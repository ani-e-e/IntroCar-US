'use client';

import { useState } from 'react';

export default function CatalogueUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationResult(null);
    setError(null);
    setImportResult(null);
  };

  const handleValidate = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', 'validate');

      const response = await fetch('/api/admin/catalogues/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validationResult) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', 'import');

      const response = await fetch('/api/admin/catalogues/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImportResult(data);
        setValidationResult(null);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const errorRows = validationResult?.results?.filter(r => r.status === 'error') || [];
  const validRows = validationResult?.results?.filter(r => r.status === 'valid') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue Upload</h1>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format</h3>
        <p className="text-sm text-blue-800 mb-2">
          Upload a CSV with the following columns:
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>id</strong> - Unique catalogue identifier (required)</li>
          <li><strong>title</strong> - Catalogue title (required)</li>
          <li><strong>makes</strong> - Pipe-separated makes, e.g. &quot;Bentley|Rolls-Royce&quot;</li>
          <li><strong>models</strong> - Pipe-separated models, e.g. &quot;Continental GT|Continental GTC&quot;</li>
          <li><strong>category</strong> - Category name</li>
          <li><strong>hotspots</strong> - Pipe-separated parent SKUs</li>
          <li><strong>image</strong> - Image URL (Cloudinary)</li>
          <li><strong>catalogue_link</strong> - Link to PDF or external page</li>
          <li><strong>cms_url</strong> - CMS page URL slug</li>
        </ul>
        <p className="text-sm text-blue-600 mt-3">
          Vehicle makes and models will be validated against the master list. Spelling suggestions will be provided for near-matches.
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

          {file && !validationResult && !importResult && (
            <button
              onClick={handleValidate}
              disabled={uploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                uploading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </span>
              ) : (
                'Validate CSV'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Validation Results</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{validationResult.validation.total}</p>
                <p className="text-sm text-gray-500">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{validationResult.validation.valid}</p>
                <p className="text-sm text-gray-500">Valid</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{validationResult.validation.errors}</p>
                <p className="text-sm text-gray-500">Errors</p>
              </div>
            </div>
          </div>

          {/* Errors Detail */}
          {errorRows.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-3">
                Rows with Errors ({errorRows.length})
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {errorRows.map((row, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm text-gray-600">
                        Line {row.lineNumber}: {row.id || '(no id)'}
                      </span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {row.errors.map((err, errIdx) => (
                        <li key={errIdx} className="text-red-700">
                          {err}
                          {/* Show suggestions if available */}
                          {Object.entries(row.suggestions || {}).map(([key, suggestions]) => {
                            if (err.includes(key.split(':')[1])) {
                              return (
                                <span key={key} className="text-blue-600 ml-2">
                                  Did you mean: {suggestions.join(', ')}?
                                </span>
                              );
                            }
                            return null;
                          })}
                        </li>
                      ))}
                    </ul>
                    {row.warnings?.length > 0 && (
                      <ul className="text-sm mt-2">
                        {row.warnings.map((warn, warnIdx) => (
                          <li key={warnIdx} className="text-yellow-700">⚠️ {warn}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Rows Preview */}
          {validRows.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">
                Valid Rows ({validRows.length}) - Preview
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Makes</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Models</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-200">
                    {validRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                        <td className="px-3 py-2 max-w-xs truncate">{row.title}</td>
                        <td className="px-3 py-2">{row.makes.join(', ')}</td>
                        <td className="px-3 py-2 max-w-xs truncate">{row.models.join(', ')}</td>
                        <td className="px-3 py-2">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validRows.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    ... and {validRows.length - 10} more valid rows
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Import Button */}
          {validRows.length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  importing
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {importing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </span>
                ) : (
                  `Import ${validRows.length} Valid Catalogues`
                )}
              </button>
              <button
                onClick={() => {
                  setValidationResult(null);
                  setFile(null);
                }}
                className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Valid Makes Reference */}
          {validationResult.validMakes && (
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700">
                Valid Makes Reference ({validationResult.validMakes.length})
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {validationResult.validMakes.map((make, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white rounded border text-sm">
                    {make}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Import Success */}
      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Import Complete!</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
              <p className="text-sm text-gray-500">Catalogues Imported</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">{importResult.skipped}</p>
              <p className="text-sm text-gray-500">Skipped (errors)</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next step:</strong> To deploy these changes to the live site, run:
            </p>
            <code className="block mt-2 text-xs bg-white p-2 rounded border text-gray-700">
              node scripts/export-from-supabase.js catalogues && git add data/json && git commit -m &quot;Catalogue update&quot; && git push
            </code>
          </div>

          <button
            onClick={() => {
              setImportResult(null);
              setFile(null);
            }}
            className="mt-4 w-full py-2 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
