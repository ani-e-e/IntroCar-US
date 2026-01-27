'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, BookOpen, ZoomIn, ZoomOut, Grid, List, Package, Car, Tag, Layers } from 'lucide-react';

export default function CatalogueDetailContent() {
  const params = useParams();
  const catalogueId = params.id;

  const [catalogue, setCatalogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageZoom, setImageZoom] = useState(true); // Default to enlarged
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!catalogueId) return;

    async function fetchCatalogue() {
      setLoading(true);
      try {
        const res = await fetch(`/api/catalogues/${encodeURIComponent(catalogueId)}`);
        if (res.ok) {
          const data = await res.json();
          setCatalogue(data);
        }
      } catch (error) {
        console.error('Error fetching catalogue:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogue();
  }, [catalogueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-introcar-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading catalogue...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-display text-introcar-charcoal mb-2">Catalogue Not Found</h2>
          <p className="text-gray-500 mb-6">The requested catalogue could not be found.</p>
          <Link href="/catalogues" className="btn-primary">
            Browse Catalogues
          </Link>
        </div>
        <Footer />
      </div>
    );
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
            <Link href="/catalogues" className="hover:text-introcar-blue">Catalogues</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-introcar-blue truncate max-w-xs">{catalogue.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Catalogue Image & Info */}
          <div className="lg:w-1/2">
            <div className="sticky top-24">
              <div
                className={`relative bg-introcar-light rounded-xl overflow-hidden transition-all cursor-pointer ${imageZoom ? 'aspect-auto' : 'aspect-[4/3]'}`}
                onClick={() => setImageZoom(!imageZoom)}
              >
                {(catalogue.image || catalogue.imageUrl) ? (
                  <Image
                    src={catalogue.image || catalogue.imageUrl}
                    alt={catalogue.title}
                    fill={!imageZoom}
                    width={imageZoom ? 1200 : undefined}
                    height={imageZoom ? 900 : undefined}
                    className={`${imageZoom ? 'w-full h-auto' : 'object-contain'}`}
                    sizes={imageZoom ? '100vw' : '50vw'}
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <BookOpen className="w-24 h-24 text-gray-300" />
                  </div>
                )}
                {/* Zoom indicator - only show when shrunk */}
                {!imageZoom && (
                  <div className="absolute bottom-4 right-4 bg-white/90 text-introcar-charcoal px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Click to enlarge
                  </div>
                )}
              </div>

              {/* Catalogue Info */}
              <div className="mt-6">
                <h1 className="text-2xl font-display font-light text-introcar-charcoal">{catalogue.title}</h1>
                <p className="text-sm text-gray-500 font-mono mt-2">{catalogue.id}</p>

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {catalogue.hotspotCount} parts shown
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {catalogue.products?.length || 0} available
                  </span>
                </div>

                {/* Metadata Section */}
                <div className="mt-6 p-4 bg-introcar-light rounded-xl space-y-4">
                  {/* Makes */}
                  {catalogue.makes && catalogue.makes.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Car className="w-5 h-5 text-introcar-blue shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Make</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {catalogue.makes.map(make => (
                            <Link
                              key={make}
                              href={`/catalogues?make=${encodeURIComponent(make)}`}
                              className="text-sm text-introcar-charcoal hover:text-introcar-blue"
                            >
                              {make}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Models */}
                  {catalogue.models && catalogue.models.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Layers className="w-5 h-5 text-introcar-blue shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Models</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {catalogue.models.slice(0, 6).map(model => (
                            <span key={model} className="text-sm px-2 py-0.5 bg-white rounded text-gray-700">
                              {model}
                            </span>
                          ))}
                          {catalogue.models.length > 6 && (
                            <span className="text-sm text-gray-500">+{catalogue.models.length - 6} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {catalogue.category && (
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-introcar-blue shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                        <Link
                          href={`/catalogues?category=${encodeURIComponent(catalogue.category)}`}
                          className="text-sm text-introcar-charcoal hover:text-introcar-blue"
                        >
                          {catalogue.category}
                          {catalogue.subcategory && ` / ${catalogue.subcategory}`}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Fitment Summary */}
                  {catalogue.fitment && catalogue.fitment.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Chassis Application</p>
                      <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
                        {catalogue.fitment.slice(0, 8).map((f, i) => (
                          <div key={i} className="flex justify-between text-gray-700">
                            <span>{f.model}</span>
                            <span className="font-mono text-introcar-blue">
                              {f.chassisStart}{f.chassisEnd && f.chassisEnd !== f.chassisStart ? ` – ${f.chassisEnd}` : ''}
                            </span>
                          </div>
                        ))}
                        {catalogue.fitment.length > 8 && (
                          <p className="text-gray-500 text-xs">+{catalogue.fitment.length - 8} more applications</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-light text-introcar-charcoal">
                Available Parts
              </h2>
              <div className="flex items-center bg-introcar-light rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-introcar-blue text-white' : 'text-gray-500'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-introcar-blue text-white' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {catalogue.products && catalogue.products.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                {catalogue.products.map((product) => (
                  <ProductCard key={product.sku} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-introcar-light rounded-xl">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No products currently available for this catalogue.</p>
                <p className="text-sm text-gray-400 mt-2">Check back later or contact us for assistance.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
