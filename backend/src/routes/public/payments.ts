import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const createSchema = Joi.object({ bookingId: Joi.string().required(), provider: Joi.string().trim().min(2).max(50).required(), idempotencyKey: Joi.string().trim().min(8).max(128).required() });
const statusSchema = Joi.object({ status: Joi.string().valid('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED').required(), providerPaymentId: Joi.string().trim().max(255).allow(null, ''), metadata: Joi.object().unknown(true).allow(null) });

router.post('/intent', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });

    const booking = await prisma.booking.findFirst({ where: { id: value.bookingId, customerId: req.customer!.id }, include: { payment: true } });
    if (!booking) return res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND' } });
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return res.status(409).json({ success: false, error: { code: 'BOOKING_NOT_PAYABLE' } });

    if (booking.payment) {
      if (booking.payment.idempotencyKey === value.idempotencyKey) return res.json({ success: true, data: booking.payment });
      return res.status(409).json({ success: false, error: { code: 'PAYMENT_ALREADY_CREATED' } });
    }

    const payment = await prisma.payment.create({ data: { bookingId: booking.id, customerId: booking.customerId, provider: value.provider, idempotencyKey: value.idempotencyKey, amountMinor: booking.amountMinor, currency: booking.currency, status: 'CREATED' } });
    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
});

router.get('/:id', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const payment = await prisma.payment.findFirst({ where: { id: req.params.id, customerId: req.customer!.id }, include: { booking: true } });
    if (!payment) return res.status(404).json({ success: false, error: { code: 'PAYMENT_NOT_FOUND' } });
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
});

router.post('/:id/status', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = statusSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });

    const payment = await prisma.payment.findFirst({ where: { id: req.params.id, customerId: req.customer!.id }, include: { booking: true } });
    if (!payment) return res.status(404).json({ success: false, error: { code: 'PAYMENT_NOT_FOUND' } });
    if (payment.status === 'PAID' && value.status !== 'REFUNDED') return res.status(409).json({ success: false, error: { code: 'PAYMENT_STATE_LOCKED' } });

    const updated = await prisma.$transaction(async (tx) => {
      const nextPayment = await tx.payment.update({ where: { id: payment.id }, data: { status: value.status, providerPaymentId: value.providerPaymentId || undefined, metadata: value.metadata === undefined ? undefined : value.metadata, paidAt: value.status === 'PAID' ? new Date() : payment.paidAt } });
      if (value.status === 'PAID') await tx.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } });
      if (value.status === 'REFUNDED' || value.status === 'CANCELLED') await tx.booking.update({ where: { id: payment.bookingId }, data: { status: 'CANCELLED' } });
      return nextPayment;
    });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

export default router;
