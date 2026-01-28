import { NextResponse } from 'next/server';
import {
  calculateUSAShipping,
  getShippingEstimate,
  calculateCartWeight,
  COUNTRY_NAMES,
} from '@/lib/shipping';

/**
 * POST /api/shipping
 * Calculate shipping costs for cart items based on weight
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
 *     needsQuote: boolean (true if weight exceeds matrix),
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

    // Get shipping options based on weight
    const shippingResult = getShippingEstimate(items, countryCode);

    return NextResponse.json({
      success: true,
      shipping: {
        ...shippingResult,
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
