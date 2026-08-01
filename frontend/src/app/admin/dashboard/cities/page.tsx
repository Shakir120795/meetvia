'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminGet, adminPost, adminPut, adminDelete, ApiError } from '@/lib/api';
import { ICity, ApiResponse } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface CityFormData {
  cityName: string;
  state: string;
  country: string;
  status: 'active' | 'inactive';
  displayOrder: number;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<ICity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<ICity | null>(null);
  const [deletingCity, setDeletingCity] = useState<ICity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CityFormData>();

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGet<ApiResponse<ICity[]>>('/api/v1/admin/cities');
      setCities(res.data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const openAddForm = () => {
    setEditingCity(null);
    setFormError(null);
    reset({
      cityName: '',
      state: '',
      country: 'India',
      status: 'active',
      displayOrder: 0,
    });
    setFormOpen(true);
  };

  const openEditForm = (city: ICity) => {
    setEditingCity(city);
    setFormError(null);
    reset({
      cityName: city.cityName,
      state: city.state,
      country: city.country,
      status: city.status,
      displayOrder: city.displayOrder,
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (city: ICity) => {
    setDeletingCity(city);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: CityFormData) => {
    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        ...data,
        displayOrder: Number(data.displayOrder),
      };

      if (editingCity) {
        await adminPut<ApiResponse<ICity>>(
          `/api/v1/admin/cities/${editingCity._id}`,
          payload
        );
      } else {
        await adminPost<ApiResponse<ICity>>('/api/v1/admin/cities', payload);
      }

      setFormOpen(false);
      fetchCities();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFormError('A city with this name and state combination already exists.');
      } else {
        setFormError('An error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCity) return;
    try {
      setSubmitting(true);
      await adminDelete(`/api/v1/admin/cities/${deletingCity._id}`);
      setDeleteOpen(false);
      setDeletingCity(null);
      fetchCities();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<ICity>[] = [
    {
      key: 'cityName',
      header: 'City Name',
      render: (item) => (
        <span className="font-medium text-white">{item.cityName}</span>
      ),
    },
    {
      key: 'state',
      header: 'State',
    },
    {
      key: 'country',
      header: 'Country',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            item.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/10 text-white/50'
          }`}
        >
          {item.status}
        </span>
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
          <h1 className="text-2xl font-bold text-white">Cities Manager</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage available cities for the platform
          </p>
        </div>
        <Button onClick={openAddForm} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New City
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={cities}
        columns={columns}
        searchKey="cityName"
        searchPlaceholder="Search cities..."
        pageSize={10}
        actions={(item) => (
          <>
            <button
              onClick={() => openEditForm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label={`Edit ${item.cityName}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteConfirm(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
              aria-label={`Delete ${item.cityName}`}
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
        title={editingCity ? 'Edit City' : 'Add New City'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-theme px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          {/* City Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cityName" className="text-sm font-medium text-foreground/80">
              City Name *
            </label>
            <input
              id="cityName"
              {...register('cityName', {
                required: 'City name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="e.g. Agra"
            />
            {errors.cityName && (
              <p className="text-sm text-red-500">{errors.cityName.message}</p>
            )}
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="state" className="text-sm font-medium text-foreground/80">
              State *
            </label>
            <input
              id="state"
              {...register('state', {
                required: 'State is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="e.g. Uttar Pradesh"
            />
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="text-sm font-medium text-foreground/80">
              Country *
            </label>
            <input
              id="country"
              {...register('country', {
                required: 'Country is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              placeholder="e.g. India"
            />
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>

          {/* Status & Display Order row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-sm font-medium text-foreground/80">
                Status *
              </label>
              <select
                id="status"
                {...register('status', { required: 'Status is required' })}
                className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              {editingCity ? 'Update City' : 'Create City'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete City"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">
              {deletingCity?.cityName}, {deletingCity?.state}
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
