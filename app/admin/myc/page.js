'use client';

import { useState, useEffect, useCallback } from 'react';

export default function MYCAdminPage() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ totalSkus: 0, totalEntries: 0, makes: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // Dropdown data
  const [makes, setMakes] = useState([]);
  const [modelsByMake, setModelsByMake] = useState({});

  // Filters
  const [search, setSearch] = useState('');
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('single'); // 'single' or 'bulk'
  const [formData, setFormData] = useState({
    sku: '',
    make: '',
    model: '',
    chassisStart: '',
    chassisEnd: '',
    additionalInfo: ''
  });
  const [bulkData, setBulkData] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Staging area for bulk review
  const [stagedEntries, setStagedEntries] = useState([]);
  const [showStaging, setShowStaging] = useState(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filterMake && { make: filterMake }),
        ...(filterModel && { model: filterModel }),
      });

      const response = await fetch(`/api/admin/myc?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEntries(data.entries);
        setPagination(data.pagination);
        setStats(data.stats);
        setMakes(data.makes || []);
        setModelsByMake(data.modelsByMake || {});
      }
    } catch (error) {
      console.error('Failed to load MYC data:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterMake, filterModel]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Reset model filter when make changes
  useEffect(() => {
    setFilterModel('');
  }, [filterMake]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadEntries();
  };

  const openAddModal = () => {
    setModalMode('single');
    setFormData({
      sku: '',
      make: makes[0] || '',
      model: '',
      chassisStart: '',
      chassisEnd: '',
      additionalInfo: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const openBulkModal = () => {
    setModalMode('bulk');
    setBulkData('');
    setFormError('');
    setShowModal(true);
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const response = await fetch('/api/admin/myc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: [formData] }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Failed to add entry');
        if (data.details) {
          setFormError(data.details.join(', '));
        }
        return;
      }

      setShowModal(false);
      setSuccessMessage(`Added ${data.added.length} entry. ${data.skipped > 0 ? `${data.skipped} duplicate(s) skipped.` : ''}`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadEntries();
    } catch (error) {
      setFormError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkParse = () => {
    setFormError('');

    if (!bulkData.trim()) {
      setFormError('Please paste CSV data');
      return;
    }

    // Parse CSV
    const lines = bulkData.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    // Find column indices
    const skuIdx = headers.findIndex(h => h.includes('sku') || h === 'parent sku');
    const makeIdx = headers.findIndex(h => h === 'make');
    const modelIdx = headers.findIndex(h => h === 'model');
    const startIdx = headers.findIndex(h => h.includes('start') || h === 'chassis start');
    const endIdx = headers.findIndex(h => h.includes('end') || h === 'chassis end');
    const infoIdx = headers.findIndex(h => h.includes('info') || h.includes('additional'));

    if (skuIdx === -1 || makeIdx === -1 || modelIdx === -1) {
      setFormError('CSV must have columns for SKU, Make, and Model');
      return;
    }

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted values
      const values = [];
      let current = '';
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const entry = {
        sku: values[skuIdx] || '',
        make: values[makeIdx] || '',
        model: values[modelIdx] || '',
        chassisStart: startIdx >= 0 ? values[startIdx] : '',
        chassisEnd: endIdx >= 0 ? values[endIdx] : '',
        additionalInfo: infoIdx >= 0 ? values[infoIdx] : '',
        id: Date.now() + i
      };

      if (entry.sku && entry.make && entry.model) {
        parsed.push(entry);
      }
    }

    if (parsed.length === 0) {
      setFormError('No valid entries found in CSV');
      return;
    }

    setStagedEntries(parsed);
    setShowModal(false);
    setShowStaging(true);
  };

  const handleBulkSubmit = async () => {
    if (stagedEntries.length === 0) return;

    setSaving(true);
    setFormError('');

    try {
      const response = await fetch('/api/admin/myc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: stagedEntries.map(({ id, ...entry }) => entry)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Failed to add entries');
        return;
      }

      setShowStaging(false);
      setStagedEntries([]);
      setSuccessMessage(`Added ${data.added.length} entries. ${data.skipped > 0 ? `${data.skipped} duplicate(s) skipped.` : ''}`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadEntries();
    } catch (error) {
      setFormError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm(`Delete fitment for ${entry.sku} - ${entry.make} ${entry.model}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/myc', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: entry.sku,
          make: entry.make,
          model: entry.model
        }),
      });

      if (response.ok) {
        loadEntries();
        setSuccessMessage('Entry deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Failed to delete entry');
    }
  };

  const removeStagedEntry = (id) => {
    setStagedEntries(prev => prev.filter(e => e.id !== id));
  };

  const availableModels = filterMake ? (modelsByMake[filterMake] || []) : [];
  const formModels = formData.make ? (modelsByMake[formData.make] || []) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MYC Admin</h1>
          <p className="text-gray-500 mt-1">
            Model/Year/Chassis → SKU Relationships
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openBulkModal}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            📤 Bulk Import CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total SKUs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSkus.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Fitment Entries</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEntries.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Makes</p>
          <p className="text-2xl font-bold text-gray-900">{makes.join(', ') || '-'}</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <span className="text-green-500">✓</span>
          {successMessage}
        </div>
      )}

      {/* Staging Area */}
      {showStaging && stagedEntries.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-amber-800">Staging Area - Review Before Pushing</h2>
              <p className="text-sm text-amber-600">{stagedEntries.length} entries ready to push to T3 table</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowStaging(false); setStagedEntries([]); }}
                className="px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Pushing...' : `Push ${stagedEntries.length} Entries`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-amber-200 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">SKU</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Make</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Model</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Chassis Range</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {stagedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-amber-50">
                    <td className="px-3 py-2 font-mono text-xs">{entry.sku}</td>
                    <td className="px-3 py-2">{entry.make}</td>
                    <td className="px-3 py-2">{entry.model}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {entry.chassisStart && entry.chassisEnd
                        ? `${entry.chassisStart} - ${entry.chassisEnd}`
                        : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeStagedEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by SKU or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterMake}
            onChange={(e) => setFilterMake(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Makes</option>
            {makes.map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            disabled={!filterMake}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">All Models</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No entries found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Make</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chassis Start</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chassis End</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Info</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry, idx) => (
                    <tr key={`${entry.sku}-${entry.make}-${entry.model}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{entry.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.make}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{entry.chassisStart || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{entry.chassisEnd || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{entry.additionalInfo || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(entry)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Bulk Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'single' ? 'Add New Entry' : 'Bulk Import from CSV'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalMode('single')}
                    className={`px-3 py-1 text-sm rounded-lg ${modalMode === 'single' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setModalMode('bulk')}
                    className={`px-3 py-1 text-sm rounded-lg ${modalMode === 'bulk' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Bulk CSV
                  </button>
                </div>
              </div>

              {modalMode === 'single' ? (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent SKU *</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                        placeholder="e.g., 000915105CE"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                      <select
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Make</option>
                        {makes.map((make) => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                      <select
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.make}
                        required
                      >
                        <option value="">Select Model</option>
                        {formModels.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Start</label>
                      <input
                        type="text"
                        value={formData.chassisStart}
                        onChange={(e) => setFormData({ ...formData, chassisStart: e.target.value })}
                        placeholder="e.g., 20755"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chassis End</label>
                      <input
                        type="text"
                        value={formData.chassisEnd}
                        onChange={(e) => setFormData({ ...formData, chassisEnd: e.target.value })}
                        placeholder="e.g., 26700"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                      <input
                        type="text"
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        placeholder="Optional notes"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Add Entry'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste CSV Data
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Required columns: <code className="bg-gray-100 px-1 rounded">Parent SKU</code>, <code className="bg-gray-100 px-1 rounded">Make</code>, <code className="bg-gray-100 px-1 rounded">Model</code>
                      <br />
                      Optional: <code className="bg-gray-100 px-1 rounded">Chassis start</code>, <code className="bg-gray-100 px-1 rounded">Chassis end</code>, <code className="bg-gray-100 px-1 rounded">Additional info</code>
                    </p>
                    <textarea
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                      placeholder={`Parent SKU,Make,Model,Chassis start,Chassis end,Additional info\n000915105CE,Bentley,Continental GT,20000,25000,Note here`}
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkParse}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Parse & Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
