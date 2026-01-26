import { NextResponse } from 'next/server';
import { filterProducts, getCategories, getCategoryNames, getStockTypes, getSearchPartTypes, getVehicleData } from '@/lib/data-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

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
    const categories = getCategories(); // Returns array with subcategories (all categories)
    const categoryNames = getCategoryNames(); // Flat list for simple dropdown
    const stockTypes = getStockTypes();
    const searchPartTypes = getSearchPartTypes();
    const vehicleData = getVehicleData();

    // Filter vehicle data to only include models that have products
    const filteredVehicleData = { ...vehicleData };
    if (filters.make && result.availableFilters?.models) {
      // Only show models that have products for current filters
      filteredVehicleData[filters.make] = {
        models: result.availableFilters.models
      };
    }

    return NextResponse.json({
      products: result.products,
      pagination: result.pagination,
      // Use available filters (based on current vehicle selection) if present, otherwise fall back to all
      categories: result.availableFilters?.categories || categories,
      categoryNames: result.availableFilters?.categories?.map(c => c.name) || categoryNames,
      stockTypes: result.availableFilters?.stockTypes || stockTypes,
      searchPartTypes: result.availableFilters?.searchPartTypes || searchPartTypes,
      years: result.availableFilters?.years || [],
      vehicleData: filteredVehicleData,
      supersessionMatch: result.supersessionMatch || null,
      searchType: result.searchType || null,
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
