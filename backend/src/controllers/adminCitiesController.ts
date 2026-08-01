import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * Get all cities sorted by displayOrder ascending.
 */
export async function getAllCities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new city.
 * Handles duplicate {cityName, state} → 409 Conflict.
 */
export async function createCity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const city = await prisma.city.create({ data: req.body });
    res.status(201).json({ success: true, data: city });
  } catch (error: any) {
    // Handle Prisma unique constraint violation (P2002)
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { message: 'City already exists', code: 'DUPLICATE_ENTRY' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Update a city by ID.
 */
export async function updateCity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const city = await prisma.city.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json({ success: true, data: city });
  } catch (error: any) {
    // Handle Prisma unique constraint violation on update
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { message: 'City already exists', code: 'DUPLICATE_ENTRY' },
      });
      return;
    }
    // Handle record not found (P2025)
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'City not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete a city by ID.
 */
export async function deleteCity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.city.delete({ where: { id } });
    res.status(200).json({ success: true, data: { message: 'City deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'City not found' },
      });
      return;
    }
    next(error);
  }
}
