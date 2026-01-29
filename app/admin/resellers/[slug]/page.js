'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Color input component with preview
function ColorPicker({ label, value, onChange, description }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
      />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded font-mono w-28"
        />
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default function ResellerEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    is_active: true,
    logo_url: '',
    colors: {
      primary: '#1e3a5f',
      primaryDark: '#142840',
      accent: '#c9a227',
      accentLight: '#d4b84a',
      secondary: '#2d4a6f',
      background: '#f8f9fa',
      text: '#1a1a1a',
      textLight: '#666666'
    },
    features: ['light'],
    show_prices: false,
    show_cart: false,
    checkout_enabled: false,
    order_email: '',
    sku_filter: '',
    company_info: {
      name: '',
      tagline: '',
      description: '',
      yearsInBusiness: null,
      phone: '',
      email: '',
      salesEmail: '',
      address: '',
      partsAddress: '',
      hours: '',
      website: ''
    }
  });

  // Product tagging state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [productPagination, setProductPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [taggingAction, setTaggingAction] = useState(null);

  // CMS Pages state
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageData, setNewPageData] = useState({
    page_slug: '',
    title: '',
    content: '',
    is_published: true,
    show_in_nav: true,
    nav_order: 100
  });

  const loadReseller = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/resellers/${slug}`);
      const data = await response.json();

      if (response.ok && data.reseller) {
        const r = data.reseller;
        setFormData({
          name: r.name || '',
          slug: r.slug || '',
          domain: r.domain || '',
          is_active: r.is_active !== false,
          logo_url: r.logo_url || '',
          colors: {
            primary: r.colors?.primary || '#1e3a5f',
            primaryDark: r.colors?.primaryDark || '#142840',
            accent: r.colors?.accent || '#c9a227',
            accentLight: r.colors?.accentLight || '#d4b84a',
            secondary: r.colors?.secondary || '#2d4a6f',
            background: r.colors?.background || '#f8f9fa',
            text: r.colors?.text || '#1a1a1a',
            textLight: r.colors?.textLight || '#666666'
          },
          features: r.features || ['light'],
          show_prices: r.show_prices || false,
          show_cart: r.show_cart || false,
          checkout_enabled: r.checkout_enabled || false,
          order_email: r.order_email || '',
          sku_filter: r.sku_filter || '',
          company_info: {
            name: r.company_info?.name || '',
            tagline: r.company_info?.tagline || '',
            description: r.company_info?.description || '',
            yearsInBusiness: r.company_info?.yearsInBusiness || null,
            phone: r.company_info?.phone || '',
            email: r.company_info?.email || '',
            salesEmail: r.company_info?.salesEmail || '',
            address: r.company_info?.address || '',
            partsAddress: r.company_info?.partsAddress || '',
            hours: r.company_info?.hours || '',
            website: r.company_info?.website || ''
          }
        });
      } else {
        setErrorMessage(data.error || 'Reseller not found');
      }
    } catch (error) {
      console.error('Failed to load reseller:', error);
      setErrorMessage('Failed to load reseller');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadProducts = useCallback(async (page = 1) => {
    if (!formData.sku_filter) return;

    setProductLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(productSearch && { search: productSearch })
      });

      const response = await fetch(`/api/admin/resellers/${slug}/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setProductPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setProductLoading(false);
    }
  }, [slug, formData.sku_filter, productSearch]);

  // Load CMS pages
  const loadPages = useCallback(async () => {
    setPagesLoading(true);
    try {
      const response = await fetch(`/api/admin/resellers/${slug}/pages`);
      const data = await response.json();
      if (response.ok) {
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setPagesLoading(false);
    }
  }, [slug]);

  // Save page (create or update)
  const savePage = async (pageData, isNew = false) => {
    try {
      const url = isNew
        ? `/api/admin/resellers/${slug}/pages`
        : `/api/admin/resellers/${slug}/pages/${pageData.page_slug}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Page saved successfully');
        setTimeout(() => setSuccessMessage(''), 4000);
        loadPages();
        setEditingPage(null);
        setShowNewPageModal(false);
        setNewPageData({ page_slug: '', title: '', content: '', is_published: true, show_in_nav: true, nav_order: 100 });
      } else {
        setErrorMessage(data.error || 'Failed to save page');
      }
    } catch (error) {
      setErrorMessage('An error occurred while saving');
    }
  };

  // Delete page
  const deletePage = async (pageSlug) => {
    if (!confirm(`Are you sure you want to delete this page?`)) return;

    try {
      const response = await fetch(`/api/admin/resellers/${slug}/pages/${pageSlug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage('Page deleted successfully');
        setTimeout(() => setSuccessMessage(''), 4000);
        loadPages();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to delete page');
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting');
    }
  };

  useEffect(() => {
    loadReseller();
  }, [loadReseller]);

  useEffect(() => {
    if (activeTab === 'pages') {
      loadPages();
    }
  }, [activeTab, loadPages]);

  useEffect(() => {
    if (activeTab === 'products' && formData.sku_filter) {
      loadProducts();
    }
  }, [activeTab, formData.sku_filter, loadProducts]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/admin/resellers/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Changes saved successfully');
        setTimeout(() => setSuccessMessage(''), 4000);

        // If slug changed, redirect to new URL
        if (data.reseller?.slug && data.reseller.slug !== slug) {
          router.replace(`/admin/resellers/${data.reseller.slug}`);
        }
      } else {
        setErrorMessage(data.error || 'Failed to save changes');
      }
    } catch (error) {
      setErrorMessage('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key, value) => {
    setFormData({
      ...formData,
      colors: { ...formData.colors, [key]: value }
    });
  };

  const updateCompanyInfo = (key, value) => {
    setFormData({
      ...formData,
      company_info: { ...formData.company_info, [key]: value }
    });
  };

  const handleTagProducts = async (action, stockTypes = null) => {
    setTaggingAction(action);
    try {
      const body = stockTypes
        ? { action: 'tag-by-stock-type', stockTypes }
        : { action };

      const response = await fetch(`/api/admin/resellers/${slug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Products updated');
        setTimeout(() => setSuccessMessage(''), 4000);
        loadProducts();
      } else {
        setErrorMessage(data.error || 'Failed to update products');
      }
    } catch (error) {
      setErrorMessage('An error occurred');
    } finally {
      setTaggingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'features', label: 'Features', icon: '⚙️' },
    { id: 'company', label: 'Company Info', icon: '🏢' },
    { id: 'pages', label: 'CMS Pages', icon: '📄' },
    { id: 'products', label: 'Product Tagging', icon: '📦' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/resellers"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{formData.name || 'Edit Reseller'}</h1>
            <p className="text-sm text-gray-500 font-mono">/reseller/{formData.slug}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/reseller/${slug}`}
            target="_blank"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Preview Site
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between">
          {errorMessage}
          <button onClick={() => setErrorMessage('')} className="text-red-500">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-2">/reseller/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g., parts.yourcompany.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">For production routing. Configure DNS to point to your deployment.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="/images/resellers/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.logo_url && (
                <div className="mt-2 p-2 bg-gray-100 rounded-lg inline-block">
                  <img src={formData.logo_url} alt="Logo preview" className="h-12 object-contain" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (site is accessible)
              </label>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={formData.colors.primary}
                  onChange={(v) => updateColor('primary', v)}
                  description="Header, buttons"
                />
                <ColorPicker
                  label="Primary Dark"
                  value={formData.colors.primaryDark}
                  onChange={(v) => updateColor('primaryDark', v)}
                  description="Hover states"
                />
                <ColorPicker
                  label="Accent Color"
                  value={formData.colors.accent}
                  onChange={(v) => updateColor('accent', v)}
                  description="CTAs, highlights"
                />
                <ColorPicker
                  label="Accent Light"
                  value={formData.colors.accentLight}
                  onChange={(v) => updateColor('accentLight', v)}
                  description="Hover states"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={formData.colors.secondary}
                  onChange={(v) => updateColor('secondary', v)}
                  description="Secondary elements"
                />
                <ColorPicker
                  label="Background"
                  value={formData.colors.background}
                  onChange={(v) => updateColor('background', v)}
                  description="Page background"
                />
                <ColorPicker
                  label="Text Color"
                  value={formData.colors.text}
                  onChange={(v) => updateColor('text', v)}
                  description="Main text"
                />
                <ColorPicker
                  label="Text Light"
                  value={formData.colors.textLight}
                  onChange={(v) => updateColor('textLight', v)}
                  description="Secondary text"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div
                className="rounded-lg overflow-hidden border border-gray-200"
                style={{ backgroundColor: formData.colors.background }}
              >
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ backgroundColor: formData.colors.primary }}
                >
                  <span className="font-bold text-white">{formData.name || 'Reseller Name'}</span>
                  <div className="flex gap-4">
                    <span className="text-white/80 text-sm">Products</span>
                    <span className="text-white/80 text-sm">Contact</span>
                  </div>
                </div>
                <div className="p-6">
                  <p style={{ color: formData.colors.text }}>
                    Welcome to our parts store.
                  </p>
                  <p className="text-sm mt-2" style={{ color: formData.colors.textLight }}>
                    Browse our selection of premium parts.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: formData.colors.accent }}
                    >
                      Shop Now
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: formData.colors.secondary,
                        color: '#fff'
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Features</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_prices}
                    onChange={(e) => setFormData({ ...formData, show_prices: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">💲 Show Prices</span>
                    <p className="text-sm text-gray-500">Display product prices on the reseller site</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_cart}
                    onChange={(e) => setFormData({ ...formData, show_cart: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">🛒 Enable Cart</span>
                    <p className="text-sm text-gray-500">Allow customers to add items to cart</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.checkout_enabled}
                    onChange={(e) => setFormData({ ...formData, checkout_enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">✓ Enable Checkout</span>
                    <p className="text-sm text-gray-500">Allow customers to complete orders (check payment)</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Email</label>
              <input
                type="email"
                value={formData.order_email}
                onChange={(e) => setFormData({ ...formData, order_email: e.target.value })}
                placeholder="orders@yourcompany.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Where order notifications are sent</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feature Mode</label>
              <select
                value={formData.features.includes('full') ? 'full' : 'light'}
                onChange={(e) => setFormData({ ...formData, features: [e.target.value] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light (reduced features)</option>
                <option value="full">Full (all features)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU Filter Tag</label>
              <input
                type="text"
                value={formData.sku_filter}
                onChange={(e) => setFormData({ ...formData, sku_filter: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                placeholder="e.g., prestige_parts"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only products tagged with this flag will appear on the reseller site.
                Leave empty to show all products.
              </p>
            </div>
          </div>
        )}

        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.company_info.name}
                  onChange={(e) => updateCompanyInfo('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                <input
                  type="number"
                  value={formData.company_info.yearsInBusiness || ''}
                  onChange={(e) => updateCompanyInfo('yearsInBusiness', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Displayed as "30+ Years" on About page</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.company_info.tagline}
                onChange={(e) => updateCompanyInfo('tagline', e.target.value)}
                placeholder="e.g., Your trusted source for Bentley and Rolls-Royce parts"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Shown below "About Us" on the About page</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
              <textarea
                value={formData.company_info.description || ''}
                onChange={(e) => updateCompanyInfo('description', e.target.value)}
                rows={4}
                placeholder="Tell your company story. Each paragraph should be separated by a blank line."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Main content for the About page. Leave blank for default text.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.company_info.phone}
                  onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.company_info.email}
                  onChange={(e) => updateCompanyInfo('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Email</label>
                <input
                  type="email"
                  value={formData.company_info.salesEmail}
                  onChange={(e) => updateCompanyInfo('salesEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.company_info.website}
                  onChange={(e) => updateCompanyInfo('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Address</label>
              <input
                type="text"
                value={formData.company_info.address}
                onChange={(e) => updateCompanyInfo('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parts Address (if different)</label>
              <input
                type="text"
                value={formData.company_info.partsAddress}
                onChange={(e) => updateCompanyInfo('partsAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
              <input
                type="text"
                value={formData.company_info.hours}
                onChange={(e) => updateCompanyInfo('hours', e.target.value)}
                placeholder="e.g., Mon-Fri 8:00 AM - 5:00 PM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* CMS Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">CMS Pages</h3>
                <p className="text-sm text-gray-500">Create custom pages for this reseller site</p>
              </div>
              <button
                onClick={() => setShowNewPageModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Page
              </button>
            </div>

            {/* Pages List */}
            {pagesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium mb-2">No custom pages yet</p>
                <p className="text-sm">Click "Add Page" to create your first custom page.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nav</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.title}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-500">/{page.page_slug}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            page.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {page.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {page.show_in_nav ? `Yes (${page.nav_order})` : 'No'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <a
                            href={`/reseller/${slug}/page/${page.page_slug}`}
                            target="_blank"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View
                          </a>
                          <button
                            onClick={() => setEditingPage(page)}
                            className="text-gray-600 hover:text-gray-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePage(page.page_slug)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* New Page Modal */}
            {showNewPageModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Create New Page</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
                        <input
                          type="text"
                          value={newPageData.title}
                          onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
                          placeholder="e.g., Our Services"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                        <input
                          type="text"
                          value={newPageData.page_slug}
                          onChange={(e) => setNewPageData({
                            ...newPageData,
                            page_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                          })}
                          placeholder="e.g., services"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Will be: /reseller/{slug}/page/{newPageData.page_slug || 'slug'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                      <textarea
                        value={newPageData.content}
                        onChange={(e) => setNewPageData({ ...newPageData, content: e.target.value })}
                        rows={10}
                        placeholder="<h2>Section Title</h2><p>Your content here...</p>"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">Use HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt;</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newPageData.is_published}
                          onChange={(e) => setNewPageData({ ...newPageData, is_published: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Published</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newPageData.show_in_nav}
                          onChange={(e) => setNewPageData({ ...newPageData, show_in_nav: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show in Nav</span>
                      </label>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nav Order</label>
                        <input
                          type="number"
                          value={newPageData.nav_order}
                          onChange={(e) => setNewPageData({ ...newPageData, nav_order: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowNewPageModal(false);
                        setNewPageData({ page_slug: '', title: '', content: '', is_published: true, show_in_nav: true, nav_order: 100 });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => savePage(newPageData, true)}
                      disabled={!newPageData.title || !newPageData.page_slug}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create Page
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Page Modal */}
            {editingPage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Edit Page: {editingPage.title}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
                        <input
                          type="text"
                          value={editingPage.title}
                          onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                        <input
                          type="text"
                          value={editingPage.page_slug}
                          onChange={(e) => setEditingPage({
                            ...editingPage,
                            page_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                      <textarea
                        value={editingPage.content || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                        rows={12}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPage.is_published}
                          onChange={(e) => setEditingPage({ ...editingPage, is_published: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Published</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPage.show_in_nav}
                          onChange={(e) => setEditingPage({ ...editingPage, show_in_nav: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show in Nav</span>
                      </label>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nav Order</label>
                        <input
                          type="number"
                          value={editingPage.nav_order}
                          onChange={(e) => setEditingPage({ ...editingPage, nav_order: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      onClick={() => setEditingPage(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => savePage(editingPage, false)}
                      disabled={!editingPage.title}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {!formData.sku_filter ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium mb-2">No SKU Filter Set</p>
                <p className="text-sm">
                  Go to the Features tab and set a SKU Filter tag to enable product tagging.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Products Tagged: <span className="text-blue-600">{formData.sku_filter}</span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {productPagination.total} products currently tagged for this reseller
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTagProducts('tag-by-stock-type', ['Prestige Parts', 'Prestige Parts (OE)', 'Uprated'])}
                      disabled={taggingAction !== null}
                      className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                    >
                      {taggingAction === 'tag-by-stock-type' ? 'Tagging...' : 'Tag Prestige Parts'}
                    </button>
                    <button
                      onClick={() => handleTagProducts('clear-all')}
                      disabled={taggingAction !== null}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      {taggingAction === 'clear-all' ? 'Clearing...' : 'Clear All Tags'}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProducts(1)}
                    placeholder="Search by SKU or description..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => loadProducts(1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Search
                  </button>
                </div>

                {/* Products Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {productLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                  ) : products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No products tagged yet
                    </div>
                  ) : (
                    <>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr key={product.sku} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-mono text-gray-900">{product.sku}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{product.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{product.stock_type || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {product.us_price ? `$${product.us_price}` : product.uk_price ? `£${product.uk_price}` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Showing {products.length} of {productPagination.total} products
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadProducts(productPagination.page - 1)}
                            disabled={productPagination.page === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-600">
                            Page {productPagination.page} of {productPagination.totalPages}
                          </span>
                          <button
                            onClick={() => loadProducts(productPagination.page + 1)}
                            disabled={productPagination.page >= productPagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
