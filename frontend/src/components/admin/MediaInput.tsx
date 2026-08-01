'use client';

import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { getToken } from '@/lib/auth';

interface MediaInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  error?: string;
}

/**
 * Combined media input — URL text field + Upload from PC button.
 * Uploads file to /api/v1/admin/media/upload and returns the URL.
 */
export default function MediaInput({
  label,
  value,
  onChange,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm',
  placeholder = 'Enter URL or upload from PC',
  error,
}: MediaInputProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getToken();
      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.error?.message || 'Upload failed';
        setUploadError(msg);
        return;
      }

      const result = await res.json();
      if (result.success && result.data?.url) {
        onChange(result.data.url);
        setUploadError(null);
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      
      <div className="flex items-center gap-2">
        {/* URL Input */}
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={value}
            onChange={(e) => { onChange(e.target.value); setUploadError(null); }}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-theme pl-10 pr-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 text-sm"
          />
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-accent/20 border border-accent/30 rounded-theme text-accent text-sm font-medium hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Preview thumbnail if value is set */}
      {value && (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.webp') || value.includes('/uploads/images/')) && (
        <div className="relative mt-1 w-16 h-16 rounded-theme overflow-hidden border border-white/10">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-0 right-0 p-0.5 bg-red-500/80 rounded-bl-theme"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Error */}
      {(error || uploadError) && (
        <p className="text-xs text-red-400">{error || uploadError}</p>
      )}
    </div>
  );
}
