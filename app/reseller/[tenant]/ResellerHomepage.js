'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Mail, Phone, ChevronRight, Package, Car } from 'lucide-react';
import ResellerHeader from './components/ResellerHeader';
import ResellerFooter from './components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';

export default function ResellerHomepage({ tenant, tenantSlug }) {
  const { colors, companyInfo, isLight } = useTenant();
  const [vehicles, setVehicles] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/data/vehicles.json')
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(console.error);
  }, []);

  const makes = [...new Set(vehicles.map(v => v.make))].sort();
  const models = selectedMake
    ? [...new Set(vehicles.filter(v => v.make === selectedMake).map(v => v.model))].sort()
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/reseller/${tenantSlug}/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    window.location.href = `/reseller/${tenantSlug}/products?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Hero Section */}
      <div
        className="py-16 md:py-24"
        style={{ backgroundColor: colors?.primary || '#1e3a5f' }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-light text-white mb-4">
            {tenant.name}
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Quality Rolls-Royce & Bentley Parts
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by part number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 shadow-lg"
                style={{ '--tw-ring-color': colors?.accent || '#c9a227' }}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Vehicle Finder Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-light text-gray-900 mb-2">
              Find Parts for Your Vehicle
            </h2>
            <p className="text-gray-600">
              Select your make and model to browse available parts
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Make</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': colors?.primary || '#1e3a5f' }}
                  value={selectedMake}
                  onChange={(e) => {
                    setSelectedMake(e.target.value);
                    setSelectedModel('');
                  }}
                >
                  <option value="">Select Make</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">Model</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 disabled:bg-gray-100"
                  style={{ '--tw-ring-color': colors?.primary || '#1e3a5f' }}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedMake}
                >
                  <option value="">Select Model</option>
                  {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  className="w-full py-3 rounded-lg text-white font-medium transition-colors"
                  style={{
                    backgroundColor: colors?.primary || '#1e3a5f',
                    opacity: selectedMake ? 1 : 0.5
                  }}
                  onClick={handleVehicleSearch}
                  disabled={!selectedMake}
                >
                  Find Parts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href={`/reseller/${tenantSlug}/products?make=Bentley`}
              className="group p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors?.primary}15` }}
                >
                  <Car className="w-6 h-6" style={{ color: colors?.primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 group-hover:text-[var(--color-primary)]">
                    Bentley Parts
                  </h3>
                  <p className="text-gray-500 text-sm">Browse all Bentley parts</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href={`/reseller/${tenantSlug}/products?make=Rolls-Royce`}
              className="group p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors?.primary}15` }}
                >
                  <Car className="w-6 h-6" style={{ color: colors?.primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 group-hover:text-[var(--color-primary)]">
                    Rolls-Royce Parts
                  </h3>
                  <p className="text-gray-500 text-sm">Browse all Rolls-Royce parts</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section - Important for light sites */}
      {isLight && (
        <div
          className="py-12"
          style={{ backgroundColor: `${colors?.primary}08` }}
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-display font-light text-gray-900 mb-4">
              Ready to Order?
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Contact us to place your order or request a quote. We'll get back to you promptly with availability and pricing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {companyInfo?.email && (
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors"
                  style={{ backgroundColor: colors?.primary }}
                >
                  <Mail className="w-5 h-5" />
                  {companyInfo.email}
                </a>
              )}
              {companyInfo?.phone && (
                <a
                  href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium transition-colors"
                  style={{
                    borderColor: colors?.primary,
                    color: colors?.primary
                  }}
                >
                  <Phone className="w-5 h-5" />
                  {companyInfo.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}
