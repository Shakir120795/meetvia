'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/api';
import { IService, ApiResponse } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import MediaInput from '@/components/admin/MediaInput';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ServiceFormData {
  title: string;
  description: string;
  duration: string;
  locationType: 'Public' | 'Virtual' | 'Flexible';
  image: string;
  video: string;
  thumbnail: string;
  whatsIncluded: string;
  buttonText: string;
  buttonLink: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [deletingService, setDeletingService] = useState<IService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>();

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGet<ApiResponse<IService[]>>('/api/v1/admin/services');
      setServices(res.data);
    } catch {
      // Error handled silently — toast could be added
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAddForm = () => {
    setEditingService(null);
    reset({
      title: '',
      description: '',
      duration: '',
      locationType: 'Public',
      image: '',
      video: '',
      thumbnail: '',
      whatsIncluded: '',
      buttonText: 'Book Now',
      buttonLink: '',
      isFeatured: false,
      isVisible: true,
      displayOrder: 0,
    });
    setFormOpen(true);
  };

  const openEditForm = (service: IService) => {
    setEditingService(service);
    reset({
      title: service.title,
      description: service.description,
      duration: service.duration || '',
      locationType: service.locationType,
      image: service.image || '',
      video: service.video || '',
      thumbnail: service.thumbnail || '',
      whatsIncluded: service.whatsIncluded.join('\n'),
      buttonText: service.buttonText,
      buttonLink: service.buttonLink || '',
      isFeatured: service.isFeatured,
      isVisible: service.isVisible,
      displayOrder: service.displayOrder,
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (service: IService) => {
    setDeletingService(service);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        whatsIncluded: data.whatsIncluded
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        displayOrder: Number(data.displayOrder),
      };

      if (editingService) {
        await adminPut<ApiResponse<IService>>(
          `/api/v1/admin/services/${editingService.id}`,
          payload
        );
      } else {
        await adminPost<ApiResponse<IService>>('/api/v1/admin/services', payload);
      }

      setFormOpen(false);
      fetchServices();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    try {
      setSubmitting(true);
      await adminDelete(`/api/v1/admin/services/${deletingService.id}`);
      setDeleteOpen(false);
      setDeletingService(null);
      fetchServices();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<IService>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <span className="font-medium text-white">{item.title}</span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item) => item.duration || '—',
    },
    {
      key: 'locationType',
      header: 'Location',
      render: (item) => (
        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
          {item.locationType}
        </span>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (item) =>
        item.isFeatured ? (
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <Star className="w-4 h-4 text-white/20" />
        ),
    },
    {
      key: 'isVisible',
      header: 'Visible',
      render: (item) =>
        item.isVisible ? (
          <Eye className="w-4 h-4 text-green-400" />
        ) : (
          <EyeOff className="w-4 h-4 text-white/30" />
        ),
    },
    {
      key: 'displayOrder',
      header: 'Order',
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
          <h1 className="text-2xl font-bold text-white">Services Manager</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage your service offerings
          </p>
        </div>
        <Button onClick={openAddForm} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Service
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={services}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search services..."
        pageSize={10}
        actions={(item) => (
          <>
            <button
              onClick={() => openEditForm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label={`Edit ${item.title}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteConfirm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
              aria-label={`Delete ${item.title}`}
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
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">