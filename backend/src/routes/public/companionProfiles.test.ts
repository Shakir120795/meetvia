import request from 'supertest';

jest.mock('../../config/db', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

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

jest.mock('dotenv', () => ({ config: jest.fn() }));

import app from '../../server';
import prisma from '../../config/db';

describe('GET /api/v1/public/companions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.user.count as jest.Mock).mockResolvedValue(0);
  });

  it('supports city, experience, date and time filters together', async () => {
    const response = await request(app).get('/api/v1/public/companions').query({
      city: 'Agra',
      experience: 'City Walk',
      date: '2026-08-24',
      time: '14:30',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        experiences: {
          some: expect.objectContaining({
            status: 'PUBLISHED',
            city: { cityName: { contains: 'Agra', mode: 'insensitive' } },
            OR: expect.arrayContaining([
              { title: { contains: 'City Walk', mode: 'insensitive' } },
              { category: { contains: 'City Walk', mode: 'insensitive' } },
            ]),
          }),
        },
        availability: {
          some: expect.objectContaining({
            isActive: true,
            weekday: 1,
            startMinute: { lte: 870 },
            endMinute: { gte: 870 },
          }),
        },
      },
    }));
  });

  it('supports text search without requiring optional discovery filters', async () => {
    const response = await request(app).get('/api/v1/public/companions').query({ q: 'Riya' });

    expect(response.status).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([
          { profile: { is: { displayName: { contains: 'Riya', mode: 'insensitive' } } } },
        ]),
      },
    }));
  });

  it('returns an empty result safely for malformed discovery dates', async () => {
    const response = await request(app).get('/api/v1/public/companions').query({ date: 'not-a-date', time: '25:90' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.not.objectContaining({ availability: expect.anything() }),
    }));
  });
});
