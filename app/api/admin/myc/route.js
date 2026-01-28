import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

const FITMENT_FILE = path.join(process.cwd(), 'data', 'json', 'fitment-lookup.json');
const VEHICLES_FILE = path.join(process.cwd(), 'data', 'json', 'vehicles.json');

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

    const fitmentData = await loadFitmentData();
    const vehicleData = await loadVehicleData();

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
      modelsByMake: vehicleData.modelsByMake
    });
  } catch (error) {
    console.error('Error loading MYC data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

// POST - Add new fitment entries (single or bulk)
export async function POST(request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { entries } = body; // Array of { sku, make, model, chassisStart, chassisEnd, additionalInfo }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
    }

    // Validate all entries
    const errors = [];
    entries.forEach((entry, index) => {
      if (!entry.sku) errors.push(`Entry ${index + 1}: SKU is required`);
      if (!entry.make) errors.push(`Entry ${index + 1}: Make is required`);
      if (!entry.model) errors.push(`Entry ${index + 1}: Model is required`);

      if (entry.chassisStart && entry.chassisEnd) {
        const start = parseInt(entry.chassisStart);
        const end = parseInt(entry.chassisEnd);
        if (!isNaN(start) && !isNaN(end) && start > end) {
          errors.push(`Entry ${index + 1}: Chassis start cannot be greater than end`);
        }
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Load existing data
    const fitmentData = await loadFitmentData();

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
