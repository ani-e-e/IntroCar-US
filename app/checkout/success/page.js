'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, Package, Truck, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear the cart on successful checkout
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!sessionId) {
        setError('No order session found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load order details');
        }

        setOrderData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [sessionId]);

  // Format currency
  const formatPrice = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartCount={0} />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-introcar-blue" />
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartCount={0} />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-500 mb-8">{error}</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              Continue Shopping
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
      <Header cartCount={0} />

      {/* Success Header */}
      <div className="bg-green-50 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-light text-introcar-charcoal mb-3">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. A confirmation email has been sent to{' '}
            <span className="font-medium">{orderData?.customerEmail}</span>
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Order Info Bar */}
          <div className="bg-introcar-light rounded-xl p-4 flex flex-wrap gap-4 justify-between text-sm">
            <div>
              <span className="text-gray-500">Order Date</span>
              <p className="font-medium text-introcar-charcoal">
                {orderData?.created ? formatDate(orderData.created) : 'Today'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Order Total</span>
              <p className="font-medium text-introcar-charcoal">
                {formatPrice(orderData?.amountTotal || 0, orderData?.currency)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Payment Status</span>
              <p className="font-medium text-green-600 capitalize">
                {orderData?.paymentStatus?.replace('_', ' ') || 'Paid'}
              </p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-introcar-light px-4 py-3 border-b border-gray-200">
              <h2 className="font-medium text-introcar-charcoal flex items-center gap-2">
                <Package className="w-5 h-5" />
                Items Ordered
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {orderData?.lineItems?.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-introcar-charcoal">{item.description}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.amount, orderData?.currency)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {orderData?.shippingAddress && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-introcar-light px-4 py-3 border-b border-gray-200">
                <h2 className="font-medium text-introcar-charcoal flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h2>
              </div>
              <div className="p-4">
                <p className="text-introcar-charcoal">{orderData.customerName}</p>
                <p className="text-gray-600">{orderData.shippingAddress.line1}</p>
                {orderData.shippingAddress.line2 && (
                  <p className="text-gray-600">{orderData.shippingAddress.line2}</p>
                )}
                <p className="text-gray-600">
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{' '}
                  {orderData.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{orderData.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-introcar-light rounded-xl p-6">
            <h2 className="font-medium text-introcar-charcoal mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              What&apos;s Next?
            </h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-introcar-blue text-white flex items-center justify-center text-xs shrink-0">1</span>
                <span>You&apos;ll receive a confirmation email with your order details.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-introcar-blue text-white flex items-center justify-center text-xs shrink-0">2</span>
                <span>Our team will process your order within 1 business day.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-introcar-blue text-white flex items-center justify-center text-xs shrink-0">3</span>
                <span>You&apos;ll receive a shipping notification with tracking information.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-introcar-blue text-white flex items-center justify-center text-xs shrink-0">4</span>
                <span>Your parts will be delivered via DHL Express.</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-introcar-charcoal font-medium rounded-full hover:border-introcar-blue hover:text-introcar-blue transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Support */}
          <div className="text-center pt-4 text-sm text-gray-500">
            <p>
              Questions about your order?{' '}
              <Link href="/contact" className="text-introcar-blue hover:underline">
                Contact us
              </Link>{' '}
              or call <span className="font-medium">+1 (555) 123-4567</span>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
