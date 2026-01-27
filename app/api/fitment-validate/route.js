import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory cache for T2 validation lookups
const validationCache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Initialize Supabase client lazily
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

/**
 * Fitment Validation API (T3 against T2)
 *
 * POST /api/fitment-validate
 * Body: {
 *   make: "Bentley",
 *   model: "Continental GT",
 *   chassisStart: "ALB36" or 12345,
 *   chassisEnd: "ALB99" or 12999
 * }
 *
 * Returns validation result including:
 * - Whether the range is valid
 * - Sort orders for range comparison
 * - Suggested corrections if invalid
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { make, model, chassisStart, chassisEnd } = body;

    // Validate required fields
    if (!make || !model) {
      return NextResponse.json(
        { error: 'make and model are required' },
        { status: 400 }
      );
    }

    if (!chassisStart) {
      return NextResponse.json(
        { error: 'chassisStart is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Normalize chassis values (could be numeric or alphanumeric)
    const startChassis = String(chassisStart).toUpperCase().trim();
    const endChassis = chassisEnd ? String(chassisEnd).toUpperCase().trim() : startChassis;

    // Check cache
    const cacheKey = `validate:${make}:${model}:${startChassis}:${endChassis}`;
    const cached = validationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Query T2 for the start chassis
    const { data: startData, error: startError } = await supabase
      .from('t2_chassis_master')
      .select('*')
      .eq('make', make)
      .eq('model', model)
      .eq('chassis', startChassis)
      .single();

    if (startError && startError.code !== 'PGRST116') {
      console.error('Start chassis lookup error:', startError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Query T2 for the end chassis (if different)
    let endData = startData;
    if (endChassis !== startChassis) {
      const { data: endResult, error: endError } = await supabase
        .from('t2_chassis_master')
        .select('*')
        .eq('make', make)
        .eq('model', model)
        .eq('chassis', endChassis)
        .single();

      if (endError && endError.code !== 'PGRST116') {
        console.error('End chassis lookup error:', endError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      endData = endResult;
    }

    // Build validation result
    const result = {
      make,
      model,
      chassisStart: startChassis,
      chassisEnd: endChassis,
      valid: false,
      issues: [],
      startValid: !!startData,
      endValid: !!endData,
      startSortOrder: startData?.sort_order || null,
      endSortOrder: endData?.sort_order || null,
      startYear: startData?.year_start || null,
      endYear: endData?.year_end || null
    };

    // Check if start chassis is valid
    if (!startData) {
      result.issues.push({
        type: 'invalid_start',
        message: `Chassis "${startChassis}" not found for ${make} ${model}`
      });

      // Try to find suggestions
      const { data: suggestions } = await supabase
        .from('t2_chassis_master')
        .select('chassis, year_start, year_end')
        .eq('make', make)
        .eq('model', model)
        .ilike('chassis', `${startChassis.slice(0, 3)}%`)
        .limit(5);

      if (suggestions?.length > 0) {
        result.startSuggestions = suggestions.map(s => ({
          chassis: s.chassis,
          yearStart: s.year_start,
          yearEnd: s.year_end
        }));
      }
    }

    // Check if end chassis is valid
    if (endChassis !== startChassis && !endData) {
      result.issues.push({
        type: 'invalid_end',
        message: `Chassis "${endChassis}" not found for ${make} ${model}`
      });

      // Try to find suggestions
      const { data: suggestions } = await supabase
        .from('t2_chassis_master')
        .select('chassis, year_start, year_end')
        .eq('make', make)
        .eq('model', model)
        .ilike('chassis', `${endChassis.slice(0, 3)}%`)
        .limit(5);

      if (suggestions?.length > 0) {
        result.endSuggestions = suggestions.map(s => ({
          chassis: s.chassis,
          yearStart: s.year_start,
          yearEnd: s.year_end
        }));
      }
    }

    // Check if range is logically valid (end should come after start)
    if (startData && endData && startData.sort_order > endData.sort_order) {
      result.issues.push({
        type: 'inverted_range',
        message: `Chassis range appears inverted: "${startChassis}" comes after "${endChassis}" chronologically. Did you mean ${endChassis} to ${startChassis}?`
      });
    }

    // Check if the range spans different model generations (optional warning)
    if (startData && endData) {
      // If there's a big gap in sort order, might span generations
      const orderGap = Math.abs(endData.sort_order - startData.sort_order);
      if (orderGap > 10000) {
        result.issues.push({
          type: 'large_range_warning',
          severity: 'warning',
          message: `This is a very wide chassis range (${orderGap.toLocaleString()} chassis). Please verify this is intentional.`
        });
      }
    }

    // Set overall validity
    result.valid = result.startValid && result.endValid &&
                   !result.issues.some(i => i.type !== 'large_range_warning');

    // If valid, include year coverage info
    if (result.valid) {
      result.yearCoverage = {
        from: Math.min(startData.year_start, endData?.year_start || startData.year_start),
        to: Math.max(startData.year_end || startData.year_start, endData?.year_end || endData?.year_start || startData.year_end)
      };
    }

    // Cache the result
    validationCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Fitment validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate fitment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to get valid chassis list for a make/model
 * GET /api/fitment-validate?make=Bentley&model=Continental GT
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const limit = parseInt(searchParams.get('limit')) || 100;

    if (!make || !model) {
      return NextResponse.json(
        { error: 'make and model are required' },
        { status: 400 }
      );
    }

    const cacheKey = `chassis-list:${make}:${model}`;
    const cached = validationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const supabase = getSupabase();

    // Get first and last few chassis codes for this make/model
    const { data: firstChassis } = await supabase
      .from('t2_chassis_master')
      .select('chassis, year_start, year_end, sort_order')
      .eq('make', make)
      .eq('model', model)
      .not('chassis', 'is', null)
      .order('sort_order', { ascending: true })
      .limit(limit / 2);

    const { data: lastChassis } = await supabase
      .from('t2_chassis_master')
      .select('chassis, year_start, year_end, sort_order')
      .eq('make', make)
      .eq('model', model)
      .not('chassis', 'is', null)
      .order('sort_order', { ascending: false })
      .limit(limit / 2);

    // Get total count
    const { count } = await supabase
      .from('t2_chassis_master')
      .select('*', { count: 'exact', head: true })
      .eq('make', make)
      .eq('model', model)
      .not('chassis', 'is', null);

    const result = {
      make,
      model,
      totalChassis: count || 0,
      firstChassis: firstChassis?.map(c => ({
        chassis: c.chassis,
        yearStart: c.year_start,
        yearEnd: c.year_end
      })) || [],
      lastChassis: lastChassis?.map(c => ({
        chassis: c.chassis,
        yearStart: c.year_start,
        yearEnd: c.year_end
      })) || [],
      sampleRange: {
        earliest: firstChassis?.[0]?.chassis || null,
        latest: lastChassis?.[0]?.chassis || null
      }
    };

    validationCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);

  } catch (error) {
    console.error('Chassis list error:', error);
    return NextResponse.json(
      { error: 'Failed to get chassis list', details: error.message },
      { status: 500 }
    );
  }
}
