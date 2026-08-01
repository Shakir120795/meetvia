import { Request, Response, NextFunction } from 'express';
import { getSiteSettings, updateSiteSettings } from './adminSiteSettingsController';

// Mock Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    siteSettings: {
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

describe('Admin Site Settings Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSiteSettings', () => {
    it('should return existing site settings', async () => {
      const settingsData = {
        id: 'settings-1',
        siteName: 'Meetvia',
        metaTitle: 'Meetvia',
        metaDescription: 'City assistance platform',
      };
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(settingsData);

      const req = {} as Request;
      const res = mockRes();

      await getSiteSettings(req, res, mockNext);

      expect(prisma.siteSettings.findFirst).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: settingsData });
    });

    it('should create default settings if none exists', async () => {
      const defaultSettings = {
        id: 'settings-new',
        siteName: 'Meetvia',
        metaTitle: 'Meetvia',
        metaDescription: 'Professional public companionship and visitor assistance platform',
      };
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.siteSettings.create as jest.Mock).mockResolvedValue(defaultSettings);

      const req = {} as Request;
      const res = mockRes();

      await getSiteSettings(req, res, mockNext);

      expect(prisma.siteSettings.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: defaultSettings });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (prisma.siteSettings.findFirst as jest.Mock).mockRejectedValue(error);

      const req = {} as Request;
      const res = mockRes();

      await getSiteSettings(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateSiteSettings', () => {
    it('should update existing site settings and return updated data', async () => {
      const existing = { id: 'settings-1', siteName: 'Meetvia', metaTitle: 'Meetvia' };
      const updateData = {
        siteName: 'Meetvia Updated',
        metaTitle: 'Meetvia Updated',
        contactEmail: 'admin@meetvia.com',
      };
      const updatedSettings = { ...existing, ...updateData };
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(existing);
      (prisma.siteSettings.update as jest.Mock).mockResolvedValue(updatedSettings);

      const req = { body: updateData } as Request;
      const res = mockRes();

      await updateSiteSettings(req, res, mockNext);

      expect(prisma.siteSettings.update).toHaveBeenCalledWith({
        where: { id: 'settings-1' },
        data: updateData,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedSettings });
    });

    it('should create settings if none exists', async () => {
      const updateData = { contactEmail: 'admin@meetvia.com' };
      const createdSettings = {
        id: 'settings-new',
        siteName: 'Meetvia',
        metaTitle: 'Meetvia',
        contactEmail: 'admin@meetvia.com',
      };
      (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.siteSettings.create as jest.Mock).mockResolvedValue(createdSettings);

      const req = { body: updateData } as Request;
      const res = mockRes();

      await updateSiteSettings(req, res, mockNext);

      expect(prisma.siteSettings.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: createdSettings });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (prisma.siteSettings.findFirst as jest.Mock).mockRejectedValue(error);

      const req = { body: {} } as Request;
      const res = mockRes();

      await updateSiteSettings(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
