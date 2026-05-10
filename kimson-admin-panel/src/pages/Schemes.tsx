import { useEffect, useState } from 'react';
import { schemeService } from '../services/schemes';
import type { Scheme, SchemeType, VisibilityType, UserCategory } from '../services/schemes';
import { uploadImage } from '../services/storage';
import { StatsCard } from '../components/StatsCard';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; schemeId: string | null }>({
    show: false,
    schemeId: null,
  });

  // Form state
  const [formData, setFormData] = useState<Partial<Scheme>>({
    name: '',
    type: 'product',
    description: '',
    pointsRequired: 0,
    imageUrl: '',
    bannerImageUrl: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    quantity: undefined,
    stock: undefined,
    minPoints: 0,
    userCategory: 'all',
    regions: [],
    cities: [],
    visibility: 'all',
    selectedUserIds: [],
    priority: 0,
    isActive: true,
    isPublished: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const allSchemes = await schemeService.getAllSchemes();
      setSchemes(allSchemes);
    } catch (error) {
      console.error('Error loading schemes:', error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingScheme(null);
    setFormData({
      name: '',
      type: 'product',
      description: '',
      pointsRequired: 0,
      imageUrl: '',
      bannerImageUrl: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      quantity: undefined,
      stock: undefined,
      minPoints: 0,
      userCategory: 'all',
      regions: [],
      cities: [],
      visibility: 'all',
      selectedUserIds: [],
      priority: 0,
      isActive: true,
      isPublished: false,
    });
    setImageFile(null);
    setBannerFile(null);
    setShowModal(true);
  };

  const handleEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setFormData({
      ...scheme,
      startDate: scheme.startDate instanceof Date ? scheme.startDate : new Date(scheme.startDate?.toDate?.() || Date.now()),
      endDate: scheme.endDate instanceof Date ? scheme.endDate : new Date(scheme.endDate?.toDate?.() || Date.now()),
    });
    setImageFile(null);
    setBannerFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.pointsRequired || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Upload images if files are selected
      let imageUrl = formData.imageUrl || '';
      let bannerImageUrl = formData.bannerImageUrl || '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'schemes');
      }
      if (bannerFile) {
        bannerImageUrl = await uploadImage(bannerFile, 'schemes');
      }

      const schemeData: Omit<Scheme, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name!,
        type: formData.type || 'product',
        description: formData.description || '',
        pointsRequired: formData.pointsRequired!,
        imageUrl,
        bannerImageUrl,
        startDate: formData.startDate as Date,
        endDate: formData.endDate as Date,
        quantity: formData.quantity,
        stock: formData.stock,
        minPoints: formData.minPoints || 0,
        userCategory: formData.userCategory || 'all',
        regions: formData.regions || [],
        cities: formData.cities || [],
        visibility: formData.visibility || 'all',
        selectedUserIds: formData.selectedUserIds || [],
        priority: formData.priority || 0,
        isActive: formData.isActive ?? true,
        isPublished: formData.isPublished ?? false,
      };

      if (editingScheme?.id) {
        await schemeService.updateScheme(editingScheme.id, schemeData);
      } else {
        await schemeService.createScheme(schemeData);
      }

      await loadSchemes();
      setShowModal(false);
      setEditingScheme(null);
      setImageFile(null);
      setBannerFile(null);
    } catch (error: any) {
      console.error('Error saving scheme:', error);
      alert(error.message || 'Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.schemeId) return;

    try {
      await schemeService.deleteScheme(deleteConfirm.schemeId);
      await loadSchemes();
      setDeleteConfirm({ show: false, schemeId: null });
    } catch (error: any) {
      console.error('Error deleting scheme:', error);
      alert(error.message || 'Failed to delete scheme');
    }
  };

  const toggleActive = async (scheme: Scheme) => {
    try {
      await schemeService.updateScheme(scheme.id!, { isActive: !scheme.isActive });
      await loadSchemes();
    } catch (error: any) {
      console.error('Error toggling scheme:', error);
      alert(error.message || 'Failed to update scheme');
    }
  };

  const togglePublished = async (scheme: Scheme) => {
    try {
      await schemeService.updateScheme(scheme.id!, { isPublished: !scheme.isPublished });
      await loadSchemes();
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      alert(error.message || 'Failed to update scheme');
    }
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || scheme.type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && scheme.isActive && scheme.isPublished) ||
      (filterStatus === 'inactive' && !scheme.isActive) ||
      (filterStatus === 'draft' && !scheme.isPublished);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: schemes.length,
    active: schemes.filter(s => s.isActive && s.isPublished).length,
    draft: schemes.filter(s => !s.isPublished).length,
    expired: schemes.filter(s => {
      const endDate = s.endDate instanceof Date ? s.endDate : s.endDate?.toDate?.();
      return endDate && endDate < new Date();
    }).length,
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading schemes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
            Schemes Management
          </h1>
          <p className="text-white/60 font-ubuntu-light">Create and manage promotional schemes and campaigns</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-[#E31E24] text-white rounded-xl font-ubuntu-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          + Create New Scheme
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Schemes" value={stats.total} icon="📋" />
        <StatsCard title="Active" value={stats.active} icon="✅" />
        <StatsCard title="Draft" value={stats.draft} icon="📝" />
        <StatsCard title="Expired" value={stats.expired} icon="⏰" />
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-ubuntu-medium mb-2 text-white">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search schemes..."
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
            />
          </div>
          <div>
            <label className="block text-sm font-ubuntu-medium mb-2 text-white">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
            >
              <option value="all">All Types</option>
              <option value="product">Product</option>
              <option value="cashback">Cashback</option>
              <option value="voucher">Voucher</option>
              <option value="contest">Contest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-ubuntu-medium mb-2 text-white">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => {
          const startDate = scheme.startDate instanceof Date ? scheme.startDate : scheme.startDate?.toDate?.();
          const endDate = scheme.endDate instanceof Date ? scheme.endDate : scheme.endDate?.toDate?.();
          const isExpired = endDate && endDate < new Date();
          const isActive = scheme.isActive && scheme.isPublished && !isExpired;

          return (
            <div
              key={scheme.id}
              className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow hover:border-white/40 transition-all duration-300"
            >
              {/* Scheme Image */}
              {scheme.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img
                    src={scheme.imageUrl}
                    alt={scheme.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Scheme Info */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-ubuntu font-black text-white flex-1">{scheme.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-ubuntu-medium ${
                    scheme.type === 'product' ? 'bg-blue-500/20 text-blue-400' :
                    scheme.type === 'cashback' ? 'bg-green-500/20 text-green-400' :
                    scheme.type === 'voucher' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {scheme.type}
                  </span>
                </div>
                {scheme.description && (
                  <p className="text-white/60 text-sm font-ubuntu-light mb-3 line-clamp-2">
                    {scheme.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-white/70 font-ubuntu-light">
                  <span>💰 {scheme.pointsRequired} points</span>
                  {scheme.stock !== undefined && (
                    <span>📦 {scheme.stock} left</span>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isActive && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-ubuntu-medium">
                    ✅ Active
                  </span>
                )}
                {!scheme.isPublished && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-ubuntu-medium">
                    📝 Draft
                  </span>
                )}
                {isExpired && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-ubuntu-medium">
                    ⏰ Expired
                  </span>
                )}
                {scheme.visibility === 'eligible' && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-ubuntu-medium">
                    👥 Eligible Only
                  </span>
                )}
              </div>

              {/* Dates */}
              {startDate && endDate && (
                <div className="text-xs text-white/50 font-ubuntu-light mb-4">
                  <p>📅 {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(scheme)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-ubuntu-medium hover:bg-white/20 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(scheme)}
                  className={`px-4 py-2 rounded-lg font-ubuntu-medium transition-all ${
                    scheme.isActive
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {scheme.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => togglePublished(scheme)}
                  className={`px-4 py-2 rounded-lg font-ubuntu-medium transition-all ${
                    scheme.isPublished
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  {scheme.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: true, schemeId: scheme.id || null })}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-ubuntu-medium hover:bg-red-500/30 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 font-ubuntu-light text-lg">No schemes found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black/95 to-black/90 border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-ubuntu font-black text-white">
                {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Scheme Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                    placeholder="e.g., Samsung 43-inch Smart TV"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Scheme Type *</label>
                  <select
                    value={formData.type || 'product'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SchemeType })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  >
                    <option value="product">Product</option>
                    <option value="cashback">Cashback</option>
                    <option value="voucher">Voucher</option>
                    <option value="contest">Contest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-ubuntu-medium mb-2 text-white">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                  placeholder="Scheme description..."
                />
              </div>

              {/* Points & Eligibility */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Points Required *</label>
                  <input
                    type="number"
                    value={formData.pointsRequired || 0}
                    onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Min Points</label>
                  <input
                    type="number"
                    value={formData.minPoints || 0}
                    onChange={(e) => setFormData({ ...formData, minPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Priority</label>
                  <input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Total Quantity (Optional)</label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                    placeholder="Leave empty for unlimited"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Current Stock</label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-white/40 focus:border-white focus:outline-none font-ubuntu-light"
                    placeholder="Current available stock"
                    min="0"
                  />
                </div>
              </div>

              {/* Eligibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">User Category</label>
                  <select
                    value={formData.userCategory || 'all'}
                    onChange={(e) => setFormData({ ...formData, userCategory: e.target.value as UserCategory })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  >
                    <option value="all">All Users</option>
                    <option value="new">New Users</option>
                    <option value="existing">Existing Users</option>
                    <option value="premium">Premium Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Visibility</label>
                  <select
                    value={formData.visibility || 'all'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as VisibilityType })}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  >
                    <option value="all">All Users</option>
                    <option value="selected">Selected Users</option>
                    <option value="eligible">Eligible Users Only</option>
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Scheme Image</label>
                  {formData.imageUrl && !imageFile && (
                    <img src={formData.imageUrl} alt="Scheme" className="w-full h-32 object-cover rounded-xl mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ubuntu-medium mb-2 text-white">Banner Image</label>
                  {formData.bannerImageUrl && !bannerFile && (
                    <img src={formData.bannerImageUrl} alt="Banner" className="w-full h-32 object-cover rounded-xl mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-white focus:outline-none font-ubuntu-light"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-white font-ubuntu-medium">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-black/50 text-white focus:ring-2 focus:ring-white/20"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-white font-ubuntu-medium">
                  <input
                    type="checkbox"
                    checked={formData.isPublished ?? false}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-black/50 text-white focus:ring-2 focus:ring-white/20"
                  />
                  Published
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-[#E31E24] text-white rounded-xl font-ubuntu-bold hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingScheme ? 'Update Scheme' : 'Create Scheme'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-ubuntu-medium hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Scheme"
        message="Are you sure you want to delete this scheme? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, schemeId: null })}
      />
    </div>
  );
};
