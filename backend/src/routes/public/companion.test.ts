import request from 'supertest';

// Mock Prisma client before importing app
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    companionApplication: {
      create: jest.fn(),
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

describe('POST /api/v1/public/companion-application', () => {
  const validBody = {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '9876543210',
    city: 'Agra',
    experience: 'I have 3 years of experience as a tour guide.',
    whyJoin: 'I want to help visitors explore the city safely.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a companion application with status "pending" and return 201', async () => {
    const mockApplication = {
      id: 'cuid-companion-001',
      ...validBody,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.companionApplication.create as jest.Mock).mockResolvedValue(mockApplication);

    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Application submitted successfully');
    expect(res.body.data.id).toBe('cuid-companion-001');
  });

  it('should return 400 when fullName is missing', async () => {
    const { fullName, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.field).toBe('fullName');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send({ ...validBody, email: 'bad-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('email');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 400 when mobile is not a valid 10-digit Indian number', async () => {
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send({ ...validBody, mobile: '12345' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('mobile');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 400 when mobile starts with invalid digit (0-5)', async () => {
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send({ ...validBody, mobile: '5234567890' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('mobile');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 400 when city is missing', async () => {
    const { city, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('city');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 400 when experience is missing', async () => {
    const { experience, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('experience');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 400 when whyJoin is missing', async () => {
    const { whyJoin, ...body } = validBody;
    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.field).toBe('whyJoin');
    expect(prisma.companionApplication.create).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    (prisma.companionApplication.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/v1/public/companion-application')
      .send(validBody);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
