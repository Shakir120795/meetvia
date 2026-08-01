import request from 'supertest';

// Mock Prisma client before importing app
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    siteSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    themeSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    heroSlide: {
      findMany: jest.fn(),
    },
    howItWorksStep: {
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

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

import app from '../../server';
import prisma from '../../config/db';

describe('Public API Endpoints - Part 1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/public/site-settings', () => {
    it('should return site settings when they exist', async () => {
      const mockSettings = {
        id: 'settings-1',
        siteName: 'Meetvia',
        metaTitle: 'Meetvia',
        metaDescription: 'City assistance services',
        contactEmail: 'info@meetvia.com',
      };
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const res = await request(app).get('/api/v1/public/site-settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockSettings);
      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('should create and return default settings when none exist', async () => {
      const defaultSettings = {
        id: 'settings-new',
        siteName: 'Meetvia',
        metaTitle: 'Meetvia',
        metaDescription: 'Professional city assistance and visitor support services in India',
      };
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.siteSettings.create as jest.Mock).mockResolvedValue(defaultSettings);

      const res = await request(app).get('/api/v1/public/site-settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.siteName).toBe('Meetvia');
      expect(prisma.siteSettings.create).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      (prisma.siteSettings.findFirst as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

      const res = await request(app).get('/api/v1/public/site-settings');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/theme', () => {
    it('should return theme settings when they exist', async () => {
      const mockTheme = {
        id: 'theme-1',
        activePreset: 'futuristic_blue',
        primaryColor: '#FFFFFF',
        secondaryColor: '#0A1628',
        accentColor: '#00D4FF',
        backgroundColor: '#0A1628',
        textColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 12,
        glassmorphismIntensity: 50,
      };
      (prisma.themeSettings.findFirst as jest.Mock).mockResolvedValue(mockTheme);

      const res = await request(app).get('/api/v1/public/theme');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTheme);
      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('should create and return default theme when none exists', async () => {
      const defaultTheme = {
        id: 'theme-new',
        activePreset: 'futuristic_blue',
        primaryColor: '#FFFFFF',
        secondaryColor: '#0A1628',
        accentColor: '#00D4FF',
        backgroundColor: '#0A1628',
        textColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 12,
        glassmorphismIntensity: 50,
      };
      (prisma.themeSettings.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.themeSettings.create as jest.Mock).mockResolvedValue(defaultTheme);

      const res = await request(app).get('/api/v1/public/theme');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activePreset).toBe('futuristic_blue');
      expect(prisma.themeSettings.create).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      (prisma.themeSettings.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/theme');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/hero-slides', () => {
    it('should return visible hero slides sorted by displayOrder', async () => {
      const mockSlides = [
        { id: '1', heading: 'Slide 1', displayOrder: 0, isVisible: true },
        { id: '2', heading: 'Slide 2', displayOrder: 1, isVisible: true },
      ];
      (prisma.heroSlide.findMany as jest.Mock).mockResolvedValue(mockSlides);

      const res = await request(app).get('/api/v1/public/hero-slides');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockSlides);
      expect(prisma.heroSlide.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no visible slides exist', async () => {
      (prisma.heroSlide.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/hero-slides');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.heroSlide.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/hero-slides');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/how-it-works', () => {
    it('should return steps sorted by displayOrder', async () => {
      const mockSteps = [
        { id: '1', stepNumber: 1, title: 'Choose Activity', description: 'Pick an activity', displayOrder: 0 },
        { id: '2', stepNumber: 2, title: 'Confirm Meeting', description: 'Confirm details', displayOrder: 1 },
        { id: '3', stepNumber: 3, title: 'Enjoy Session', description: 'Have fun', displayOrder: 2 },
      ];
      (prisma.howItWorksStep.findMany as jest.Mock).mockResolvedValue(mockSteps);

      const res = await request(app).get('/api/v1/public/how-it-works');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockSteps);
      expect(prisma.howItWorksStep.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no steps exist', async () => {
      (prisma.howItWorksStep.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/how-it-works');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.howItWorksStep.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/how-it-works');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Response format', () => {
    it('all endpoints return JSON content-type', async () => {
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue({ siteName: 'Meetvia' });
      (prisma.themeSettings.findFirst as jest.Mock).mockResolvedValue({ activePreset: 'futuristic_blue' });
      (prisma.heroSlide.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.howItWorksStep.findMany as jest.Mock).mockResolvedValue([]);

      const endpoints = [
        '/api/v1/public/site-settings',
        '/api/v1/public/theme',
        '/api/v1/public/hero-slides',
        '/api/v1/public/how-it-works',
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body.success).toBeDefined();
      }
    });
  });
});
