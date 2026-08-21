import { Router } from 'express';
import Joi from 'joi';
import {
  requestCustomerOtp,
  revokeCustomerSession,
  verifyCustomerOtp,
  OtpChannel,
} from '../../utils/customerAuth';

const router = Router();

const requestSchema = Joi.object({
  channel: Joi.string().valid('mobile', 'email').required(),
  identifier: Joi.string().trim().min(5).required(),
  purpose: Joi.string().valid('login', 'signup').default('login'),
});

const verifySchema = Joi.object({
  requestId: Joi.string().required(),
  code: Joi.string().pattern(/^\d{6}$/).required(),
});

router.post('/otp/request', async (req, res, next) => {
  try {
    const { error, value } = requestSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: { message: error.message } });

    const result = await requestCustomerOtp(value.channel as OtpChannel, value.identifier, value.purpose);

    // Development-safe response. Production SMS/email delivery will consume this service without exposing the OTP.
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
    const { error, value } = verifySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: { message: error.message } });

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
    res.status(status).json({ success: false, error: { message } });
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const auth = req.header('authorization');
    if (!auth?.startsWith('Bearer ')) return res.status(204).send();
    await revokeCustomerSession(auth.slice(7));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
