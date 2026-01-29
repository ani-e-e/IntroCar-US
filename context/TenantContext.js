'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDefaultTenant, getTenant, isLightSite, getTenantCSSVariables } from '@/lib/tenants';

const TenantContext = createContext(null);

export function TenantProvider({ children, tenant: tenantProp = null, tenantSlug = null }) {
  // Accept either a tenant object directly (from server) or a tenantSlug to look up
  const [tenant, setTenant] = useState(() => {
    if (tenantProp) {
      return tenantProp;
    }
    if (tenantSlug) {
      return getTenant(tenantSlug); // Sync fallback for initial render
    }
    return getDefaultTenant();
  });

  const [loading, setLoading] = useState(false);

  // Fetch tenant from API (for client-side refresh)
  const refreshTenant = useCallback(async () => {
    if (!tenantSlug) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tenant/${tenantSlug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.tenant) {
          setTenant(data.tenant);
        }
      }
    } catch (error) {
      console.error('Failed to refresh tenant:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  // Update tenant when prop changes (server-side data)
  useEffect(() => {
    if (tenantProp) {
      setTenant(tenantProp);
    }
  }, [tenantProp]);

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
    tenantSlug: tenant?.slug || tenantSlug,
    isLight: isLightSite(tenant),
    showPrices: tenant?.showPrices ?? true,
    showCart: tenant?.showCart ?? true,
    checkoutEnabled: tenant?.checkoutEnabled ?? true,
    orderEmail: tenant?.orderEmail,
    skuFilter: tenant?.skuFilter,
    companyInfo: tenant?.companyInfo,
    colors: tenant?.colors,
    loading,
    refreshTenant,
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
      tenantSlug: 'introcar-us',
      isLight: false,
      showPrices: true,
      showCart: true,
      checkoutEnabled: true,
      orderEmail: null,
      skuFilter: null,
      companyInfo: defaultTenant.companyInfo,
      colors: defaultTenant.colors,
      loading: false,
      refreshTenant: () => {},
    };
  }
  return context;
}
