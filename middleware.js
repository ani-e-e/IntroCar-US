import { NextResponse } from 'next/server';

/**
 * Middleware for multi-tenant support
 *
 * This middleware detects the tenant based on the domain and rewrites
 * requests to the appropriate tenant routes.
 *
 * For now, we use subdomain/path-based routing:
 * - intro-car-us.vercel.app → Main site (introcar-us)
 * - intro-car-us.vercel.app/reseller/albers-rb → Albers RB reseller site
 *
 * In production with custom domains:
 * - albers.introcar.com → Albers RB site
 */

// Tenant domain mapping (for production custom domains)
const domainToTenant = {
  'intro-car-us.vercel.app': 'introcar-us',
  'albers.introcar.com': 'albers-rb',
  // Add more domain mappings as resellers are configured
};

export function middleware(request) {
  const { pathname, hostname } = request.nextUrl;

  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/data') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Check if request is for a reseller route (/reseller/[tenant-slug])
  if (pathname.startsWith('/reseller/')) {
    return NextResponse.next();
  }

  // Check if hostname maps to a specific tenant (for production)
  const tenantFromDomain = domainToTenant[hostname];

  if (tenantFromDomain && tenantFromDomain !== 'introcar-us') {
    // Rewrite to reseller route
    const url = request.nextUrl.clone();
    url.pathname = `/reseller/${tenantFromDomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Default: continue with normal routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
