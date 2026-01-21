import { NextResponse } from 'next/server';
import { filterProducts, getCategories, getStockTypes, getVehicleData } from '@/lib/data-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      stockType: searchParams.get('stockType') || '',
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      year: searchParams.get('year') || '',
      nlaOnly: searchParams.get('nlaOnly') === 'true',
      inStockOnly: searchParams.get('inStockOnly') === 'true',
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 24,
    };
    
    const sort = searchParams.get('sort') || 'relevance';
    const result = filterProducts({ ...filters, sort });
    const categories = getCategories();
    const stockTypes = getStockTypes();
    const vehicleData = getVehicleData();

    return NextResponse.json({
      products: result.products,
      pagination: result.pagination,
      categories,
      stockTypes,
      vehicleData,
      supersessionMatch: result.supersessionMatch || null,
      searchType: result.searchType || null,
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
