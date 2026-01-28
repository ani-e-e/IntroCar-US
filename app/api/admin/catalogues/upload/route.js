import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validateSession } from '@/lib/admin-auth';

// Initialize Supabase client lazily
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Simple CSV parser that handles quoted values
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

  return lines.slice(1).map((line, lineIndex) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = { _lineNumber: lineIndex + 2 }; // +2 for 1-indexed + header row
    headers.forEach((header, i) => {
      row[header] = values[i]?.replace(/"/g, '') || '';
    });
    return row;
  });
}

// Parse pipe or comma separated values into array
function parseArrayField(value) {
  if (!value) return [];
  // Support both pipe (|) and semicolon (;) separators
  const separator = value.includes('|') ? '|' : value.includes(';') ? ';' : ',';
  return value.split(separator).map(v => v.trim()).filter(Boolean);
}

// Fuzzy match to find similar strings (for suggestions)
function findSimilar(input, validOptions, threshold = 0.6) {
  const inputLower = input.toLowerCase();
  const matches = [];

  for (const option of validOptions) {
    const optionLower = option.toLowerCase();

    // Exact match (case insensitive)
    if (inputLower === optionLower) {
      return { exact: option };
    }

    // Check if one contains the other
    if (inputLower.includes(optionLower) || optionLower.includes(inputLower)) {
      matches.push({ option, score: 0.8 });
      continue;
    }

    // Simple similarity based on common words
    const inputWords = inputLower.split(/\s+/);
    const optionWords = optionLower.split(/\s+/);
    const commonWords = inputWords.filter(w => optionWords.some(ow => ow.includes(w) || w.includes(ow)));
    const score = commonWords.length / Math.max(inputWords.length, optionWords.length);

    if (score >= threshold) {
      matches.push({ option, score });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return { suggestions: matches.slice(0, 3).map(m => m.option) };
}

export async function POST(request) {
  // Check auth
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie || !validateSession(sessionCookie.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mode = formData.get('mode') || 'validate'; // 'validate' or 'import'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Load valid vehicles for validation
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('make, model');

    if (vehiclesError) {
      console.error('Error loading vehicles:', vehiclesError);
      return NextResponse.json({ error: 'Failed to load vehicle data' }, { status: 500 });
    }

    // Build validation lookup
    const validMakes = [...new Set(vehicles.map(v => v.make))];
    const validModelsByMake = {};
    for (const v of vehicles) {
      if (!validModelsByMake[v.make]) validModelsByMake[v.make] = [];
      validModelsByMake[v.make].push(v.model);
    }
    const allModels = vehicles.map(v => v.model);

    // Parse CSV
    const content = await file.text();
    const rows = parseCSV(content);

    console.log(`Processing ${rows.length} catalogue rows...`);
    console.log('Headers detected:', Object.keys(rows[0] || {}).filter(k => k !== '_lineNumber'));

    // Validate each row
    const results = [];
    let validCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      const validation = {
        lineNumber: row._lineNumber,
        id: row.id || row.catalogue_id || '',
        title: row.title || row.name || '',
        makes: parseArrayField(row.makes || row.make || ''),
        models: parseArrayField(row.models || row.model || ''),
        category: row.category || '',
        hotspots: parseArrayField(row.hotspots || row.parent_skus || ''),
        image: row.image || row.image_url || row.imageurl || '',
        catalogueLink: row.catalogue_link || row.cataloguelink || row.link || '',
        cmsUrl: row.cms_url || row.cmsurl || '',
        errors: [],
        warnings: [],
        suggestions: {}
      };

      // Required field validation
      if (!validation.id) {
        validation.errors.push('Missing required field: id');
      }
      if (!validation.title) {
        validation.errors.push('Missing required field: title');
      }

      // Validate makes
      for (const make of validation.makes) {
        const result = findSimilar(make, validMakes);
        if (result.exact) {
          // Found exact match - use the correctly cased version
          const idx = validation.makes.indexOf(make);
          validation.makes[idx] = result.exact;
        } else if (result.suggestions?.length > 0) {
          validation.errors.push(`Invalid make: "${make}"`);
          validation.suggestions[`make:${make}`] = result.suggestions;
        } else {
          validation.errors.push(`Unknown make: "${make}" (no similar matches found)`);
        }
      }

      // Validate models
      for (const model of validation.models) {
        const result = findSimilar(model, allModels);
        if (result.exact) {
          // Found exact match - use the correctly cased version
          const idx = validation.models.indexOf(model);
          validation.models[idx] = result.exact;
        } else if (result.suggestions?.length > 0) {
          validation.errors.push(`Invalid model: "${model}"`);
          validation.suggestions[`model:${model}`] = result.suggestions;
        } else {
          validation.errors.push(`Unknown model: "${model}" (no similar matches found)`);
        }
      }

      // Cross-validate: ensure models belong to the specified makes
      for (const model of validation.models) {
        const modelMakes = vehicles.filter(v => v.model === model).map(v => v.make);
        if (modelMakes.length > 0) {
          const hasValidMake = validation.makes.some(m => modelMakes.includes(m));
          if (!hasValidMake && validation.makes.length > 0) {
            validation.warnings.push(`Model "${model}" typically belongs to ${modelMakes.join('/')}, not ${validation.makes.join('/')}`);
          }
        }
      }

      // Track counts
      if (validation.errors.length === 0) {
        validCount++;
        validation.status = 'valid';
      } else {
        errorCount++;
        validation.status = 'error';
      }

      results.push(validation);
    }

    // If mode is 'import' and there are no errors, proceed with import
    if (mode === 'import') {
      const validRows = results.filter(r => r.status === 'valid');

      if (validRows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No valid rows to import',
          validation: { total: rows.length, valid: validCount, errors: errorCount },
          results
        });
      }

      // Prepare data for upsert
      const cataloguesToUpsert = validRows.map(r => ({
        id: r.id,
        title: r.title,
        makes: r.makes,
        models: r.models,
        category: r.category || null,
        hotspots: r.hotspots,
        image: r.image || null,
        catalogue_link: r.catalogueLink || null,
        cms_url: r.cmsUrl || null,
        updated_at: new Date().toISOString()
      }));

      // Upsert to Supabase
      const { data: upserted, error: upsertError } = await supabase
        .from('catalogues')
        .upsert(cataloguesToUpsert, { onConflict: 'id' })
        .select('id');

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        return NextResponse.json({
          success: false,
          error: `Database error: ${upsertError.message}`,
          validation: { total: rows.length, valid: validCount, errors: errorCount }
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        imported: upserted?.length || validRows.length,
        skipped: errorCount,
        validation: { total: rows.length, valid: validCount, errors: errorCount },
        results
      });
    }

    // Return validation results (preview mode)
    return NextResponse.json({
      success: true,
      mode: 'validate',
      validation: {
        total: rows.length,
        valid: validCount,
        errors: errorCount
      },
      validMakes,
      results
    });

  } catch (error) {
    console.error('Catalogue upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
