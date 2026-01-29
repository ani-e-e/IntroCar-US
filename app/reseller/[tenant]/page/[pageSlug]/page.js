'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ResellerHeader from '../../components/ResellerHeader';
import ResellerFooter from '../../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';

function CMSPageContent({ tenantSlug, pageSlug }) {
  const { colors, tenant } = useTenant();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/reseller/pages?tenant=${tenantSlug}&page=${pageSlug}`);
        const data = await res.json();

        if (res.ok && data.page) {
          setPage(data.page);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [tenantSlug, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
          <Link
            href={`/reseller/${tenantSlug}`}
            className="px-6 py-3 rounded-full text-white font-medium inline-block"
            style={{ backgroundColor: colors?.primary }}
          >
            Back to Home
          </Link>
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
            <span style={{ color: colors?.primary }}>{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div
        className="py-12"
        style={{ backgroundColor: `${colors?.primary}08` }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-light text-gray-900 mb-4">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:font-light
            prose-h2:text-2xl prose-h2:text-gray-900 prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:text-gray-800 prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:my-4 prose-li:text-gray-700
            prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function CMSPage({ params }) {
  return <CMSPageContent tenantSlug={params.tenant} pageSlug={params.pageSlug} />;
}
