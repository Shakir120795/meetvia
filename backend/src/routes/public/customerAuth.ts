import { Router } from 'express';
import {
  requestCustomerOtp,
  revokeCustomerSession,
  verifyCustomerOtp,
  OtpChannel,
} from '../../utils/customerAuth';
import {
  bearerTokenSchema,
  otpRequestSchema,
  otpVerifySchema,
  validationMessages,
} from '../../utils/customerAuthValidation';

const router = Router();

router.post('/otp/request', async (req, res, next) => {
  try {
    const { error, value } = otpRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: validationMessages(error) } });
    }

    const result = await requestCustomerOtp(value.channel as OtpChannel, value.identifier, value.purpose);
    res.status(200).json({
      success: true,
      data: {
        requestId: result.requestId,
        expiresAt: result.expiresAt,
        ...(process.env.NODE_ENV !== 'production' ? { developmentOtp: result.code } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/otp/verify', async (req, res, next) => {
  try {
    const { error, value } = otpVerifySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: validationMessages(error) } });
    }

    const result = await verifyCustomerOtp(value.requestId, value.code);
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        sessionToken: result.sessionToken,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    const status = ['OTP_EXPIRED_OR_INVALID', 'OTP_ATTEMPTS_EXCEEDED', 'OTP_INVALID'].includes(message) ? 401 : 500;
    res.status(status).json({ success: false, error: { code: message, message: 'Unable to verify OTP' } });
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) return res.status(204).send();
    const token = header.slice(7).trim();
    const { error } = bearerTokenSchema.validate(token);
    if (error) return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN' } });

    await revokeCustomerSession(token);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
