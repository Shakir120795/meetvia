import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from '../../middleware/auth';
import { uploadSingle, getFileCategory } from '../../middleware/upload';
import { getRequiredStringParam } from '../../utils/params';
import prisma from '../../config/db';

const router = Router();

// All media routes require authentication
router.use(authMiddleware);

/**
 * POST /upload — Upload a media file
 * Uses Multer middleware with type/size validation.
 * Creates a Media record with metadata on success.
 */
router.post(
  '/upload',
  uploadSingle('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'No file provided' },
        });
        return;
      }

      const fileType = getFileCategory(req.file.mimetype);

      if (!fileType) {
        res.status(415).json({
          success: false,
          error: { message: 'unsupported file type' },
        });
        return;
      }

      const storagePath = `${fileType === 'image' ? 'images' : 'videos'}/${req.file.filename}`;
      const url = `/uploads/${storagePath}`;

      const media = await prisma.media.create({
        data: {
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          fileType,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          storagePath,
          url,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: media.id,
          url: media.url,
          originalFilename: media.originalFilename,
          storedFilename: media.storedFilename,
          fileType: media.fileType,
          mimeType: media.mimeType,
          fileSize: media.fileSize,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET / — List media (paginated)
 * Query params: ?page=1&limit=20&type=image|video&search=filename
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
      const type = req.query.type as string;
      const search = req.query.search as string;

      const where: any = {};

      if (type && (type === 'image' || type === 'video')) {
        where.fileType = type;
      }

      if (search) {
        where.originalFilename = { contains: search, mode: 'insensitive' };
      }

      const total = await prisma.media.count({ where });
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const items = await prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      res.status(200).json({
        success: true,
        data: {
          items,
          total,
          page,
          pages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /:id — Delete media file + metadata
 * Removes the file from disk and the Media record from the database.
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const media = await prisma.media.findUnique({
        where: { id: getRequiredStringParam(req.params.id, "ID") },
      });

      if (!media) {
        res.status(404).json({
          success: false,
          error: { message: 'Media not found' },
        });
        return;
      }

      // Delete file from disk
      const filePath = path.join(__dirname, '../../../uploads', media.storagePath);
      try {
        await fs.promises.unlink(filePath);
      } catch (err: any) {
        // Ignore file not found errors (file may have been manually removed)
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      // Delete Media record from DB
      await prisma.media.delete({ where: { id: getRequiredStringParam(req.params.id, "ID") } });

      res.status(200).json({
        success: true,
        data: { message: 'Media deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
