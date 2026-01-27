'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

export default function ResellerFooter({ tenantSlug }) {
  const { tenant, colors, companyInfo, isLight } = useTenant();

  return (
    <footer
      className="py-12 text-white"
      style={{ backgroundColor: colors?.primary || '#1e3a5f' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-display font-light mb-4">
              {tenant?.name || 'Reseller'}
            </h3>
            <p className="text-white/70 text-sm">
              Quality Rolls-Royce & Bentley Parts
            </p>
            {isLight && (
              <p className="text-white/70 text-sm mt-4">
                Powered by IntroCar
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <div className="space-y-3">
              {companyInfo?.email && (
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {companyInfo.email}
                </a>
              )}
              {companyInfo?.phone && (
                <a
                  href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {companyInfo.phone}
                </a>
              )}
              {companyInfo?.address && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  {companyInfo.address}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link
                href={`/reseller/${tenantSlug}/products`}
                className="block text-white/80 hover:text-white transition-colors"
              >
                All Parts
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/products?make=Bentley`}
                className="block text-white/80 hover:text-white transition-colors"
              >
                Bentley Parts
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/products?make=Rolls-Royce`}
                className="block text-white/80 hover:text-white transition-colors"
              >
                Rolls-Royce Parts
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} {tenant?.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>Parts supplied by IntroCar International</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
