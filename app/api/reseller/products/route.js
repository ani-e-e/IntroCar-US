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

    // For reseller sites, filter products to only those with reseller flag
    // This would require the products to have a 'reseller_flags' field
    // For now, we return all products - actual filtering happens when DB is updated
    let products = result.products;

    // If tenant has a SKU filter, we would filter here
    // Once products have reseller_flags field in database:
    // if (tenant.skuFilter) {
    //   products = products.filter(p =>
    //     p.reseller_flags?.includes(tenant.skuFilter)
    //   );
    // }

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

    return NextResponse.json({
      products: products,
      pagination: result.pagination,
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
