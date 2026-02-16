import { type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../errors/index.js';
import { AdSlotType } from '../db.js';

const VALID_TYPES = Object.values(AdSlotType);

export function validateCreateAdSlot(req: Request, _res: Response, next: NextFunction): void {
  const { name, type, basePrice } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('name', 'Name must be at least 3 characters');
  }

  if (!type || !VALID_TYPES.includes(type)) {
    throw new ValidationError('type', `Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (typeof basePrice !== 'number' || basePrice <= 0) {
    throw new ValidationError('basePrice', 'Base price must be a positive number');
  }

  next();
}

export function validateUpdateAdSlot(req: Request, _res: Response, next: NextFunction): void {
  const { name, basePrice, width, height } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 3)) {
    throw new ValidationError('name', 'Name must be at least 3 characters');
  }

  if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice <= 0)) {
    throw new ValidationError('basePrice', 'Base price must be a positive number');
  }

  if (width !== undefined && (typeof width !== 'number' || width <= 0)) {
    throw new ValidationError('width', 'Width must be a positive number');
  }

  if (height !== undefined && (typeof height !== 'number' || height <= 0)) {
    throw new ValidationError('height', 'Height must be a positive number');
  }

  next();
}
