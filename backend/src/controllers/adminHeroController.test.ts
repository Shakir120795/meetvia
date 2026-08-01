import { Request, Response, NextFunction } from 'express';
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  reorderHeroSlides,
  toggleHeroSlideVisibility,
  deleteHeroSlide,
} from './adminHeroController';

// Mock Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    heroSlide: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import prisma from '../config/db';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis() as any;
  res.json = jest.fn().mockReturnThis() as any;
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

describe('Admin Hero Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHeroSlides', () => {
    it('should return all slides sorted by displayOrder', async () => {
      const slides = [
        { heading: 'Slide 1', displayOrder: 0 },
        { heading: 'Slide 2', displayOrder: 1 },
      ];
      (prisma.heroSlide.findMany as jest.Mock).mockResolvedValue(slides);

      const req = {} as Request;
      const res = mockRes();

      await getHeroSlides(req, res, mockNext);

      expect(prisma.heroSlide.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: slides });
    });
  });

  describe('createHeroSlide', () => {
    it('should create a new slide and return 201', async () => {
      const slideData = { heading: 'New Slide', subtitle: 'Subtitle' };
      (prisma.heroSlide.create as jest.Mock).mockResolvedValue(slideData);

      const req = { body: slideData } as Request;
      const res = mockRes();

      await createHeroSlide(req, res, mockNext);

      expect(prisma.heroSlide.create).toHaveBeenCalledWith({ data: slideData });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: slideData });
    });
  });

  describe('updateHeroSlide', () => {
    it('should update an existing slide', async () => {
      const updatedSlide = { heading: 'Updated', displayOrder: 1 };
      (prisma.heroSlide.update as jest.Mock).mockResolvedValue(updatedSlide);

      const req = { params: { id: 'abc123' }, body: { heading: 'Updated' } } as any;
      const res = mockRes();

      await updateHeroSlide(req, res, mockNext);

      expect(prisma.heroSlide.update).toHaveBeenCalledWith({
        where: { id: 'abc123' },
        data: { heading: 'Updated' },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedSlide });
    });

    it('should return 404 if slide not found', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      (prisma.heroSlide.update as jest.Mock).mockRejectedValue(prismaError);

      const req = { params: { id: 'notfound' }, body: {} } as any;
      const res = mockRes();

      await updateHeroSlide(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Hero slide not found', code: 'NOT_FOUND' },
      });
    });
  });

  describe('reorderHeroSlides', () => {
    it('should bulk reorder slides and return updated list', async () => {
      const slidesInput = [
        { id: 'id1', displayOrder: 2 },
        { id: 'id2', displayOrder: 1 },
      ];
      const updatedSlides = [
        { id: 'id2', heading: 'Slide 2', displayOrder: 1 },
        { id: 'id1', heading: 'Slide 1', displayOrder: 2 },
      ];
      (prisma.$transaction as jest.Mock).mockResolvedValue([]);
      (prisma.heroSlide.findMany as jest.Mock).mockResolvedValue(updatedSlides);

      const req = { body: { slides: slidesInput } } as Request;
      const res = mockRes();

      await reorderHeroSlides(req, res, mockNext);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedSlides });
    });

    it('should return 400 if slides is not an array', async () => {
      const req = { body: { slides: 'not-array' } } as Request;
      const res = mockRes();

      await reorderHeroSlides(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'slides must be an array', code: 'VALIDATION_ERROR' },
      });
    });
  });

  describe('toggleHeroSlideVisibility', () => {
    it('should toggle visibility to true', async () => {
      const updatedSlide = { heading: 'Slide', isVisible: true };
      (prisma.heroSlide.update as jest.Mock).mockResolvedValue(updatedSlide);

      const req = { params: { id: 'abc123' }, body: { isVisible: true } } as any;
      const res = mockRes();

      await toggleHeroSlideVisibility(req, res, mockNext);

      expect(prisma.heroSlide.update).toHaveBeenCalledWith({
        where: { id: 'abc123' },
        data: { isVisible: true },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedSlide });
    });

    it('should return 400 if isVisible is not a boolean', async () => {
      const req = { params: { id: 'abc123' }, body: { isVisible: 'yes' } } as any;
      const res = mockRes();

      await toggleHeroSlideVisibility(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if slide not found', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      (prisma.heroSlide.update as jest.Mock).mockRejectedValue(prismaError);

      const req = { params: { id: 'notfound' }, body: { isVisible: false } } as any;
      const res = mockRes();

      await toggleHeroSlideVisibility(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteHeroSlide', () => {
    it('should delete a slide and return success message', async () => {
      (prisma.heroSlide.delete as jest.Mock).mockResolvedValue({ heading: 'Deleted' });

      const req = { params: { id: 'abc123' } } as any;
      const res = mockRes();

      await deleteHeroSlide(req, res, mockNext);

      expect(prisma.heroSlide.delete).toHaveBeenCalledWith({ where: { id: 'abc123' } });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Hero slide deleted successfully' },
      });
    });

    it('should return 404 if slide not found', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      (prisma.heroSlide.delete as jest.Mock).mockRejectedValue(prismaError);

      const req = { params: { id: 'notfound' } } as any;
      const res = mockRes();

      await deleteHeroSlide(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
