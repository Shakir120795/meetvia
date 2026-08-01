import request from 'supertest';

// Mock Prisma client before importing app
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    service: {
      findMany: jest.fn(),
    },
    city: {
      findMany: jest.fn(),
    },
    fAQ: {
      findMany: jest.fn(),
    },
    testimonial: {
      findMany: jest.fn(),
    },
    legalPage: {
      findUnique: jest.fn(),
    },
    siteSettings: {
      findFirst: jest.fn(),
    },
    socialLink: {
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

describe('Public API Endpoints - Part 2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/public/services', () => {
    it('should return visible services sorted by displayOrder', async () => {
      const mockServices = [
        { id: '1', title: 'Service A', displayOrder: 0, isVisible: true },
        { id: '2', title: 'Service B', displayOrder: 1, isVisible: true },
      ];
      (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);

      const res = await request(app).get('/api/v1/public/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockServices);
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no visible services exist', async () => {
      (prisma.service.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.service.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/services');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/services/featured', () => {
    it('should return featured services when 6 or more featured exist', async () => {
      const mockFeatured = Array.from({ length: 6 }, (_, i) => ({
        id: `id${i}`,
        title: `Featured ${i}`,
        isFeatured: true,
        isVisible: true,
        displayOrder: i,
      }));
      (prisma.service.findMany as jest.Mock).mockResolvedValue(mockFeatured);

      const res = await request(app).get('/api/v1/public/services/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(6);
    });

    it('should fill with non-featured visible services when fewer than 6 featured', async () => {
      const mockFeatured = [
        { id: 'f1', title: 'Featured 1', isFeatured: true, isVisible: true, displayOrder: 0 },
        { id: 'f2', title: 'Featured 2', isFeatured: true, isVisible: true, displayOrder: 1 },
      ];
      const mockFiller = [
        { id: 'n1', title: 'Normal 1', isFeatured: false, isVisible: true, displayOrder: 2 },
        { id: 'n2', title: 'Normal 2', isFeatured: false, isVisible: true, displayOrder: 3 },
        { id: 'n3', title: 'Normal 3', isFeatured: false, isVisible: true, displayOrder: 4 },
        { id: 'n4', title: 'Normal 4', isFeatured: false, isVisible: true, displayOrder: 5 },
      ];

      (prisma.service.findMany as jest.Mock)
        .mockResolvedValueOnce(mockFeatured) // first call: featured
        .mockResolvedValueOnce(mockFiller); // second call: filler

      const res = await request(app).get('/api/v1/public/services/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(6);
    });

    it('should return 500 on database error', async () => {
      (prisma.service.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/services/featured');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/cities', () => {
    it('should return active cities sorted by displayOrder', async () => {
      const mockCities = [
        { id: '1', cityName: 'Agra', state: 'Uttar Pradesh', country: 'India', status: 'active', displayOrder: 0 },
        { id: '2', cityName: 'Delhi', state: 'Delhi', country: 'India', status: 'active', displayOrder: 1 },
      ];
      (prisma.city.findMany as jest.Mock).mockResolvedValue(mockCities);

      const res = await request(app).get('/api/v1/public/cities');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockCities);
      expect(prisma.city.findMany).toHaveBeenCalledWith({
        where: { status: 'active' },
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no active cities exist', async () => {
      (prisma.city.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/cities');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.city.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/cities');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/faq', () => {
    it('should return all FAQs sorted by displayOrder', async () => {
      const mockFaqs = [
        { id: '1', question: 'Q1', answer: 'A1', displayOrder: 0 },
        { id: '2', question: 'Q2', answer: 'A2', displayOrder: 1 },
      ];
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue(mockFaqs);

      const res = await request(app).get('/api/v1/public/faq');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockFaqs);
      expect(prisma.fAQ.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no FAQs exist', async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/faq');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.fAQ.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/faq');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/faq/preview', () => {
    it('should return first 6 FAQs sorted by displayOrder', async () => {
      const mockFaqs = Array.from({ length: 6 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Q${i + 1}`,
        answer: `A${i + 1}`,
        displayOrder: i,
      }));
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue(mockFaqs);

      const res = await request(app).get('/api/v1/public/faq/preview');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(6);
      expect(prisma.fAQ.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
        take: 6,
      });
    });

    it('should return 500 on database error', async () => {
      (prisma.fAQ.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/faq/preview');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/testimonials', () => {
    it('should return verified and visible testimonials sorted by displayOrder', async () => {
      const mockTestimonials = [
        { id: '1', reviewerName: 'John', reviewText: 'Great', isVerified: true, isVisible: true, displayOrder: 0 },
        { id: '2', reviewerName: 'Jane', reviewText: 'Awesome', isVerified: true, isVisible: true, displayOrder: 1 },
      ];
      (prisma.testimonial.findMany as jest.Mock).mockResolvedValue(mockTestimonials);

      const res = await request(app).get('/api/v1/public/testimonials');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTestimonials);
      expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { isVerified: true, isVisible: true },
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no verified+visible testimonials exist', async () => {
      (prisma.testimonial.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/testimonials');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.testimonial.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/testimonials');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/testimonials/preview', () => {
    it('should return max 3 verified and visible testimonials', async () => {
      const mockTestimonials = [
        { id: '1', reviewerName: 'John', reviewText: 'Great', isVerified: true, isVisible: true, displayOrder: 0 },
        { id: '2', reviewerName: 'Jane', reviewText: 'Awesome', isVerified: true, isVisible: true, displayOrder: 1 },
        { id: '3', reviewerName: 'Bob', reviewText: 'Nice', isVerified: true, isVisible: true, displayOrder: 2 },
      ];
      (prisma.testimonial.findMany as jest.Mock).mockResolvedValue(mockTestimonials);

      const res = await request(app).get('/api/v1/public/testimonials/preview');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
        where: { isVerified: true, isVisible: true },
        orderBy: { displayOrder: 'asc' },
        take: 3,
      });
    });

    it('should return 500 on database error', async () => {
      (prisma.testimonial.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/testimonials/preview');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/pages/:slug', () => {
    it('should return legal page by slug', async () => {
      const mockPage = {
        id: 'page-1',
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<p>Our privacy policy...</p>',
      };
      (prisma.legalPage.findUnique as jest.Mock).mockResolvedValue(mockPage);

      const res = await request(app).get('/api/v1/public/pages/privacy-policy');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockPage);
      expect(prisma.legalPage.findUnique).toHaveBeenCalledWith({ where: { slug: 'privacy-policy' } });
    });

    it('should return 404 when page slug not found', async () => {
      (prisma.legalPage.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/v1/public/pages/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Page not found');
    });

    it('should return 500 on database error', async () => {
      (prisma.legalPage.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/pages/privacy-policy');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/public/footer', () => {
    it('should return footer description and visible social links', async () => {
      const mockSettings = { metaDescription: 'Professional city assistance services' };
      const mockLinks = [
        { id: '1', platform: 'Instagram', url: 'https://instagram.com/meetvia', iconIdentifier: 'FaInstagram', displayOrder: 0 },
        { id: '2', platform: 'Facebook', url: 'https://facebook.com/meetvia', iconIdentifier: 'FaFacebook', displayOrder: 1 },
      ];
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);
      (prisma.socialLink.findMany as jest.Mock).mockResolvedValue(mockLinks);

      const res = await request(app).get('/api/v1/public/footer');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Professional city assistance services');
      expect(res.body.data.socialLinks).toEqual(mockLinks);
      expect(prisma.socialLink.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return null description when no site settings exist', async () => {
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.socialLink.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/v1/public/footer');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBeNull();
      expect(res.body.data.socialLinks).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (prisma.siteSettings.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/v1/public/footer');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Response format', () => {
    it('all Part 2 endpoints return JSON content-type', async () => {
      (prisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.city.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.testimonial.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.legalPage.findUnique as jest.Mock).mockResolvedValue({ slug: 'test', title: 'Test', content: 'Content' });
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue({ metaDescription: 'Desc' });
      (prisma.socialLink.findMany as jest.Mock).mockResolvedValue([]);

      const endpoints = [
        '/api/v1/public/cities',
        '/api/v1/public/pages/privacy-policy',
        '/api/v1/public/footer',
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body.success).toBeDefined();
      }
    });
  });
});
