import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate';
import { submitContactSchema } from '../../validators/contact';
import prisma from '../../config/db';
import { sendTelegramNotification, formatInquiryNotification } from '../../utils/telegram';

const router = Router();

/**
 * POST /api/v1/public/contact
 * Submit a contact inquiry.
 * Validates request body with submitContactSchema, stores in ContactInquiry table with status "new".
 */
router.post(
  '/',
  validate(submitContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inquiry = await prisma.contactInquiry.create({
        data: {
          fullName: req.body.fullName,
          email: req.body.email,
          mobile: req.body.mobile || undefined,
          serviceType: req.body.serviceType,
          preferredDate: req.body.preferredDate ? new Date(req.body.preferredDate) : undefined,
          message: req.body.message,
          safetyConfirmed: req.body.safetyConfirmed,
          status: 'new_status',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          message: 'Inquiry submitted successfully',
          id: inquiry.id,
        },
      });

      // Send Telegram notification (non-blocking)
      sendTelegramNotification(formatInquiryNotification({
        fullName: req.body.fullName,
        email: req.body.email,
        mobile: req.body.mobile,
        serviceType: req.body.serviceType,
        message: req.body.message,
      })).catch(() => {}); // Silently fail — don't block response
    } catch (error) {
      next(error);
    }
  }
);

export default router;
