import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory cache for T2 lookups (chassis data doesn't change frequently)
const chassisCache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Initialize Supabase client lazily
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

/**
 * Chassis Lookup API
 *
 * Query modes:
 * 1. GET /api/chassis-lookup?chassis=ALB36
 *    - Looks up a chassis code (alphanumeric) and returns matching model(s)/year(s)
 *
 * 2. GET /api/chassis-lookup?make=Bentley&model=Continental GT&chassis=ALB36
 *    - Validates if a chassis belongs to a specific make/model
 *    - Returns year and sort_order for fitment matching
 *
 * 3. GET /api/chassis-lookup?make=Bentley&model=Continental GT
 *    - Returns all chassis codes for a make/model (for autocomplete)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chassis = searchParams.get('chassis')?.trim().toUpperCase();
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Validate input
    if (!chassis && !make && !model) {
      return NextResponse.json(
        { error: 'Please provide chassis, make, or model parameter' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // MODE 1: Just chassis code - find what model/year it belongs to
    if (chassis && !make && !model) {
      const cacheKey = `chassis:${chassis}`;
      const cached = chassisCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
      }

      // Query T2 for this chassis
      const { data, error } = await supabase
        .from('t2_chassis_master')
        .select('make, model, chassis, year_start, year_end, adjusted, sort_order')
        .eq('chassis', chassis)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Chassis lookup error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      if (!data || data.length === 0) {
        return NextResponse.json({
          found: false,
          message: `Chassis "${chassis}" not found in database`,
          suggestions: []
        });
      }

      // Group results by make/model (same chassis can appear in multiple models)
      const results = data.map(row => ({
        make: row.make,
        model: row.model,
        chassis: row.chassis,
        yearStart: row.year_start,
        yearEnd: row.year_end,
        adjusted: row.adjusted,
        sortOrder: row.sort_order
      }));

      const response = {
        found: true,
        chassis,
        matches: results,
        // If only one match, provide direct info
        ...(results.length === 1 ? {
          make: results[0].make,
          model: results[0].model,
          yearStart: results[0].yearStart,
          yearEnd: results[0].yearEnd
        } : {
          multipleMatches: true,
          message: 'This chassis appears in multiple models. Please select one.'
        })
      };

      chassisCache.set(cacheKey, { data: response, timestamp: Date.now() });
      return NextResponse.json(response);
    }

    // MODE 2: Make + Model + Chassis - validate and get details
    if (chassis && make && model) {
      const cacheKey = `validate:${make}:${model}:${chassis}`;
      const cached = chassisCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
      }

      // Query T2 for this specific combination
      const { data, error } = await supabase
        .from('t2_chassis_master')
        .select('*')
        .eq('make', make)
        .eq('model', model)
        .eq('chassis', chassis)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Chassis validation error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      if (!data) {
        // Check if the chassis exists for a different model of this make
        const { data: altData } = await supabase
          .from('t2_chassis_master')
          .select('model, year_start, year_end')
          .eq('make', make)
          .eq('chassis', chassis)
          .limit(5);

        return NextResponse.json({
          valid: false,
          message: `Chassis "${chassis}" is not valid for ${make} ${model}`,
          suggestions: altData?.map(d => ({
            model: d.model,
            yearStart: d.year_start,
            yearEnd: d.year_end
          })) || []
        });
      }

      const response = {
        valid: true,
        make: data.make,
        model: data.model,
        chassis: data.chassis,
        yearStart: data.year_start,
        yearEnd: data.year_end,
        sortOrder: data.sort_order,
        adjusted: data.adjusted
      };

      chassisCache.set(cacheKey, { data: response, timestamp: Date.now() });
      return NextResponse.json(response);
    }

    // MODE 3: Make + Model (no chassis) - get chassis list for autocomplete
    if (make && model && !chassis) {
      const cacheKey = `list:${make}:${model}`;
      const cached = chassisCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
      }

      // Get distinct chassis codes for this make/model
      const { data, error } = await supabase
        .from('t2_chassis_master')
        .select('chassis, year_start, year_end, sort_order')
        .eq('make', make)
        .eq('model', model)
        .not('chassis', 'is', null)
        .order('sort_order', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Chassis list error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      const response = {
        make,
        model,
        totalChassis: data?.length || 0,
        chassisCodes: data?.map(d => ({
          chassis: d.chassis,
          yearStart: d.year_start,
          yearEnd: d.year_end,
          sortOrder: d.sort_order
        })) || [],
        // Provide first and last for range display
        firstChassis: data?.[0]?.chassis || null,
        lastChassis: data?.[data.length - 1]?.chassis || null
      };

      chassisCache.set(cacheKey, { data: response, timestamp: Date.now() });
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Invalid parameter combination' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Chassis lookup API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chassis lookup', details: error.message },
      { status: 500 }
    );
  }
}
