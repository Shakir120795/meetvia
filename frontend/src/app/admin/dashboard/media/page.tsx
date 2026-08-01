'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { adminGet, adminDelete, ApiError } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { IMedia, PaginatedResponse } from '@/types';
import MediaGrid from '@/components/admin/MediaGrid';
import FileUpload from '@/components/ui/FileUpload';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<IMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<IMedia | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all media items — the MediaGrid component handles client-side pagination, search, and filtering
      const res = await adminGet<PaginatedResponse<IMedia>>(
        '/api/v1/admin/media?page=1&limit=1000'
      );
      setMedia(res.data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (file: File) => {
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const res = await fetch('/api/v1/admin/media/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message =
        (data as { error?: { message?: string } })?.error?.message ||
        `Upload failed with status ${res.status}`;

      // Surface specific errors for size/type
      if (res.status === 413 || message.toLowerCase().includes('size')) {
        throw new Error('File size exceeded. Images max 10MB, Videos max 100MB.');
      }
      if (res.status === 415 || message.toLowerCase().includes('type') || message.toLowerCase().includes('unsupported')) {
        throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, SVG, MP4, WebM.');
      }
      throw new Error(message);
    }

    // Refresh media list after successful upload
    await fetchMedia();
  };

  const openDeleteConfirm = (media: IMedia) => {
    setDeletingMedia(media);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMedia) return;
    try {
      setDeleting(true);
      await adminDelete(`/api/v1/admin/media/${deletingMedia._id}`);
      setDeleteOpen(false);
      setDeletingMedia(null);
      await fetchMedia();
    } catch {
      // Error handled silently
    } finally {
      setDeleting(false);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Media Library</h1>
        <p className="text-white/60 text-sm mt-1">
          Upload and manage images and videos
        </p>
      </div>

      {/* Upload Area */}
      <FileUpload onUpload={handleUpload} />

      {uploadError && (
        <p className="text-sm text-red-400">{uploadError}</p>
      )}

      {/* Media Grid */}
      {media.length > 0 ? (
        <MediaGrid items={media} onDelete={openDeleteConfirm} />
      ) : (
        <div className="text-center py-16 text-white/40">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No media uploaded yet</p>
          <p className="text-sm mt-1">
            Drag and drop files above or click to upload
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Media"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">
              {deletingMedia?.originalFilename}
            </span>
            ? This will remove both the file and its metadata. This action cannot be
            undone.
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
              loading={deleting}
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
