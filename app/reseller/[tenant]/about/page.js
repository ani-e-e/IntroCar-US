'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Phone, Mail, MapPin, Clock, Award, Users, Wrench, Package } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';

function AboutContent({ tenantSlug }) {
  const { colors, companyInfo, tenant } = useTenant();

  // Get dynamic content with fallbacks
  const tagline = companyInfo?.tagline || 'Your trusted source for quality parts';
  const description = companyInfo?.description || null;
  const yearsInBusiness = companyInfo?.yearsInBusiness || null;

  // Default stats (can be overridden per tenant via companyInfo.stats)
  const defaultStats = [
    { value: '1000s', label: 'Parts in Stock' },
    { value: '1945', label: 'Earliest Parts Coverage' },
  ];

  // Add years stat if available
  if (yearsInBusiness) {
    defaultStats.unshift({ value: `${yearsInBusiness}+`, label: 'Years of Experience' });
  }

  const stats = companyInfo?.stats || defaultStats;

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
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-light text-gray-900 mb-4">
            About {tenant?.name || 'Us'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {tagline}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Company Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="prose prose-lg max-w-none">
            {description ? (
              // Render custom description paragraphs
              description.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {index === 0 ? (
                    <>
                      <strong>{tenant?.name}</strong> {paragraph.replace(/^[^,]+,?\s*/, '')}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))
            ) : (
              // Default generic content for resellers
              <>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>{tenant?.name}</strong> is your trusted source for quality Rolls-Royce and Bentley parts. We specialize in providing genuine OEM parts and quality reproductions for classic and modern vehicles.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  With our extensive inventory and expert knowledge, we can help you find the exact parts you need for your vehicle. We offer competitive pricing and excellent customer service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Whether you're looking for routine maintenance parts or rare components for a restoration project, our knowledgeable team is here to assist you every step of the way.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid - Only show if we have stats */}
        {stats && stats.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-6 mb-16`}>
            {stats.slice(0, 4).map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl"
                style={{ backgroundColor: `${colors?.primary}08` }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: colors?.primary }}>
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-2xl font-display text-gray-900 text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors?.primary}15` }}
              >
                <Package className="w-7 h-7" style={{ color: colors?.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">OEM Parts</h3>
              <p className="text-gray-600 text-sm">
                Genuine OEM parts for Rolls-Royce and Bentley vehicles
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors?.primary}15` }}
              >
                <Award className="w-7 h-7" style={{ color: colors?.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Reproductions</h3>
              <p className="text-gray-600 text-sm">
                High-quality reproduction parts when OEM is not available
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors?.primary}15` }}
              >
                <Wrench className="w-7 h-7" style={{ color: colors?.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Knowledge</h3>
              <p className="text-gray-600 text-sm">
                Specialized expertise in classic Rolls-Royce and Bentley vehicles
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors?.primary}15` }}
              >
                <Users className="w-7 h-7" style={{ color: colors?.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Service</h3>
              <p className="text-gray-600 text-sm">
                Dedicated customer service to help you find what you need
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Section - Standard for all resellers */}
        <div className="mb-16">
          <h2 className="text-2xl font-display text-gray-900 text-center mb-8">Vehicle Coverage</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              className="p-6 rounded-xl border"
              style={{ borderColor: `${colors?.primary}30`, backgroundColor: `${colors?.primary}05` }}
            >
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Rolls-Royce</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>Classic Crewe-built vehicles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>OEM and quality reproduction parts</span>
                </li>
              </ul>
            </div>
            <div
              className="p-6 rounded-xl border"
              style={{ borderColor: `${colors?.primary}30`, backgroundColor: `${colors?.primary}05` }}
            >
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Bentley</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>All model years and series</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>OEM and quality reproduction parts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{ backgroundColor: colors?.primary }}
        >
          <h2 className="text-2xl md:text-3xl font-display text-white mb-4">
            Ready to Find Your Parts?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            {companyInfo?.hours
              ? `Contact us during our business hours: ${companyInfo.hours}`
              : 'Contact our helpful team to get started with your parts order.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/reseller/${tenantSlug}/parts-request`}
              className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-full font-semibold transition-colors hover:bg-gray-100"
              style={{ color: colors?.primary }}
            >
              Submit Parts Request
            </Link>
            {companyInfo?.phone && (
              <a
                href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {companyInfo.phone}
              </a>
            )}
            {!companyInfo?.phone && companyInfo?.email && (
              <a
                href={`mailto:${companyInfo.email}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {companyInfo.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function AboutPage({ params }) {
  return <AboutContent tenantSlug={params.tenant} />;
}
