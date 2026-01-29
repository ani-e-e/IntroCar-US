'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function ResellersAdminPage() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newReseller, setNewReseller] = useState({
    name: '',
    slug: '',
    domain: ''
  });

  const loadResellers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showInactive) params.set('includeInactive', 'true');

      const response = await fetch(`/api/admin/resellers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResellers(data.resellers || []);
      } else {
        setErrorMessage(data.error || 'Failed to load resellers');
      }
    } catch (error) {
      console.error('Failed to load resellers:', error);
      setErrorMessage('Failed to load resellers');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    loadResellers();
  }, [loadResellers]);

  // Auto-generate slug from name
  const handleNameChange = (name) => {
    setNewReseller({
      ...newReseller,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReseller),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewReseller({ name: '', slug: '', domain: '' });
        setSuccessMessage(data.message || 'Reseller created successfully');
        setTimeout(() => setSuccessMessage(''), 4000);
        loadResellers();
      } else {
        setErrorMessage(data.error || 'Failed to create reseller');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating reseller');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slug, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/resellers/${slug}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Reseller deleted');
        setTimeout(() => setSuccessMessage(''), 4000);
        loadResellers();
      } else {
        setErrorMessage(data.error || 'Failed to delete reseller');
      }
    } catch (error) {
      setErrorMessage('Failed to delete reseller');
    }
  };

  const toggleActive = async (slug, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/resellers/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        loadResellers();
      } else {
        setErrorMessage(data.error || 'Failed to update status');
      }
    } catch (error) {
      setErrorMessage('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reseller Configuration</h1>
          <p className="text-gray-500 mt-1">
            Manage reseller sites, branding, and product filtering
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show inactive
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + New Reseller
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <span className="text-green-500">✓</span>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Resellers</p>
          <p className="text-2xl font-bold text-gray-900">{resellers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {resellers.filter(r => r.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">With Checkout</p>
          <p className="text-2xl font-bold text-blue-600">
            {resellers.filter(r => r.checkout_enabled).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">With Product Filter</p>
          <p className="text-2xl font-bold text-purple-600">
            {resellers.filter(r => r.sku_filter).length}
          </p>
        </div>
      </div>

      {/* Resellers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : resellers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No resellers configured yet. Click "New Reseller" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reseller</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU Filter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Features</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resellers.map((reseller) => (
                  <tr key={reseller.slug} className={`hover:bg-gray-50 ${!reseller.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {reseller.logo_url ? (
                          <img
                            src={reseller.logo_url}
                            alt=""
                            className="w-10 h-10 rounded object-contain bg-gray-100"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: reseller.colors?.primary || '#1e3a5f' }}
                          >
                            {reseller.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{reseller.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{reseller.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {reseller.domain || <span className="text-gray-400">Not set</span>}
                    </td>
                    <td className="px-4 py-4">
                      {reseller.sku_filter ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {reseller.sku_filter}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">All products</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {reseller.productCount !== undefined ? (
                        <span className="font-medium">{reseller.productCount.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {reseller.show_prices && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                            💲 Prices
                          </span>
                        )}
                        {reseller.show_cart && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                            🛒 Cart
                          </span>
                        )}
                        {reseller.checkout_enabled && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                            ✓ Checkout
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(reseller.slug, reseller.is_active)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          reseller.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {reseller.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/resellers/${reseller.slug}`}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/reseller/${reseller.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          Preview
                        </Link>
                        {reseller.slug !== 'introcar-us' && (
                          <button
                            onClick={() => handleDelete(reseller.slug, reseller.name)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Reseller</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reseller Name *
                  </label>
                  <input
                    type="text"
                    value={newReseller.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Acme Motors"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">/reseller/</span>
                    <input
                      type="text"
                      value={newReseller.slug}
                      onChange={(e) => setNewReseller({ ...newReseller, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="acme-motors"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Domain (optional)
                  </label>
                  <input
                    type="text"
                    value={newReseller.domain}
                    onChange={(e) => setNewReseller({ ...newReseller, domain: e.target.value })}
                    placeholder="e.g., parts.acmemotors.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errorMessage}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setErrorMessage('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Reseller'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
