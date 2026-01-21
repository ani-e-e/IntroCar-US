'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, ChevronRight, ChevronLeft, BookOpen, Package, X, Filter } from 'lucide-react';

export default function CataloguesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ makes: [], models: [], categories: [] });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentSearch = searchParams.get('search') || '';
  const currentMake = searchParams.get('make') || '';
  const currentModel = searchParams.get('model') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(currentSearch);

  const fetchCatalogues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentMake) params.set('make', currentMake);
      if (currentModel) params.set('model', currentModel);
      if (currentCategory) params.set('category', currentCategory);
      params.set('page', currentPage.toString());
      params.set('limit', '24');

      const res = await fetch(`/api/lookbooks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCatalogues(data.lookbooks || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        setFilters(data.filters || { makes: [], models: [], categories: [] });
      }
    } catch (error) {
      console.error('Error fetching catalogues:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentMake, currentModel, currentCategory, currentPage]);

  useEffect(() => {
    fetchCatalogues();
  }, [fetchCatalogues]);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch) {
      params.set('search', localSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/catalogues?${params.toString()}`);
  }

  function setFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Clear model if make changes
    if (key === 'make') {
      params.delete('model');
    }
    params.set('page', '1');
    router.push(`/catalogues?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/catalogues');
  }

  function goToPage(page) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/catalogues?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasFilters = currentSearch || currentMake || currentModel || currentCategory;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-introcar-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-introcar-blue">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-introcar-blue">Catalogues</span>
            {currentMake && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-introcar-charcoal">{currentMake}</span>
              </>
            )}
            {currentCategory && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-introcar-charcoal">{currentCategory}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-introcar-blue py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/80" />
          <h1 className="text-3xl font-display font-light mb-4 text-white">Parts Catalogues</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Browse our extensive collection of technical diagrams and exploded views.
            Find the exact part you need by viewing it in context.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="text-introcar-charcoal font-medium mb-3">Search</h3>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Catalogue or part number..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-introcar-charcoal placeholder-gray-400 focus:outline-none focus:border-introcar-blue text-sm"
                  />
                </form>
              </div>

              {/* Make Filter */}
              <div>
                <h3 className="text-introcar-charcoal font-medium mb-3">Make</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilter('make', '')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!currentMake ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                  >
                    All Makes
                  </button>
                  {filters.makes.map((make) => (
                    <button
                      key={make}
                      onClick={() => setFilter('make', make)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentMake === make ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                    >
                      {make}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Filter - only show if make is selected */}
              {currentMake && filters.models.length > 0 && (
                <div>
                  <h3 className="text-introcar-charcoal font-medium mb-3">Model</h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => setFilter('model', '')}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!currentModel ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                    >
                      All Models
                    </button>
                    {filters.models.map((model) => (
                      <button
                        key={model}
                        onClick={() => setFilter('model', model)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentModel === model ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div>
                <h3 className="text-introcar-charcoal font-medium mb-3">Category</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => setFilter('category', '')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!currentCategory ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                  >
                    All Categories
                  </button>
                  {filters.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter('category', cat)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${currentCategory === cat ? 'bg-introcar-blue text-white' : 'text-gray-600 hover:text-introcar-charcoal hover:bg-introcar-light'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-introcar-blue hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-introcar-light rounded-lg text-introcar-charcoal"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasFilters && <span className="ml-1 w-5 h-5 bg-introcar-blue text-white text-xs rounded-full flex items-center justify-center">!</span>}
              </button>
            </div>

            {/* Mobile Filters Panel */}
            {filtersOpen && (
              <div className="lg:hidden mb-6 p-4 bg-introcar-light rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-introcar-charcoal">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <select
                  value={currentMake}
                  onChange={(e) => { setFilter('make', e.target.value); }}
                  className="input-field w-full"
                >
                  <option value="">All Makes</option>
                  {filters.makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
                {currentMake && filters.models.length > 0 && (
                  <select
                    value={currentModel}
                    onChange={(e) => setFilter('model', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">All Models</option>
                    {filters.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                )}
                <select
                  value={currentCategory}
                  onChange={(e) => setFilter('category', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">All Categories</option>
                  {filters.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm text-introcar-blue hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Active Filters */}
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
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-introcar-light rounded-full text-sm text-introcar-charcoal">
                    {currentCategory}
                    <button onClick={() => setFilter('category', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="text-gray-500 text-sm mb-6">
              {pagination.total.toLocaleString()} catalogues {hasFilters ? 'found' : 'available'}
            </p>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl animate-pulse">
                    <div className="aspect-[4/3] bg-introcar-light rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-introcar-light rounded w-3/4" />
                      <div className="h-3 bg-introcar-light rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Catalogues Grid */}
            {!loading && catalogues.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogues.map((catalogue) => (
                  <Link
                    key={catalogue.id}
                    href={`/catalogues/${encodeURIComponent(catalogue.id)}`}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-introcar-light">
                      {catalogue.imageUrl ? (
                        <Image
                          src={catalogue.imageUrl}
                          alt={catalogue.title}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      {/* Parts count badge */}
                      <div className="absolute bottom-2 right-2 bg-introcar-blue text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {catalogue.hotspotCount} parts
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-introcar-charcoal font-medium line-clamp-2 group-hover:text-introcar-blue transition-colors">
                        {catalogue.title}
                      </h3>
                      {/* Metadata */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {catalogue.makes?.map(make => (
                          <span key={make} className="text-xs px-2 py-0.5 bg-introcar-light rounded text-gray-600">
                            {make}
                          </span>
                        ))}
                        {catalogue.category && (
                          <span className="text-xs px-2 py-0.5 bg-introcar-blue/10 rounded text-introcar-blue">
                            {catalogue.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && catalogues.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl text-introcar-charcoal mb-2">No catalogues found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-introcar-light text-gray-500 hover:text-introcar-charcoal disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-introcar-light text-gray-500 hover:text-introcar-charcoal disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
