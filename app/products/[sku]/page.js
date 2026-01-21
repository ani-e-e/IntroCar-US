'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedParts from '@/components/RelatedParts';
import CatalogueLink from '@/components/CatalogueLink';
import { ChevronRight, Package, Truck, Shield, AlertTriangle, Info } from 'lucide-react';

export default function ProductPage({ params }) {
  const { sku } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${sku}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [sku]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-800 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-slate-800 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-slate-800 rounded w-1/2" />
                <div className="h-6 bg-slate-800 rounded w-full" />
                <div className="h-10 bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Product Not Found</h1>
          <p className="text-slate-400 mb-8">The product "{sku}" could not be found.</p>
          <Link href="/products" className="px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg">
            Browse All Parts
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isNLA = product.nlaDate && product.nlaDate !== '';
  const isPrestige = product.stockType?.toLowerCase().includes('prestige');
  const hasStock = product.availableNow > 0 || product.available1to3Days > 0 || product.inStock;

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-white">Parts</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-amber-500">{product.sku}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <div className="aspect-square relative">
              {product.image || product.imageUrl ? (
                <Image src={product.image || product.imageUrl} alt={product.description} fill className="object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-slate-600" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {isPrestige && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                  Prestige Parts®
                </span>
              )}
              {isNLA && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> NLA from Bentley
                </span>
              )}
              {hasStock && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  In Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-2">{product.description}</h1>
            <p className="text-slate-400 mb-6">SKU: {product.sku} | Parent: {product.parentSku}</p>

            {product.price && (
              <div className="text-3xl font-bold text-amber-500 mb-6">
                ${product.price.toFixed(2)}
              </div>
            )}

            {product.stockType && (
              <p className="text-slate-300 mb-4">
                <span className="text-slate-500">Type:</span> {product.stockType}
              </p>
            )}

            {product.additionalInfo && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Application Note</p>
                  <p className="text-slate-300 text-sm">{product.additionalInfo}</p>
                </div>
              </div>
            )}

            {isNLA && product.nlaDate && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">No Longer Available from Bentley Motors</p>
                  <p className="text-slate-300 text-sm">Discontinued: {product.nlaDate}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl">
                <Truck className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-white text-sm font-medium">Fast Shipping</p>
                  <p className="text-slate-400 text-xs">Worldwide delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl">
                <Shield className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-white text-sm font-medium">3-Year Warranty</p>
                  <p className="text-slate-400 text-xs">On Prestige Parts</p>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors mb-4">
              Add to Cart
            </button>

            {product.catalogueUrl && (
              <CatalogueLink url={product.catalogueUrl} className="w-full justify-center" />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800 mb-6">
          <div className="flex gap-8">
            <button onClick={() => setActiveTab('details')} className={`pb-4 font-medium transition-colors ${activeTab === 'details' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}>
              Details
            </button>
            {product.fitment && product.fitment.length > 0 && (
              <button onClick={() => setActiveTab('fitment')} className={`pb-4 font-medium transition-colors ${activeTab === 'fitment' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}>
                Fitment ({product.fitment.length})
              </button>
            )}
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">SKU</span>
                <span className="text-white">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Parent SKU</span>
                <span className="text-white">{product.parentSku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Stock Type</span>
                <span className="text-white">{product.stockType}</span>
              </div>
              {product.categories && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white">{product.categories}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Weight</span>
                  <span className="text-white">{product.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fitment' && product.fitment && product.fitment.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Vehicle Fitment</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="pb-3 pr-4">Make</th>
                    <th className="pb-3 pr-4">Model</th>
                    <th className="pb-3 pr-4">Chassis Range</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {product.fitment.map((f, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-3 pr-4">{f.make}</td>
                      <td className="py-3 pr-4">{f.model}</td>
                      <td className="py-3 pr-4 font-mono text-amber-400">
                        {f.chassisStart && f.chassisEnd ? `${f.chassisStart} → ${f.chassisEnd}` : f.chassisStart || 'All'}
                      </td>
                      <td className="py-3 text-slate-400">{f.additionalInfo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <RelatedParts sku={product.sku} />
      </div>

      <Footer />
    </div>
  );
}
