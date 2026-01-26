'use client';

import { useState, useEffect, useCallback } from 'react';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);

  // Dropdown options from API
  const [availableMakes, setAvailableMakes] = useState([]);
  const [modelsByMake, setModelsByMake] = useState({});
  const [productCategories, setProductCategories] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    topicCategory: '',
    verified: false,
    makes: [],
    models: [],
    productCategories: [],
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(category && { category }),
        ...(verifiedFilter && { verified: verifiedFilter }),
      });

      const response = await fetch(`/api/admin/videos?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos);
        setCategories(data.categories);
        setStats(data.stats);
        // Set dropdown options
        setAvailableMakes(data.makes || []);
        setModelsByMake(data.modelsByMake || {});
        setProductCategories(data.productCategories || []);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, verifiedFilter]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadVideos();
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      topicCategory: categories[0] || '',
      verified: false,
      makes: [],
      models: [],
      productCategories: [],
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      topicCategory: video.category,
      verified: video.verified,
      makes: video.makes || [],
      models: video.models || [],
      productCategories: video.productCategories || [],
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const url = editingVideo
        ? `/api/admin/videos/${editingVideo.id}`
        : '/api/admin/videos';

      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Failed to save video');
        return;
      }

      setShowModal(false);
      loadVideos();
    } catch (error) {
      setFormError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (video) => {
    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !video.verified }),
      });

      const data = await response.json();

      if (response.ok) {
        loadVideos();
      } else {
        alert(data.error || 'Failed to update verification status');
      }
    } catch (error) {
      console.error('Failed to update verification status:', error);
      alert('Failed to update verification status');
    }
  };

  const handleDelete = async (video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        loadVideos();
      } else {
        alert(data.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  // Multi-select toggle handler
  const toggleArrayItem = (field, item) => {
    const current = formData[field] || [];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
  };

  // Get available models based on selected makes
  const getAvailableModels = () => {
    const selectedMakes = formData.makes || [];
    if (selectedMakes.length === 0) return [];

    let models = [];
    selectedMakes.forEach(make => {
      if (modelsByMake[make]) {
        models = [...models, ...modelsByMake[make]];
      }
    });
    return [...new Set(models)].sort();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Technical Videos</h1>
          <p className="text-gray-500 mt-1">
            {stats.total} total • {stats.verified} verified • {stats.unverified} unverified
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Video
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => { setVerifiedFilter(e.target.value); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Videos Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No videos found</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`border rounded-lg overflow-hidden ${
                  video.verified ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                }`}
              >
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-900 relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                      Watch on YouTube
                    </span>
                  </a>
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      video.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {video.verified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {video.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {video.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {video.category}
                    </span>
                    {video.makes?.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {video.makes.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleVerify(video)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        video.verified
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {video.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => openEditModal(video)}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video)}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL or Video ID *
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Video title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the video content"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic Category *
                  </label>
                  <select
                    value={formData.topicCategory}
                    onChange={(e) => setFormData({ ...formData, topicCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select topic...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Makes Multi-Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makes (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableMakes.map((make) => (
                      <button
                        key={make}
                        type="button"
                        onClick={() => toggleArrayItem('makes', make)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          formData.makes?.includes(make)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {make}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Models Multi-Select (only show if makes selected) */}
                {formData.makes?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Models (select all that apply)
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {getAvailableModels().map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => toggleArrayItem('models', model)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              formData.models?.includes(model)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                    {formData.models?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.models.length} model(s) selected
                      </p>
                    )}
                  </div>
                )}

                {/* Product Categories Multi-Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Categories (select all that apply)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {productCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleArrayItem('productCategories', cat)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            formData.productCategories?.includes(cat)
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.productCategories?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.productCategories.length} category/categories selected
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="verified" className="text-sm text-gray-700">
                    Mark as verified (description matches video content)
                  </label>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {formError}
                  </div>
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
                    {saving ? 'Saving...' : (editingVideo ? 'Save Changes' : 'Add Video')}
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
