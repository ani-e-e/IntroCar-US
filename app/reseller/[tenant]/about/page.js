'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Phone, Mail, MapPin, Clock, Award, Users, Wrench, Package } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';

function AboutContent({ tenantSlug }) {
  const { colors, companyInfo, tenant } = useTenant();

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
            About Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dedicated to excellence since 1963
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Company Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>Albers Motorcars</strong> (formerly known as Albers Rolls-Royce and later as Bentley Zionsville) continues to be dedicated to two iconic brands, Rolls-Royce and Bentley.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Going forward, as Albers Motorcars, we will continue to offer independent service and parts for Bentley cars over 10 years old as well as Crewe built Rolls-Royce cars (up to 2002 model year).
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              In returning to our roots, offering parts and service as our founder did when we started over 60 years ago, we eagerly look forward to keeping the Albers name synonymous with Crewe built Rolls-Royce and Bentley cars.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              We will continue to be one of the country's largest suppliers of OEM parts while offering a wide selection of quality reproduction parts when OEM is not available as well as a vast number of no longer available items accumulated over the last 57 years.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You'll be pleased to know that although our name has changed, the same knowledgeable staff and the Albers family are here to serve you. We look forward to continuing to provide for your needs in the future.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: `${colors?.primary}08` }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: colors?.primary }}>60+</div>
            <div className="text-gray-600">Years of Experience</div>
          </div>
          <div
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: `${colors?.primary}08` }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: colors?.primary }}>1000s</div>
            <div className="text-gray-600">Parts in Stock</div>
          </div>
          <div
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: `${colors?.primary}08` }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: colors?.primary }}>1945</div>
            <div className="text-gray-600">Earliest Parts Coverage</div>
          </div>
          <div
            className="text-center p-6 rounded-xl"
            style={{ backgroundColor: `${colors?.primary}08` }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: colors?.primary }}>#1</div>
            <div className="text-gray-600">Largest Independent Supplier</div>
          </div>
        </div>

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
                One of the country's largest suppliers of genuine OEM parts for Rolls-Royce and Bentley
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
                Wide selection of quality reproduction parts when OEM is not available
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors?.primary}15` }}
              >
                <Wrench className="w-7 h-7" style={{ color: colors?.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Service</h3>
              <p className="text-gray-600 text-sm">
                Independent service for Bentley cars over 10 years old and Crewe built Rolls-Royce
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors?.primary}15` }}
              >
                <Users className="w-7 h-7" style={{ color: colors?.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">NLA Inventory</h3>
              <p className="text-gray-600 text-sm">
                Vast number of no longer available items accumulated over the last 57 years
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Section */}
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
                  <span>Crewe Built cars from 1945 to 2002</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>Limited stock of pre-war parts (1920-1939)</span>
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
                  <span>Parts from 1945 to present</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>Service for cars over 10 years old</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: colors?.primary }}>•</span>
                  <span>Limited stock of pre-war parts (1931-1939)</span>
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
            Contact our helpful and experienced staff Monday through Friday, 8 a.m. to 4:30 p.m. EST.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/reseller/${tenantSlug}/parts-request`}
              className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-full font-semibold transition-colors hover:bg-gray-100"
              style={{ color: colors?.primary }}
            >
              Submit Parts Request
            </Link>
            <a
              href="tel:(317) 873-2360"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" />
              (317) 873-2360
            </a>
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
