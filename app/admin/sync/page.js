'use client';

import { useState, useEffect } from 'react';

export default function SyncPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/admin/sync');
      const data = await response.json();
      if (response.ok) {
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        loadStatus(); // Refresh status
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading sync status...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sync to Magento</h1>
      <p className="text-gray-600 mb-8">
        Push product updates to your Magento store.
      </p>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${status?.magentoConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-gray-700">
            {status?.magentoConfigured
              ? 'Magento API configured'
              : 'Magento API not configured'}
          </span>
        </div>
        {!status?.magentoConfigured && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Setup required:</strong> Add these environment variables to Vercel:
            </p>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li><code className="bg-yellow-100 px-1 rounded">MAGENTO_BASE_URL</code> - Your Magento store URL</li>
              <li><code className="bg-yellow-100 px-1 rounded">MAGENTO_ACCESS_TOKEN</code> - API access token from Magento admin</li>
            </ul>
          </div>
        )}
      </div>

      {/* Pending Sync */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Updates</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status?.pendingCount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {status?.pendingCount || 0} products
          </span>
        </div>

        {status?.pendingCount > 0 ? (
          <>
            <p className="text-gray-600 mb-4">
              These products have been modified and need to be synced to Magento.
            </p>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">SKU</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {status?.pendingProducts?.map((product) => (
                    <tr key={product.sku} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono">{product.sku}</td>
                      <td className="px-4 py-2 text-gray-600 truncate max-w-xs">{product.description}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {product.lastModified ? new Date(product.lastModified).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500">All products are in sync with Magento.</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold">{result.message}</p>
          {result.results && (
            <div className="mt-2 text-sm">
              <p>✅ Success: {result.results.success.length}</p>
              {result.results.failed.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-700">
                    ❌ Failed: {result.results.failed.length}
                  </summary>
                  <div className="mt-2 bg-white p-2 rounded text-red-600">
                    {result.results.failed.map((f, i) => (
                      <div key={i} className="font-mono text-xs">
                        {f.sku}: {f.error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sync Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSync}
          disabled={syncing || !status?.magentoConfigured || status?.pendingCount === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {syncing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Syncing...
            </>
          ) : (
            <>
              🔄 Sync {status?.pendingCount || 0} Products to Magento
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          This will update prices, descriptions, weights, and stock levels in Magento.
        </p>
        <p className="mt-1">
          Products are matched by SKU. New products will not be created.
        </p>
      </div>
    </div>
  );
}
