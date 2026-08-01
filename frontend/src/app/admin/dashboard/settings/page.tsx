'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminGet, adminPut } from '@/lib/api';
import { ISiteSettings, ApiResponse } from '@/types';
import MediaInput from '@/components/admin/MediaInput';
import Button from '@/components/ui/Button';

interface SettingsFormData {
  siteName: string;
  siteLogo: string;
  favicon: string;
  metaTitle: string;
  metaDescription: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  safetyCheckboxText: string;
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGet<ApiResponse<ISiteSettings>>('/api/v1/admin/site-settings');
      const data = res.data;
      reset({
        siteName: data.siteName || '',
        siteLogo: data.siteLogo || '',
        favicon: data.favicon || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        whatsappNumber: data.whatsappNumber || '',
        whatsappMessage: data.whatsappMessage || '',
        safetyCheckboxText: data.safetyCheckboxText || '',
      });
    } catch {
      setMessage({ type: 'error', text: 'Failed to load site settings.' });
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true);
      setMessage(null);
      await adminPut<ApiResponse<ISiteSettings>>('/api/v1/admin/site-settings', data);
      setMessage({ type: 'success', text: 'Site settings saved successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage global site configuration and metadata
          </p>
        </div>
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

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Section */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">General</h2>

          {/* Site Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="siteName" className="text-sm font-medium text-foreground/80">
              Site Name *
            </label>
            <input
              id="siteName"
              {...register('siteName', {
                required: 'Site name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="Meetvia"
            />
            {errors.siteName && (
              <p className="text-sm text-red-500">{errors.siteName.message}</p>
            )}
          </div>

          {/* Site Logo */}
          <MediaInput
            label="Site Logo"
            value={watch('siteLogo') || ''}
            onChange={(url) => setValue('siteLogo', url)}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
          />

          {/* Favicon */}
          <MediaInput
            label="Favicon"
            value={watch('favicon') || ''}
            onChange={(url) => setValue('favicon', url)}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
          />
        </div>

        {/* SEO / Meta Section */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">SEO / Meta</h2>

          {/* Meta Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="metaTitle" className="text-sm font-medium text-foreground/80">
              Meta Title * (max 60 characters)
            </label>
            <input
              id="metaTitle"
              {...register('metaTitle', {
                required: 'Meta title is required',
                maxLength: { value: 60, message: 'Max 60 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="Meetvia"
            />
            {errors.metaTitle && (
              <p className="text-sm text-red-500">{errors.metaTitle.message}</p>
            )}
          </div>

          {/* Meta Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="metaDescription" className="text-sm font-medium text-foreground/80">
              Meta Description (max 160 characters)
            </label>
            <textarea
              id="metaDescription"
              {...register('metaDescription', {
                maxLength: { value: 160, message: 'Max 160 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[80px] resize-y"
              placeholder="Brief description of the site..."
            />
            {errors.metaDescription && (
              <p className="text-sm text-red-500">{errors.metaDescription.message}</p>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Contact</h2>

          {/* Contact Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contactEmail" className="text-sm font-medium text-foreground/80">
              Contact Email
            </label>
            <input
              id="contactEmail"
              type="email"
              {...register('contactEmail', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="admin@meetvia.com"
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contactPhone" className="text-sm font-medium text-foreground/80">
              Contact Phone
            </label>
            <input
              id="contactPhone"
              {...register('contactPhone')}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">WhatsApp</h2>

          {/* WhatsApp Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsappNumber" className="text-sm font-medium text-foreground/80">
              WhatsApp Number
            </label>
            <input
              id="whatsappNumber"
              {...register('whatsappNumber')}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="+919876543210"
            />
          </div>

          {/* WhatsApp Message */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsappMessage" className="text-sm font-medium text-foreground/80">
              WhatsApp Prefilled Message
            </label>
            <textarea
              id="whatsappMessage"
              {...register('whatsappMessage')}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[80px] resize-y"
              placeholder="Hello! I'd like to know more about..."
            />
          </div>
        </div>

        {/* Safety Section */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Safety</h2>

          {/* Safety Checkbox Text */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="safetyCheckboxText" className="text-sm font-medium text-foreground/80">
              Safety Checkbox Text
            </label>
            <textarea
              id="safetyCheckboxText"
              {...register('safetyCheckboxText')}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[80px] resize-y"
              placeholder="I confirm that all meetings will be in public places..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
