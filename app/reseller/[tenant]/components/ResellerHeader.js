'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X, Mail, Phone, ShoppingCart } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { useCart } from '@/context/CartContext';

export default function ResellerHeader({ tenantSlug }) {
  const { tenant, colors, companyInfo, showCart, isLight } = useTenant();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cmsPages, setCmsPages] = useState([]);

  // Fetch CMS pages for navigation
  useEffect(() => {
    async function loadPages() {
      try {
        const res = await fetch(`/api/reseller/pages?tenant=${tenantSlug}`);
        const data = await res.json();
        if (res.ok && data.pages) {
          // Only show pages marked for navigation
          setCmsPages(data.pages.filter(p => p.show_in_nav));
        }
      } catch (error) {
        console.error('Error loading CMS pages:', error);
      }
    }
    loadPages();
  }, [tenantSlug]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/reseller/${tenantSlug}/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Contact Bar */}
      <div
        className="py-2 text-sm"
        style={{ backgroundColor: colors?.primary, color: 'white' }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {companyInfo?.email && (
              <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{companyInfo.email}</span>
              </a>
            )}
            {companyInfo?.phone && (
              <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">{companyInfo.phone}</span>
              </a>
            )}
          </div>
          {isLight && (
            <span className="text-xs opacity-75">
              Contact us to order
            </span>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo/Name */}
          <Link href={`/reseller/${tenantSlug}`} className="flex items-center gap-3">
            {tenant?.logo ? (
              <Image
                src={tenant.logo}
                alt={tenant.name}
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            ) : (
              <span
                className="text-2xl font-display font-light"
                style={{ color: colors?.primary }}
              >
                {tenant?.name || 'Reseller'}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/reseller/${tenantSlug}/products`}
              className="text-gray-600 hover:opacity-80 transition-opacity"
              style={{ ':hover': { color: colors?.primary } }}
            >
              All Parts
            </Link>
            <Link
              href={`/reseller/${tenantSlug}/products?make=Bentley`}
              className="text-gray-600 hover:opacity-80 transition-opacity"
            >
              Bentley
            </Link>
            <Link
              href={`/reseller/${tenantSlug}/products?make=Rolls-Royce`}
              className="text-gray-600 hover:opacity-80 transition-opacity"
            >
              Rolls-Royce
            </Link>
            <Link
              href={`/reseller/${tenantSlug}/about`}
              className="text-gray-600 hover:opacity-80 transition-opacity"
            >
              About
            </Link>
            {/* CMS Pages */}
            {cmsPages.map((page) => (
              <Link
                key={page.page_slug}
                href={`/reseller/${tenantSlug}/page/${page.page_slug}`}
                className="text-gray-600 hover:opacity-80 transition-opacity"
              >
                {page.title}
              </Link>
            ))}
            <Link
              href={`/reseller/${tenantSlug}/contact`}
              className="text-gray-600 hover:opacity-80 transition-opacity"
            >
              Contact
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by part number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': colors?.primary }}
              />
            </div>
          </form>

          {/* Cart Icon - Desktop */}
          <Link
            href={`/reseller/${tenantSlug}/cart`}
            className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors?.primary }}
          >
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="ml-1">({itemCount})</span>
            )}
            {itemCount === 0 && <span className="ml-1">Cart</span>}
          </Link>

          {/* Mobile: Cart + Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={`/reseller/${tenantSlug}/cart`}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                  style={{ backgroundColor: colors?.primary }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by part number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400"
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              <Link
                href={`/reseller/${tenantSlug}/products`}
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Parts
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/products?make=Bentley`}
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bentley Parts
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/products?make=Rolls-Royce`}
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rolls-Royce Parts
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/parts-request`}
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Parts Request
              </Link>
              <Link
                href={`/reseller/${tenantSlug}/about`}
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              {/* CMS Pages - Mobile */}
              {cmsPages.map((page) => (
                <Link
                  key={page.page_slug}
                  href={`/reseller/${tenantSlug}/page/${page.page_slug}`}
                  className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {page.title}
                </Link>
              ))}
              <Link
                href={`/reseller/${tenantSlug}/contact`}
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
