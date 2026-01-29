'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, Truck, Shield, CheckCircle, Mail, Phone, ArrowLeft, ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import ResellerHeader from '../../components/ResellerHeader';
import ResellerFooter from '../../components/ResellerFooter';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { useCart } from '@/context/CartContext';
import { getTenant } from '@/lib/tenants';

function ResellerProductDetail({ params }) {
  const { sku, tenant: tenantSlug } = params;
  const { colors, showPrices, showCart, orderEmail, companyInfo, isLight } = useTenant();
  const { addItem, isInCart, getItem, updateQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

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

  // Format NLA date
  const formatNLADate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const monthsLong = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const lowerStr = dateStr.toLowerCase();
      for (let i = 0; i < monthsLong.length; i++) {
        if (lowerStr.includes(monthsLong[i])) {
          const yearMatch = dateStr.match(/\d{4}/);
          if (yearMatch) {
            return `${monthsShort[i]} ${yearMatch[0]}`;
          }
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
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
        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-8">The product "{sku}" could not be found.</p>
          <Link
            href={`/reseller/${tenantSlug}/products`}
            className="px-6 py-3 rounded-full text-white font-medium inline-block"
            style={{ backgroundColor: colors?.primary }}
          >
            Browse All Parts
          </Link>
        </div>
        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  const isNLA = product.nlaDate && product.nlaDate !== '';
  const isPrestige = product.stockType?.toLowerCase().includes('prestige') || product.stockType === 'Uprated';
  const hasStock = product.availableNow > 0 || product.available1to3Days > 0 || product.inStock;
  const nlaMake = product.nlaDate ? (
    product.stockType?.toLowerCase().includes('rolls') ? 'Rolls-Royce' : 'Bentley'
  ) : null;

  // Reseller availability logic
  const PRESTIGE_STOCK_TYPES = ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated'];
  const isResellerAvailable = PRESTIGE_STOCK_TYPES.includes(product.stockType);
  const resellerAvailabilityText = isResellerAvailable ? 'Available' : 'Send Request';

  const inCart = isInCart(product.sku);
  const cartItem = getItem(product.sku);

  const handleAddToCart = () => {
    addItem({
      sku: product.sku,
      description: product.description,
      price: product.price || 0,
      priceGbp: product.priceGbp || product.price || 0,
      stockType: product.stockType,
      image: product.imageUrl || '/images/logos/introcar-icon.png',
      weight: product.weight || 0.5,
    }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/reseller/${tenantSlug}/products`} className="hover:text-gray-900">Parts</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>{product.sku}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/reseller/${tenantSlug}/products`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Parts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div>
            <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {isPrestige && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${colors?.primary}15`, color: colors?.primary }}
                >
                  Prestige Parts®
                </span>
              )}
              {isNLA && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                  style={{ backgroundColor: `${colors?.primary}15`, color: colors?.primary }}
                >
                  <CheckCircle className="w-3 h-3" /> {nlaMake || 'OE'} NLA
                </span>
              )}
              {/* Stock status badge - IntroCar US style */}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide ${
                hasStock
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-400 text-white'
              }`}>
                {hasStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{product.description}</h1>
            <p className="text-gray-500 mb-6">Part Number: {product.sku} | Ref: {product.parentSku}</p>

            {/* Price and Add to Cart */}
            {showPrices && product.price ? (
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  ${parseFloat(product.price).toFixed(2)}
                </div>

                {showCart && (
                  <div className="space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center border-x border-gray-300 py-2"
                        />
                        <button
                          onClick={() => setQuantity(q => q + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Bag Button - IntroCar US style */}
                    {isResellerAvailable ? (
                      <button
                        onClick={handleAddToCart}
                        disabled={justAdded}
                        className={`w-full sm:w-auto px-8 py-3 rounded-full text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          justAdded ? 'bg-green-500' : 'hover:opacity-90'
                        }`}
                        style={!justAdded ? { backgroundColor: colors?.primary } : {}}
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-5 h-5" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Add to Bag
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href={`mailto:${orderEmail}?subject=Enquiry: ${product.sku}&body=I am interested in:%0A%0APart Number: ${product.sku}%0ADescription: ${product.description}%0AQuantity: ${quantity}%0A%0APlease provide availability and pricing.`}
                        className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all hover:opacity-80"
                        style={{ borderColor: colors?.primary, color: colors?.primary }}
                      >
                        <Mail className="w-5 h-5" />
                        Send Enquiry
                      </a>
                    )}

                    {inCart && !justAdded && (
                      <p className="text-sm text-gray-500">
                        ✓ {cartItem?.quantity || 0} already in your bag
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : showCart && isResellerAvailable ? (
              <div className="mb-6 space-y-4">
                {/* Quantity Selector for no-price cart */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x border-gray-300 py-2"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Bag Button - IntroCar US style */}
                <button
                  onClick={handleAddToCart}
                  disabled={justAdded}
                  className={`w-full sm:w-auto px-8 py-3 rounded-full text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    justAdded ? 'bg-green-500' : 'hover:opacity-90'
                  }`}
                  style={!justAdded ? { backgroundColor: colors?.primary } : {}}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Bag
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500">
                  Price will be confirmed when you submit your order.
                </p>

                {inCart && !justAdded && (
                  <p className="text-sm text-gray-500">
                    ✓ {cartItem?.quantity || 0} already in your bag
                  </p>
                )}
              </div>
            ) : showCart ? (
              <div className="mb-6 space-y-4">
                {/* Send Enquiry for non-available items with cart enabled */}
                <a
                  href={`mailto:${orderEmail}?subject=Enquiry: ${product.sku}&body=I am interested in:%0A%0APart Number: ${product.sku}%0ADescription: ${product.description}%0A%0APlease provide availability and pricing.`}
                  className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all hover:opacity-80"
                  style={{ borderColor: colors?.primary, color: colors?.primary }}
                >
                  <Mail className="w-5 h-5" />
                  Send Enquiry
                </a>
                <p className="text-sm text-gray-500">
                  This part requires confirmation. Contact us for availability and pricing.
                </p>
              </div>
            ) : (
              <div
                className="mb-6 p-4 rounded-xl border"
                style={{ backgroundColor: `${colors?.primary}08`, borderColor: `${colors?.primary}30` }}
              >
                <p className="font-semibold mb-2" style={{ color: colors?.primary }}>Contact Us for Pricing</p>
                <p className="text-gray-600 text-sm mb-3">
                  Get a quote for this part by contacting our sales team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${orderEmail}?subject=Enquiry: ${product.sku}&body=I am interested in:%0A%0APart Number: ${product.sku}%0ADescription: ${product.description}%0A%0APlease provide availability and pricing.`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold uppercase tracking-wider hover:opacity-90 transition-all"
                    style={{ backgroundColor: colors?.primary }}
                  >
                    <Mail className="w-4 h-4" />
                    Send Enquiry
                  </a>
                  {companyInfo?.phone && (
                    <a
                      href={`tel:${companyInfo.phone}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold uppercase tracking-wider border-2 hover:opacity-80 transition-all"
                      style={{ borderColor: colors?.primary, color: colors?.primary }}
                    >
                      <Phone className="w-4 h-4" />
                      {companyInfo.phone}
                    </a>
                  )}
                </div>
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
              <div
                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: `${colors?.primary}08` }}
              >
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: colors?.primary }} />
                <div>
                  <p className="text-gray-900 font-medium">Original Equipment Discontinued</p>
                  <p className="text-gray-600 text-sm">{nlaMake || 'Manufacturer'} NLA since: {formatNLADate(product.nlaDate)}</p>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Truck className="w-5 h-5" style={{ color: colors?.primary }} />
                <div>
                  <p className="text-gray-900 text-sm font-medium">Fast Shipping</p>
                  <p className="text-gray-500 text-xs">Worldwide delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Shield className="w-5 h-5" style={{ color: colors?.primary }} />
                <div>
                  <p className="text-gray-900 text-sm font-medium">3-Year Warranty</p>
                  <p className="text-gray-500 text-xs">On Prestige Parts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'border-b-2'
                  : 'text-gray-400 hover:text-gray-900'
              }`}
              style={activeTab === 'details' ? { color: colors?.primary, borderColor: colors?.primary } : {}}
            >
              Details
            </button>
            {product.fitment && product.fitment.length > 0 && (
              <button
                onClick={() => setActiveTab('fitment')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'fitment'
                    ? 'border-b-2'
                    : 'text-gray-400 hover:text-gray-900'
                }`}
                style={activeTab === 'fitment' ? { color: colors?.primary, borderColor: colors?.primary } : {}}
              >
                Model Application Data ({product.fitment.length})
              </button>
            )}
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Part Number</span>
                <span className="text-gray-900 font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Ref</span>
                <span className="text-gray-900 font-medium">{product.parentSku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Stock Type</span>
                <span className="text-gray-900">{product.stockType}</span>
              </div>
              {product.numberRequired && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Number Required</span>
                  <span className="text-gray-900">{product.numberRequired}</span>
                </div>
              )}
              {product.categories && (
                <div className="col-span-1 md:col-span-2 py-2 border-b border-gray-200">
                  <span className="text-gray-500 block mb-2">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.split('|').map((cat, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-gray-900">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Weight</span>
                  <span className="text-gray-900">{product.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fitment' && product.fitment && product.fitment.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Application Data</h3>
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
                <tbody className="text-gray-900">
                  {product.fitment.map((f, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-3 pr-4">{f.make}</td>
                      <td className="py-3 pr-4">{f.model}</td>
                      <td className="py-3 pr-4 font-mono" style={{ color: colors?.primary }}>
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
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function ResellerProductPage({ params }) {
  const tenant = getTenant(params.tenant);

  if (!tenant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Invalid Site</h1>
          <p className="text-gray-500">This reseller site does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <TenantProvider tenant={tenant}>
      <ResellerProductDetail params={params} />
    </TenantProvider>
  );
}
