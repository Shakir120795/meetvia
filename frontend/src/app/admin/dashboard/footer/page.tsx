'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminGet, adminPut, adminPost, adminDelete } from '@/lib/api';
import { ISocialLink, ApiResponse } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface FooterData {
  description: string;
}

interface SocialLinkFormData {
  platform: string;
  url: string;
  iconIdentifier: string;
  isVisible: boolean;
  displayOrder: number;
}

export default function FooterManagerPage() {
  const [description, setDescription] = useState('');
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingFooter, setSavingFooter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ISocialLink | null>(null);
  const [deletingLink, setDeletingLink] = useState<ISocialLink | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialLinkFormData>();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [footerRes, linksRes] = await Promise.all([
        adminGet<ApiResponse<FooterData>>('/api/v1/admin/footer'),
        adminGet<ApiResponse<ISocialLink[]>>('/api/v1/admin/social-links'),
      ]);
      setDescription(footerRes.data.description);
      setSocialLinks(linksRes.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load footer data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveDescription = async () => {
    try {
      setSavingFooter(true);
      setMessage(null);
      await adminPut<ApiResponse<FooterData>>('/api/v1/admin/footer', { description });
      setMessage({ type: 'success', text: 'Footer description saved.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save footer description.' });
    } finally {
      setSavingFooter(false);
    }
  };

  const openAddForm = () => {
    setEditingLink(null);
    reset({
      platform: '',
      url: '',
      iconIdentifier: '',
      isVisible: true,
      displayOrder: 0,
    });
    setFormOpen(true);
  };

  const openEditForm = (link: ISocialLink) => {
    setEditingLink(link);
    reset({
      platform: link.platform,
      url: link.url,
      iconIdentifier: link.iconIdentifier,
      isVisible: link.isVisible,
      displayOrder: link.displayOrder,
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (link: ISocialLink) => {
    setDeletingLink(link);
    setDeleteOpen(true);
  };

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Please enter a valid URL (include http:// or https://)';
    }
  };

  const onSubmit = async (data: SocialLinkFormData) => {
    try {
      setSubmitting(true);
      setMessage(null);
      const payload = {
        ...data,
        displayOrder: Number(data.displayOrder),
      };

      if (editingLink) {
        await adminPut<ApiResponse<ISocialLink>>(
          `/api/v1/admin/social-links/${editingLink._id}`,
          payload
        );
        setMessage({ type: 'success', text: 'Social link updated.' });
      } else {
        await adminPost<ApiResponse<ISocialLink>>('/api/v1/admin/social-links', payload);
        setMessage({ type: 'success', text: 'Social link created.' });
      }

      setFormOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save social link.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLink) return;
    try {
      setSubmitting(true);
      setMessage(null);
      await adminDelete(`/api/v1/admin/social-links/${deletingLink._id}`);
      setDeleteOpen(false);
      setDeletingLink(null);
      setMessage({ type: 'success', text: 'Social link deleted.' });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete social link.' });
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Footer Manager</h1>
        <p className="text-white/60 text-sm mt-1">
          Manage footer description and social media links
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`px-4 py-3 rounded-theme text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Footer Description Section */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Footer Description</h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="footer-description" className="text-sm font-medium text-foreground/80">
            Description text (max 200 characters)
          </label>
          <textarea
            id="footer-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[80px] resize-y"
            placeholder="Enter footer description..."
          />
          <span className="text-xs text-white/40">{description.length}/200</span>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveDescription} size="sm" loading={savingFooter}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Description
          </Button>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Social Media Links</h2>
          <Button onClick={openAddForm} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Link
          </Button>
        </div>

        {/* Social Links List */}
        {socialLinks.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">No social links added yet.</p>
        ) : (
          <div className="space-y-2">
            {socialLinks.map((link) => (
              <div
                key={link._id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-theme"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                    {link.displayOrder}
                  </span>
                  <div>
                    <span className="font-medium text-white">{link.platform}</span>
                    <p className="text-white/40 text-xs truncate max-w-[250px]">{link.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {link.isVisible ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white/30" />
                  )}
                  <button
                    onClick={() => openEditForm(link)}
                    className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
                    aria-label={`Edit ${link.platform}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(link)}
                    className="p-1.5 rounded-theme text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
                    aria-label={`Delete ${link.platform}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Social Link Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingLink ? 'Edit Social Link' : 'Add Social Link'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Platform */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="platform" className="text-sm font-medium text-foreground/80">
              Platform *
            </label>
            <input
              id="platform"
              {...register('platform', { required: 'Platform name is required' })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="e.g. Instagram, Facebook"
            />
            {errors.platform && (
              <p className="text-sm text-red-500">{errors.platform.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="url" className="text-sm font-medium text-foreground/80">
              URL *
            </label>
            <input
              id="url"
              {...register('url', {
                required: 'URL is required',
                validate: isValidUrl,
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="https://..."
            />
            {errors.url && (
              <p className="text-sm text-red-500">{errors.url.message}</p>
            )}
          </div>

          {/* Icon Identifier */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="iconIdentifier" className="text-sm font-medium text-foreground/80">
              Icon Identifier *
            </label>
            <input
              id="iconIdentifier"
              {...register('iconIdentifier', { required: 'Icon identifier is required' })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="e.g. instagram, facebook, youtube"
            />
            {errors.iconIdentifier && (
              <p className="text-sm text-red-500">{errors.iconIdentifier.message}</p>
            )}
          </div>

          {/* Display Order */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayOrder" className="text-sm font-medium text-foreground/80">
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              {...register('displayOrder', { valueAsNumber: true })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="0"
            />
          </div>

          {/* Visible Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isVisible')}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
            />
            <span className="text-sm text-foreground/80">Visible</span>
          </label>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFormOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {editingLink ? 'Update Link' : 'Create Link'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Social Link"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete the{' '}
            <span className="font-semibold text-white">
              {deletingLink?.platform}
            </span>{' '}
            social link? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              loading={submitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
