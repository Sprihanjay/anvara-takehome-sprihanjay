import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requirePublisher } from '../middleware/role.js';

const router: IRouter = Router();

// GET /api/publishers - Get the authenticated user's publisher record
router.get('/', requirePublisher, async (req: Request, res: Response) => {
  try {
    const publishers = await prisma.publisher.findMany({
      where: { id: req.user!.publisherId! },
      include: {
        _count: {
          select: { adSlots: true, placements: true },
        },
      },
    });
    res.json(publishers);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ error: 'Failed to fetch publishers' });
  }
});

// GET /api/publishers/:id - Get single publisher (verify ownership)
router.get('/:id', requirePublisher, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    if (id !== req.user!.publisherId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: {
        adSlots: true,
        placements: {
          include: {
            campaign: { select: { name: true, sponsor: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!publisher) {
      res.status(404).json({ error: 'Publisher not found' });
      return;
    }

    res.json(publisher);
  } catch (error) {
    console.error('Error fetching publisher:', error);
    res.status(500).json({ error: 'Failed to fetch publisher' });
  }
});

export default router;
