import request from 'supertest';

const mockSendTelegramNotification = jest.fn();
const mockFormatInquiryNotification = jest.fn();

// Mock Prisma client before importing app
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    contactInquiry: {
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock('../../utils/telegram', () => ({
  __esModule: true,
  sendTelegramNotification: (...args: any[]) => mockSendTelegramNotification(...args),
  formatInquiryNotification: (...args: any[]) => mockFormatInquiryNotification(...args),
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

describe('POST /api/v1/public/contact', () => {
  const validBody = {
    fullName: 'John Doe',
    email: 'john@example.com',
    serviceType: 'City Exploration',
    message: 'I would like to book a tour.',
    safetyConfirmed: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatInquiryNotification.mockReturnValue('formatted-test-message');
    mockSendTelegramNotification.mockResolvedValue(undefined);
  });

  it('should create a contact inquiry with status "new_status" and return 201', async () => {
    const mockInquiry = {
      id: 'cuid-contact-001',
      ...validBody,
      status: 'new_status',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.contactInquiry.create as jest.Mock).mockResolvedValue(mockInquiry);

    const res = await request(app)
      .post('/api/v1/public/contact')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Inquiry submitted successfully');
    expect(res.body.data.id).toBe('cuid-contact-001');
    expect(mockFormatInquiryNotification).toHaveBeenCalledTimes(1);
    expect(mockSendTelegramNotification).toHaveBeenCalledWith('formatted-test-message');
  });

  it('should accept optional fields (mobile, preferredDate)', async () => {
    const mockInquiry = {
      id: 'cuid-contact-002',
      ...validBody,
      mobile: '+91 9876543210',
      preferredDate: '2025-03-15',
      status: 'new_status',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.contactInquiry.create as jest.Mock).mockResolvedValue(mockInquiry);

    const res = await request(app)
      .post('/api/v1/public/contact')
      .send({
        ...validBody,
        mobile: '+91 9876543210',
        preferredDate: '2025-03-15',
      });

    expect(res.status).toBe(201);
    expect(prisma.contactInquiry.create).toHaveBeenCalled();
  });

  it('should return 400 when fullName is missing', async () => {
    const { fullName, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.field).toBe('fullName');
    expect(prisma.contactInquiry.create).not.toHaveBeenCalled();
    expect(mockSendTelegramNotification).not.toHaveBeenCalled();
  });

  it('should return 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('email');
    expect(prisma.contactInquiry.create).not.toHaveBeenCalled();
  });

  it('should return 400 when safetyConfirmed is false', async () => {
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send({ ...validBody, safetyConfirmed: false });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('safetyConfirmed');
    expect(prisma.contactInquiry.create).not.toHaveBeenCalled();
  });

  it('should return 400 when message is missing', async () => {
    const { message, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('message');
    expect(prisma.contactInquiry.create).not.toHaveBeenCalled();
  });

  it('should return 400 when serviceType is missing', async () => {
    const { serviceType, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('serviceType');
    expect(prisma.contactInquiry.create).not.toHaveBeenCalled();
  });

  it('should keep the successful response when Telegram notification fails', async () => {
    (prisma.contactInquiry.create as jest.Mock).mockResolvedValue({
      id: 'cuid-contact-telegram-failure',
      ...validBody,
      status: 'new_status',
    });
    mockSendTelegramNotification.mockRejectedValueOnce(new Error('Telegram unavailable'));

    const res = await request(app)
      .post('/api/v1/public/contact')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('cuid-contact-telegram-failure');
    expect(prisma.contactInquiry.create).toHaveBeenCalledTimes(1);
    expect(mockSendTelegramNotification).toHaveBeenCalledTimes(1);
  });

  it('should return 500 on database error and must not send Telegram', async () => {
    (prisma.contactInquiry.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/v1/public/contact')
      .send(validBody);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(mockSendTelegramNotification).not.toHaveBeenCalled();
  });
});
