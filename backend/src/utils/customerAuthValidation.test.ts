import { bearerTokenSchema, otpRequestSchema, otpVerifySchema } from './customerAuthValidation';

describe('customer auth validation', () => {
  test('accepts valid email OTP request', () => {
    const result = otpRequestSchema.validate({ channel: 'email', identifier: 'User@Example.com', purpose: 'login' });
    expect(result.error).toBeUndefined();
    expect(result.value.identifier).toBe('User@Example.com');
  });

  test('accepts valid international mobile OTP request', () => {
    const result = otpRequestSchema.validate({ channel: 'mobile', identifier: '+919876543210' });
    expect(result.error).toBeUndefined();
    expect(result.value.purpose).toBe('login');
  });

  test('rejects malformed email', () => {
    const result = otpRequestSchema.validate({ channel: 'email', identifier: 'not-an-email' });
    expect(result.error).toBeDefined();
  });

  test('rejects malformed mobile', () => {
    const result = otpRequestSchema.validate({ channel: 'mobile', identifier: '12345' });
    expect(result.error).toBeDefined();
  });

  test('accepts exactly six OTP digits', () => {
    expect(otpVerifySchema.validate({ requestId: 'req_123', code: '123456' }).error).toBeUndefined();
  });

  test('rejects non-six-digit OTP', () => {
    expect(otpVerifySchema.validate({ requestId: 'req_123', code: '12345' }).error).toBeDefined();
    expect(otpVerifySchema.validate({ requestId: 'req_123', code: '12345a' }).error).toBeDefined();
  });

  test('rejects empty bearer token', () => {
    expect(bearerTokenSchema.validate('').error).toBeDefined();
  });
});
