import { type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../errors/index.js';
import { CampaignStatus } from '../db.js';

const VALID_STATUSES = Object.values(CampaignStatus);

export function validateCreateCampaign(req: Request, _res: Response, next: NextFunction): void {
  const { name, budget, startDate, endDate, status } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('name', 'Name must be at least 3 characters');
  }

  if (typeof budget !== 'number' || budget < 0) {
    throw new ValidationError('budget', 'Budget must be a non-negative number');
  }

  if (!startDate) {
    throw new ValidationError('startDate', 'Start date is required');
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    throw new ValidationError('startDate', 'Invalid start date');
  }

  if (!endDate) {
    throw new ValidationError('endDate', 'End date is required');
  }

  const end = new Date(endDate);
  if (isNaN(end.getTime())) {
    throw new ValidationError('endDate', 'Invalid end date');
  }

  if (end <= start) {
    throw new ValidationError('endDate', 'End date must be after start date');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw new ValidationError('status', `Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  next();
}

export function validateUpdateCampaign(req: Request, _res: Response, next: NextFunction): void {
  const { name, budget, startDate, endDate, status } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 3)) {
    throw new ValidationError('name', 'Name must be at least 3 characters');
  }

  if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
    throw new ValidationError('budget', 'Budget must be a non-negative number');
  }

  if (startDate !== undefined) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new ValidationError('startDate', 'Invalid start date');
    }
  }

  if (endDate !== undefined) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      throw new ValidationError('endDate', 'Invalid end date');
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      throw new ValidationError('endDate', 'End date must be after start date');
    }
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw new ValidationError('status', `Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  next();
}
