'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedParts from '@/components/RelatedParts';
import CatalogueLink from '@/components/CatalogueLink';
import ProductVideo from '@/components/ProductVideo';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ChevronRight, Package, Truck, Shield, CheckCircle, Info, Video, ShoppingCart, Check } from 'lucide-react';

export default function ProductPage({ params }) {
  const { sku } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, isInCart } = useCart();
  const { formatGbpAsUsd, convertToUsd } = useCurrency();

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

  // Format NLA date to "Sep 2014" format (from "1st September 2014" or similar)
  const formatNLADate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const monthsLong = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Try to parse format like "1st September 2014" or "24th January 2025"
      const lowerStr = dateStr.toLowerCase();
      for (let i = 0; i < monthsLong.length; i++) {
        if (lowerStr.includes(monthsLong[i])) {
          // Extract the year (4 digit number)
          const yearMatch = dateStr.match(/\d{4}/);
          if (yearMatch) {
            return `${monthsShort[i]} ${yearMatch[0]}`;
          }
        }
      }

      // Fallback: try parsing as standard date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      return dateStr; // Return as-is if can't parse
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
                <span className="px-3 py-1 bg-introcar-blue/10 text-introcar-blue rounded-full text-sm font-medium">
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
              <div className="text-3xl font-bold text-introcar-charcoal mb-6">
                {formatGbpAsUsd(product.price)}
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
                <Truck className="w-5 h-5 text-introcar-blue" />
                <div>
                  <p className="text-introcar-charcoal text-sm font-medium">Fast Shipping</p>
                  <p className="text-gray-500 text-xs">Worldwide delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-introcar-light rounded-xl border border-gray-200">
                <Shield className="w-5 h-5 text-introcar-blue" />
                <div>
                  <p className="text-introcar-charcoal text-sm font-medium">3-Year Warranty</p>
                  <p className="text-gray-500 text-xs">On Prestige Parts</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-600">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                addItem({
                  sku: product.sku,
                  description: product.description,
                  price: convertToUsd(product.price), // USD price for Stripe
                  priceGbp: product.price, // Original GBP price for Magento
                  stockType: product.stockType,
                  image: product.imageUrl,
                  weight: product.weight || 0.5,
                }, quantity);
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
              className={`w-full py-4 font-bold rounded-xl transition-colors mb-4 flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-introcar-blue text-white hover:bg-introcar-blue/90'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>

            {isInCart(product.sku) && !addedToCart && (
              <Link
                href="/cart"
                className="block w-full py-3 text-center text-introcar-blue border border-introcar-blue rounded-xl hover:bg-introcar-blue/5 transition-colors mb-4"
              >
                View Cart
              </Link>
            )}

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
                <div className="col-span-1 md:col-span-2 py-2 border-b border-gray-200">
                  <span className="text-gray-500 block mb-2">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.split('|').map((cat, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-introcar-charcoal">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
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
