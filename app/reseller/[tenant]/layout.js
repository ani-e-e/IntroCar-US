import { getTenant, getAllTenantSlugs, getTenantCSSVariables } from '@/lib/tenants';
import { TenantProvider } from '@/context/TenantContext';

// Generate static params for all tenants
export async function generateStaticParams() {
  const slugs = getAllTenantSlugs();
  return slugs.map((tenant) => ({ tenant }));
}

// Dynamic metadata based on tenant
export async function generateMetadata({ params }) {
  const tenant = getTenant(params.tenant);

  return {
    title: `${tenant.name} - Rolls-Royce & Bentley Parts`,
    description: `Browse Rolls-Royce and Bentley parts from ${tenant.name}. Quality original equipment and Prestige Parts.`,
  };
}

export default function ResellerLayout({ children, params }) {
  const tenant = getTenant(params.tenant);
  const cssVars = getTenantCSSVariables(tenant);

  // Convert CSS variables to inline style
  const styleVars = Object.entries(cssVars).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  return (
    <TenantProvider tenantSlug={params.tenant}>
      <div style={styleVars} className="min-h-screen">
        {children}
      </div>
    </TenantProvider>
  );
}
