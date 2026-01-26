'use client';

import { useState } from 'react';

export default function StockUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stockSource, setStockSource] = useState('warehouse'); // 'warehouse' or 'supplier'

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);

    if (selectedFile) {
      // Preview first few rows
      const text = await selectedFile.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const previewRows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i];
          return obj;
        }, {});
      });
      setPreview({ headers, rows: previewRows, total: lines.length - 1 });
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', stockSource);

      const response = await fetch('/api/admin/stock/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Update</h1>
      </div>

      {/* Stock Source Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Stock Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setStockSource('warehouse')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              stockSource === 'warehouse'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏭</span>
              <div>
                <p className="font-semibold text-gray-900">Warehouse Stock</p>
                <p className="text-sm text-gray-600">Khaos Control export - Available Now</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setStockSource('supplier')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              stockSource === 'supplier'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-semibold text-gray-900">Supplier Stock</p>
                <p className="text-sm text-gray-600">Supplier updates - 1-3 Day Availability</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className={`border rounded-lg p-4 ${stockSource === 'warehouse' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <h3 className={`font-semibold mb-2 ${stockSource === 'warehouse' ? 'text-blue-900' : 'text-green-900'}`}>
          CSV Format Expected
        </h3>
        <p className={`text-sm mb-2 ${stockSource === 'warehouse' ? 'text-blue-800' : 'text-green-800'}`}>
          {stockSource === 'warehouse'
            ? 'Upload your Khaos Control stock export CSV. Expected columns:'
            : 'Upload your supplier stock availability CSV. Expected columns:'
          }
        </p>
        <ul className={`text-sm list-disc list-inside space-y-1 ${stockSource === 'warehouse' ? 'text-blue-700' : 'text-green-700'}`}>
          <li><strong>Stock_code</strong> or <strong>SKU</strong> - Product SKU (exact match)</li>
          <li><strong>Available_level</strong> or <strong>qty</strong> - Stock quantity</li>
        </ul>
        <p className={`text-sm mt-3 ${stockSource === 'warehouse' ? 'text-blue-600' : 'text-green-600'}`}>
          {stockSource === 'warehouse'
            ? '→ Updates "Available Now" field and "In Stock" status'
            : '→ Updates "1-3 Day Availability" field'
          }
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview ({preview.total} rows total)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.map((header, i) => (
                        <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.rows.map((row, i) => (
                      <tr key={i}>
                        {preview.headers.map((header, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !file || uploading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : stockSource === 'warehouse'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              stockSource === 'warehouse'
                ? 'Upload & Update Warehouse Stock'
                : 'Upload & Update Supplier Availability'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">✅ Stock Update Complete!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-2xl font-bold text-green-700">{result.processed}</p>
              <p className="text-sm text-gray-600">Rows Processed</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-2xl font-bold text-green-700">{result.updated}</p>
              <p className="text-sm text-gray-600">Products Updated</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-2xl font-bold text-yellow-600">{result.notFound}</p>
              <p className="text-sm text-gray-600">SKUs Not Found</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-2xl font-bold text-red-600">{result.errors}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
          </div>

          {result.notFoundSkus && result.notFoundSkus.length > 0 && (
            <div className="mt-4">
              <details className="text-sm">
                <summary className="cursor-pointer text-yellow-700 font-medium">
                  View {result.notFoundSkus.length} SKUs not found in database
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded border text-gray-600">
                  {result.notFoundSkus.slice(0, 50).join(', ')}
                  {result.notFoundSkus.length > 50 && ` ... and ${result.notFoundSkus.length - 50} more`}
                </div>
              </details>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next step:</strong> To deploy these changes to the live site, run:
            </p>
            <code className="block mt-2 text-xs bg-white p-2 rounded border text-gray-700">
              node scripts/export-from-supabase.js stock && git add data/json && git commit -m "Stock update" && git push
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
