'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, ChevronRight, ChevronLeft, BookOpen, Package } from 'lucide-react';

export default function CataloguesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(currentSearch);

  const fetchLookbooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      params.set('page', currentPage.toString());
      params.set('limit', '24');

      const res = await fetch(`/api/lookbooks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLookbooks(data.lookbooks || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching lookbooks:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentPage]);

  useEffect(() => {
    fetchLookbooks();
  }, [fetchLookbooks]);

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

  function goToPage(page) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/catalogues?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-introcar-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-display font-light mb-4">Parts Catalogues</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Browse our extensive collection of technical diagrams and exploded views.
            Find the exact part you need by viewing it in context.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search catalogues by name or part number..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-full text-introcar-charcoal placeholder-gray-400 focus:outline-none focus:border-introcar-blue"
            />
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">
            {pagination.total.toLocaleString()} catalogues available
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        {!loading && lookbooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lookbooks.map((lookbook) => (
              <Link
                key={lookbook.id}
                href={`/catalogues/${encodeURIComponent(lookbook.id)}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-introcar-light">
                  {lookbook.imageUrl ? (
                    <Image
                      src={lookbook.imageUrl}
                      alt={lookbook.title}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {/* Parts count badge */}
                  <div className="absolute bottom-2 right-2 bg-introcar-blue text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {lookbook.hotspotCount} parts
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-introcar-charcoal font-medium line-clamp-2 group-hover:text-introcar-blue transition-colors">
                    {lookbook.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{lookbook.id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && lookbooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl text-introcar-charcoal mb-2">No catalogues found</h3>
            <p className="text-gray-500">Try a different search term</p>
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

      <Footer />
    </div>
  );
}
