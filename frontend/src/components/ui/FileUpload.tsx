'use client';

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function FileUpload({
  onUpload,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm',
  maxSizeMB = 100,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setProgress(0);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      resetState();

      // Client-side size validation
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File size exceeds the ${maxSizeMB}MB limit.`);
        return;
      }

      // Client-side type validation
      const allowedTypes = accept.split(',').map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setError('Unsupported file type. Allowed: JPEG, PNG, WebP, SVG, MP4, WebM.');
        return;
      }

      try {
        setUploading(true);
        // Simulate progress (since fetch doesn't provide upload progress natively)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        await onUpload(file);

        clearInterval(progressInterval);
        setProgress(100);
        setSuccess(true);

        // Reset success after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setProgress(0);
        }, 3000);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setError(message);
        setProgress(0);
      } finally {
        setUploading(false);
      }
    },
    [accept, maxSizeMB, onUpload, resetState]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    if (!uploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-theme p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragging
            ? 'border-accent bg-accent/10'
            : 'border-white/20 hover:border-accent/50 hover:bg-white/5'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload file area. Click or drag and drop a file here."
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Icon and text */}
        <div className="flex flex-col items-center gap-3">
          {success ? (
            <CheckCircle className="w-10 h-10 text-green-400" />
          ) : (
            <Upload className="w-10 h-10 text-white/40" />
          )}

          {uploading ? (
            <p className="text-white/70 text-sm">Uploading...</p>
          ) : success ? (
            <p className="text-green-400 text-sm font-medium">Upload successful!</p>
          ) : (
            <>
              <p className="text-white/70 text-sm">
                <span className="text-accent font-medium">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-white/40 text-xs">
                Images (JPEG, PNG, WebP, SVG) up to 10MB &bull; Videos (MP4, WebM) up to
                100MB
              </p>
            </>
          )}
        </div>

        {/* Progress bar */}
        {(uploading || success) && (
          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                success ? 'bg-green-400' : 'bg-accent'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={resetState}
            className="ml-auto p-0.5 hover:bg-white/10 rounded"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
