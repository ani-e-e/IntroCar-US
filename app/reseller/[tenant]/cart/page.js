'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Package, Truck, ChevronRight } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';
import { useCart } from '@/context/CartContext';
import { formatShippingPrice, calculateUSAShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

function CartContent({ tenantSlug }) {
  const { colors, companyInfo, showPrices } = useTenant();
  const {
    items,
    itemCount,
    subtotal,
    totalWeight,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [selectedShipping, setSelectedShipping] = useState(null);

  // Calculate shipping based on weight
  const shippingEstimate = calculateUSAShipping(totalWeight);
  const shippingCost = shippingEstimate.options?.[0]?.price || 0;
  const total = subtotal + shippingCost;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: colors?.primary, borderTopColor: 'transparent' }}
            />
            <span className="text-gray-500">Loading cart...</span>
          </div>
        </div>
        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />

        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span style={{ color: colors?.primary }}>Cart</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${colors?.primary}10` }}
            >
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-display font-light text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any parts to your cart yet.
              Browse our extensive range of Rolls-Royce and Bentley parts.
            </p>
            <Link
              href={`/reseller/${tenantSlug}/products`}
              className="inline-flex items-center px-6 py-3 text-white font-medium rounded-full transition-colors"
              style={{ backgroundColor: colors?.primary }}
            >
              Start Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>Cart</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="py-6" style={{ backgroundColor: `${colors?.primary}08` }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-display font-light text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-gray-500 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Banner */}
            {showPrices && subtotal < FREE_SHIPPING_THRESHOLD && (
              <div
                className="border rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: `${colors?.primary}08`, borderColor: `${colors?.primary}20` }}
              >
                <Truck className="w-6 h-6 shrink-0" style={{ color: colors?.primary }} />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Add <span className="font-semibold" style={{ color: colors?.primary }}>{formatShippingPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more to qualify for <span className="font-semibold">FREE shipping</span>!
                  </p>
                </div>
              </div>
            )}

            {/* Item List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.sku} className="p-4 md:p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.description}
                            width={96}
                            height={96}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/reseller/${tenantSlug}/products/${item.sku}`}
                              className="font-medium text-gray-900 hover:underline transition-colors line-clamp-2"
                            >
                              {item.description}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                            {item.stockType && (
                              <span
                                className="inline-block mt-2 px-2 py-0.5 text-xs rounded"
                                style={{
                                  backgroundColor: `${colors?.primary}10`,
                                  color: colors?.primary
                                }}
                              >
                                {item.stockType}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.sku)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 1)}
                              className="w-14 h-8 text-center border border-gray-200 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          {showPrices && (
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatShippingPrice(item.price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-gray-500">
                                  {formatShippingPrice(item.price)} each
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="bg-gray-50 px-4 md:px-6 py-4 flex items-center justify-between">
                <Link
                  href={`/reseller/${tenantSlug}/products`}
                  className="text-sm text-gray-700 hover:underline transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Shipping Estimate */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: `${colors?.primary}08` }}>
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4" style={{ color: colors?.primary }} />
                  Shipping Estimate
                </h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Weight</span>
                  <span className="text-sm font-medium">{totalWeight.toFixed(2)} kg</span>
                </div>
                {!shippingEstimate.needsQuote ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">DHL Air Service</span>
                    <span className="text-sm font-medium">{formatShippingPrice(shippingCost)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Large items may require a custom shipping quote.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  Estimated 3-5 business days delivery to USA
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: `${colors?.primary}08` }}>
                <h3 className="font-medium text-gray-900">Order Summary</h3>
              </div>
              <div className="p-4 space-y-3">
                {showPrices && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                      <span className="font-medium">{formatShippingPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          formatShippingPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">
                        {formatShippingPrice(subtotal >= FREE_SHIPPING_THRESHOLD ? subtotal : total)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Prices shown in USD. Taxes may apply.
                    </p>
                  </>
                )}

                {!showPrices && (
                  <p className="text-sm text-gray-600">
                    Pricing will be confirmed when you submit your order.
                    We will contact you with a quote including shipping.
                  </p>
                )}
              </div>
              <div className="px-4 pb-4">
                <Link
                  href={`/reseller/${tenantSlug}/checkout`}
                  className="flex items-center justify-center gap-2 w-full py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: colors?.primary }}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Pay by check • Orders emailed to {companyInfo?.name}
                </p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="rounded-xl p-4" style={{ backgroundColor: `${colors?.primary}08` }}>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Why Shop With Us</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: colors?.primary }}
                  >✓</span>
                  {companyInfo?.tagline || 'Expert service since 1963'}
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: colors?.primary }}
                  >✓</span>
                  Quality Prestige Parts
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: colors?.primary }}
                  >✓</span>
                  3-year warranty on parts
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: colors?.primary }}
                  >✓</span>
                  Fast DHL shipping
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function ResellerCartPage({ params }) {
  return <CartContent tenantSlug={params.tenant} />;
}
