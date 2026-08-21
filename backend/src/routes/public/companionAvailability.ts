import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const slotSchema = Joi.object({ weekday: Joi.number().integer().min(0).max(6).required(), startMinute: Joi.number().integer().min(0).max(1439).required(), endMinute: Joi.number().integer().min(1).max(1440).required(), timezone: Joi.string().trim().min(1).max(64).default('UTC'), isActive: Joi.boolean().default(true) }).custom((value, helpers) => value.endMinute <= value.startMinute ? helpers.error('any.invalid') : value);

router.get('/:companionId', async (req, res, next) => {
  try {
    const slots = await prisma.companionAvailability.findMany({ where: { companionId: req.params.companionId, isActive: true }, orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }] });
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
});

router.put('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = Joi.array().items(slotSchema).min(1).max(50).validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const hasCompanionRole = req.customer!.roles.includes('COMPANION');
    if (!hasCompanionRole) return res.status(403).json({ success: false, error: { code: 'COMPANION_ROLE_REQUIRED' } });

    const slots = value as Array<{ weekday: number; startMinute: number; endMinute: number; timezone: string; isActive: boolean }>;
    await prisma.$transaction(async (tx) => {
      await tx.companionAvailability.deleteMany({ where: { companionId: req.customer!.id } });
      await tx.companionAvailability.createMany({ data: slots.map((slot) => ({ ...slot, companionId: req.customer!.id })) });
    });
    const saved = await prisma.companionAvailability.findMany({ where: { companionId: req.customer!.id }, orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }] });
    res.json({ success: true, data: saved });
  } catch (error) { next(error); }
});

export default router;
