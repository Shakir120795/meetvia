import { getFileCategory, getMaxSize } from './upload';

describe('Upload Middleware - Utility Functions', () => {
  describe('getFileCategory', () => {
    it('should return "image" for image/jpeg', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
    });

    it('should return "image" for image/png', () => {
      expect(getFileCategory('image/png')).toBe('image');
    });

    it('should return "image" for image/webp', () => {
      expect(getFileCategory('image/webp')).toBe('image');
    });

    it('should return "image" for image/svg+xml', () => {
      expect(getFileCategory('image/svg+xml')).toBe('image');
    });

    it('should return "video" for video/mp4', () => {
      expect(getFileCategory('video/mp4')).toBe('video');
    });

    it('should return "video" for video/webm', () => {
      expect(getFileCategory('video/webm')).toBe('video');
    });

    it('should return null for unsupported MIME type', () => {
      expect(getFileCategory('application/pdf')).toBeNull();
    });

    it('should return null for text/plain', () => {
      expect(getFileCategory('text/plain')).toBeNull();
    });

    it('should return null for image/gif (not in allowed set)', () => {
      expect(getFileCategory('image/gif')).toBeNull();
    });
  });

  describe('getMaxSize', () => {
    it('should return 10MB for image MIME types', () => {
      expect(getMaxSize('image/jpeg')).toBe(10 * 1024 * 1024);
      expect(getMaxSize('image/png')).toBe(10 * 1024 * 1024);
      expect(getMaxSize('image/webp')).toBe(10 * 1024 * 1024);
      expect(getMaxSize('image/svg+xml')).toBe(10 * 1024 * 1024);
    });

    it('should return 100MB for video MIME types', () => {
      expect(getMaxSize('video/mp4')).toBe(100 * 1024 * 1024);
      expect(getMaxSize('video/webm')).toBe(100 * 1024 * 1024);
    });

    it('should return 0 for unsupported MIME types', () => {
      expect(getMaxSize('application/pdf')).toBe(0);
      expect(getMaxSize('text/html')).toBe(0);
    });
  });
});
