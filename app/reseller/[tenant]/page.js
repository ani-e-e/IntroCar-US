import { getTenant } from '@/lib/tenants';
import ResellerHomepage from './ResellerHomepage';

export default function ResellerPage({ params }) {
  const tenant = getTenant(params.tenant);

  return <ResellerHomepage tenant={tenant} tenantSlug={params.tenant} />;
}
