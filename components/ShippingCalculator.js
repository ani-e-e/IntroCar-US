'use client';

import { useState, useEffect } from 'react';
import { Plane, Truck, Mail, Building, Calculator, Globe, Package, Check, Info } from 'lucide-react';
import { formatShippingPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

// Icon mapping for delivery methods
const methodIcons = {
  plane: Plane,
  truck: Truck,
  mail: Mail,
  building: Building,
  calculator: Calculator,
  globe: Globe,
};

/**
 * Shipping Calculator Component
 * Shows available shipping options and calculates costs
 */
export default function ShippingCalculator({
  items = [],
  subtotal = 0,
  countryCode = 'USA',
  onShippingSelect,
  compact = false,
}) {
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    calculateShipping();
  }, [items, subtotal, countryCode]);

  async function calculateShipping() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          countryCode,
          subtotal,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate shipping');
      }

      setShippingData(data.shipping);

      // Auto-select first option
      if (data.shipping.options?.length > 0 && !selectedOption) {
        const firstOption = data.shipping.options[0];
        setSelectedOption(firstOption.method);
        onShippingSelect?.(firstOption);
      }
    } catch (err) {
      console.error('Shipping calculation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOptionSelect(option) {
    setSelectedOption(option.method);
    onShippingSelect?.(option);
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${compact ? '' : 'p-6'}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-introcar-blue border-t-transparent rounded-full animate-spin" />
          <span>Calculating shipping...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-4 ${compact ? '' : 'p-6'}`}>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={calculateShipping}
          className="mt-2 text-sm text-introcar-blue hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!shippingData) {
    return null;
  }

  const { options, freeShippingEligible, amountToFreeShipping, totalWeight, countryName } = shippingData;

  if (compact) {
    // Compact view for cart sidebar
    const option = options?.[0];
    if (!option) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Shipping ({countryName})</span>
          <span className="font-medium">
            {option.freeShipping ? (
              <span className="text-green-600">FREE</span>
            ) : option.price !== null ? (
              formatShippingPrice(option.price)
            ) : (
              <span className="text-introcar-blue">Quote</span>
            )}
          </span>
        </div>
        {option.estimatedDays && (
          <p className="text-xs text-gray-500">
            Est. delivery: {option.estimatedDays}
          </p>
        )}
        {!freeShippingEligible && amountToFreeShipping > 0 && (
          <div className="bg-introcar-light rounded-lg p-2 text-xs">
            <p className="text-gray-600">
              Add <span className="font-medium text-introcar-blue">{formatShippingPrice(amountToFreeShipping)}</span> more for free shipping!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Full view for checkout
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-introcar-light px-4 py-3 border-b border-gray-200">
        <h3 className="font-medium text-introcar-charcoal flex items-center gap-2">
          <Package className="w-5 h-5 text-introcar-blue" />
          Shipping Options
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Shipping destination */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Shipping to:</span>
          <span className="font-medium">{countryName}</span>
        </div>

        {/* Weight info */}
        {totalWeight > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total weight:</span>
            <span>{totalWeight.toFixed(2)} kg ({(totalWeight * 2.20462).toFixed(2)} lbs)</span>
          </div>
        )}

        {/* Free shipping progress */}
        {!freeShippingEligible && amountToFreeShipping > 0 && (
          <div className="bg-introcar-light rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-introcar-blue" />
              <span className="text-sm font-medium text-introcar-charcoal">Free Shipping Available</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Add <span className="font-semibold text-introcar-blue">{formatShippingPrice(amountToFreeShipping)}</span> more to qualify for free shipping!
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-introcar-blue transition-all"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatShippingPrice(subtotal)} / {formatShippingPrice(FREE_SHIPPING_THRESHOLD)}
            </p>
          </div>
        )}

        {freeShippingEligible && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Your order qualifies for free shipping!
            </span>
          </div>
        )}

        {/* Shipping options */}
        <div className="space-y-2">
          {options?.map((option) => {
            const Icon = methodIcons[option.icon] || Package;
            const isSelected = selectedOption === option.method;

            return (
              <button
                key={option.method}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-introcar-blue bg-introcar-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-introcar-blue text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-introcar-charcoal">{option.name}</h4>
                      <span className="text-lg font-semibold text-introcar-charcoal shrink-0">
                        {option.freeShipping ? (
                          <span className="text-green-600">FREE</span>
                        ) : option.price !== null ? (
                          formatShippingPrice(option.price)
                        ) : (
                          <span className="text-introcar-blue text-sm">Quote Required</span>
                        )}
                      </span>
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                    )}
                    {option.estimatedDays && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Est. delivery:</span> {option.estimatedDays}
                      </p>
                    )}
                    {option.freeShipping && option.originalPrice && (
                      <p className="text-sm text-gray-400 line-through mt-1">
                        Was {formatShippingPrice(option.originalPrice)}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-introcar-blue text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {shippingData.needsQuote && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium">Shipping quote required</p>
            <p className="mt-1">{shippingData.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact shipping estimate display for product pages
 */
export function ShippingEstimate({ weight = 0.5 }) {
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    fetchEstimate();
  }, [weight]);

  async function fetchEstimate() {
    try {
      const response = await fetch(`/api/shipping?weight=${weight}&country=USA`);
      const data = await response.json();
      if (data.success) {
        setEstimate(data);
      }
    } catch (err) {
      console.error('Failed to fetch shipping estimate:', err);
    }
  }

  if (!estimate || estimate.needsQuote) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Plane className="w-4 h-4" />
        <span>Contact us for shipping quote</span>
      </div>
    );
  }

  const option = estimate.options?.[0];
  if (!option) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Plane className="w-4 h-4 text-introcar-blue" />
      <span>
        Ships to USA from <span className="font-medium">{formatShippingPrice(option.price)}</span>
      </span>
    </div>
  );
}
