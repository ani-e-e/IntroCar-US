'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, X, Grid, List, Package, Car, Mail, ShoppingCart, Check } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';
import { useCart } from '@/context/CartContext';

// Simple product card for reseller sites
function ResellerProductCard({ product, tenantSlug, showPrices, showCart }) {
  const { colors } = useTenant();
  const { addItem, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const displayImage = product.imageUrl || product.image || '/images/logos/introcar-icon.png';
  const inCart = isInCart(product.sku);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      sku: product.sku,
      description: product.description,
      price: product.price || 0,
      priceGbp: product.priceGbp || product.price || 0,
      stockType: product.stockType,
      image: displayImage,
      weight: product.weight || 0.5,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <Link href={`/reseller/${tenantSlug}/products/${product.sku}`} className="block relative aspect-square bg-gray-100">
        <Image
          src={displayImage}
          alt={product.description || product.sku}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Stock Type Badge */}
        {product.stockType && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: colors?.primary }}
            >
              {product.stockType === 'Prestige Parts' ? 'Prestige Parts®' : product.stockType}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-gray-500 font-mono">{product.sku}</span>
        <Link href={`/reseller/${tenantSlug}/products/${product.sku}`}>
          <h3 className="text-gray-900 font-medium mt-1 line-clamp-2 hover:opacity-80 transition-opacity">
            {product.description || 'Part Description'}
          </h3>
        </Link>

        {/* Price and Cart */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {showPrices && product.price ? (
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {showCart && (
                <button
                  onClick={handleAddToCart}
                  disabled={justAdded}
                  className={`p-2 rounded-lg transition-all ${
                    justAdded || inCart
                      ? 'text-white'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ backgroundColor: justAdded || inCart ? '#4CAF50' : colors?.primary }}
                  title={inCart ? 'In cart' : 'Add to cart'}
                >
                  {justAdded || inCart ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          ) : showCart ? (
            <button
              onClick={handleAddToCart}
              disabled={justAdded}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                justAdded || inCart
                  ? 'bg-green-500 text-white'
                  : 'text-white'
              }`}
              style={!(justAdded || inCart) ? { backgroundColor: colors?.primary } : {}}
            >
              {justAdded || inCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <a
              href={`mailto:?subject=Inquiry about ${product.sku}&body=I'm interested in part ${product.sku}: ${product.description}`}
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: colors?.primary }}
            >
              <Mail className="w-4 h-4" />
              Request Quote
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Filter section component
function FilterSection({ title, icon: Icon, defaultOpen = true, children, count, colors }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: colors?.primary }} />}
          <span className="font-medium text-gray-900 text-sm">{title}</span>
          {count > 0 && (
            <span
              className="text-xs text-white px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: colors?.primary }}
            >
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

export default function ResellerProductsContent({ tenant, tenantSlug }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colors, showPrices, showCart, skuFilter, orderEmail, isLight } = useTenant();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [vehicleData, setVehicleData] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  const currentSearch = searchParams.get('search') || '';
  const currentMake = searchParams.get('make') || '';
  const currentModel = searchParams.get('model') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(currentSearch);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentMake) params.set('make', currentMake);
      if (currentModel) params.set('model', currentModel);
      if (currentCategory) params.set('category', currentCategory);
      // Note: skuFilter would be applied server-side if products are tagged
      params.set('page', currentPage.toString());
      params.set('limit', '24');

      // Use reseller API with tenant param for SKU filtering
      params.set('tenant', tenantSlug);
      const res = await fetch(`/api/reseller/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        setCategories(data.categories || []);
        setVehicleData(data.vehicleData || {});
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentMake, currentModel, currentCategory, currentPage, skuFilter]);

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
    router.push(`/reseller/${tenantSlug}/products?${params.toString()}`);
  }

  function setFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === 'make') {
      params.delete('model');
    }
    params.set('page', '1');
    router.push(`/reseller/${tenantSlug}/products?${params.toString()}`);
  }

  function clearFilters() {
    router.push(`/reseller/${tenantSlug}/products`);
    setLocalSearch('');
  }

  function goToPage(page) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/reseller/${tenantSlug}/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasFilters = currentSearch || currentMake || currentModel || currentCategory;
  const makes = Object.keys(vehicleData).sort();
  const models = currentMake && vehicleData[currentMake] ? vehicleData[currentMake].models : [];

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>Parts</span>
            {currentMake && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900">{currentMake}</span>
              </>
            )}
            {currentModel && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900">{currentModel}</span>
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
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': colors?.primary }}
                  />
                </form>
              </div>

              {/* Vehicle Filter */}
              <FilterSection title="Vehicle" icon={Car} defaultOpen={true} count={(currentMake ? 1 : 0) + (currentModel ? 1 : 0)} colors={colors}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Make</label>
                    <div className="space-y-1">
                      {makes.map((make) => (
                        <button
                          key={make}
                          onClick={() => setFilter('make', make)}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentMake === make
                              ? 'text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          style={currentMake === make ? { backgroundColor: colors?.primary } : {}}
                        >
                          {make}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentMake && models.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Model</label>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {models.map((model) => (
                          <button
                            key={model}
                            onClick={() => setFilter('model', model)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              currentModel === model
                                ? 'text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={currentModel === model ? { backgroundColor: colors?.primary } : {}}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FilterSection>

              {/* Category Filter */}
              <FilterSection title="Category" icon={Package} defaultOpen={true} count={currentCategory ? 1 : 0} colors={colors}>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setFilter('category', cat.name)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentCategory === cat.name
                          ? 'text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={currentCategory === cat.name ? { backgroundColor: colors?.primary } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Clear Filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
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
                <h1 className="text-2xl font-display font-light text-gray-900">
                  {currentMake || 'All'} Parts {currentModel && `- ${currentModel}`}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{pagination.total.toLocaleString()} products found</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'text-white' : 'text-gray-500'}`} style={viewMode === 'grid' ? { backgroundColor: colors?.primary } : {}}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'text-white' : 'text-gray-500'}`} style={viewMode === 'list' ? { backgroundColor: colors?.primary } : {}}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contact CTA for light sites */}
            {isLight && (
              <div
                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: `${colors?.primary}10` }}
              >
                <Mail className="w-5 h-5 shrink-0 mt-0.5" style={{ color: colors?.primary }} />
                <div>
                  <p className="font-medium" style={{ color: colors?.primary }}>Contact us to order</p>
                  <p className="text-gray-600 text-sm">
                    Email us at <a href={`mailto:${orderEmail}`} className="underline">{orderEmail}</a> with your part requirements for pricing and availability.
                  </p>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-900">
                    Search: {currentSearch}
                    <button onClick={() => { setFilter('search', ''); setLocalSearch(''); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentMake && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-900">
                    {currentMake}
                    <button onClick={() => setFilter('make', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentModel && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-900">
                    {currentModel}
                    <button onClick={() => setFilter('model', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-900">
                    {currentCategory}
                    <button onClick={() => setFilter('category', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-6 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {products.map((product) => (
                  <ResellerProductCard
                    key={product.sku}
                    product={product}
                    tenantSlug={tenantSlug}
                    showPrices={showPrices}
                    showCart={showCart}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 rounded-full text-white font-medium"
                  style={{ backgroundColor: colors?.primary }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}
