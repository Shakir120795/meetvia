import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const createSchema = Joi.object({ companionId: Joi.string().required(), cityId: Joi.string().allow(null, ''), experienceId: Joi.string().allow(null, ''), startAt: Joi.date().iso().required(), endAt: Joi.date().iso().greater(Joi.ref('startAt')).allow(null), message: Joi.string().trim().max(1000).allow('') });
const statusSchema = Joi.object({ status: Joi.string().valid('ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED').required() });

router.post('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    if (value.companionId === req.customer!.id) return res.status(400).json({ success: false, error: { code: 'SELF_REQUEST', message: 'You cannot request yourself as a companion' } });

    const companion = await prisma.user.findFirst({ where: { id: value.companionId, status: 'ACTIVE', roles: { some: { role: { name: 'COMPANION' } } } } });
    if (!companion) return res.status(404).json({ success: false, error: { code: 'COMPANION_NOT_FOUND' } });

    const request = await prisma.companionRequest.create({ data: { requesterId: req.customer!.id, companionId: value.companionId, cityId: value.cityId || undefined, experienceId: value.experienceId || undefined, startAt: new Date(value.startAt), endAt: value.endAt ? new Date(value.endAt) : undefined, message: value.message || undefined } });
    res.status(201).json({ success: true, data: request });
  } catch (error) { next(error); }
});

router.get('/mine', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const requests = await prisma.companionRequest.findMany({ where: { OR: [{ requesterId: req.customer!.id }, { companionId: req.customer!.id }] }, include: { requester: { include: { profile: true } }, companion: { include: { profile: true } }, city: true, experience: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: requests });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = statusSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const request = await prisma.companionRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND' } });
    const allowed = request.requesterId === req.customer!.id ? ['CANCELLED'] : request.companionId === req.customer!.id ? ['ACCEPTED', 'DECLINED', 'COMPLETED'] : [];
    if (!allowed.includes(value.status)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    const updated = await prisma.companionRequest.update({ where: { id: request.id }, data: { status: value.status } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

export default router;
