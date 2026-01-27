'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getDefaultTenant, getTenant, isLightSite, getTenantCSSVariables } from '@/lib/tenants';

const TenantContext = createContext(null);

export function TenantProvider({ children, tenantSlug = null }) {
  const [tenant, setTenant] = useState(() => {
    if (tenantSlug) {
      return getTenant(tenantSlug);
    }
    return getDefaultTenant();
  });

  useEffect(() => {
    if (tenantSlug) {
      setTenant(getTenant(tenantSlug));
    }
  }, [tenantSlug]);

  // Apply CSS variables for theming
  useEffect(() => {
    if (tenant) {
      const cssVars = getTenantCSSVariables(tenant);
      Object.entries(cssVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [tenant]);

  const value = {
    tenant,
    isLight: isLightSite(tenant),
    showPrices: tenant?.showPrices ?? true,
    showCart: tenant?.showCart ?? true,
    checkoutEnabled: tenant?.checkoutEnabled ?? true,
    orderEmail: tenant?.orderEmail,
    skuFilter: tenant?.skuFilter,
    companyInfo: tenant?.companyInfo,
    colors: tenant?.colors,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    // Return default tenant info if used outside provider
    const defaultTenant = getDefaultTenant();
    return {
      tenant: defaultTenant,
      isLight: false,
      showPrices: true,
      showCart: true,
      checkoutEnabled: true,
      orderEmail: null,
      skuFilter: null,
      companyInfo: defaultTenant.companyInfo,
      colors: defaultTenant.colors,
    };
  }
  return context;
}
