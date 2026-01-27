'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Award, Clock, Users, Wrench } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { getTenant } from '@/lib/tenants';

function AboutContent({ tenantSlug }) {
  const { tenant, colors, companyInfo } = useTenant();

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>About Us</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div
        className="py-16"
        style={{ backgroundColor: `${colors?.primary}08` }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-light text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600">
            {companyInfo?.tagline || 'Dedicated to excellence'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed">
            <strong style={{ color: colors?.primary }}>{companyInfo?.name || tenant?.name}</strong> continues to be dedicated to two iconic brands, Rolls-Royce and Bentley. We offer independent service and parts for Bentley cars over 10 years old as well as Crewe built Rolls-Royce cars (up to 2002 model year).
          </p>
          <p className="text-gray-700 leading-relaxed">
            In returning to our roots, offering parts and service as our founder did when we started over 60 years ago, we eagerly look forward to keeping the {companyInfo?.name?.split(' ')[0] || 'our'} name synonymous with Crewe built Rolls-Royce and Bentley cars.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We continue to be one of the country's largest suppliers of OEM parts while offering a wide selection of quality reproduction parts when OEM is not available, as well as a vast number of no longer available items accumulated over the last six decades.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Clock, label: 'Years of Experience', value: '60+' },
            { icon: Award, label: 'Quality Parts', value: '1000s' },
            { icon: Users, label: 'Satisfied Customers', value: '10,000+' },
            { icon: Wrench, label: 'Expert Staff', value: 'Dedicated' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-xl"
              style={{ backgroundColor: `${colors?.primary}08` }}
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: colors?.primary }} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-light text-gray-900 mb-6">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'OEM Parts',
                description: 'Genuine original equipment manufacturer parts for Rolls-Royce and Bentley vehicles.',
              },
              {
                title: 'Reproduction Parts',
                description: 'Quality reproduction parts when OEM is no longer available.',
              },
              {
                title: 'NLA Parts',
                description: 'Vast inventory of no-longer-available parts accumulated over 60 years.',
              },
              {
                title: 'Expert Knowledge',
                description: 'Our experienced staff has decades of knowledge about these iconic vehicles.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: colors?.primary }}
        >
          <h2 className="text-2xl font-display text-white mb-4">Have Questions?</h2>
          <p className="text-white/90 mb-6">
            Our knowledgeable staff is here to help you find the right parts for your vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/reseller/${tenantSlug}/parts-request`}
              className="px-6 py-3 bg-white rounded-full font-semibold transition-opacity hover:opacity-90"
              style={{ color: colors?.primary }}
            >
              Request Parts
            </Link>
            <Link
              href={`/reseller/${tenantSlug}/contact`}
              className="px-6 py-3 rounded-full font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function AboutPage({ params }) {
  const tenant = getTenant(params.tenant);

  if (!tenant) {
    return <div>Invalid tenant</div>;
  }

  return (
    <TenantProvider tenant={tenant}>
      <AboutContent tenantSlug={params.tenant} />
    </TenantProvider>
  );
}
