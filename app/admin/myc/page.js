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
  const [t7Values, setT7Values] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('single'); // 'single', 'bulk', or 'paste'
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
  const [existingBySku, setExistingBySku] = useState({});
  const [showStaging, setShowStaging] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [entriesToDelete, setEntriesToDelete] = useState(new Set());
  const [expandedSkus, setExpandedSkus] = useState(new Set());

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
        setT7Values(data.t7Values || []);
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

  const openPasteModal = () => {
    setModalMode('paste');
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

  // Detect if data is tab-separated (Excel paste) or comma-separated (CSV)
  const detectDelimiter = (text) => {
    const firstLine = text.split('\n')[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    return tabCount > commaCount ? '\t' : ',';
  };

  // Parse either CSV or TSV (Excel paste)
  const parseData = (text, delimiter) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(delimiter).map(h => h.trim().replace(/"/g, ''));

    // Find column indices - support various header names
    const skuIdx = headers.findIndex(h =>
      h.includes('sku') || h === 'parent sku' || h === 'parentsku'
    );
    const makeIdx = headers.findIndex(h => h === 'make');
    const modelIdx = headers.findIndex(h => h === 'model');
    const startIdx = headers.findIndex(h =>
      h.includes('start') || h === 'chassis start' || h === 'chassisstart'
    );
    const endIdx = headers.findIndex(h =>
      h.includes('end') || h === 'chassis end' || h === 'chassisend'
    );
    const infoIdx = headers.findIndex(h =>
      h.includes('info') || h.includes('additional')
    );

    if (skuIdx === -1 || makeIdx === -1 || modelIdx === -1) {
      return null; // Invalid format
    }

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let values;
      if (delimiter === '\t') {
        // Tab-separated - simple split
        values = line.split('\t').map(v => v.trim().replace(/"/g, ''));
      } else {
        // CSV - handle quoted values
        values = [];
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
      }

      const entry = {
        sku: (values[skuIdx] || '').toUpperCase(),
        make: values[makeIdx] || '',
        model: values[modelIdx] || '',
        chassisStart: startIdx >= 0 ? values[startIdx] : '',
        chassisEnd: endIdx >= 0 ? values[endIdx] : '',
        additionalInfo: infoIdx >= 0 ? values[infoIdx] : '',
        id: Date.now() + i,
        // These will be set after checking
        isDuplicate: null,
        isNearDuplicate: false,
        isValidAdditionalInfo: true,
        status: 'checking'
      };

      if (entry.sku && entry.make && entry.model) {
        parsed.push(entry);
      }
    }

    return parsed;
  };

  // Check duplicates and T7 validation via API
  const checkEntries = async (entries) => {
    setCheckingDuplicates(true);
    try {
      const response = await fetch('/api/admin/myc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check',
          entries: entries.map(({ id, isDuplicate, isNearDuplicate, isValidAdditionalInfo, status, nearMatches, ...entry }) => entry)
        }),
      });

      const data = await response.json();

      if (response.ok && data.entries) {
        // Store existing entries by SKU
        setExistingBySku(data.existingBySku || {});

        // Auto-expand SKUs that have existing data
        const skusWithExisting = Object.keys(data.existingBySku || {}).filter(
          sku => (data.existingBySku[sku] || []).length > 0
        );
        setExpandedSkus(new Set(skusWithExisting));

        // Merge check results back into entries
        return entries.map((entry, idx) => ({
          ...entry,
          isDuplicate: data.entries[idx]?.isDuplicate || false,
          isNearDuplicate: data.entries[idx]?.isNearDuplicate || false,
          nearMatches: data.entries[idx]?.nearMatches || [],
          isValidAdditionalInfo: data.entries[idx]?.isValidAdditionalInfo ?? true,
          status: data.entries[idx]?.status || 'new'
        }));
      }
      return entries;
    } catch (error) {
      console.error('Error checking entries:', error);
      return entries;
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleBulkParse = async () => {
    setFormError('');

    if (!bulkData.trim()) {
      setFormError('Please paste data');
      return;
    }

    const delimiter = detectDelimiter(bulkData);
    const parsed = parseData(bulkData, delimiter);

    if (parsed === null) {
      setFormError('Data must have columns for SKU (or Parent SKU), Make, and Model');
      return;
    }

    if (parsed.length === 0) {
      setFormError('No valid entries found');
      return;
    }

    // Check for duplicates and T7 validation
    const checkedEntries = await checkEntries(parsed);

    setStagedEntries(checkedEntries);
    setEntriesToDelete(new Set());
    setShowModal(false);
    setShowStaging(true);
  };

  const handleBulkSubmit = async () => {
    // Filter to only submit non-exact-duplicate entries
    const entriesToAdd = stagedEntries.filter(e => e.status !== 'exact_duplicate');

    if (entriesToAdd.length === 0 && entriesToDelete.size === 0) {
      setFormError('No changes to make');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      // Convert entriesToDelete set to array of entry objects
      const deleteArray = [];
      entriesToDelete.forEach(key => {
        const [sku, ...rest] = key.split('|');
        const existing = existingBySku[sku]?.find(e =>
          `${e.sku}|${e.make}|${e.model}|${e.chassisStart}|${e.chassisEnd}|${e.additionalInfo}` === key
        );
        if (existing) {
          deleteArray.push(existing);
        }
      });

      const response = await fetch('/api/admin/myc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'replace',
          toDelete: deleteArray,
          toAdd: entriesToAdd.map(({ id, isDuplicate, isNearDuplicate, isValidAdditionalInfo, status, nearMatches, ...entry }) => entry)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Failed to update entries';
        setFormError(errorMsg);
        return;
      }

      setShowStaging(false);
      setStagedEntries([]);
      setEntriesToDelete(new Set());
      setExistingBySku({});
      setSuccessMessage(`${data.deleted > 0 ? `Deleted ${data.deleted}, ` : ''}Added ${data.addedCount} entries`);
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
          id: entry.id, // Use ID for precise deletion if available
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

  const toggleDeleteExisting = (entry) => {
    const key = `${entry.sku}|${entry.make}|${entry.model}|${entry.chassisStart}|${entry.chassisEnd}|${entry.additionalInfo}`;
    setEntriesToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleExpandSku = (sku) => {
    setExpandedSkus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sku)) {
        newSet.delete(sku);
      } else {
        newSet.add(sku);
      }
      return newSet;
    });
  };

  const [cleaningUp, setCleaningUp] = useState(false);

  const handleCleanupDuplicates = async () => {
    if (!confirm('This will remove all duplicate entries from the database, keeping only one of each unique entry. Continue?')) {
      return;
    }

    setCleaningUp(true);
    try {
      const response = await fetch('/api/admin/myc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Cleanup complete: ${data.deleted} duplicates removed. ${data.totalAfter} entries remaining.`);
        setTimeout(() => setSuccessMessage(''), 5000);
        loadEntries();
      } else {
        alert(data.error || 'Cleanup failed');
      }
    } catch (error) {
      alert('Failed to cleanup duplicates');
    } finally {
      setCleaningUp(false);
    }
  };

  const availableModels = filterMake ? (modelsByMake[filterMake] || []) : [];
  const formModels = formData.make ? (modelsByMake[formData.make] || []) : [];

  // Get unique SKUs from staged entries
  const uniqueSkus = [...new Set(stagedEntries.map(e => e.sku))];

  // Stats for staged entries
  const stagedStats = {
    total: stagedEntries.length,
    new: stagedEntries.filter(e => e.status === 'new').length,
    nearDuplicates: stagedEntries.filter(e => e.status === 'near_duplicate').length,
    exactDuplicates: stagedEntries.filter(e => e.status === 'exact_duplicate').length,
    invalidInfo: stagedEntries.filter(e => !e.isValidAdditionalInfo).length,
    toDelete: entriesToDelete.size
  };

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
            onClick={openPasteModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            📋 Paste from Excel
          </button>
          <button
            onClick={openBulkModal}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            📤 Bulk CSV
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Data Cleanup</p>
          <button
            onClick={handleCleanupDuplicates}
            disabled={cleaningUp}
            className="mt-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {cleaningUp ? 'Cleaning...' : '🧹 Remove Duplicates'}
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

      {/* Staging Area */}
      {showStaging && stagedEntries.length > 0 && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Review & Compare</h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-sm">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-green-700">{stagedStats.new + stagedStats.nearDuplicates} to add</span>
                </span>
                {stagedStats.nearDuplicates > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <span className="text-orange-600">({stagedStats.nearDuplicates} similar exist - review)</span>
                  </span>
                )}
                {stagedStats.exactDuplicates > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-yellow-700">{stagedStats.exactDuplicates} identical (skip)</span>
                  </span>
                )}
                {stagedStats.toDelete > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-red-700">{stagedStats.toDelete} to delete</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowStaging(false); setStagedEntries([]); setEntriesToDelete(new Set()); setExistingBySku({}); }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={saving || (stagedStats.new === 0 && stagedStats.nearDuplicates === 0 && stagedStats.toDelete === 0)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : `Apply Changes`}
              </button>
            </div>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</div>
          )}

          {/* Group by SKU */}
          <div className="space-y-3">
            {uniqueSkus.map(sku => {
              const skuEntries = stagedEntries.filter(e => e.sku === sku);
              const existing = existingBySku[sku] || [];
              const isExpanded = expandedSkus.has(sku);

              return (
                <div key={sku} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  {/* SKU Header */}
                  <div
                    className="px-4 py-3 bg-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-200"
                    onClick={() => toggleExpandSku(sku)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-slate-800">{sku}</span>
                      <span className="text-sm text-slate-500">
                        {skuEntries.length} new • {existing.length} existing
                      </span>
                    </div>
                    <span className="text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                  </div>

                  {isExpanded && (
                    <div className="p-4">
                      {/* Existing Entries */}
                      {existing.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            Existing in T3 ({existing.length})
                            <span className="text-xs font-normal text-slate-400">— check to delete</span>
                          </h4>
                          <div className="bg-blue-50 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-blue-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-800 w-10">Del?</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-800">Make</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-800">Model</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-800">Chassis Start</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-800">Chassis End</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-800">Additional Info</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-blue-100">
                                {existing.map((entry, idx) => {
                                  const key = `${entry.sku}|${entry.make}|${entry.model}|${entry.chassisStart}|${entry.chassisEnd}|${entry.additionalInfo}`;
                                  const isMarkedForDelete = entriesToDelete.has(key);
                                  return (
                                    <tr key={idx} className={isMarkedForDelete ? 'bg-red-100' : ''}>
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={isMarkedForDelete}
                                          onChange={() => toggleDeleteExisting(entry)}
                                          className="w-4 h-4 text-red-600 rounded"
                                        />
                                      </td>
                                      <td className={`px-3 py-2 ${isMarkedForDelete ? 'line-through text-red-400' : ''}`}>{entry.make}</td>
                                      <td className={`px-3 py-2 ${isMarkedForDelete ? 'line-through text-red-400' : ''}`}>{entry.model}</td>
                                      <td className={`px-3 py-2 text-slate-500 ${isMarkedForDelete ? 'line-through text-red-400' : ''}`}>{entry.chassisStart || '-'}</td>
                                      <td className={`px-3 py-2 text-slate-500 ${isMarkedForDelete ? 'line-through text-red-400' : ''}`}>{entry.chassisEnd || '-'}</td>
                                      <td className={`px-3 py-2 text-slate-500 ${isMarkedForDelete ? 'line-through text-red-400' : ''}`}>{entry.additionalInfo || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* New Entries */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          To Add ({skuEntries.filter(e => e.status !== 'exact_duplicate').length})
                          {skuEntries.some(e => e.status === 'near_duplicate') && (
                            <span className="text-xs font-normal text-orange-600">
                              — check existing entries to delete if replacing
                            </span>
                          )}
                        </h4>
                        <div className="rounded-lg overflow-hidden border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 w-20">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Make</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Model</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Chassis Start</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Chassis End</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Additional Info</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {skuEntries.map((entry) => (
                                <tr
                                  key={entry.id}
                                  className={`
                                    ${entry.status === 'new' ? 'bg-green-50' : ''}
                                    ${entry.status === 'near_duplicate' ? 'bg-orange-50' : ''}
                                    ${entry.status === 'exact_duplicate' ? 'bg-yellow-50 opacity-60' : ''}
                                  `}
                                >
                                  <td className="px-3 py-2">
                                    {entry.status === 'new' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        New
                                      </span>
                                    )}
                                    {entry.status === 'near_duplicate' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800" title="Same Make+Model exists with different chassis/info - will ADD this entry. Delete the old one above if replacing.">
                                        Add ⚠️
                                      </span>
                                    )}
                                    {entry.status === 'exact_duplicate' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Identical entry already exists">
                                        Identical
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">{entry.make}</td>
                                  <td className="px-3 py-2">{entry.model}</td>
                                  <td className="px-3 py-2 text-slate-500">{entry.chassisStart || '-'}</td>
                                  <td className="px-3 py-2 text-slate-500">{entry.chassisEnd || '-'}</td>
                                  <td className="px-3 py-2">
                                    <span className={!entry.isValidAdditionalInfo ? 'text-red-600 font-medium' : 'text-slate-500'}>
                                      {entry.additionalInfo || '-'}
                                    </span>
                                    {!entry.isValidAdditionalInfo && (
                                      <span className="ml-1 text-red-500 text-xs" title="Not in T7 valid values">⚠️</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {entry.status === 'exact_duplicate' ? (
                                      <span className="text-xs text-slate-400">Skip</span>
                                    ) : (
                                      <button
                                        onClick={() => removeStagedEntry(entry.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-slate-100 rounded-lg">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">How to use:</h4>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside mb-3">
              <li><strong>Review existing data</strong> (blue section) - check boxes to DELETE old entries you want to replace</li>
              <li><strong>Review new data</strong> (white section) - these will be ADDED to the database</li>
              <li>Click <strong>Apply Changes</strong> to delete checked items and add new entries</li>
            </ol>
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Status colors:</h4>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span> New - will be added
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></span> Add ⚠️ - will add (similar exists, delete old if replacing)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></span> Identical - already exists, will skip
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span> Existing - check box to delete
              </span>
            </div>
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
                  {modalMode === 'single' ? 'Add New Entry' :
                   modalMode === 'paste' ? 'Paste from Excel' :
                   'Bulk Import from CSV'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalMode('single')}
                    className={`px-3 py-1 text-sm rounded-lg ${modalMode === 'single' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setModalMode('paste')}
                    className={`px-3 py-1 text-sm rounded-lg ${modalMode === 'paste' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Excel Paste
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
                      <select
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None</option>
                        {t7Values.map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">{t7Values.length} valid T7 values available</p>
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
              ) : modalMode === 'paste' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste from Excel (Tab-separated)
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-green-800 font-medium mb-1">📋 How to use:</p>
                      <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                        <li>Select cells in Excel including headers</li>
                        <li>Copy (Ctrl+C / Cmd+C)</li>
                        <li>Paste in the text area below (Ctrl+V / Cmd+V)</li>
                      </ol>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Required columns: <code className="bg-gray-100 px-1 rounded">Parent SKU</code>, <code className="bg-gray-100 px-1 rounded">Make</code>, <code className="bg-gray-100 px-1 rounded">Model</code>
                      <br />
                      Optional: <code className="bg-gray-100 px-1 rounded">Chassis start</code>, <code className="bg-gray-100 px-1 rounded">Chassis end</code>, <code className="bg-gray-100 px-1 rounded">Additional info</code>
                    </p>
                    <textarea
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                      placeholder={`Parent SKU\tMake\tModel\tChassis start\tChassis end\tAdditional info
000915105CE\tBentley\tContinental GT\t20000\t25000\tNote`}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
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
                      disabled={checkingDuplicates}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {checkingDuplicates ? 'Checking...' : 'Check & Review'}
                    </button>
                  </div>
                </div>
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
                      placeholder={`Parent SKU,Make,Model,Chassis start,Chassis end,Additional info
000915105CE,Bentley,Continental GT,20000,25000,Note here`}
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
                      disabled={checkingDuplicates}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {checkingDuplicates ? 'Checking...' : 'Check & Review'}
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
