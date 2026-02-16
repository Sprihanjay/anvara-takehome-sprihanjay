import { type Request, type Response, type NextFunction } from 'express';

export function requireSponsor(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'sponsor' || !req.user.sponsorId) {
    res.status(403).json({ error: 'Sponsor access required' });
    return;
  }
  next();
}

export function requirePublisher(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'publisher' || !req.user.publisherId) {
    res.status(403).json({ error: 'Publisher access required' });
    return;
  }
  next();
}
