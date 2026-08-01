import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate';
import { submitCompanionSchema } from '../../validators/companion';
import prisma from '../../config/db';
import { sendTelegramNotification, formatCompanionNotification } from '../../utils/telegram';

const router = Router();

/**
 * POST /api/v1/public/companion-application
 * Submit a companion application.
 * Validates request body with submitCompanionSchema, stores in CompanionApplication table with status "pending".
 */
router.post(
  '/',
  validate(submitCompanionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const application = await prisma.companionApplication.create({
        data: {
          fullName: req.body.fullName,
          email: req.body.email,
          mobile: req.body.mobile,
          city: req.body.city,
          experience: req.body.experience,
          whyJoin: req.body.whyJoin,
          status: 'pending',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          message: 'Application submitted successfully',
          id: application.id,
        },
      });

      // Send Telegram notification (non-blocking)
      sendTelegramNotification(formatCompanionNotification({
        fullName: req.body.fullName,
        email: req.body.email,
        mobile: req.body.mobile,
        city: req.body.city,
      })).catch(() => {}); // Silently fail
    } catch (error) {
      next(error);
    }
  }
);

export default router;
