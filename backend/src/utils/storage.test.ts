import fs from 'fs';
import path from 'path';
import { LocalStorageAdapter } from './storage';

describe('LocalStorageAdapter', () => {
  const testBasePath = path.resolve(__dirname, '../../uploads-test');
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter(testBasePath);
  });

  afterEach(async () => {
    // Clean up test upload directory
    try {
      await fs.promises.rm(testBasePath, { recursive: true, force: true });
    } catch {
      // ignore if directory doesn't exist
    }
  });

  describe('upload', () => {
    it('should store image files in the images subdirectory', async () => {
      const fileBuffer = Buffer.from('fake image data');
      const result = await adapter.upload(fileBuffer, 'photo.jpg', 'image/jpeg');

      expect(result).toMatch(/^images\/[a-f0-9-]+\.jpg$/);

      // Verify file exists on disk
      const fullPath = path.join(testBasePath, result);
      const fileExists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should store video files in the videos subdirectory', async () => {
      const fileBuffer = Buffer.from('fake video data');
      const result = await adapter.upload(fileBuffer, 'clip.mp4', 'video/mp4');

      expect(result).toMatch(/^videos\/[a-f0-9-]+\.mp4$/);

      const fullPath = path.join(testBasePath, result);
      const fileExists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should generate unique filenames for files with the same original name', async () => {
      const fileBuffer = Buffer.from('data');
      const result1 = await adapter.upload(fileBuffer, 'photo.png', 'image/png');
      const result2 = await adapter.upload(fileBuffer, 'photo.png', 'image/png');

      expect(result1).not.toBe(result2);
    });

    it('should preserve the original file extension', async () => {
      const fileBuffer = Buffer.from('data');
      const result = await adapter.upload(fileBuffer, 'animation.webp', 'image/webp');
      expect(result).toMatch(/\.webp$/);
    });

    it('should write correct file content', async () => {
      const content = 'hello world file content';
      const fileBuffer = Buffer.from(content);
      const result = await adapter.upload(fileBuffer, 'test.svg', 'image/svg+xml');

      const fullPath = path.join(testBasePath, result);
      const readContent = await fs.promises.readFile(fullPath, 'utf-8');
      expect(readContent).toBe(content);
    });
  });

  describe('delete', () => {
    it('should remove an uploaded file', async () => {
      const fileBuffer = Buffer.from('to be deleted');
      const filepath = await adapter.upload(fileBuffer, 'delete-me.jpg', 'image/jpeg');

      await adapter.delete(filepath);

      const fullPath = path.join(testBasePath, filepath);
      const fileExists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(false);
    });

    it('should not throw when deleting a non-existent file', async () => {
      await expect(adapter.delete('images/non-existent-file.jpg')).resolves.not.toThrow();
    });
  });

  describe('getUrl', () => {
    it('should return the correct public URL for a file', () => {
      const url = adapter.getUrl('images/abc-123.jpg');
      expect(url).toBe('/uploads/images/abc-123.jpg');
    });

    it('should handle video paths', () => {
      const url = adapter.getUrl('videos/xyz-456.mp4');
      expect(url).toBe('/uploads/videos/xyz-456.mp4');
    });
  });
});
