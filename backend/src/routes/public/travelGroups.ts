import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const createSchema = Joi.object({ tripId: Joi.string().required(), name: Joi.string().trim().min(2).max(120).required(), description: Joi.string().trim().max(1000).allow('', null), maxMembers: Joi.number().integer().min(2).max(100).default(10) });

router.get('/', async (_req, res, next) => {
  try {
    const groups = await prisma.travelGroup.findMany({ where: { status: 'OPEN' }, include: { trip: true, creator: { include: { profile: true } }, members: { where: { status: 'ACTIVE' } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: groups });
  } catch (error) { next(error); }
});

router.post('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const trip = await prisma.trip.findFirst({ where: { id: value.tripId, ownerId: req.customer!.id } });
    if (!trip) return res.status(403).json({ success: false, error: { code: 'OWNER_REQUIRED' } });
    const group = await prisma.travelGroup.create({ data: { tripId: trip.id, creatorId: req.customer!.id, name: value.name, description: value.description || undefined, maxMembers: value.maxMembers, members: { create: { userId: req.customer!.id, status: 'ACTIVE', joinedAt: new Date() } } }, include: { members: true } });
    res.status(201).json({ success: true, data: group });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const group = await prisma.travelGroup.findUnique({ where: { id: req.params.id }, include: { trip: true, creator: { include: { profile: true } } } });
    if (!group) return res.status(404).json({ success: false, error: { code: 'GROUP_NOT_FOUND' } });
    const members = await prisma.travelGroupMember.findMany({ where: { groupId: group.id }, include: { user: { include: { profile: true } } } });
    res.json({ success: true, data: { ...group, members } });
  } catch (error) { next(error); }
});

router.post('/:id/join', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const group = await prisma.travelGroup.findUnique({ where: { id: req.params.id } });
    if (!group) return res.status(404).json({ success: false, error: { code: 'GROUP_NOT_FOUND' } });
    if (group.status !== 'OPEN') return res.status(409).json({ success: false, error: { code: 'GROUP_NOT_OPEN' } });
    const activeMembers = await prisma.travelGroupMember.findMany({ where: { groupId: group.id, status: 'ACTIVE' } });
    if (activeMembers.some((m) => m.userId === req.customer!.id)) return res.status(409).json({ success: false, error: { code: 'ALREADY_MEMBER' } });
    if (activeMembers.length >= group.maxMembers) return res.status(409).json({ success: false, error: { code: 'GROUP_FULL' } });
    const member = await prisma.travelGroupMember.upsert({ where: { groupId_userId: { groupId: group.id, userId: req.customer!.id } }, create: { groupId: group.id, userId: req.customer!.id, status: 'ACTIVE', joinedAt: new Date() }, update: { status: 'ACTIVE', joinedAt: new Date() } });
    res.status(201).json({ success: true, data: member });
  } catch (error) { next(error); }
});

router.post('/:id/leave', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const member = await prisma.travelGroupMember.findUnique({ where: { groupId_userId: { groupId: req.params.id, userId: req.customer!.id } } });
    if (!member || member.status !== 'ACTIVE') return res.status(404).json({ success: false, error: { code: 'MEMBERSHIP_NOT_FOUND' } });
    await prisma.travelGroupMember.update({ where: { id: member.id }, data: { status: 'LEFT' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
