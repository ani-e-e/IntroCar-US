'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, Truck, CheckCircle, Mail, AlertCircle, ArrowLeft, CreditCard } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';
import { useCart } from '@/context/CartContext';
import { formatShippingPrice, calculateUSAShipping } from '@/lib/shipping';

function CheckoutContent({ tenantSlug }) {
  const { colors, companyInfo, showPrices, orderEmail, tenant } = useTenant();
  const { items, itemCount, subtotal, totalWeight, clearCart } = useCart();

  const [step, setStep] = useState(1); // 1: Info, 2: Review, 3: Complete
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  const [formData, setFormData] = useState({
    // Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Shipping Address
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    // Order Notes
    notes: '',
    // Payment
    paymentMethod: 'check', // Only check for now
  });

  // Calculate shipping based on weight
  const shippingEstimate = calculateUSAShipping(totalWeight);
  const shippingCost = shippingEstimate.needsQuote ? 0 : (shippingEstimate.options?.[0]?.price || 0);
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'zip'];
    for (const field of required) {
      if (!formData[field].trim()) {
        return false;
      }
    }
    return true;
  };

  const handleContinueToReview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reseller/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          customer: formData,
          items,
          subtotal,
          shipping: shippingCost,
          total,
          paymentMethod: 'check',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setOrderNumber(data.orderNumber);
      setStep(3);
      clearCart();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart redirect
  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-display text-gray-900 mb-4">Your cart is empty</h1>
          <Link
            href={`/reseller/${tenantSlug}/products`}
            className="inline-flex items-center px-6 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: colors?.primary }}
          >
            Browse Products
          </Link>
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
            <Link href={`/reseller/${tenantSlug}/cart`} className="hover:text-gray-900">Cart</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>Checkout</span>
          </nav>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Information' },
              { num: 2, label: 'Review Order' },
              { num: 3, label: 'Complete' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s.num ? 'text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                  style={step >= s.num ? { backgroundColor: colors?.primary } : {}}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`ml-2 text-sm ${step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`w-16 md:w-32 h-0.5 mx-4 ${step > s.num ? '' : 'bg-gray-200'}`}
                    style={step > s.num ? { backgroundColor: colors?.primary } : {}}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step 1: Customer Information */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleContinueToReview} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          name="zip"
                          value={formData.zip}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special instructions or notes for your order..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div
                    className="border-2 rounded-lg p-4 cursor-pointer"
                    style={{ borderColor: colors?.primary, backgroundColor: `${colors?.primary}08` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: colors?.primary }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors?.primary }} />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">Pay by Check</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Mail your check to {companyInfo?.name}. Order will ship upon check clearance.
                        </p>
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Make checks payable to: <strong>{companyInfo?.name}</strong>
                  </p>
                </div>

                {/* Continue Button */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/reseller/${tenantSlug}/cart`}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Cart
                  </Link>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors?.primary }}
                  >
                    Continue to Review
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary
                items={items}
                itemCount={itemCount}
                subtotal={subtotal}
                shippingCost={shippingCost}
                total={total}
                showPrices={showPrices}
                colors={colors}
                tenantSlug={tenantSlug}
              />
            </div>
          </div>
        )}

        {/* Step 2: Review Order */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-display text-gray-900 mb-6">Review Your Order</h1>

            {/* Customer Info Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm hover:underline"
                  style={{ color: colors?.primary }}
                >
                  Edit
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                  <p className="text-gray-600">{formData.email}</p>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">{formData.address1}</p>
                  {formData.address2 && <p className="text-gray-600">{formData.address2}</p>}
                  <p className="text-gray-600">{formData.city}, {formData.state} {formData.zip}</p>
                  <p className="text-gray-600">{formData.country}</p>
                </div>
              </div>
              {formData.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Notes: {formData.notes}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({itemCount})</h2>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.sku} className="py-3 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.description} width={64} height={64} className="object-contain" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.description}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku} × {item.quantity}</p>
                    </div>
                    {showPrices && (
                      <p className="font-medium text-gray-900">{formatShippingPrice(item.price * item.quantity)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" style={{ color: colors?.primary }} />
                <div>
                  <p className="font-medium text-gray-900">Pay by Check</p>
                  <p className="text-sm text-gray-600">Make checks payable to: {companyInfo?.name}</p>
                </div>
              </div>
            </div>

            {/* Order Total */}
            {showPrices && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatShippingPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping (DHL Air Service)</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatShippingPrice(shippingCost)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatShippingPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error submitting order</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Information
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: colors?.primary }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Submit Order
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center mt-4">
              By submitting this order, you agree to pay by check. Your order will be emailed to {companyInfo?.name} for processing.
            </p>
          </div>
        )}

        {/* Step 3: Order Complete */}
        {step === 3 && (
          <div className="max-w-xl mx-auto text-center py-12">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors?.primary}15` }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: colors?.primary }} />
            </div>
            <h1 className="text-3xl font-display text-gray-900 mb-4">Order Submitted!</h1>
            <p className="text-lg text-gray-600 mb-2">Thank you for your order.</p>
            {orderNumber && (
              <p className="text-sm text-gray-500 mb-6">Order Reference: <strong>{orderNumber}</strong></p>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-3">What Happens Next?</h2>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs text-white" style={{ backgroundColor: colors?.primary }}>1</span>
                  <span>Your order has been emailed to {companyInfo?.name} for review.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs text-white" style={{ backgroundColor: colors?.primary }}>2</span>
                  <span>We will send you an invoice with payment instructions.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs text-white" style={{ backgroundColor: colors?.primary }}>3</span>
                  <span>Mail your check to: <strong>{companyInfo?.address}</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs text-white" style={{ backgroundColor: colors?.primary }}>4</span>
                  <span>Once payment clears, your order will ship via DHL Air Service (3-5 business days).</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/reseller/${tenantSlug}/products`}
                className="px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: colors?.primary }}
              >
                Continue Shopping
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/contact`}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

// Order Summary Component
function OrderSummary({ items, itemCount, subtotal, shippingCost, total, showPrices, colors, tenantSlug }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-4">
      <div className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: `${colors?.primary}08` }}>
        <h3 className="font-medium text-gray-900">Order Summary</h3>
      </div>
      <div className="p-4">
        {/* Items Preview */}
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.sku} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.description} width={48} height={48} className="object-contain" />
                ) : (
                  <Package className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 line-clamp-1">{item.description}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              {showPrices && (
                <p className="text-sm font-medium">{formatShippingPrice(item.price * item.quantity)}</p>
              )}
            </div>
          ))}
        </div>

        {showPrices && (
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({itemCount} items)</span>
              <span>{formatShippingPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatShippingPrice(shippingCost)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatShippingPrice(total)}</span>
            </div>
          </div>
        )}

        {!showPrices && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Final pricing will be confirmed via email after order submission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResellerCheckoutPage({ params }) {
  return <CheckoutContent tenantSlug={params.tenant} />;
}
