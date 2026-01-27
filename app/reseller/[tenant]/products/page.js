import { Suspense } from 'react';
import { getTenant } from '@/lib/tenants';
import ResellerProductsContent from './ResellerProductsContent';

export async function generateMetadata({ params }) {
  const tenant = getTenant(params.tenant);
  return {
    title: `Parts | ${tenant.name}`,
    description: `Browse Rolls-Royce and Bentley parts from ${tenant.name}.`,
  };
}

export default function ResellerProductsPage({ params }) {
  const tenant = getTenant(params.tenant);

  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ResellerProductsContent tenant={tenant} tenantSlug={params.tenant} />
    </Suspense>
  );
}
