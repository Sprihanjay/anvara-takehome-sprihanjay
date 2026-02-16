import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';

export function requireOwnership(resourceType: 'campaign' | 'adSlot') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = getParam(req.params.id);

    try {
      if (resourceType === 'campaign') {
        const campaign = await prisma.campaign.findUnique({
          where: { id },
          select: { sponsorId: true },
        });

        if (!campaign) {
          res.status(404).json({ error: 'Campaign not found' });
          return;
        }

        if (campaign.sponsorId !== req.user!.sponsorId) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }
      } else if (resourceType === 'adSlot') {
        const adSlot = await prisma.adSlot.findUnique({
          where: { id },
          select: { publisherId: true },
        });

        if (!adSlot) {
          res.status(404).json({ error: 'Ad slot not found' });
          return;
        }

        if (adSlot.publisherId !== req.user!.publisherId) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }
      }

      next();
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  };
}
