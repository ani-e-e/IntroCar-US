'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedParts from '@/components/RelatedParts';
import CatalogueLink from '@/components/CatalogueLink';
import ProductVideo from '@/components/ProductVideo';
import { ChevronRight, Package, Truck, Shield, CheckCircle, Info, Video } from 'lucide-react';

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

  // Format NLA date to "Dec 2015" format
  const formatNLADate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Try parsing various date formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try UK format dd/mm/yyyy or similar
        const parts = dateStr.split(/[\/\-\.]/);
        if (parts.length >= 2) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = parseInt(parts[1]) - 1;
          const year = parts[2] || parts[0];
          if (month >= 0 && month < 12) {
            return `${months[month]} ${year.length === 2 ? '20' + year : year}`;
          }
        }
        return dateStr; // Return as-is if can't parse
      }
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-100 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-1/3" />
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-introcar-charcoal mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-8">The product "{sku}" could not be found.</p>
          <Link href="/products" className="btn-primary inline-block">
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

  // Determine make from NLA field or fitment
  const nlaMake = product.nlaDate ? (
    product.stockType?.toLowerCase().includes('rolls') ? 'Rolls-Royce' : 'Bentley'
  ) : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-introcar-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-introcar-charcoal">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-introcar-charcoal">Parts</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-introcar-blue">{product.sku}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image & Video */}
          <div>
            <div className="bg-introcar-light rounded-xl overflow-hidden border border-gray-200">
              <div className="aspect-square relative">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.description}
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-introcar-light">
                    <Image
                      src="/images/logos/introcar-icon.png"
                      alt="No image available"
                      width={200}
                      height={200}
                      className="opacity-40"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Video */}
            <ProductVideo sku={product.sku} parentSku={product.parentSku} />
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {isPrestige && (
                <span className="px-3 py-1 bg-introcar-gold/20 text-introcar-gold rounded-full text-sm font-medium">
                  Prestige Parts®
                </span>
              )}
              {isNLA && (
                <span className="px-3 py-1 bg-introcar-blue/10 text-introcar-blue rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {nlaMake || 'OE'} NLA
                </span>
              )}
              {hasStock && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  In Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-semibold text-introcar-charcoal mb-2">{product.description}</h1>
            <p className="text-gray-500 mb-6">Part Number: {product.sku} | Ref: {product.parentSku}</p>

            {product.price && (
              <div className="text-3xl font-bold text-introcar-gold mb-6">
                ${product.price.toFixed(2)}
              </div>
            )}

            {product.stockType && (
              <p className="text-gray-700 mb-4">
                <span className="text-gray-500">Stock Type:</span> {product.stockType}
              </p>
            )}

            {product.numberRequired && (
              <p className="text-gray-700 mb-4">
                <span className="text-gray-500">Number Required:</span> {product.numberRequired}
              </p>
            )}

            {product.additionalInfo && (
              <p className="text-gray-600 text-sm mb-6 italic">
                {product.additionalInfo}
              </p>
            )}

            {isNLA && product.nlaDate && (
              <div className="mb-6 p-4 bg-introcar-blue/5 border border-introcar-blue/20 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-introcar-blue shrink-0 mt-0.5" />
                <div>
                  <p className="text-introcar-charcoal font-medium">Original Equipment Discontinued</p>
                  <p className="text-gray-600 text-sm">{nlaMake || 'Manufacturer'} NLA since: {formatNLADate(product.nlaDate)}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-introcar-light rounded-xl border border-gray-200">
                <Truck className="w-5 h-5 text-introcar-gold" />
                <div>
                  <p className="text-introcar-charcoal text-sm font-medium">Fast Shipping</p>
                  <p className="text-gray-500 text-xs">Worldwide delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-introcar-light rounded-xl border border-gray-200">
                <Shield className="w-5 h-5 text-introcar-gold" />
                <div>
                  <p className="text-introcar-charcoal text-sm font-medium">3-Year Warranty</p>
                  <p className="text-gray-500 text-xs">On Prestige Parts</p>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-introcar-gold text-white font-bold rounded-xl hover:bg-introcar-gold/90 transition-colors mb-4">
              Add to Cart
            </button>

            {product.catalogueUrl && (
              <CatalogueLink url={product.catalogueUrl} className="w-full justify-center" />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button onClick={() => setActiveTab('details')} className={`pb-4 font-medium transition-colors ${activeTab === 'details' ? 'text-introcar-blue border-b-2 border-introcar-blue' : 'text-gray-400 hover:text-introcar-charcoal'}`}>
              Details
            </button>
            {product.fitment && product.fitment.length > 0 && (
              <button onClick={() => setActiveTab('fitment')} className={`pb-4 font-medium transition-colors ${activeTab === 'fitment' ? 'text-introcar-blue border-b-2 border-introcar-blue' : 'text-gray-400 hover:text-introcar-charcoal'}`}>
                Model Application Data ({product.fitment.length})
              </button>
            )}
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="bg-introcar-light rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-introcar-charcoal mb-4">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Part Number</span>
                <span className="text-introcar-charcoal font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Ref</span>
                <span className="text-introcar-charcoal font-medium">{product.parentSku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Stock Type</span>
                <span className="text-introcar-charcoal">{product.stockType}</span>
              </div>
              {product.numberRequired && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Number Required</span>
                  <span className="text-introcar-charcoal">{product.numberRequired}</span>
                </div>
              )}
              {product.categories && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Category</span>
                  <span className="text-introcar-charcoal">{product.categories}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Weight</span>
                  <span className="text-introcar-charcoal">{product.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fitment' && product.fitment && product.fitment.length > 0 && (
          <div className="bg-introcar-light rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-introcar-charcoal mb-4">Model Application Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-300">
                    <th className="pb-3 pr-4">Make</th>
                    <th className="pb-3 pr-4">Model</th>
                    <th className="pb-3 pr-4">Chassis Range</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-introcar-charcoal">
                  {product.fitment.map((f, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-3 pr-4">{f.make}</td>
                      <td className="py-3 pr-4">{f.model}</td>
                      <td className="py-3 pr-4 font-mono text-introcar-blue">
                        {f.chassisStart && f.chassisEnd ? `${f.chassisStart} → ${f.chassisEnd}` : f.chassisStart || 'All'}
                      </td>
                      <td className="py-3 text-gray-500">{f.additionalInfo || '-'}</td>
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
