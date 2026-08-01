'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { adminGet, adminPut } from '@/lib/api';
import { IHowItWorksStep, ApiResponse } from '@/types';
import Button from '@/components/ui/Button';

interface StepFormData {
  stepNumber: number;
  title: string;
  description: string;
}

export default function HowItWorksPage() {
  const [steps, setSteps] = useState<StepFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, { title?: string; description?: string }>>({});

  const fetchSteps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGet<ApiResponse<IHowItWorksStep[]>>('/api/v1/admin/how-it-works');
      const formData = res.data.map((step) => ({
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
      }));
      setSteps(formData);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const updateStep = (index: number, field: keyof StepFormData, value: string | number) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear validation error for the field
    setValidationErrors((prev) => {
      const updated = { ...prev };
      if (updated[index]) {
        delete updated[index][field as 'title' | 'description'];
        if (Object.keys(updated[index]).length === 0) {
          delete updated[index];
        }
      }
      return updated;
    });
    setSaveSuccess(false);
    setSaveError(null);
  };

  const addStep = () => {
    if (steps.length >= 10) return;
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: '',
        description: '',
      },
    ]);
    setSaveSuccess(false);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Re-number steps
      return updated.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    });
    setSaveSuccess(false);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    setSteps((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      // Re-number steps
      return updated.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    });
    setSaveSuccess(false);
  };

  const validate = (): boolean => {
    const errors: Record<number, { title?: string; description?: string }> = {};
    let hasErrors = false;

    steps.forEach((step, index) => {
      const stepErrors: { title?: string; description?: string } = {};
      if (!step.title.trim()) {
        stepErrors.title = 'Title is required';
        hasErrors = true;
      } else if (step.title.length > 100) {
        stepErrors.title = 'Max 100 characters';
        hasErrors = true;
      }
      if (!step.description.trim()) {
        stepErrors.description = 'Description is required';
        hasErrors = true;
      } else if (step.description.length > 300) {
        stepErrors.description = 'Max 300 characters';
        hasErrors = true;
      }
      if (Object.keys(stepErrors).length > 0) {
        errors[index] = stepErrors;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      await adminPut<ApiResponse<IHowItWorksStep[]>>('/api/v1/admin/how-it-works', {
        steps: steps.map((step, index) => ({
          stepNumber: index + 1,
          title: step.title.trim(),
          description: step.description.trim(),
        })),
      });

      setSaveSuccess(true);
    } catch {
      setSaveError('Failed to save steps. Please try again.');
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
          <h1 className="text-2xl font-bold text-white">How It Works</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage the &quot;How Meetvia Works&quot; steps displayed on the home page (max 10 steps)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={addStep}
            size="sm"
            variant="outline"
            disabled={steps.length >= 10}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Step
          </Button>
          <Button onClick={handleSave} size="sm" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Save All
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-theme px-4 py-3 text-sm text-green-400">
          Steps saved successfully.
        </div>
      )}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-theme px-4 py-3 text-sm text-red-400">
          {saveError}
        </div>
      )}

      {/* Steps list */}
      {steps.length === 0 ? (
        <div className="text-center py-16 border border-white/10 rounded-xl">
          <p className="text-white/40 mb-4">No steps yet. Add your first step.</p>
          <Button onClick={addStep} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Step
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-xl p-4 bg-white/5 space-y-3"
            >
              {/* Step header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-white/30" />
                  <span className="text-sm font-semibold text-accent">
                    Step {step.stepNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move step up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move step down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeStep(index)}
                    className="p-1.5 rounded-theme text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
                    aria-label="Remove step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground/80">
                    Title *
                  </label>
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
                    placeholder="Step title"
                    maxLength={100}
                  />
                  {validationErrors[index]?.title && (
                    <p className="text-sm text-red-500">
                      {validationErrors[index].title}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground/80">
                    Description *
                  </label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[60px] resize-y"
                    placeholder="Step description"
                    maxLength={300}
                  />
                  {validationErrors[index]?.description && (
                    <p className="text-sm text-red-500">
                      {validationErrors[index].description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Max steps info */}
      <p className="text-xs text-white/40 text-center">
        {steps.length}/10 steps used
      </p>
    </div>
  );
}
