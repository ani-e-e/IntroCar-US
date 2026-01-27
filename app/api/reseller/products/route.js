import { NextResponse } from 'next/server';
import { getTenant } from '@/lib/tenants';
import { filterProducts, getCategories, getCategoryNames, getStockTypes, getSearchPartTypes, getVehicleData } from '@/lib/data-server';

/**
 * Reseller Products API
 * Same as main products API but with SKU filtering based on tenant
 * Light sites only see products flagged for their reseller
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
      // Add reseller SKU filter if tenant has one
      resellerFilter: tenant.skuFilter || null,
    };

    const sort = searchParams.get('sort') || 'relevance';
    const result = filterProducts({ ...filters, sort });

    // For reseller sites, filter products based on tenant's SKU filter
    let products = result.products;
    let filteredTotal = result.pagination?.total || products.length;

    // Apply reseller-specific product filtering
    if (tenant.skuFilter) {
      // For 'prestige_parts' filter, show only Prestige Parts branded products
      if (tenant.skuFilter === 'prestige_parts') {
        products = products.filter(p =>
          p.stockType === 'Prestige Parts' ||
          p.stockType === 'Prestige Parts (OE)' ||
          p.stockType === 'Uprated'
        );
        filteredTotal = products.length;
      }
      // Future: Check reseller_flags array when database is updated
      // else {
      //   products = products.filter(p =>
      //     p.resellerFlags?.includes(tenant.skuFilter)
      //   );
      // }
    }

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

    // Recalculate pagination if filtered
    const pagination = tenant.skuFilter ? {
      page: filters.page,
      limit: filters.limit,
      total: filteredTotal,
      totalPages: Math.ceil(filteredTotal / filters.limit),
    } : result.pagination;

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
