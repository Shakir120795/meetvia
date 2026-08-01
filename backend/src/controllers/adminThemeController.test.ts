import { Request, Response, NextFunction } from 'express';
import { getTheme, updateTheme } from './adminThemeController';

// Mock Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    themeSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
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

describe('Admin Theme Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTheme', () => {
    it('should return existing theme settings', async () => {
      const themeData = {
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
      (prisma.themeSettings.findFirst as jest.Mock).mockResolvedValue(themeData);

      const req = {} as Request;
      const res = mockRes();

      await getTheme(req, res, mockNext);

      expect(prisma.themeSettings.findFirst).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: themeData });
    });

    it('should create default theme if none exists', async () => {
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

      const req = {} as Request;
      const res = mockRes();

      await getTheme(req, res, mockNext);

      expect(prisma.themeSettings.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: defaultTheme });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (prisma.themeSettings.findFirst as jest.Mock).mockRejectedValue(error);

      const req = {} as Request;
      const res = mockRes();

      await getTheme(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTheme', () => {
    it('should update existing theme settings and return updated data', async () => {
      const existing = {
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
      const updateData = {
        primaryColor: '#000000',
        borderRadius: 8,
      };
      const updatedTheme = { ...existing, ...updateData };
      (prisma.themeSettings.findFirst as jest.Mock).mockResolvedValue(existing);
      (prisma.themeSettings.update as jest.Mock).mockResolvedValue(updatedTheme);

      const req = { body: updateData } as Request;
      const res = mockRes();

      await updateTheme(req, res, mockNext);

      expect(prisma.themeSettings.update).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
        data: updateData,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedTheme });
    });

    it('should create theme settings if none exists', async () => {
      const updateData = { primaryColor: '#000000' };
      const createdTheme = {
        id: 'theme-new',
        activePreset: 'futuristic_blue',
        primaryColor: '#000000',
        secondaryColor: '#0A1628',
        accentColor: '#00D4FF',
        backgroundColor: '#0A1628',
        textColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 12,
        glassmorphismIntensity: 50,
      };
      (prisma.themeSettings.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.themeSettings.create as jest.Mock).mockResolvedValue(createdTheme);

      const req = { body: updateData } as Request;
      const res = mockRes();

      await updateTheme(req, res, mockNext);

      expect(prisma.themeSettings.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: createdTheme });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (prisma.themeSettings.findFirst as jest.Mock).mockRejectedValue(error);

      const req = { body: {} } as Request;
      const res = mockRes();

      await updateTheme(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
