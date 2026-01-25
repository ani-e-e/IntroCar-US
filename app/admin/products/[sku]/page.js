'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage({ params }) {
  const { sku } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProduct();
  }, [sku]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(sku)}`);
      const data = await response.json();

      if (response.ok) {
        setProduct(data.product);
      } else {
        setError(data.error || 'Failed to load product');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(sku)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setProduct(data.product);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/admin/products" className="text-blue-600 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:underline text-sm">
          ← Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.sku}</h1>
            <p className="text-gray-500 mt-1">{product.description}</p>
          </div>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.description}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={product.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (GBP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.price || 0}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.weight || 0}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Type
              </label>
              <select
                value={product.stockType || ''}
                onChange={(e) => handleChange('stockType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Original Equipment">Original Equipment</option>
                <option value="Prestige Parts">Prestige Parts</option>
                <option value="Aftermarket">Aftermarket</option>
              </select>
            </div>

            {/* In Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                value={product.inStock ? 'true' : 'false'}
                onChange={(e) => handleChange('inStock', e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            {/* Available Now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Now
              </label>
              <input
                type="number"
                min="0"
                value={product.availableNow || 0}
                onChange={(e) => handleChange('availableNow', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Available 1-3 Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available 1-3 Days
              </label>
              <input
                type="number"
                min="0"
                value={product.available1to3Days || 0}
                onChange={(e) => handleChange('available1to3Days', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <input
                type="text"
                value={product.categories || ''}
                onChange={(e) => handleChange('categories', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Category/Subcategory"
              />
              <p className="text-xs text-gray-500 mt-1">Use / to separate category hierarchy, | for multiple categories</p>
            </div>

            {/* Additional Info */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Info
              </label>
              <textarea
                value={product.additionalInfo || ''}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Read-only Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Read-only Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Parent SKU:</span>
                <p className="font-mono">{product.parentSku || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Part Type:</span>
                <p>{product.searchPartType || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Fitment:</span>
                <p>{product.fitment?.length || 0} vehicles</p>
              </div>
              <div>
                <span className="text-gray-500">Supersessions:</span>
                <p>{product.supersessions?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              {product.lastModified && (
                <p className="text-sm text-gray-500">
                  Last modified: {new Date(product.lastModified).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/products"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
