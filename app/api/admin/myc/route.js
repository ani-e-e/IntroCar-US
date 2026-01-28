import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// T7 file for validation only (reference data)
const T7_FILE = path.join(process.cwd(), 'data', 'json', 't7-additional-info.json');

// Initialize Supabase client
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Load T7 valid additional info values (from JSON - reference data only)
async function loadT7Values() {
  try {
    const raw = await fs.readFile(T7_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading T7 values:', error);
    return [];
  }
}

// Load vehicle data for dropdowns from Supabase
async function loadVehicleData() {
  try {
    const supabase = getSupabase();

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('make, model')
      .order('make')
      .order('model');

    if (error) throw error;

    const makes = [...new Set(vehicles.map(v => v.make))].sort();
    const modelsByMake = {};

    vehicles.forEach(v => {
      if (!modelsByMake[v.make]) modelsByMake[v.make] = new Set();
      modelsByMake[v.make].add(v.model);
    });

    Object.keys(modelsByMake).forEach(make => {
      modelsByMake[make] = [...modelsByMake[make]].sort();
    });

    return { makes, modelsByMake };
  } catch (error) {
    console.error('Error loading vehicle data:', error);
    return {
      makes: ['Bentley', 'Rolls-Royce'],
      modelsByMake: {
        'Bentley': [],
        'Rolls-Royce': []
      }
    };
  }
}

// GET - List fitment data with search/pagination from Supabase
export async function GET(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const make = searchParams.get('make') || '';
    const model = searchParams.get('model') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = getSupabase();
    const [vehicleData, t7Values] = await Promise.all([
      loadVehicleData(),
      loadT7Values()
    ]);

    // Build query
    let query = supabase
      .from('product_fitment')
      .select('id, parent_sku, make, model, chassis_start, chassis_end, additional_info', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`parent_sku.ilike.%${search}%,model.ilike.%${search}%`);
    }
    if (make) {
      query = query.eq('make', make);
    }
    if (model) {
      query = query.eq('model', model);
    }

    // Get total count first
    const { count: totalEntries } = await query;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = supabase
      .from('product_fitment')
      .select('id, parent_sku, make, model, chassis_start, chassis_end, additional_info');

    if (search) {
      query = query.or(`parent_sku.ilike.%${search}%,model.ilike.%${search}%`);
    }
    if (make) {
      query = query.eq('make', make);
    }
    if (model) {
      query = query.eq('model', model);
    }

    const { data: entries, error } = await query
      .order('parent_sku')
      .order('make')
      .order('model')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get unique SKU count
    const { data: skuCountData } = await supabase
      .from('product_fitment')
      .select('parent_sku')
      .limit(100000);

    const totalSkus = new Set(skuCountData?.map(r => r.parent_sku) || []).size;

    // Map to expected format
    const mappedEntries = entries.map(e => ({
      id: e.id,
      sku: e.parent_sku,
      make: e.make,
      model: e.model,
      chassisStart: e.chassis_start,
      chassisEnd: e.chassis_end,
      additionalInfo: e.additional_info
    }));

    const totalPages = Math.ceil((totalEntries || 0) / limit);

    return NextResponse.json({
      entries: mappedEntries,
      pagination: {
        page,
        limit,
        total: totalEntries || 0,
        totalPages
      },
      stats: {
        totalSkus,
        totalEntries: totalEntries || 0,
        makes: vehicleData.makes.length
      },
      makes: vehicleData.makes,
      modelsByMake: vehicleData.modelsByMake,
      t7Values
    });
  } catch (error) {
    console.error('Error loading MYC data:', error);
    return NextResponse.json({ error: 'Failed to load data', details: error.message }, { status: 500 });
  }
}

// POST - Add new fitment entries (single or bulk) or check duplicates
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { entries, action } = body;

    const supabase = getSupabase();
    const t7Values = await loadT7Values();

    // Handle 'replace' action first (doesn't require entries array)
    if (action === 'replace') {
      const { toDelete, toAdd } = body;

      console.log('Replace action - toDelete:', JSON.stringify(toDelete, null, 2));
      console.log('Replace action - toAdd:', JSON.stringify(toAdd, null, 2));

      // Delete specified entries by ID first
      let deletedCount = 0;
      if (toDelete && Array.isArray(toDelete) && toDelete.length > 0) {
        // If entries have IDs, delete by ID (most precise)
        const idsToDelete = toDelete.filter(d => d.id).map(d => d.id);

        if (idsToDelete.length > 0) {
          console.log('Deleting by IDs:', idsToDelete);
          const { error: deleteError } = await supabase
            .from('product_fitment')
            .delete()
            .in('id', idsToDelete);

          if (deleteError) {
            console.error('Delete by ID error:', deleteError);
            throw deleteError;
          }
          deletedCount = idsToDelete.length;
          console.log(`Deleted ${deletedCount} entries by ID`);
        }

        // For entries without ID, delete by matching all fields
        const entriesWithoutId = toDelete.filter(d => !d.id);
        for (const del of entriesWithoutId) {
          const sku = (del.sku || '').toUpperCase();
          // Keep chassis as strings - they can be alphanumeric like "5AS1"
          const chassisStart = del.chassisStart !== undefined && del.chassisStart !== null
            ? String(del.chassisStart) : null;
          const chassisEnd = del.chassisEnd !== undefined && del.chassisEnd !== null
            ? String(del.chassisEnd) : null;

          let deleteQuery = supabase
            .from('product_fitment')
            .delete()
            .eq('parent_sku', sku)
            .eq('make', del.make)
            .eq('model', del.model);

          if (chassisStart !== null) {
            deleteQuery = deleteQuery.eq('chassis_start', chassisStart);
          }
          if (chassisEnd !== null) {
            deleteQuery = deleteQuery.eq('chassis_end', chassisEnd);
          }
          if (del.additionalInfo) {
            deleteQuery = deleteQuery.eq('additional_info', del.additionalInfo);
          }

          const { error: delError } = await deleteQuery;
          if (delError) {
            console.error('Delete by fields error:', delError);
          } else {
            deletedCount++;
          }
        }
      }

      // Add new entries - but first check they don't already exist
      const added = [];
      const skipped = [];
      if (toAdd && Array.isArray(toAdd) && toAdd.length > 0) {
        for (const entry of toAdd) {
          if (!entry.sku || !entry.make || !entry.model) continue;

          const sku = (entry.sku || '').toUpperCase();
          // Keep chassis as strings - they can be alphanumeric
          const chassisStart = entry.chassisStart ? String(entry.chassisStart) : null;
          const chassisEnd = entry.chassisEnd ? String(entry.chassisEnd) : null;

          // Check if this exact entry already exists
          let existsQuery = supabase
            .from('product_fitment')
            .select('id')
            .eq('parent_sku', sku)
            .eq('make', entry.make)
            .eq('model', entry.model);

          if (chassisStart) {
            existsQuery = existsQuery.eq('chassis_start', chassisStart);
          } else {
            existsQuery = existsQuery.is('chassis_start', null);
          }
          if (chassisEnd) {
            existsQuery = existsQuery.eq('chassis_end', chassisEnd);
          } else {
            existsQuery = existsQuery.is('chassis_end', null);
          }

          const { data: existing } = await existsQuery.limit(1);

          if (existing && existing.length > 0) {
            console.log(`Skipping duplicate: ${sku} ${entry.make} ${entry.model} ${chassisStart}-${chassisEnd}`);
            skipped.push({ sku, make: entry.make, model: entry.model });
            continue;
          }

          // Insert the new entry
          const { data: insertedData, error: insertError } = await supabase
            .from('product_fitment')
            .insert({
              parent_sku: sku,
              make: entry.make,
              model: entry.model,
              chassis_start: chassisStart,
              chassis_end: chassisEnd,
              additional_info: entry.additionalInfo || null
            })
            .select();

          if (insertError) {
            console.error('Insert error:', insertError);
          } else {
            added.push({ sku, make: entry.make, model: entry.model });
          }
        }
      }

      return NextResponse.json({
        message: `Deleted ${deletedCount}, added ${added.length} entries${skipped.length > 0 ? `, skipped ${skipped.length} duplicates` : ''}`,
        deleted: deletedCount,
        added,
        addedCount: added.length,
        skipped: skipped.length
      });
    }

    // For 'check' and default actions, entries array is required
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
    }

    // If action is 'check', check for duplicates and return existing entries for each SKU
    if (action === 'check') {
      // Collect all unique SKUs being checked
      const uniqueSkus = [...new Set(entries.map(e => (e.sku || '').toUpperCase()))];

      // Get all existing entries for these SKUs from Supabase
      const { data: existingEntries, error: fetchError } = await supabase
        .from('product_fitment')
        .select('id, parent_sku, make, model, chassis_start, chassis_end, additional_info')
        .in('parent_sku', uniqueSkus);

      if (fetchError) throw fetchError;

      // Group by SKU
      const existingBySku = {};
      uniqueSkus.forEach(sku => {
        existingBySku[sku] = (existingEntries || [])
          .filter(e => e.parent_sku === sku)
          .map(e => ({
            id: e.id,
            sku: e.parent_sku,
            make: e.make,
            model: e.model,
            chassisStart: e.chassis_start,
            chassisEnd: e.chassis_end,
            additionalInfo: e.additional_info
          }));
      });

      const results = entries.map(entry => {
        const sku = (entry.sku || '').toUpperCase();
        const existingForSku = existingBySku[sku] || [];
        // Keep chassis as strings for comparison - they can be alphanumeric like "5AS1"
        const entryChassisStart = entry.chassisStart ? String(entry.chassisStart) : null;
        const entryChassisEnd = entry.chassisEnd ? String(entry.chassisEnd) : null;
        const entryAdditionalInfo = entry.additionalInfo || null;

        // Check for EXACT duplicate (ALL fields match - truly identical data)
        // Compare as strings since chassis can be alphanumeric
        const exactMatch = existingForSku.find(f =>
          f.make === entry.make &&
          f.model === entry.model &&
          String(f.chassisStart || '') === String(entryChassisStart || '') &&
          String(f.chassisEnd || '') === String(entryChassisEnd || '') &&
          (f.additionalInfo || null) === entryAdditionalInfo
        );

        // Check for NEAR duplicate (same make+model but different chassis/info values)
        // These are entries that might need to REPLACE existing data
        const nearMatches = existingForSku.filter(f =>
          f.make === entry.make &&
          f.model === entry.model &&
          (String(f.chassisStart || '') !== String(entryChassisStart || '') ||
           String(f.chassisEnd || '') !== String(entryChassisEnd || '') ||
           (f.additionalInfo || null) !== entryAdditionalInfo)
        );

        const isValidAdditionalInfo = !entry.additionalInfo ||
          t7Values.includes(entry.additionalInfo) ||
          entry.additionalInfo.trim() === '';

        let status = 'new';
        if (exactMatch) {
          // Truly identical - no need to add
          status = 'exact_duplicate';
        } else if (nearMatches.length > 0) {
          // Same make+model exists with different values - likely a replacement
          status = 'near_duplicate';
        }
        // else 'new' - completely new make+model for this SKU

        return {
          ...entry,
          sku,
          isDuplicate: !!exactMatch,
          isNearDuplicate: nearMatches.length > 0,
          nearMatches,
          isValidAdditionalInfo,
          status
        };
      });

      const exactDuplicateCount = results.filter(r => r.status === 'exact_duplicate').length;
      const nearDuplicateCount = results.filter(r => r.status === 'near_duplicate').length;
      const newCount = results.filter(r => r.status === 'new').length;
      const invalidInfoCount = results.filter(r => !r.isValidAdditionalInfo).length;

      return NextResponse.json({
        entries: results,
        existingBySku,
        summary: {
          total: results.length,
          exactDuplicates: exactDuplicateCount,
          nearDuplicates: nearDuplicateCount,
          new: newCount,
          invalidAdditionalInfo: invalidInfoCount
        }
      });
    }

    // Validate all entries
    const errors = [];
    entries.forEach((entry, index) => {
      if (!entry.sku) errors.push(`Row ${index + 1}: SKU is required`);
      if (!entry.make) errors.push(`Row ${index + 1}: Make is required`);
      if (!entry.model) errors.push(`Row ${index + 1}: Model is required`);

      if (entry.chassisStart && entry.chassisEnd) {
        const start = parseInt(entry.chassisStart);
        const end = parseInt(entry.chassisEnd);
        if (!isNaN(start) && !isNaN(end) && start > end) {
          errors.push(`Row ${index + 1}: Chassis start cannot be greater than end`);
        }
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Check for duplicates and add entries
    const duplicates = [];
    const added = [];

    for (const entry of entries) {
      const sku = entry.sku.toUpperCase();
      // Keep chassis as strings - they can be alphanumeric like "5AS1"
      const chassisStart = entry.chassisStart ? String(entry.chassisStart) : null;
      const chassisEnd = entry.chassisEnd ? String(entry.chassisEnd) : null;

      // Check for EXACT duplicate (all fields must match)
      let existsQuery = supabase
        .from('product_fitment')
        .select('id')
        .eq('parent_sku', sku)
        .eq('make', entry.make)
        .eq('model', entry.model);

      if (chassisStart) {
        existsQuery = existsQuery.eq('chassis_start', chassisStart);
      } else {
        existsQuery = existsQuery.is('chassis_start', null);
      }
      if (chassisEnd) {
        existsQuery = existsQuery.eq('chassis_end', chassisEnd);
      } else {
        existsQuery = existsQuery.is('chassis_end', null);
      }

      const { data: existing } = await existsQuery.limit(1);

      if (existing && existing.length > 0) {
        duplicates.push({ sku, make: entry.make, model: entry.model });
      } else {
        const { error: insertError } = await supabase
          .from('product_fitment')
          .insert({
            parent_sku: sku,
            make: entry.make,
            model: entry.model,
            chassis_start: chassisStart,
            chassis_end: chassisEnd,
            additional_info: entry.additionalInfo || null
          });

        if (insertError) {
          console.error('Insert error:', insertError);
        } else {
          added.push({ sku, make: entry.make, model: entry.model });
        }
      }
    }

    return NextResponse.json({
      message: `Added ${added.length} entries`,
      added,
      duplicates,
      skipped: duplicates.length
    });
  } catch (error) {
    console.error('Error adding MYC entries:', error);
    return NextResponse.json({
      error: 'Failed to add entries',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Remove fitment entry
export async function DELETE(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sku, make, model, id } = body;

    const supabase = getSupabase();

    // If ID is provided, delete by ID (most precise)
    if (id) {
      const { error } = await supabase
        .from('product_fitment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ message: 'Entry deleted successfully' });
    }

    // Otherwise, delete by SKU + make + model
    if (!sku || !make || !model) {
      return NextResponse.json({ error: 'SKU, make, and model are required (or provide id)' }, { status: 400 });
    }

    const { error, count } = await supabase
      .from('product_fitment')
      .delete()
      .eq('parent_sku', sku.toUpperCase())
      .eq('make', make)
      .eq('model', model);

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting MYC entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry', details: error.message }, { status: 500 });
  }
}
