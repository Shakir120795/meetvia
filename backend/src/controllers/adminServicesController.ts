import { Request, Response, NextFunction } from 'express';
import { getRequiredStringParam } from '../utils/params';
import prisma from '../config/db';

/**
 * Get all services (including hidden), sorted by displayOrder ascending.
 */
export async function getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new service.
 */
export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await prisma.service.create({ data: req.body });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a service by ID.
 */
export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getRequiredStringParam(req.params.id, "ID");
    const service = await prisma.service.update({
      where: { id: getRequiredStringParam(req.params.id, "ID") },
      data: req.body,
    });
    res.status(200).json({ success: true, data: service });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Service not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete a service by ID.
 */
export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getRequiredStringParam(req.params.id, "ID");
    await prisma.service.delete({ where: { id: getRequiredStringParam(req.params.id, "ID") } });
    res.status(200).json({ success: true, data: { message: 'Service deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Service not found' },
      });
      return;
    }
    next(error);
  }
}
