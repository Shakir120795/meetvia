'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Palette, Check, Loader2 } from 'lucide-react';
import { adminGet, adminPut } from '@/lib/api';
import { IThemeSettings } from '@/types';
import ThemePreview from '@/components/admin/ThemePreview';

// --- Validation schema ---
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const themeSchema = z.object({
  primaryColor: z.string().regex(hexColorRegex, 'Must be a valid hex color (#RRGGBB)'),
  secondaryColor: z.string().regex(hexColorRegex, 'Must be a valid hex color (#RRGGBB)'),
  accentColor: z.string().regex(hexColorRegex, 'Must be a valid hex color (#RRGGBB)'),
  backgroundColor: z.string().regex(hexColorRegex, 'Must be a valid hex color (#RRGGBB)'),
  textColor: z.string().regex(hexColorRegex, 'Must be a valid hex color (#RRGGBB)'),
  fontFamily: z.string().min(1, 'Font family is required'),
  borderRadius: z.number().min(0, 'Min 0').max(32, 'Max 32'),
  glassmorphismIntensity: z.number().min(0, 'Min 0').max(100, 'Max 100'),
});

type ThemeFormData = z.infer<typeof themeSchema>;

// --- Preset definitions ---
interface PresetTheme {
  label: string;
  values: ThemeFormData;
}

const presets: PresetTheme[] = [
  {
    label: 'Futuristic Blue',
    values: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#0A1628',
      accentColor: '#00D4FF',
      backgroundColor: '#0A1628',
      textColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 12,
      glassmorphismIntensity: 50,
    },
  },
  {
    label: 'Luxury Dark',
    values: {
      primaryColor: '#C9A96E',
      secondaryColor: '#1A1A2E',
      accentColor: '#FFD700',
      backgroundColor: '#1A1A2E',
      textColor: '#F5F5F5',
      fontFamily: 'Playfair Display',
      borderRadius: 8,
      glassmorphismIntensity: 40,
    },
  },
  {
    label: 'Clean White',
    values: {
      primaryColor: '#1A1A2E',
      secondaryColor: '#FFFFFF',
      accentColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A2E',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 16,
      glassmorphismIntensity: 30,
    },
  },
];

// --- Color field config ---
const colorFields: { name: keyof ThemeFormData; label: string }[] = [
  { name: 'primaryColor', label: 'Primary Color' },
  { name: 'secondaryColor', label: 'Secondary Color' },
  { name: 'accentColor', label: 'Accent Color' },
  { name: 'backgroundColor', label: 'Background Color' },
  { name: 'textColor', label: 'Text Color' },
];

export default function ThemeManagerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fetchError, setFetchError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: presets[0].values,
  });

  // Watch all values for live preview
  const watchedValues = watch();

  // Fetch current theme on mount
  useEffect(() => {
    async function fetchTheme() {
      try {
        const response = await adminGet<{ success: boolean; data: IThemeSettings }>(
          '/api/v1/admin/theme'
        );
        if (response.success && response.data) {
          const theme = response.data;
          reset({
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            accentColor: theme.accentColor,
            backgroundColor: theme.backgroundColor,
            textColor: theme.textColor,
            fontFamily: theme.fontFamily,
            borderRadius: theme.borderRadius,
            glassmorphismIntensity: theme.glassmorphismIntensity,
          });
        }
      } catch (err) {
        setFetchError('Failed to load theme settings. Using defaults.');
        console.error('Theme fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTheme();
  }, [reset]);

  // Apply preset
  const applyPreset = (preset: PresetTheme) => {
    Object.entries(preset.values).forEach(([key, value]) => {
      setValue(key as keyof ThemeFormData, value, { shouldValidate: true });
    });
  };

  // Save theme
  const onSubmit = async (data: ThemeFormData) => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await adminPut('/api/v1/admin/theme', data);
      setSuccessMessage('Theme saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Theme save error:', err);
      setSuccessMessage('');
      setFetchError('Failed to save theme. Please try again.');
      setTimeout(() => setFetchError(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Palette className="w-7 h-7 text-accent" />
        <h1 className="text-2xl font-bold text-white">Theme Manager</h1>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          <Check size={16} />
          {successMessage}
        </div>
      )}
      {fetchError && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {fetchError}
        </div>
      )}

      {/* Preset buttons */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          Presets
        </h2>
        <div className="flex flex-wrap gap-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all duration-200"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Color fields */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Colors
            </h2>
            {colorFields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-white/80"
                >
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={watchedValues[field.name] as string || '#000000'}
                    onChange={(e) =>
                      setValue(field.name, e.target.value.toUpperCase(), {
                        shouldValidate: true,
                      })
                    }
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    aria-label={`${field.label} picker`}
                  />
                  <input
                    id={field.name}
                    type="text"
                    {...register(field.name)}
                    placeholder="#RRGGBB"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200 font-mono text-sm"
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={
                      errors[field.name] ? `${field.name}-error` : undefined
                    }
                  />
                </div>
                {errors[field.name] && (
                  <p
                    id={`${field.name}-error`}
                    className="text-xs text-red-400"
                    role="alert"
                  >
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Typography
            </h2>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fontFamily"
                className="text-sm font-medium text-white/80"
              >
                Font Family
              </label>
              <input
                id="fontFamily"
                type="text"
                {...register('fontFamily')}
                placeholder="Inter, sans-serif"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200 text-sm"
                aria-invalid={!!errors.fontFamily}
                aria-describedby={
                  errors.fontFamily ? 'fontFamily-error' : undefined
                }
              />
              {errors.fontFamily && (
                <p
                  id="fontFamily-error"
                  className="text-xs text-red-400"
                  role="alert"
                >
                  {errors.fontFamily.message}
                </p>
              )}
            </div>
          </div>

          {/* Sliders / Numeric */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Shape & Effects
            </h2>

            {/* Border Radius */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="borderRadius"
                className="text-sm font-medium text-white/80"
              >
                Border Radius ({watchedValues.borderRadius}px)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={watchedValues.borderRadius}
                  onChange={(e) =>
                    setValue('borderRadius', Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  className="flex-1 accent-[var(--color-accent)]"
                  aria-label="Border radius slider"
                />
                <input
                  id="borderRadius"
                  type="number"
                  {...register('borderRadius', { valueAsNumber: true })}
                  min={0}
                  max={32}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  aria-invalid={!!errors.borderRadius}
                  aria-describedby={
                    errors.borderRadius ? 'borderRadius-error' : undefined
                  }
                />
              </div>
              {errors.borderRadius && (
                <p
                  id="borderRadius-error"
                  className="text-xs text-red-400"
                  role="alert"
                >
                  {errors.borderRadius.message}
                </p>
              )}
            </div>

            {/* Glassmorphism Intensity */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="glassmorphismIntensity"
                className="text-sm font-medium text-white/80"
              >
                Glassmorphism Intensity ({watchedValues.glassmorphismIntensity}%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={watchedValues.glassmorphismIntensity}
                  onChange={(e) =>
                    setValue('glassmorphismIntensity', Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  className="flex-1 accent-[var(--color-accent)]"
                  aria-label="Glassmorphism intensity slider"
                />
                <input
                  id="glassmorphismIntensity"
                  type="number"
                  {...register('glassmorphismIntensity', { valueAsNumber: true })}
                  min={0}
                  max={100}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  aria-invalid={!!errors.glassmorphismIntensity}
                  aria-describedby={
                    errors.glassmorphismIntensity
                      ? 'glassmorphismIntensity-error'
                      : undefined
                  }
                />
              </div>
              {errors.glassmorphismIntensity && (
                <p
                  id="glassmorphismIntensity-error"
                  className="text-xs text-red-400"
                  role="alert"
                >
                  {errors.glassmorphismIntensity.message}
                </p>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-secondary font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Theme'
            )}
          </button>
        </form>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8 self-start">
          <ThemePreview
            primaryColor={watchedValues.primaryColor}
            secondaryColor={watchedValues.secondaryColor}
            accentColor={watchedValues.accentColor}
            backgroundColor={watchedValues.backgroundColor}
            textColor={watchedValues.textColor}
            fontFamily={watchedValues.fontFamily}
            borderRadius={watchedValues.borderRadius}
            glassmorphismIntensity={watchedValues.glassmorphismIntensity}
          />
        </div>
      </div>
    </div>
  );
}
