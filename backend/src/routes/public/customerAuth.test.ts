import request from 'supertest';

const requestCustomerOtp = jest.fn();
const verifyCustomerOtp = jest.fn();
const revokeCustomerSession = jest.fn();

jest.mock('../../utils/customerAuth', () => ({
  requestCustomerOtp,
  verifyCustomerOtp,
  revokeCustomerSession,
  OtpChannel: {},
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

describe('Customer OTP authentication', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requests an email OTP and returns a request id', async () => {
    requestCustomerOtp.mockResolvedValue({ requestId: 'otp-request-1', expiresAt: '2026-08-22T12:00:00.000Z', code: '123456' });

    const res = await request(app)
      .post('/api/v1/public/auth/otp/request')
      .send({ channel: 'email', identifier: 'user@example.com', purpose: 'LOGIN' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requestId).toBe('otp-request-1');
    expect(requestCustomerOtp).toHaveBeenCalledWith('email', 'user@example.com', 'LOGIN');
  });

  it('rejects an invalid OTP request payload', async () => {
    const res = await request(app)
      .post('/api/v1/public/auth/otp/request')
      .send({ channel: 'email', identifier: 'not-an-email', purpose: 'LOGIN' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(requestCustomerOtp).not.toHaveBeenCalled();
  });

  it('verifies an OTP and returns a customer session', async () => {
    const user = { id: 'user-1', email: 'user@example.com', mobile: null, status: 'ACTIVE', profile: null };
    verifyCustomerOtp.mockResolvedValue({ user, sessionToken: 'session-token', expiresAt: '2026-08-23T12:00:00.000Z' });

    const res = await request(app)
      .post('/api/v1/public/auth/otp/verify')
      .send({ requestId: 'otp-request-1', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe('user-1');
    expect(res.body.data.sessionToken).toBe('session-token');
    expect(verifyCustomerOtp).toHaveBeenCalledWith('otp-request-1', '123456');
  });

  it('returns 401 when OTP verification fails', async () => {
    verifyCustomerOtp.mockRejectedValue(new Error('OTP_INVALID'));

    const res = await request(app)
      .post('/api/v1/public/auth/otp/verify')
      .send({ requestId: 'otp-request-1', code: '000000' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('accepts logout without a bearer token as an idempotent operation', async () => {
    const res = await request(app).post('/api/v1/public/auth/logout');

    expect(res.status).toBe(204);
    expect(revokeCustomerSession).not.toHaveBeenCalled();
  });

  it('revokes a valid bearer session on logout', async () => {
    revokeCustomerSession.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/v1/public/auth/logout')
      .set('Authorization', 'Bearer session-token');

    expect(res.status).toBe(204);
    expect(revokeCustomerSession).toHaveBeenCalledWith('session-token');
  });
});
