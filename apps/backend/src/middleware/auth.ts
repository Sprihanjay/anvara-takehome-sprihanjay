import { type Request, type Response, type NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import { prisma } from '../db.js';

export interface UserContext {
  id: string;
  email: string;
  role: 'sponsor' | 'publisher' | null;
  sponsorId?: string;
  publisherId?: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (sponsor) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: 'sponsor',
        sponsorId: sponsor.id,
      };
      next();
      return;
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: publisher ? 'publisher' : null,
      publisherId: publisher?.id,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}
