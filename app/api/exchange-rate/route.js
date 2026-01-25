import { NextResponse } from 'next/server';
import { getExchangeRate, getRateInfo, refreshExchangeRate } from '@/lib/currency';

/**
 * GET /api/exchange-rate
 * Returns the current GBP to USD exchange rate
 * Used by client components to convert prices
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    // Force refresh if requested (admin use)
    const rate = refresh ? await refreshExchangeRate() : await getExchangeRate();
    const info = getRateInfo();

    return NextResponse.json({
      success: true,
      rate: rate,
      baseCurrency: 'GBP',
      targetCurrency: 'USD',
      timestamp: info.timestamp,
      ageMinutes: info.age,
      source: 'fixer.io',
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch exchange rate',
        rate: 1.27, // Fallback rate
      },
      { status: 500 }
    );
  }
}
