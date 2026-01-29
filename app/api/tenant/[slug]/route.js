import { NextResponse } from 'next/server';
import { getTenantAsync } from '@/lib/tenants';

/**
 * Public API endpoint to get tenant configuration
 * Used by client-side components for tenant refresh
 */
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Tenant slug required' }, { status: 400 });
    }

    const tenant = await getTenantAsync(slug);

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if tenant is active
    if (tenant.isActive === false) {
      return NextResponse.json({ error: 'Tenant not available' }, { status: 404 });
    }

    return NextResponse.json({
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        colors: tenant.colors,
        logo: tenant.logo,
        showPrices: tenant.showPrices,
        showCart: tenant.showCart,
        checkoutEnabled: tenant.checkoutEnabled,
        skuFilter: tenant.skuFilter,
        orderEmail: tenant.orderEmail,
        companyInfo: tenant.companyInfo,
        features: tenant.features,
      }
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
