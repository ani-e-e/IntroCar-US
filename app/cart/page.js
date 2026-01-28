'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShippingCalculator from '@/components/ShippingCalculator';
import { useCart } from '@/context/CartContext';
import { formatShippingPrice } from '@/lib/shipping';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Package, Truck, Loader2, Lock } from 'lucide-react';

export default function CartPage() {
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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Handle Stripe checkout
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Call our API to create a Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shipping: selectedShipping,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect directly to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message);
      setIsCheckingOut(false);
    }
  };

  // Calculate totals - shipping is always based on weight, no free shipping
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartCount={0} />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-introcar-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">Loading cart...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartCount={0} />

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-introcar-light rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any parts to your cart yet.
              Browse our extensive range of Rolls-Royce and Bentley parts.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={itemCount} />

      {/* Page Header */}
      <div className="bg-introcar-light py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-display font-light text-introcar-charcoal">
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
            {/* Item List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.sku} className="p-4 md:p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-introcar-light rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
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
                              href={`/products/${item.sku}`}
                              className="font-medium text-introcar-charcoal hover:text-introcar-blue transition-colors line-clamp-2"
                            >
                              {item.description}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                            {item.stockType && (
                              <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                                item.stockType === 'Prestige Parts'
                                  ? 'bg-introcar-blue/10 text-introcar-blue'
                                  : item.stockType === 'Uprated'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
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
                              className="w-8 h-8 rounded-lg bg-introcar-light text-introcar-charcoal hover:bg-gray-200 flex items-center justify-center transition-colors"
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
                              className="w-8 h-8 rounded-lg bg-introcar-light text-introcar-charcoal hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold text-introcar-charcoal">
                              {formatShippingPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500">
                                {formatShippingPrice(item.price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="bg-introcar-light px-4 md:px-6 py-4 flex items-center justify-between">
                <Link
                  href="/products"
                  className="text-sm text-introcar-charcoal hover:text-introcar-blue transition-colors flex items-center gap-1"
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
            {/* Shipping Calculator */}
            <ShippingCalculator
              items={items}
              subtotal={subtotal}
              countryCode="USA"
              onShippingSelect={setSelectedShipping}
            />

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-introcar-light px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-introcar-charcoal">Order Summary</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatShippingPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {selectedShipping?.price !== null && selectedShipping?.price !== undefined ? (
                      formatShippingPrice(shippingCost)
                    ) : (
                      <span className="text-amber-600">Quote Required</span>
                    )}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-introcar-charcoal">Total</span>
                  <span className="font-bold text-introcar-charcoal">
                    {selectedShipping?.price !== null ? (
                      formatShippingPrice(total)
                    ) : (
                      formatShippingPrice(subtotal) + ' + shipping'
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Prices shown in USD. Taxes may apply at checkout.
                </p>
              </div>
              <div className="px-4 pb-4">
                {checkoutError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {checkoutError}
                  </div>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-introcar-blue text-white font-medium rounded-lg hover:bg-introcar-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Proceed to Checkout
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-introcar-light rounded-xl p-4">
              <h4 className="text-sm font-medium text-introcar-charcoal mb-3">Why Shop With Us</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-introcar-blue/10 text-introcar-blue flex items-center justify-center text-xs">✓</span>
                  Family-run since 1988
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-introcar-blue/10 text-introcar-blue flex items-center justify-center text-xs">✓</span>
                  230,000+ parts available
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-introcar-blue/10 text-introcar-blue flex items-center justify-center text-xs">✓</span>
                  3-year warranty on Prestige Parts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-introcar-blue/10 text-introcar-blue flex items-center justify-center text-xs">✓</span>
                  Price match guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
