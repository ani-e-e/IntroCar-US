import { NextResponse } from 'next/server';
import {
  calculateUSAShipping,
  getShippingEstimate,
  calculateCartWeight,
  qualifiesForFreeShipping,
  FREE_SHIPPING_THRESHOLD,
  COUNTRY_NAMES,
} from '@/lib/shipping';

/**
 * POST /api/shipping
 * Calculate shipping costs for cart items
 *
 * Request body:
 * {
 *   items: [{ sku, quantity, weight?, price }],
 *   countryCode: 'USA',
 *   subtotal: 123.45
 * }
 *
 * Response:
 * {
 *   success: true,
 *   shipping: {
 *     options: [...],
 *     freeShippingEligible: boolean,
 *     freeShippingThreshold: number,
 *     amountToFreeShipping: number,
 *     totalWeight: number
 *   }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { items = [], countryCode = 'USA', subtotal = 0 } = body;

    // Calculate total weight
    const totalWeight = calculateCartWeight(items);

    // Check free shipping eligibility
    const freeShippingEligible = qualifiesForFreeShipping(subtotal);
    const amountToFreeShipping = freeShippingEligible
      ? 0
      : FREE_SHIPPING_THRESHOLD - subtotal;

    // Get shipping options
    const shippingResult = getShippingEstimate(items, countryCode);

    // If free shipping applies, zero out the price
    if (freeShippingEligible && !shippingResult.needsQuote) {
      shippingResult.options = shippingResult.options.map(option => ({
        ...option,
        originalPrice: option.price,
        price: 0,
        freeShipping: true,
      }));
    }

    return NextResponse.json({
      success: true,
      shipping: {
        ...shippingResult,
        freeShippingEligible,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping: Math.max(0, amountToFreeShipping),
        totalWeight,
        countryName: COUNTRY_NAMES[countryCode] || countryCode,
      },
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate shipping',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shipping?weight=2.5&country=USA
 * Quick shipping estimate by weight
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const weight = parseFloat(searchParams.get('weight') || '0.5');
    const countryCode = searchParams.get('country') || 'USA';

    if (countryCode === 'USA') {
      const result = calculateUSAShipping(weight);
      return NextResponse.json({
        success: true,
        ...result,
        countryName: 'United States',
        weight,
      });
    }

    // For other countries, return quote required
    return NextResponse.json({
      success: true,
      needsQuote: true,
      message: `International shipping to ${COUNTRY_NAMES[countryCode] || countryCode} requires a quote.`,
      countryName: COUNTRY_NAMES[countryCode] || countryCode,
      weight,
    });
  } catch (error) {
    console.error('Shipping estimate error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get shipping estimate',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
