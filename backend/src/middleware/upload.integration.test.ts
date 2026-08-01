import express from 'express';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { uploadSingle } from './upload';

// Create a test app with the upload middleware
const app = express();

app.post('/upload', uploadSingle('file'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'no file uploaded' } });
  }
  res.status(201).json({
    success: true,
    data: {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    },
  });
});

// Global error handler for the test app
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).json({ success: false, error: { message: err.message } });
});

// Helper to create a temporary test file
function createTempFile(filename: string, sizeInBytes: number): string {
  const tempDir = path.join(__dirname, '../../uploads/test-temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const filepath = path.join(tempDir, filename);
  const buffer = Buffer.alloc(sizeInBytes, 'a');
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

// Cleanup helper
function cleanupFile(filepath: string): void {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

describe('Upload Middleware - Integration Tests', () => {
  const uploadedFiles: string[] = [];

  afterAll(() => {
    // Clean up any uploaded files
    uploadedFiles.forEach((f) => cleanupFile(f));

    // Clean up temp directory
    const tempDir = path.join(__dirname, '../../uploads/test-temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Successful uploads', () => {
    it('should accept a valid JPEG image', async () => {
      const tempFile = createTempFile('test.jpg', 1024);

      const res = await request(app)
        .post('/upload')
        .attach('file', tempFile);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mimetype).toBe('image/jpeg');
      expect(res.body.data.filename).toMatch(/^[0-9a-f-]+\.jpg$/);

      if (res.body.data.path) uploadedFiles.push(res.body.data.path);
      cleanupFile(tempFile);
    });

    it('should accept a valid PNG image', async () => {
      // Create a minimal valid PNG file (8-byte signature)
      const tempDir = path.join(__dirname, '../../uploads/test-temp');
      const filepath = path.join(tempDir, 'test.png');
      // PNG signature bytes
      const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      const padding = Buffer.alloc(100, 0);
      fs.writeFileSync(filepath, Buffer.concat([pngSignature, padding]));

      const res = await request(app)
        .post('/upload')
        .attach('file', filepath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.filename).toMatch(/^[0-9a-f-]+\.png$/);

      if (res.body.data.path) uploadedFiles.push(res.body.data.path);
      cleanupFile(filepath);
    });

    it('should generate unique filenames (UUID format)', async () => {
      const tempFile = createTempFile('duplicate.jpg', 512);

      const res1 = await request(app).post('/upload').attach('file', tempFile);
      const res2 = await request(app).post('/upload').attach('file', tempFile);

      expect(res1.body.data.filename).not.toBe(res2.body.data.filename);
      // Both should be UUID format + .jpg
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;
      expect(res1.body.data.filename).toMatch(uuidRegex);
      expect(res2.body.data.filename).toMatch(uuidRegex);

      if (res1.body.data.path) uploadedFiles.push(res1.body.data.path);
      if (res2.body.data.path) uploadedFiles.push(res2.body.data.path);
      cleanupFile(tempFile);
    });
  });

  describe('Rejected uploads - unsupported type', () => {
    it('should reject a PDF file', async () => {
      const tempFile = createTempFile('document.pdf', 512);

      const res = await request(app)
        .post('/upload')
        .attach('file', tempFile);

      expect(res.status).toBe(415);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('unsupported file type');

      cleanupFile(tempFile);
    });

    it('should reject a GIF file (not in allowed set)', async () => {
      const tempFile = createTempFile('animation.gif', 512);

      const res = await request(app)
        .post('/upload')
        .attach('file', tempFile);

      expect(res.status).toBe(415);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('unsupported file type');

      cleanupFile(tempFile);
    });

    it('should reject a file with mismatched extension and MIME type', async () => {
      // Create a file with .jpg extension but it will be detected by supertest
      // based on extension. We simulate mismatch by naming a text file as .exe
      const tempFile = createTempFile('malicious.exe', 512);

      const res = await request(app)
        .post('/upload')
        .attach('file', tempFile);

      expect(res.status).toBe(415);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('unsupported file type');

      cleanupFile(tempFile);
    });
  });

  describe('Rejected uploads - file size exceeded', () => {
    it('should reject an image larger than 10MB', async () => {
      const elevenMB = 11 * 1024 * 1024;
      const tempFile = createTempFile('large.jpg', elevenMB);

      const res = await request(app)
        .post('/upload')
        .attach('file', tempFile);

      // Should get either 413 from size check
      expect(res.status).toBe(413);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('file size exceeded');

      cleanupFile(tempFile);
    });
  });

  describe('Edge cases', () => {
    it('should return 400 when no file is provided', async () => {
      const res = await request(app)
        .post('/upload')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle .webp extension correctly', async () => {
      const tempFile = createTempFile('photo.webp', 1024);

      const res = await request(app)
        .post('/upload')
        .attach('file', tempFile);

      expect(res.status).toBe(201);
      expect(res.body.data.filename).toMatch(/\.webp$/);

      if (res.body.data.path) uploadedFiles.push(res.body.data.path);
      cleanupFile(tempFile);
    });
  });
});
