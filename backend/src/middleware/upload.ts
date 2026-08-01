import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

// Allowed MIME types and their valid extensions
const ALLOWED_IMAGE_MIMES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
};

const ALLOWED_VIDEO_MIMES: Record<string, string[]> = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
};

const ALL_ALLOWED_MIMES = { ...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES };

// Size limits in bytes
const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Determines whether a MIME type belongs to images or videos.
 */
export function getFileCategory(mimeType: string): 'image' | 'video' | null {
  if (mimeType in ALLOWED_IMAGE_MIMES) return 'image';
  if (mimeType in ALLOWED_VIDEO_MIMES) return 'video';
  return null;
}

/**
 * Returns the max file size based on MIME type category.
 */
export function getMaxSize(mimeType: string): number {
  const category = getFileCategory(mimeType);
  if (category === 'image') return IMAGE_MAX_SIZE;
  if (category === 'video') return VIDEO_MAX_SIZE;
  return 0;
}

/**
 * Multer disk storage configuration.
 * - Generates unique filenames using UUID + original extension.
 * - Routes files to uploads/images/ or uploads/videos/ based on MIME type.
 */
const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    const category = getFileCategory(file.mimetype);
    if (category === 'image') {
      cb(null, path.join(__dirname, '../../uploads/images'));
    } else if (category === 'video') {
      cb(null, path.join(__dirname, '../../uploads/videos'));
    } else {
      // This shouldn't be reached since fileFilter rejects unsupported types
      cb(null, path.join(__dirname, '../../uploads'));
    }
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter that validates:
 * 1. MIME type is in the allowed set
 * 2. File extension matches the MIME type
 *
 * We use a custom MulterError with code 'LIMIT_UNEXPECTED_FILE' workaround:
 * Instead of calling cb(new Error(...)) which can cause stream issues,
 * we attach the rejection reason to the request and call cb(null, false).
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const mimeType = file.mimetype;
  const ext = path.extname(file.originalname).toLowerCase();

  // Check if MIME type is in allowed set
  if (!(mimeType in ALL_ALLOWED_MIMES)) {
    (req as any).__uploadRejectionReason = 'unsupported file type';
    return cb(null, false);
  }

  // Verify extension matches MIME type
  const validExtensions = ALL_ALLOWED_MIMES[mimeType];
  if (!validExtensions.includes(ext)) {
    (req as any).__uploadRejectionReason = 'unsupported file type';
    return cb(null, false);
  }

  cb(null, true);
};

/**
 * Creates a multer instance with the appropriate size limit.
 * Uses the larger video limit by default since we validate per-file in the error handler.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: VIDEO_MAX_SIZE, // Use largest limit; we validate specific limits in middleware
  },
});

/**
 * Express middleware that handles file upload with proper size validation.
 * Wraps multer's single file upload and provides specific error messages.
 */
export const uploadSingle = (fieldName: string = 'file') => {
  return (req: Request, res: any, next: any) => {
    const multerUpload = upload.single(fieldName);

    multerUpload(req, res, (err: any) => {
      if (err) {
        // Multer-specific file size error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            error: { message: 'file size exceeded' },
          });
        }

        // Our custom error messages
        if (err.message === 'unsupported file type') {
          return res.status(415).json({
            success: false,
            error: { message: 'unsupported file type' },
          });
        }

        // Multer LIMIT_UNEXPECTED_FILE error
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            error: { message: 'unexpected file field' },
          });
        }

        // Generic upload error
        return res.status(400).json({
          success: false,
          error: { message: err.message || 'file upload failed' },
        });
      }

      // Check if the file was rejected by our file filter
      if ((req as any).__uploadRejectionReason) {
        return res.status(415).json({
          success: false,
          error: { message: (req as any).__uploadRejectionReason },
        });
      }

      // After successful multer processing, validate file size against category-specific limit
      if (req.file) {
        const category = getFileCategory(req.file.mimetype);
        const maxSize = category === 'image' ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE;

        if (req.file.size > maxSize) {
          // Remove the uploaded file since it exceeds the size limit
          const fs = require('fs');
          fs.unlink(req.file.path, () => {
            // Ignore unlink errors
          });

          return res.status(413).json({
            success: false,
            error: { message: 'file size exceeded' },
          });
        }
      }

      next();
    });
  };
};

/**
 * Returns a multer instance configured for a specific file type expectation.
 * Useful when you know ahead of time whether you expect an image or video.
 */
export const getUploadMiddleware = (
  expectedType?: 'image' | 'video'
): multer.Multer => {
  const sizeLimit =
    expectedType === 'image'
      ? IMAGE_MAX_SIZE
      : expectedType === 'video'
        ? VIDEO_MAX_SIZE
        : VIDEO_MAX_SIZE;

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: sizeLimit,
    },
  });
};

// Default export: multer instance configured for single 'file' field
export default upload;
