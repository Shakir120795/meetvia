'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/api';
import { IFAQ, ApiResponse } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface FAQFormData {
  question: string;
  answer: string;
  displayOrder: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<IFAQ | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<IFAQ | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FAQFormData>();

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGet<ApiResponse<IFAQ[]>>('/api/v1/admin/faq');
      setFaqs(res.data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openAddForm = () => {
    setEditingFaq(null);
    reset({
      question: '',
      answer: '',
      displayOrder: faqs.length > 0 ? Math.max(...faqs.map((f) => f.displayOrder)) + 1 : 0,
    });
    setFormOpen(true);
  };

  const openEditForm = (faq: IFAQ) => {
    setEditingFaq(faq);
    reset({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (faq: IFAQ) => {
    setDeletingFaq(faq);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: FAQFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        displayOrder: Number(data.displayOrder),
      };

      if (editingFaq) {
        await adminPut<ApiResponse<IFAQ>>(
          `/api/v1/admin/faq/${editingFaq._id}`,
          payload
        );
      } else {
        await adminPost<ApiResponse<IFAQ>>('/api/v1/admin/faq', payload);
      }

      setFormOpen(false);
      fetchFaqs();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaq) return;
    try {
      setSubmitting(true);
      await adminDelete(`/api/v1/admin/faq/${deletingFaq._id}`);
      setDeleteOpen(false);
      setDeletingFaq(null);
      fetchFaqs();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveUp = async (faq: IFAQ) => {
    const sorted = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((f) => f._id === faq._id);
    if (index <= 0) return;

    const items = [
      { id: sorted[index]._id, displayOrder: sorted[index - 1].displayOrder },
      { id: sorted[index - 1]._id, displayOrder: sorted[index].displayOrder },
    ];

    try {
      await adminPut<ApiResponse<IFAQ[]>>('/api/v1/admin/faq/reorder', { items });
      fetchFaqs();
    } catch {
      // Error handled silently
    }
  };

  const handleMoveDown = async (faq: IFAQ) => {
    const sorted = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((f) => f._id === faq._id);
    if (index < 0 || index >= sorted.length - 1) return;

    const items = [
      { id: sorted[index]._id, displayOrder: sorted[index + 1].displayOrder },
      { id: sorted[index + 1]._id, displayOrder: sorted[index].displayOrder },
    ];

    try {
      await adminPut<ApiResponse<IFAQ[]>>('/api/v1/admin/faq/reorder', { items });
      fetchFaqs();
    } catch {
      // Error handled silently
    }
  };

  const columns: Column<IFAQ>[] = [
    {
      key: 'question',
      header: 'Question',
      render: (item) => (
        <span className="font-medium text-white line-clamp-2">{item.question}</span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ Manager</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage frequently asked questions
          </p>
        </div>
        <Button onClick={openAddForm} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New FAQ
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={faqs}
        columns={columns}
        searchKey="question"
        searchPlaceholder="Search FAQs..."
        pageSize={10}
        actions={(item) => (
          <>
            <button
              onClick={() => handleMoveUp(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMoveDown(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEditForm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label={`Edit FAQ: ${item.question}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteConfirm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
              aria-label={`Delete FAQ: ${item.question}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Question */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="question" className="text-sm font-medium text-foreground/80">
              Question *
            </label>
            <input
              id="question"
              {...register('question', {
                required: 'Question is required',
                maxLength: { value: 200, message: 'Max 200 characters' },
                validate: (value) =>
                  value.trim() !== '' || 'Question cannot be empty',
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="Enter the question"
            />
            {errors.question && (
              <p className="text-sm text-red-500">{errors.question.message}</p>
            )}
          </div>

          {/* Answer */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="answer" className="text-sm font-medium text-foreground/80">
              Answer *
            </label>
            <textarea
              id="answer"
              {...register('answer', {
                required: 'Answer is required',
                maxLength: { value: 2000, message: 'Max 2000 characters' },
                validate: (value) =>
                  value.trim() !== '' || 'Answer cannot be empty',
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[120px] resize-y"
              placeholder="Enter the answer"
            />
            {errors.answer && (
              <p className="text-sm text-red-500">{errors.answer.message}</p>
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
              {editingFaq ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete FAQ"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete the FAQ{' '}
            <span className="font-semibold text-white">
              &ldquo;{deletingFaq?.question}&rdquo;
            </span>
            ? This action cannot be undone.
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
