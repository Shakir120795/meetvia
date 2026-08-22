'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import MediaInput from '@/components/admin/MediaInput';
import {
  adminGet,
  adminPost,
  adminPut,
  adminPatch,
  adminDelete,
} from '@/lib/api';
import { ITestimonial, ApiResponse } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface TestimonialFormData {
  reviewerName: string;
  location: string;
  reviewText: string;
  rating: number;
  image: string;
  isVerified: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<ITestimonial | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<ITestimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestimonialFormData>();

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGet<ApiResponse<ITestimonial[]>>(
        '/api/v1/admin/testimonials'
      );
      setTestimonials(res.data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const openAddForm = () => {
    setEditingTestimonial(null);
    reset({
      reviewerName: '',
      location: '',
      reviewText: '',
      rating: 5,
      image: '',
      isVerified: false,
      isVisible: true,
      displayOrder: testimonials.length > 0
        ? Math.max(...testimonials.map((t) => t.displayOrder)) + 1
        : 0,
    });
    setFormOpen(true);
  };

  const openEditForm = (testimonial: ITestimonial) => {
    setEditingTestimonial(testimonial);
    reset({
      reviewerName: testimonial.reviewerName,
      location: testimonial.location || '',
      reviewText: testimonial.reviewText,
      rating: testimonial.rating || 5,
      image: testimonial.image || '',
      isVerified: testimonial.isVerified,
      isVisible: testimonial.isVisible,
      displayOrder: testimonial.displayOrder,
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (testimonial: ITestimonial) => {
    setDeletingTestimonial(testimonial);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        rating: Number(data.rating),
        displayOrder: Number(data.displayOrder),
      };

      if (editingTestimonial) {
        await adminPut<ApiResponse<ITestimonial>>(
          `/api/v1/admin/testimonials/${editingTestimonial.id}`,
          payload
        );
      } else {
        await adminPost<ApiResponse<ITestimonial>>(
          '/api/v1/admin/testimonials',
          payload
        );
      }

      setFormOpen(false);
      fetchTestimonials();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTestimonial) return;
    try {
      setSubmitting(true);
      await adminDelete(
        `/api/v1/admin/testimonials/${deletingTestimonial.id}`
      );
      setDeleteOpen(false);
      setDeletingTestimonial(null);
      fetchTestimonials();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVerified = async (testimonial: ITestimonial) => {
    try {
      await adminPatch<ApiResponse<ITestimonial>>(
        `/api/v1/admin/testimonials/${testimonial.id}/verify`,
        { isVerified: !testimonial.isVerified }
      );
      fetchTestimonials();
    } catch {
      // Error handled silently
    }
  };

  const toggleVisible = async (testimonial: ITestimonial) => {
    try {
      await adminPatch<ApiResponse<ITestimonial>>(
        `/api/v1/admin/testimonials/${testimonial.id}/visibility`,
        { isVisible: !testimonial.isVisible }
      );
      fetchTestimonials();
    } catch {
      // Error handled silently
    }
  };

  const columns: Column<ITestimonial>[] = [
    {
      key: 'reviewerName',
      header: 'Name',
      render: (item) => (
        <span className="font-medium text-white">{item.reviewerName}</span>
      ),
    },
    {
      key: 'reviewText',
      header: 'Review',
      render: (item) => (
        <span className="text-white/70 line-clamp-2 max-w-xs">
          {item.reviewText}
        </span>
      ),
    },
    {
      key: 'isVerified',
      header: 'Verified',
      render: (item) => (
        <button
          onClick={() => toggleVerified(item)}
          className="p-1 rounded-theme hover:bg-white/10 transition-colors"
          aria-label={`Toggle verified for ${item.reviewerName}`}
        >
          {item.isVerified ? (
            <ShieldCheck className="w-4 h-4 text-green-400" />
          ) : (
            <ShieldOff className="w-4 h-4 text-white/30" />
          )}
        </button>
      ),
    },
    {
      key: 'isVisible',
      header: 'Visible',
      render: (item) => (
        <button
          onClick={() => toggleVisible(item)}
          className="p-1 rounded-theme hover:bg-white/10 transition-colors"
          aria-label={`Toggle visibility for ${item.reviewerName}`}
        >
          {item.isVisible ? (
            <Eye className="w-4 h-4 text-green-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-white/30" />
          )}
        </button>
      ),
    },
    {
      key: 'displayOrder',
      header: 'Order',
      render: (item) => (
        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
          {item.displayOrder}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials Manager</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage visitor testimonials and reviews
          </p>
        </div>
        <Button onClick={openAddForm} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Testimonial
        </Button>
      </div>

      <DataTable
        data={testimonials}
        columns={columns}
        searchKey="reviewerName"
        searchPlaceholder="Search testimonials..."
        pageSize={10}
        actions={(item) => (
          <>
            <button
              onClick={() => openEditForm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label={`Edit ${item.reviewerName}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteConfirm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
              aria-label={`Delete ${item.reviewerName}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      />

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reviewerName" className="text-sm font-medium text-foreground/80">
              Reviewer Name *
            </label>
            <input
              id="reviewerName"
              {...register('reviewerName', {
                required: 'Reviewer name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="Full name"
            />
            {errors.reviewerName && (
              <p className="text-sm text-red-500">{errors.reviewerName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="location" className="text-sm font-medium text-foreground/80">
              Location
            </label>
            <input
              id="location"
              {...register('location', {
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="City, Country"
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reviewText" className="text-sm font-medium text-foreground/80">
              Review Text *
            </label>
            <textarea
              id="reviewText"
              {...register('reviewText', {
                required: 'Review text is required',
                maxLength: { value: 500, message: 'Max 500 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[100px] resize-y"
              placeholder="The testimonial text"
            />
            {errors.reviewText && (
              <p className="text-sm text-red-500">{errors.reviewText.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rating" className="text-sm font-medium text-foreground/80">
                Rating (1-5)
              </label>
              <input
                id="rating"
                type="number"
                min={1}
                max={5}
                {...register('rating', {
                  valueAsNumber: true,
                  min: { value: 1, message: 'Minimum 1' },
                  max: { value: 5, message: 'Maximum 5' },
                })}
                className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
                placeholder="5"
              />
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating.message}</p>
              )}
            </div>
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
          </div>

          <MediaInput
            label="Reviewer Image"
            value={watch('image') || ''}
            onChange={(url) => setValue('image', url)}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isVerified')}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
              />
              <span className="text-sm text-foreground/80">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isVisible')}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
              />
              <span className="text-sm text-foreground/80">Visible</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Testimonial"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete the testimonial from{' '}
            <span className="font-semibold text-white">
              {deletingTestimonial?.reviewerName}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
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
