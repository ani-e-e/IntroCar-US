'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Send, Phone, Mail, CheckCircle } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { getTenant } from '@/lib/tenants';

function PartsRequestContent({ tenantSlug }) {
  const { colors, companyInfo } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    make: '',
    model: '',
    year: '',
    vin: '',
    partDescription: '',
    paymentMethod: 'call',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Create mailto link with form data
    const subject = `Parts Request - ${formData.make} ${formData.model} ${formData.year}`;
    const body = `
PARTS REQUEST

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company || 'N/A'}
- Phone: ${formData.phone}

Address:
${formData.street}
${formData.city}, ${formData.state} ${formData.zip}
${formData.country}

Vehicle Information:
- Make: ${formData.make}
- Model: ${formData.model}
- Year: ${formData.year}
- VIN/Chassis: ${formData.vin}

Part Description:
${formData.partDescription}

Payment Preference: ${formData.paymentMethod === 'call' ? 'Please call me to finalize' : 'I will call to finalize'}
    `.trim();

    // Open mailto
    window.location.href = `mailto:${companyInfo?.email || 'parts@albersrb.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colors?.primary}15` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: colors?.primary }} />
          </div>
          <h1 className="text-3xl font-display font-light text-gray-900 mb-4">Request Submitted</h1>
          <p className="text-gray-600 mb-8">
            Your email client should have opened with your parts request. If it didn't, please email us directly at{' '}
            <a href={`mailto:${companyInfo?.email}`} className="underline" style={{ color: colors?.primary }}>
              {companyInfo?.email}
            </a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/reseller/${tenantSlug}/products`}
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: colors?.primary }}
            >
              Browse Parts
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 rounded-full font-medium border"
              style={{ borderColor: colors?.primary, color: colors?.primary }}
            >
              Submit Another Request
            </button>
          </div>
        </div>
        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>Parts Request</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-light text-gray-900 mb-4">Parts Request</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {companyInfo?.tagline || 'Specializing in Rolls-Royce & Bentley since 1963'}.
            Fill out the form below and our knowledgeable staff will assist you with your parts needs.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <a
            href={`tel:${companyInfo?.phone?.replace(/\D/g, '')}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors?.primary}15` }}
            >
              <Phone className="w-5 h-5" style={{ color: colors?.primary }} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Call Us</p>
              <p className="text-gray-500">{companyInfo?.phone}</p>
            </div>
          </a>
          <a
            href={`mailto:${companyInfo?.email}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors?.primary}15` }}
            >
              <Mail className="w-5 h-5" style={{ color: colors?.primary }} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Us</p>
              <p className="text-gray-500">{companyInfo?.email}</p>
            </div>
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': colors?.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Shipping Address
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Vehicle Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="">Select Make</option>
                  <option value="Rolls-Royce">Rolls-Royce</option>
                  <option value="Bentley">Bentley</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Continental GT, Silver Shadow"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2005"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN/Chassis Number *</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Part Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Part Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Name/Description/Number *
              </label>
              <textarea
                name="partDescription"
                value={formData.partDescription}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Please describe the part(s) you need, include part numbers if known..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Payment Preference */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              How Would You Like to Proceed?
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="call"
                  checked={formData.paymentMethod === 'call'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: colors?.primary }}
                />
                <span className="text-gray-900">Please call me to finalize this order</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="willCall"
                  checked={formData.paymentMethod === 'willCall'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: colors?.primary }}
                />
                <span className="text-gray-900">I will call to finalize this order ({companyInfo?.phone})</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: colors?.primary }}
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Parts Request'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              We typically respond within 24 hours during business days.
            </p>
          </div>
        </form>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function PartsRequestPage({ params }) {
  const tenant = getTenant(params.tenant);

  if (!tenant) {
    return <div>Invalid tenant</div>;
  }

  return (
    <TenantProvider tenant={tenant}>
      <PartsRequestContent tenantSlug={params.tenant} />
    </TenantProvider>
  );
}
