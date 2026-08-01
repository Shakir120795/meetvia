import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from './dashboardController';

// Mock Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    service: { count: jest.fn() },
    contactInquiry: { count: jest.fn() },
    companionApplication: { count: jest.fn() },
    fAQ: { count: jest.fn() },
    testimonial: { count: jest.fn() },
    city: { count: jest.fn() },
    media: { count: jest.fn() },
  },
}));

import prisma from '../config/db';

describe('Dashboard Controller - getDashboardStats', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {};
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return all dashboard stats with status 200', async () => {
    (prisma.service.count as jest.Mock).mockResolvedValue(6);
    (prisma.contactInquiry.count as jest.Mock)
      .mockResolvedValueOnce(10) // total inquiries
      .mockResolvedValueOnce(3); // new inquiries
    (prisma.companionApplication.count as jest.Mock).mockResolvedValue(5);
    (prisma.fAQ.count as jest.Mock).mockResolvedValue(8);
    (prisma.testimonial.count as jest.Mock).mockResolvedValue(4);
    (prisma.city.count as jest.Mock).mockResolvedValue(2);
    (prisma.media.count as jest.Mock).mockResolvedValue(15);

    await getDashboardStats(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: {
        services: 6,
        inquiries: 10,
        newInquiries: 3,
        applications: 5,
        faqs: 8,
        testimonials: 4,
        activeCities: 2,
        media: 15,
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call contactInquiry.count with status "new_status" for newInquiries', async () => {
    (prisma.service.count as jest.Mock).mockResolvedValue(0);
    (prisma.contactInquiry.count as jest.Mock)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    (prisma.companionApplication.count as jest.Mock).mockResolvedValue(0);
    (prisma.fAQ.count as jest.Mock).mockResolvedValue(0);
    (prisma.testimonial.count as jest.Mock).mockResolvedValue(0);
    (prisma.city.count as jest.Mock).mockResolvedValue(0);
    (prisma.media.count as jest.Mock).mockResolvedValue(0);

    await getDashboardStats(mockReq as Request, mockRes as Response, mockNext);

    expect(prisma.contactInquiry.count).toHaveBeenCalledWith({ where: { status: 'new_status' } });
  });

  it('should call city.count with status "active" for activeCities', async () => {
    (prisma.service.count as jest.Mock).mockResolvedValue(0);
    (prisma.contactInquiry.count as jest.Mock)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    (prisma.companionApplication.count as jest.Mock).mockResolvedValue(0);
    (prisma.fAQ.count as jest.Mock).mockResolvedValue(0);
    (prisma.testimonial.count as jest.Mock).mockResolvedValue(0);
    (prisma.city.count as jest.Mock).mockResolvedValue(0);
    (prisma.media.count as jest.Mock).mockResolvedValue(0);

    await getDashboardStats(mockReq as Request, mockRes as Response, mockNext);

    expect(prisma.city.count).toHaveBeenCalledWith({ where: { status: 'active' } });
  });

  it('should call next with error when a query fails', async () => {
    const error = new Error('Database connection failed');
    (prisma.service.count as jest.Mock).mockRejectedValue(error);
    (prisma.contactInquiry.count as jest.Mock).mockResolvedValue(0);
    (prisma.companionApplication.count as jest.Mock).mockResolvedValue(0);
    (prisma.fAQ.count as jest.Mock).mockResolvedValue(0);
    (prisma.testimonial.count as jest.Mock).mockResolvedValue(0);
    (prisma.city.count as jest.Mock).mockResolvedValue(0);
    (prisma.media.count as jest.Mock).mockResolvedValue(0);

    await getDashboardStats(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should return zero counts when tables are empty', async () => {
    (prisma.service.count as jest.Mock).mockResolvedValue(0);
    (prisma.contactInquiry.count as jest.Mock)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    (prisma.companionApplication.count as jest.Mock).mockResolvedValue(0);
    (prisma.fAQ.count as jest.Mock).mockResolvedValue(0);
    (prisma.testimonial.count as jest.Mock).mockResolvedValue(0);
    (prisma.city.count as jest.Mock).mockResolvedValue(0);
    (prisma.media.count as jest.Mock).mockResolvedValue(0);

    await getDashboardStats(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: {
        services: 0,
        inquiries: 0,
        newInquiries: 0,
        applications: 0,
        faqs: 0,
        testimonials: 0,
        activeCities: 0,
        media: 0,
      },
    });
  });
});
