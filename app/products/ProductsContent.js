'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Search, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, X, AlertCircle, SlidersHorizontal, Grid, List, Package, Car, Tag } from 'lucide-react';

// Collapsible filter section component
function FilterSection({ title, icon: Icon, defaultOpen = true, children, count }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-introcar-light hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-introcar-blue" />}
          <span className="font-medium text-introcar-charcoal text-sm">{title}</span>
          {count > 0 && (
            <span className="text-xs bg-introcar-blue text-white px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]); // Now contains {name, subcategories[]}
  const [stockTypes, setStockTypes] = useState([]);
  const [vehicleData, setVehicleData] = useState({});
  const [supersessionMatch, setSupersessionMatch] = useState(null);
  const [searchType, setSearchType] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const currentSearch = searchParams.get('search') || '';
  const currentMake = searchParams.get('make') || '';
  const currentModel = searchParams.get('model') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentStockType = searchParams.get('stockType') || '';
  const currentYear = searchParams.get('year') || '';
  const currentChassis = searchParams.get('chassis') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSort = searchParams.get('sort') || 'relevance';

  const [localSearch, setLocalSearch] = useState(currentSearch);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentMake) params.set('make', currentMake);
      if (currentModel) params.set('model', currentModel);
      if (currentYear) params.set('year', currentYear);
      if (currentChassis) params.set('chassis', currentChassis);
      if (currentCategory) params.set('category', currentCategory);
      if (currentSubcategory) params.set('subcategory', currentSubcategory);
      if (currentStockType) params.set('stockType', currentStockType);
      if (currentSort) params.set('sort', currentSort);
      params.set('page', currentPage.toString());
      params.set('limit', '24');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        setCategories(data.categories || []); // Now array of {name, subcategories[]}
        setStockTypes(data.stockTypes || []);
        setVehicleData(data.vehicleData || {});
        setSupersessionMatch(data.supersessionMatch);
        setSearchType(data.searchType);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentMake, currentModel, currentYear, currentChassis, currentCategory, currentSubcategory, currentStockType, currentPage, currentSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch) {
      params.set('search', localSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  }

  function setFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Clear subcategory if category changes
    if (key === 'category') {
      params.delete('subcategory');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  }

  function setCategoryFilter(category, subcategory = '') {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
      if (subcategory) {
        params.set('subcategory', subcategory);
      } else {
        params.delete('subcategory');
      }
    } else {
      params.delete('category');
      params.delete('subcategory');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/products');
    setLocalSearch('');
    setExpandedCategory(null);
  }

  function goToPage(page) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasFilters = currentSearch || currentMake || currentModel || currentYear || currentChassis || currentCategory || currentSubcategory || currentStockType;
  const makes = Object.keys(vehicleData).sort();
  const models = currentMake && vehicleData[currentMake] ? vehicleData[currentMake].models : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-introcar-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-introcar-blue">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-introcar-blue">Parts</span>
            {currentMake && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-introcar-charcoal">{currentMake}</span>
              </>
            )}
            {currentModel && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-introcar-charcoal">{currentModel}</span>
              </>
            )}
            {currentYear && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-introcar-charcoal">{currentYear}</span>
              </>
            )}
            {currentChassis && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-introcar-blue font-medium">Chassis {currentChassis}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Search */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search part number..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-introcar-light border-0 rounded-lg text-introcar-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-introcar-blue text-sm"
                  />
                </form>
              </div>

              {/* Category - MOVED TO TOP for better visibility */}
              <FilterSection title="Category" icon={Package} defaultOpen={true} count={currentCategory ? 1 : 0}>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => setCategoryFilter('')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.name}>
                      <button
                        onClick={() => {
                          if (cat.subcategories && cat.subcategories.length > 0) {
                            setExpandedCategory(expandedCategory === cat.name ? null : cat.name);
                          }
                          setCategoryFilter(cat.name);
                        }}
                        className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.name && !currentSubcategory ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      {/* Subcategories */}
                      {expandedCategory === cat.name && cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-introcar-blue/20 pl-3">
                          {cat.subcategories.map((sub) => (
                            <button
                              key={sub}
                              onClick={() => setCategoryFilter(cat.name, sub)}
                              className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${currentCategory === cat.name && currentSubcategory === sub ? 'bg-introcar-blue text-white' : 'text-gray-500 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </FilterSection>

              {/* Part Type (Stock Type) - After Category */}
              <FilterSection title="Part Type" icon={Tag} defaultOpen={true} count={currentStockType ? 1 : 0}>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilter('stockType', '')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentStockType ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                  >
                    All Types
                  </button>
                  {stockTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter('stockType', type)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentStockType === type ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Vehicle Selection */}
              <FilterSection title="Vehicle" icon={Car} defaultOpen={!!(currentMake || currentModel)} count={(currentMake ? 1 : 0) + (currentModel ? 1 : 0)}>
                <div className="space-y-3">
                  {/* Make */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Make</label>
                    <div className="space-y-1">
                      <button
                        onClick={() => setFilter('make', '')}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentMake ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                      >
                        All Makes
                      </button>
                      {makes.map((make) => (
                        <button
                          key={make}
                          onClick={() => setFilter('make', make)}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentMake === make ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                        >
                          {make}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model - Only show if make selected */}
                  {currentMake && models.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Model</label>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => setFilter('model', '')}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentModel ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                        >
                          All {currentMake} Models
                        </button>
                        {models.map((model) => (
                          <button
                            key={model}
                            onClick={() => setFilter('model', model)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentModel === model ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FilterSection>

              {/* Clear Filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-display font-light text-introcar-charcoal">
                  {currentMake || 'All'} Parts {currentModel && `- ${currentModel}`}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{pagination.total.toLocaleString()} products found</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFiltersOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-introcar-light text-introcar-charcoal rounded-lg">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <select value={currentSort} onChange={(e) => setFilter('sort', e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-introcar-charcoal text-sm">
                  <option value="relevance">Relevance</option>
                  <option value="popularity">Best Sellers</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="sku">SKU</option>
                </select>
                <div className="flex items-center bg-introcar-light rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-introcar-blue text-white' : 'text-gray-500'}`}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-introcar-blue text-white' : 'text-gray-500'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {supersessionMatch && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-introcar-charcoal font-medium">Superseded Part Number</p>
                  <p className="text-gray-600 text-sm">"{supersessionMatch.oldSku}" has been replaced. Showing current parts.</p>
                </div>
              </div>
            )}

            {searchType === 'variant' && currentSearch && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-introcar-charcoal font-medium">Showing all variants for "{currentSearch}"</p>
                  <p className="text-gray-600 text-sm">Results include all suffix variants (e.g., -X, -A, -U)</p>
                </div>
              </div>
            )}

            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    Search: {currentSearch}
                    <button onClick={() => { setFilter('search', ''); setLocalSearch(''); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentMake && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    {currentMake}
                    <button onClick={() => setFilter('make', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentModel && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    {currentModel}
                    <button onClick={() => setFilter('model', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentYear && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    Year: {currentYear}
                    <button onClick={() => setFilter('year', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentChassis && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-blue/10 rounded-full text-sm text-introcar-blue">
                    Chassis: {currentChassis}
                    <button onClick={() => setFilter('chassis', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    {currentCategory}{currentSubcategory && ` / ${currentSubcategory}`}
                    <button onClick={() => setCategoryFilter('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentStockType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    {currentStockType}
                    <button onClick={() => setFilter('stockType', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl animate-pulse">
                    <div className="aspect-square bg-introcar-light rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-introcar-light rounded w-1/2" />
                      <div className="h-4 bg-introcar-light rounded w-full" />
                      <div className="h-6 bg-introcar-light rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product.sku} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-introcar-light rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl text-introcar-charcoal mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-lg bg-introcar-light text-gray-500 hover:text-introcar-charcoal disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg bg-introcar-light text-gray-500 hover:text-introcar-charcoal disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-display font-light text-introcar-charcoal">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-introcar-charcoal">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Category - FIRST */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-introcar-blue" />
                  <h3 className="text-introcar-charcoal font-medium">Category</h3>
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  <button onClick={() => { setCategoryFilter(''); setFiltersOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!currentCategory ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:bg-introcar-light'}`}>
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button key={cat.name} onClick={() => { setCategoryFilter(cat.name); setFiltersOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentCategory === cat.name ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:bg-introcar-light'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Part Type - SECOND */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-introcar-blue" />
                  <h3 className="text-introcar-charcoal font-medium">Part Type</h3>
                </div>
                <div className="space-y-1">
                  {['', ...stockTypes].map((type) => (
                    <button key={type} onClick={() => { setFilter('stockType', type); setFiltersOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentStockType === type ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:bg-introcar-light'}`}>
                      {type || 'All Types'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle - THIRD */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Car className="w-4 h-4 text-introcar-blue" />
                  <h3 className="text-introcar-charcoal font-medium">Vehicle</h3>
                </div>
                <div className="space-y-1">
                  {['', ...makes].map((make) => (
                    <button key={make} onClick={() => { setFilter('make', make); if (!make) setFiltersOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentMake === make ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:bg-introcar-light'}`}>
                      {make || 'All Makes'}
                    </button>
                  ))}
                </div>
                {currentMake && models.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Model</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {models.map((model) => (
                        <button key={model} onClick={() => { setFilter('model', model); setFiltersOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentModel === model ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:bg-introcar-light'}`}>
                          {model}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {hasFilters && (
                <button onClick={() => { clearFilters(); setFiltersOpen(false); }} className="w-full py-3 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
