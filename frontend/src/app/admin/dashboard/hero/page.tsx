'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminGet, adminPost, adminPut, adminPatch, adminDelete } from '@/lib/api';
import MediaInput from '@/components/admin/MediaInput';
import { IHeroSlide, ApiResponse } from '@/types';

interface SlideFormData {
  heading: string;
  subtitle: string;
  backgroundImage: string;
  backgroundVideo: string;
  overlayOpacity: number;
  includesList: string;
  ctaText: string;
  ctaLink: string;
  isVisible: boolean;
}

const emptyForm: SlideFormData = {
  heading: '',
  subtitle: '',
  backgroundImage: '',
  backgroundVideo: '',
  overlayOpacity: 40,
  includesList: '',
  ctaText: '',
  ctaLink: '',
  isVisible: true,
};

export default function HeroManagerPage() {
  const [slides, setSlides] = useState<IHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<IHeroSlide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setError('');
      const res = await adminGet<ApiResponse<IHeroSlide[]>>('/api/v1/admin/hero-slides');
      setSlides(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openAddForm = () => {
    setEditingSlide(null);
    setFormData(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (slide: IHeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      heading: slide.heading,
      subtitle: slide.subtitle || '',
      backgroundImage: slide.backgroundImage || '',
      backgroundVideo: slide.backgroundVideo || '',
      overlayOpacity: slide.overlayOpacity,
      includesList: slide.includesList.join(', '),
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      isVisible: slide.isVisible,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSlide(null);
    setFormData(emptyForm);
    setFormError('');
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      overlayOpacity: Number(e.target.value),
    }));
  };

  const handleSave = async () => {
    if (!formData.heading.trim()) {
      setFormError('Heading is required');
      return;
    }
    if (formData.heading.length > 200) {
      setFormError('Heading must be 200 characters or less');
      return;
    }
    if (formData.subtitle.length > 500) {
      setFormError('Subtitle must be 500 characters or less');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      heading: formData.heading.trim(),
      subtitle: formData.subtitle.trim() || undefined,
      backgroundImage: formData.backgroundImage.trim() || undefined,
      backgroundVideo: formData.backgroundVideo.trim() || undefined,
      overlayOpacity: formData.overlayOpacity,
      includesList: formData.includesList
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ctaText: formData.ctaText.trim() || undefined,
      ctaLink: formData.ctaLink.trim() || undefined,
      isVisible: formData.isVisible,
    };

    try {
      if (editingSlide) {
        await adminPut<ApiResponse<IHeroSlide>>(
          `/api/v1/admin/hero-slides/${editingSlide._id}`,
          payload
        );
      } else {
        await adminPost<ApiResponse<IHeroSlide>>(
          '/api/v1/admin/hero-slides',
          payload
        );
      }
      closeForm();
      await fetchSlides();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save slide');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (slide: IHeroSlide) => {
    try {
      await adminPatch<ApiResponse<IHeroSlide>>(
        `/api/v1/admin/hero-slides/${slide._id}/visibility`,
        { isVisible: !slide.isVisible }
      );
      await fetchSlides();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDelete<ApiResponse<{ message: string }>>(
        `/api/v1/admin/hero-slides/${id}`
      );
      setDeleteConfirmId(null);
      await fetchSlides();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete slide');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    const reorderPayload = newSlides.map((s, i) => ({ id: s._id, displayOrder: i }));
    try {
      await adminPut<ApiResponse<IHeroSlide[]>>('/api/v1/admin/hero-slides/reorder', {
        slides: reorderPayload,
      });
      await fetchSlides();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reorder slides');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    const reorderPayload = newSlides.map((s, i) => ({ id: s._id, displayOrder: i }));
    try {
      await adminPut<ApiResponse<IHeroSlide[]>>('/api/v1/admin/hero-slides/reorder', {
        slides: reorderPayload,
      });
      await fetchSlides();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reorder slides');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Hero Slides Manager</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-secondary font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus size={18} />
          Add New Slide
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Slides List */}
      {slides.length === 0 ? (
        <div className="text-center py-12 text-white/50">
          <p>No hero slides yet. Click &quot;Add New Slide&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide._id}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              {/* Order Controls */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === slides.length - 1}
                  className="p-1 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              {/* Order Number */}
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-accent/20 text-accent text-sm font-bold">
                {index + 1}
              </span>

              {/* Slide Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{slide.heading}</h3>
                {slide.subtitle && (
                  <p className="text-white/50 text-sm truncate mt-0.5">
                    {slide.subtitle}
                  </p>
                )}
              </div>

              {/* Visibility Badge */}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  slide.isVisible
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {slide.isVisible ? 'Visible' : 'Hidden'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(slide)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                  aria-label={slide.isVisible ? 'Hide slide' : 'Show slide'}
                  title={slide.isVisible ? 'Hide' : 'Show'}
                >
                  {slide.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => openEditForm(slide)}
                  className="p-2 text-white/50 hover:text-accent transition-colors"
                  aria-label="Edit slide"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(slide._id)}
                  className="p-2 text-white/50 hover:text-red-400 transition-colors"
                  aria-label="Delete slide"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-secondary border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Slide?</h3>
            <p className="text-white/60 text-sm mb-6">
              This action cannot be undone. The slide will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-secondary border border-white/10 rounded-xl p-6 max-w-lg w-full mx-4 my-auto">
            <h3 className="text-white font-semibold text-lg mb-4">
              {editingSlide ? 'Edit Slide' : 'Add New Slide'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Heading */}
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Heading <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="heading"
                  value={formData.heading}
                  onChange={handleFormChange}
                  maxLength={200}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent"
                  placeholder="Enter heading (max 200 chars)"
                />
                <span className="text-white/40 text-xs">{formData.heading.length}/200</span>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-white/70 text-sm mb-1">Subtitle</label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleFormChange}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent resize-none"
                  placeholder="Enter subtitle (max 500 chars)"
                />
                <span className="text-white/40 text-xs">{formData.subtitle.length}/500</span>
              </div>

              {/* Background Image URL */}
              <MediaInput
                label="Background Image"
                value={formData.backgroundImage}
                onChange={(url) => setFormData(prev => ({ ...prev, backgroundImage: url }))}
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                placeholder="Enter URL or upload from PC"
              />

              {/* Background Video URL */}
              <MediaInput
                label="Background Video"
                value={formData.backgroundVideo}
                onChange={(url) => setFormData(prev => ({ ...prev, backgroundVideo: url }))}
                accept="video/mp4,video/webm"
                placeholder="Enter URL or upload from PC"
              />

              {/* Overlay Opacity */}
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Overlay Opacity: {formData.overlayOpacity}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.overlayOpacity}
                  onChange={handleSliderChange}
                  className="w-full accent-accent"
                />
              </div>

              {/* Includes List */}
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Includes List <span className="text-white/40">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="includesList"
                  value={formData.includesList}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent"
                  placeholder="Item 1, Item 2, Item 3"
                />
              </div>

              {/* CTA Text */}
              <div>
                <label className="block text-white/70 text-sm mb-1">CTA Button Text</label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent"
                  placeholder="e.g. Learn More"
                />
              </div>

              {/* CTA Link */}
              <div>
                <label className="block text-white/70 text-sm mb-1">CTA Button Link</label>
                <input
                  type="text"
                  name="ctaLink"
                  value={formData.ctaLink}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent"
                  placeholder="/services or https://..."
                />
              </div>

              {/* Is Visible Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-accent"
                />
                <label htmlFor="isVisible" className="text-white/70 text-sm">
                  Visible on website
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/10">
              <button
                onClick={closeForm}
                disabled={saving}
                className="px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-accent text-secondary font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingSlide ? 'Update Slide' : 'Create Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
