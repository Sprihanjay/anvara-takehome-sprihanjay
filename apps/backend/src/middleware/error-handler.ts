import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../errors/index.js';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation failed',
      field: err.field,
      message: err.message,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(500).json({ error: 'Internal server error' });
}
