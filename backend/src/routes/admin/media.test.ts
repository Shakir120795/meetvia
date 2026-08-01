import request from 'supertest';
import express from 'express';
import fs from 'fs';

// Mock env config
jest.mock('../../config/env', () => ({
  __esModule: true,
  default: {
    JWT_SECRET: 'test-secret-key',
    JWT_EXPIRY: '24h',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    PORT: 5000,
    NODE_ENV: 'test',
  },
}));

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock Prisma client
const mockMediaCreate = jest.fn();
const mockMediaCount = jest.fn();
const mockMediaFindMany = jest.fn();
const mockMediaFindUnique = jest.fn();
const mockMediaDelete = jest.fn();

jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    media: {
      create: (...args: any[]) => mockMediaCreate(...args),
      count: (...args: any[]) => mockMediaCount(...args),
      findMany: (...args: any[]) => mockMediaFindMany(...args),
      findUnique: (...args: any[]) => mockMediaFindUnique(...args),
      delete: (...args: any[]) => mockMediaDelete(...args),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Mock auth middleware to bypass JWT for unit tests
jest.mock('../../middleware/auth', () => ({
  __esModule: true,
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { userId: 'testuser', email: 'admin@meetvia.com' };
    next();
  },
}));

// Mock upload middleware
jest.mock('../../middleware/upload', () => ({
  __esModule: true,
  uploadSingle: (_fieldName: string) => (req: any, _res: any, next: any) => {
    if ((req as any).__testFile) {
      req.file = (req as any).__testFile;
    }
    next();
  },
  getFileCategory: (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return null;
  },
}));

// Mock fs.promises.unlink
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      unlink: jest.fn(),
    },
  };
});

import mediaRouter from './media';

function createApp() {
  const app = express();
  app.use(express.json());
  // Middleware to allow tests to set file data
  app.use((req: any, _res, next) => {
    if (req.headers['x-test-file']) {
      req.__testFile = JSON.parse(req.headers['x-test-file'] as string);
    }
    next();
  });
  app.use('/media', mediaRouter);
  return app;
}

describe('Admin Media Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /media/upload', () => {
    it('should return 400 when no file is provided', async () => {
      const app = createApp();
      const res = await request(app).post('/media/upload').send();

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('No file provided');
    });

    it('should return 201 with media data on successful image upload', async () => {
      const mockFile = {
        originalname: 'photo.jpg',
        filename: 'abc-uuid.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        path: '/tmp/uploads/images/abc-uuid.jpg',
      };

      mockMediaCreate.mockResolvedValue({
        id: 'media123',
        originalFilename: 'photo.jpg',
        storedFilename: 'abc-uuid.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        fileSize: 1024000,
        storagePath: 'images/abc-uuid.jpg',
        url: '/uploads/images/abc-uuid.jpg',
      });

      const app = createApp();
      const res = await request(app)
        .post('/media/upload')
        .set('x-test-file', JSON.stringify(mockFile));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        id: 'media123',
        url: '/uploads/images/abc-uuid.jpg',
        originalFilename: 'photo.jpg',
        storedFilename: 'abc-uuid.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        fileSize: 1024000,
      });
    });

    it('should return 201 with media data on successful video upload', async () => {
      const mockFile = {
        originalname: 'clip.mp4',
        filename: 'def-uuid.mp4',
        mimetype: 'video/mp4',
        size: 50000000,
        path: '/tmp/uploads/videos/def-uuid.mp4',
      };

      mockMediaCreate.mockResolvedValue({
        id: 'media456',
        originalFilename: 'clip.mp4',
        storedFilename: 'def-uuid.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        fileSize: 50000000,
        storagePath: 'videos/def-uuid.mp4',
        url: '/uploads/videos/def-uuid.mp4',
      });

      const app = createApp();
      const res = await request(app)
        .post('/media/upload')
        .set('x-test-file', JSON.stringify(mockFile));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileType).toBe('video');
      expect(res.body.data.url).toBe('/uploads/videos/def-uuid.mp4');
    });

    it('should store correct relative storagePath', async () => {
      const mockFile = {
        originalname: 'image.png',
        filename: 'ghi-uuid.png',
        mimetype: 'image/png',
        size: 2048,
        path: '/tmp/uploads/images/ghi-uuid.png',
      };

      mockMediaCreate.mockResolvedValue({
        id: 'media789',
        originalFilename: 'image.png',
        storedFilename: 'ghi-uuid.png',
        fileType: 'image',
        mimeType: 'image/png',
        fileSize: 2048,
        storagePath: 'images/ghi-uuid.png',
        url: '/uploads/images/ghi-uuid.png',
      });

      const app = createApp();
      await request(app)
        .post('/media/upload')
        .set('x-test-file', JSON.stringify(mockFile));

      expect(mockMediaCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          storagePath: 'images/ghi-uuid.png',
          url: '/uploads/images/ghi-uuid.png',
        }),
      });
    });
  });

  describe('GET /media', () => {
    const mockItems = [
      { id: '1', originalFilename: 'a.jpg', fileType: 'image' },
      { id: '2', originalFilename: 'b.png', fileType: 'image' },
    ];

    it('should return paginated media list with defaults', async () => {
      mockMediaCount.mockResolvedValue(2);
      mockMediaFindMany.mockResolvedValue(mockItems);

      const app = createApp();
      const res = await request(app).get('/media');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual(mockItems);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pages).toBe(1);
    });

    it('should filter by type when type param is provided', async () => {
      mockMediaCount.mockResolvedValue(1);
      mockMediaFindMany.mockResolvedValue([mockItems[0]]);

      const app = createApp();
      await request(app).get('/media?type=image');

      expect(mockMediaCount).toHaveBeenCalledWith({ where: { fileType: 'image' } });
    });

    it('should filter by type=video', async () => {
      mockMediaCount.mockResolvedValue(1);
      mockMediaFindMany.mockResolvedValue([]);

      const app = createApp();
      await request(app).get('/media?type=video');

      expect(mockMediaCount).toHaveBeenCalledWith({ where: { fileType: 'video' } });
    });

    it('should search by originalFilename with case-insensitive match', async () => {
      mockMediaCount.mockResolvedValue(1);
      mockMediaFindMany.mockResolvedValue([mockItems[0]]);

      const app = createApp();
      await request(app).get('/media?search=photo');

      expect(mockMediaCount).toHaveBeenCalledWith({
        where: { originalFilename: { contains: 'photo', mode: 'insensitive' } },
      });
    });

    it('should combine type and search filters', async () => {
      mockMediaCount.mockResolvedValue(1);
      mockMediaFindMany.mockResolvedValue([mockItems[0]]);

      const app = createApp();
      await request(app).get('/media?type=image&search=sunset');

      expect(mockMediaCount).toHaveBeenCalledWith({
        where: {
          fileType: 'image',
          originalFilename: { contains: 'sunset', mode: 'insensitive' },
        },
      });
    });

    it('should handle custom page and limit', async () => {
      mockMediaCount.mockResolvedValue(50);
      mockMediaFindMany.mockResolvedValue([]);

      const app = createApp();
      const res = await request(app).get('/media?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.pages).toBe(5);

      expect(mockMediaFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page-1) * limit
          take: 10,
        })
      );
    });

    it('should default page to 1 if invalid', async () => {
      mockMediaCount.mockResolvedValue(5);
      mockMediaFindMany.mockResolvedValue([]);

      const app = createApp();
      const res = await request(app).get('/media?page=0');

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(1);
    });

    it('should ignore invalid type values', async () => {
      mockMediaCount.mockResolvedValue(10);
      mockMediaFindMany.mockResolvedValue([]);

      const app = createApp();
      await request(app).get('/media?type=audio');

      // Should not add fileType filter for invalid types
      expect(mockMediaCount).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe('DELETE /media/:id', () => {
    it('should return 404 when media not found', async () => {
      mockMediaFindUnique.mockResolvedValue(null);

      const app = createApp();
      const res = await request(app).delete('/media/nonexistent123');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Media not found');
    });

    it('should delete file and metadata on success', async () => {
      const mockMedia = {
        id: 'media123',
        storagePath: 'images/abc-uuid.jpg',
      };
      mockMediaFindUnique.mockResolvedValue(mockMedia);
      mockMediaDelete.mockResolvedValue(mockMedia);
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      const app = createApp();
      const res = await request(app).delete('/media/media123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Media deleted');
      expect(fs.promises.unlink).toHaveBeenCalled();
      expect(mockMediaDelete).toHaveBeenCalledWith({ where: { id: 'media123' } });
    });

    it('should still delete metadata if file is already removed from disk', async () => {
      const mockMedia = {
        id: 'media456',
        storagePath: 'videos/def-uuid.mp4',
      };
      mockMediaFindUnique.mockResolvedValue(mockMedia);
      mockMediaDelete.mockResolvedValue(mockMedia);
      // Simulate file not found error
      const enoentError: any = new Error('ENOENT');
      enoentError.code = 'ENOENT';
      (fs.promises.unlink as jest.Mock).mockRejectedValue(enoentError);

      const app = createApp();
      const res = await request(app).delete('/media/media456');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Media deleted');
      expect(mockMediaDelete).toHaveBeenCalledWith({ where: { id: 'media456' } });
    });

    it('should propagate non-ENOENT file system errors', async () => {
      const mockMedia = {
        id: 'media789',
        storagePath: 'images/ghi-uuid.png',
      };
      mockMediaFindUnique.mockResolvedValue(mockMedia);
      const permError: any = new Error('EACCES');
      permError.code = 'EACCES';
      (fs.promises.unlink as jest.Mock).mockRejectedValue(permError);

      const app = express();
      app.use(express.json());
      app.use('/media', mediaRouter);
      // Add error handler to catch the propagated error
      app.use((err: any, _req: any, res: any, _next: any) => {
        res.status(500).json({ success: false, error: { message: err.message } });
      });

      const res = await request(app).delete('/media/media789');

      expect(res.status).toBe(500);
    });
  });
});
