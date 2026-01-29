import { NextResponse } from 'next/server';
import { getTenant } from '@/lib/tenants';
import { filterProducts, getCategories, getCategoryNames, getStockTypes, getSearchPartTypes, getVehicleData } from '@/lib/data-server';

// Prestige Parts stock types that are "available" for resellers
const PRESTIGE_PARTS_STOCK_TYPES = ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated'];

/**
 * Compute reseller availability status based on stock type
 * - Prestige Parts stock types → "available"
 * - All other stock types → "send_request"
 */
function getResellerAvailability(stockType) {
  if (PRESTIGE_PARTS_STOCK_TYPES.includes(stockType)) {
    return 'available';
  }
  return 'send_request';
}

/**
 * Reseller Products API
 * Shows ALL IntroCar products with reseller-specific availability logic:
 * - Prestige Parts products are marked as "available"
 * - All other products are marked as "send request" (reseller must confirm)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get tenant from query param
    const tenantSlug = searchParams.get('tenant');
    const tenant = getTenant(tenantSlug);

    if (!tenant) {
      return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
    }

    const filters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      stockType: searchParams.get('stockType') || '',
      searchPartType: searchParams.get('searchPartType') || '',
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      year: searchParams.get('year') || '',
      chassis: searchParams.get('chassis') || '',
      nlaOnly: searchParams.get('nlaOnly') === 'true',
      inStockOnly: searchParams.get('inStockOnly') === 'true',
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 24,
    };

    const sort = searchParams.get('sort') || 'relevance';
    const result = filterProducts({ ...filters, sort });

    // Add reseller availability status to each product
    // All products are shown, but availability depends on stock type
    let products = result.products.map(product => ({
      ...product,
      resellerAvailability: getResellerAvailability(product.stockType),
      // For resellers, we show "Available" or "Send Request" instead of regular stock status
      displayAvailability: PRESTIGE_PARTS_STOCK_TYPES.includes(product.stockType)
        ? 'Available'
        : 'Send Request'
    }));

    let filteredTotal = result.pagination?.total || products.length;

    const categories = getCategories();
    const categoryNames = getCategoryNames();
    const stockTypes = getStockTypes();
    const searchPartTypes = getSearchPartTypes();
    const vehicleData = getVehicleData();

    // Filter vehicle data to only include models that have products
    const filteredVehicleData = { ...vehicleData };
    if (filters.make && result.availableFilters?.models) {
      filteredVehicleData[filters.make] = {
        models: result.availableFilters.models
      };
    }

    // Use standard pagination (no longer filtering by stock type)
    const pagination = result.pagination;

    return NextResponse.json({
      products: products.slice(0, filters.limit), // Apply limit after filtering
      pagination,
      categories: result.availableFilters?.categories || categories,
      categoryNames: result.availableFilters?.categories?.map(c => c.name) || categoryNames,
      stockTypes: result.availableFilters?.stockTypes || stockTypes,
      searchPartTypes: result.availableFilters?.searchPartTypes || searchPartTypes,
      years: result.availableFilters?.years || [],
      vehicleData: filteredVehicleData,
      supersessionMatch: result.supersessionMatch || null,
      searchType: result.searchType || null,
      // Reseller-specific response fields
      tenant: tenant.slug,
      showPrices: tenant.showPrices,
      showCart: tenant.showCart,
    });
  } catch (error) {
    console.error('Reseller Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
