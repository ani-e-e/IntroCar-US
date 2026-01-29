import { getTenantAsync, getAllTenantSlugsAsync, getTenantCSSVariables } from '@/lib/tenants';
import { TenantProvider } from '@/context/TenantContext';
import { CartProvider } from '@/context/CartContext';

// Generate static params for all tenants
export async function generateStaticParams() {
  const slugs = await getAllTenantSlugsAsync();
  return slugs.map((tenant) => ({ tenant }));
}

// Dynamic metadata based on tenant
export async function generateMetadata({ params }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantAsync(tenantSlug);

  return {
    title: `${tenant.name} - Rolls-Royce & Bentley Parts`,
    description: `Browse Rolls-Royce and Bentley parts from ${tenant.name}. Quality original equipment and Prestige Parts.`,
  };
}

export default async function ResellerLayout({ children, params }) {
  const { tenant: tenantSlug } = await params;

  // Fetch tenant config from database (with fallback to hardcoded)
  const tenant = await getTenantAsync(tenantSlug);
  const cssVars = getTenantCSSVariables(tenant);

  // Convert CSS variables to inline style
  const styleVars = Object.entries(cssVars).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  return (
    <CartProvider>
      <TenantProvider tenant={tenant} tenantSlug={tenantSlug}>
        <div style={styleVars} className="min-h-screen">
          {children}
        </div>
      </TenantProvider>
    </CartProvider>
  );
}
