'use client';

import { useState, useRef } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setPreview(null);
      setResult(null);
      setError('');
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preview', 'true');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data);
      } else {
        setError(data.error || 'Failed to preview');
      }
    } catch (err) {
      setError('Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setPreview(null);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.error || 'Failed to upload');
      }
    } catch (err) {
      setError('Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload CSV</h1>
      <p className="text-gray-600 mb-8">
        Bulk update product prices, stock levels, weights, and more.
      </p>

      {/* CSV Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-3">CSV Format Guide</h3>
        <p className="text-sm text-blue-800 mb-3">
          Your CSV must include a <code className="bg-blue-100 px-1 rounded">sku</code> column. Other supported columns:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-white rounded px-2 py-1"><code>price</code></div>
          <div className="bg-white rounded px-2 py-1"><code>weight</code></div>
          <div className="bg-white rounded px-2 py-1"><code>description</code></div>
          <div className="bg-white rounded px-2 py-1"><code>categories</code></div>
          <div className="bg-white rounded px-2 py-1"><code>stock_type</code></div>
          <div className="bg-white rounded px-2 py-1"><code>in_stock</code></div>
          <div className="bg-white rounded px-2 py-1"><code>available_now</code></div>
          <div className="bg-white rounded px-2 py-1"><code>qty</code></div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          Column names are flexible (e.g., "price_usd", "Part_Number", "Quantity" all work)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold">{result.message}</p>
          <div className="mt-2 text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Rows processed: {result.summary.totalRows}</div>
            <div>Products updated: {result.summary.productsUpdated}</div>
            <div>Not found: {result.summary.productsNotFound}</div>
            <div>Errors: {result.summary.errors}</div>
          </div>
          {result.notFound?.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm">SKUs not found ({result.notFound.length})</summary>
              <div className="mt-2 text-xs font-mono bg-white p-2 rounded max-h-32 overflow-y-auto">
                {result.notFound.join(', ')}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!preview && !result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            <div className="text-4xl mb-4">📤</div>
            {file ? (
              <>
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-900">Drop your CSV here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </>
            )}
          </div>

          {file && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Preview Changes'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview Results */}
      {preview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Preview Changes</h2>
            <p className="text-gray-600 mt-1">Review the changes before applying them.</p>
          </div>

          {/* Summary */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{preview.summary.totalRows}</p>
                <p className="text-sm text-gray-500">Rows in CSV</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{preview.summary.productsToUpdate}</p>
                <p className="text-sm text-gray-500">Will Update</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{preview.summary.productsNotFound}</p>
                <p className="text-sm text-gray-500">Not Found</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{preview.summary.errors}</p>
                <p className="text-sm text-gray-500">Errors</p>
              </div>
            </div>
          </div>

          {/* Field Mappings */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Field Mappings</h3>
            <div className="flex flex-wrap gap-2">
              {preview.mappedFields.map((mapping, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {mapping}
                </span>
              ))}
            </div>
          </div>

          {/* Changes Preview */}
          {preview.updates.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Changes Preview {preview.updates.length > 100 && `(showing first 100 of ${preview.summary.productsToUpdate})`}
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">SKU</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Field</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Current</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">New</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.updates.slice(0, 100).map((update, i) => (
                      Object.entries(update.changes).map(([field, { old: oldVal, new: newVal }], j) => (
                        <tr key={`${i}-${j}`} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-gray-900">{j === 0 ? update.sku : ''}</td>
                          <td className="px-3 py-2 text-gray-600">{field}</td>
                          <td className="px-3 py-2 text-red-600">{String(oldVal)}</td>
                          <td className="px-3 py-2 text-green-600">{String(newVal)}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Not Found SKUs */}
          {preview.notFound.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <details>
                <summary className="cursor-pointer font-medium text-yellow-700">
                  {preview.notFound.length} SKUs not found in database
                </summary>
                <div className="mt-2 text-sm font-mono bg-yellow-50 p-3 rounded max-h-32 overflow-y-auto">
                  {preview.notFound.join(', ')}
                </div>
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || preview.summary.productsToUpdate === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Applying...' : `Apply ${preview.summary.productsToUpdate} Updates`}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 text-center">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
