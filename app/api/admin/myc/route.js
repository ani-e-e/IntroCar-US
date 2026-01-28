import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const FITMENT_FILE = path.join(process.cwd(), 'data', 'json', 'fitment-lookup.json');
const VEHICLES_FILE = path.join(process.cwd(), 'data', 'json', 'vehicles.json');
const T7_FILE = path.join(process.cwd(), 'data', 'json', 't7-additional-info.json');

// Load fitment data
async function loadFitmentData() {
  try {
    const raw = await fs.readFile(FITMENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading fitment data:', error);
    return {};
  }
}

// Save fitment data
async function saveFitmentData(data) {
  await fs.writeFile(FITMENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Load vehicle data for dropdowns
async function loadVehicleData() {
  try {
    const raw = await fs.readFile(VEHICLES_FILE, 'utf-8');
    const vehicles = JSON.parse(raw);

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

// Load T7 valid additional info values
async function loadT7Values() {
  try {
    const raw = await fs.readFile(T7_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading T7 values:', error);
    return [];
  }
}

// Check if entry exists in fitment data
function checkDuplicate(fitmentData, sku, make, model) {
  if (!fitmentData[sku]) return false;
  return fitmentData[sku].some(
    f => f.make === make && f.model === model
  );
}

// GET - List fitment data with search/pagination
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
    const checkDuplicates = searchParams.get('checkDuplicates') === 'true';

    const [fitmentData, vehicleData, t7Values] = await Promise.all([
      loadFitmentData(),
      loadVehicleData(),
      loadT7Values()
    ]);

    // Convert to array for filtering and pagination
    let entries = [];

    for (const [sku, fitments] of Object.entries(fitmentData)) {
      for (const fitment of fitments) {
        entries.push({
          sku,
          make: fitment.make,
          model: fitment.model,
          chassisStart: fitment.chassisStart,
          chassisEnd: fitment.chassisEnd,
          additionalInfo: fitment.additionalInfo
        });
      }
    }

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      entries = entries.filter(e =>
        e.sku.toLowerCase().includes(searchLower) ||
        e.model?.toLowerCase().includes(searchLower)
      );
    }

    if (make) {
      entries = entries.filter(e => e.make === make);
    }

    if (model) {
      entries = entries.filter(e => e.model === model);
    }

    // Get stats
    const totalSkus = Object.keys(fitmentData).length;
    const totalEntries = entries.length;

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedEntries = entries.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalEntries / limit);

    return NextResponse.json({
      entries: paginatedEntries,
      pagination: {
        page,
        limit,
        total: totalEntries,
        totalPages
      },
      stats: {
        totalSkus,
        totalEntries: Object.values(fitmentData).reduce((sum, arr) => sum + arr.length, 0),
        makes: vehicleData.makes.length
      },
      makes: vehicleData.makes,
      modelsByMake: vehicleData.modelsByMake,
      t7Values
    });
  } catch (error) {
    console.error('Error loading MYC data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
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

    const [fitmentData, t7Values] = await Promise.all([
      loadFitmentData(),
      loadT7Values()
    ]);

    // Handle 'replace' action first (doesn't require entries array)
    if (action === 'replace') {
      const { toDelete, toAdd } = body;

      // Delete specified entries
      let deletedCount = 0;
      if (toDelete && Array.isArray(toDelete)) {
        for (const del of toDelete) {
          const sku = (del.sku || '').toUpperCase();
          if (fitmentData[sku]) {
            const originalLength = fitmentData[sku].length;
            fitmentData[sku] = fitmentData[sku].filter(f =>
              !(f.make === del.make && f.model === del.model &&
                f.chassisStart === del.chassisStart && f.chassisEnd === del.chassisEnd &&
                f.additionalInfo === del.additionalInfo)
            );
            deletedCount += originalLength - fitmentData[sku].length;

            // Remove SKU if empty
            if (fitmentData[sku].length === 0) {
              delete fitmentData[sku];
            }
          }
        }
      }

      // Add new entries
      const added = [];
      if (toAdd && Array.isArray(toAdd)) {
        for (const entry of toAdd) {
          const sku = (entry.sku || '').toUpperCase();
          if (!sku || !entry.make || !entry.model) continue;

          if (!fitmentData[sku]) {
            fitmentData[sku] = [];
          }

          fitmentData[sku].push({
            make: entry.make,
            model: entry.model,
            chassisStart: entry.chassisStart ? parseInt(entry.chassisStart) || null : null,
            chassisEnd: entry.chassisEnd ? parseInt(entry.chassisEnd) || null : null,
            additionalInfo: entry.additionalInfo || null
          });
          added.push({ sku, make: entry.make, model: entry.model });
        }
      }

      await saveFitmentData(fitmentData);

      return NextResponse.json({
        message: `Deleted ${deletedCount}, added ${added.length} entries`,
        deleted: deletedCount,
        added,
        addedCount: added.length
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

      // Get all existing entries for these SKUs
      const existingBySku = {};
      uniqueSkus.forEach(sku => {
        if (fitmentData[sku]) {
          existingBySku[sku] = fitmentData[sku].map((f, idx) => ({
            id: `existing-${sku}-${idx}`,
            sku,
            make: f.make,
            model: f.model,
            chassisStart: f.chassisStart,
            chassisEnd: f.chassisEnd,
            additionalInfo: f.additionalInfo
          }));
        } else {
          existingBySku[sku] = [];
        }
      });

      const results = entries.map(entry => {
        const sku = (entry.sku || '').toUpperCase();
        const existingForSku = fitmentData[sku] || [];
        const entryChassisStart = entry.chassisStart ? parseInt(entry.chassisStart) || null : null;
        const entryChassisEnd = entry.chassisEnd ? parseInt(entry.chassisEnd) || null : null;
        const entryAdditionalInfo = entry.additionalInfo || null;

        // Check for EXACT duplicate (ALL fields match - truly identical data)
        const exactMatch = existingForSku.find(f =>
          f.make === entry.make &&
          f.model === entry.model &&
          f.chassisStart === entryChassisStart &&
          f.chassisEnd === entryChassisEnd &&
          f.additionalInfo === entryAdditionalInfo
        );

        // Check for NEAR duplicate (same make+model but different chassis/info values)
        // These are entries that might need to REPLACE existing data
        const nearMatches = existingForSku.filter(f =>
          f.make === entry.make &&
          f.model === entry.model &&
          (f.chassisStart !== entryChassisStart ||
           f.chassisEnd !== entryChassisEnd ||
           f.additionalInfo !== entryAdditionalInfo)
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

      if (!fitmentData[sku]) {
        fitmentData[sku] = [];
      }

      // Check for duplicate (same SKU + make + model combination)
      const isDuplicate = fitmentData[sku].some(
        f => f.make === entry.make && f.model === entry.model
      );

      if (isDuplicate) {
        duplicates.push({ sku, make: entry.make, model: entry.model });
      } else {
        fitmentData[sku].push({
          make: entry.make,
          model: entry.model,
          chassisStart: entry.chassisStart ? parseInt(entry.chassisStart) || null : null,
          chassisEnd: entry.chassisEnd ? parseInt(entry.chassisEnd) || null : null,
          additionalInfo: entry.additionalInfo || null
        });
        added.push({ sku, make: entry.make, model: entry.model });
      }
    }

    // Save updated data
    await saveFitmentData(fitmentData);

    return NextResponse.json({
      message: `Added ${added.length} entries`,
      added,
      duplicates,
      skipped: duplicates.length
    });
  } catch (error) {
    console.error('Error adding MYC entries:', error);
    return NextResponse.json({ error: 'Failed to add entries' }, { status: 500 });
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
    const { sku, make, model } = body;

    if (!sku || !make || !model) {
      return NextResponse.json({ error: 'SKU, make, and model are required' }, { status: 400 });
    }

    const fitmentData = await loadFitmentData();

    if (!fitmentData[sku]) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }

    const originalLength = fitmentData[sku].length;
    fitmentData[sku] = fitmentData[sku].filter(
      f => !(f.make === make && f.model === model)
    );

    if (fitmentData[sku].length === originalLength) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Remove SKU key if no fitments remain
    if (fitmentData[sku].length === 0) {
      delete fitmentData[sku];
    }

    await saveFitmentData(fitmentData);

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting MYC entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
