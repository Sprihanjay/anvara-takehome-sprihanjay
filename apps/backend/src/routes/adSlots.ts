import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSponsor, requirePublisher } from '../middleware/role.js';
import { validateCreateAdSlot, validateUpdateAdSlot } from '../validators/ad-slot.validator.js';
import { AdSlotRepository } from '../repositories/ad-slot.repository.js';
import { AdSlotService } from '../services/ad-slot.service.js';

const router: IRouter = Router();

const adSlotRepository = new AdSlotRepository(prisma);
const adSlotService = new AdSlotService(adSlotRepository);

// GET /api/ad-slots - List available ad slots (public)
router.get('/', async (req: Request, res: Response) => {
  const adSlots = await adSlotService.listPublic({
    publisherId: req.query.publisherId as string | undefined,
    type: req.query.type as string | undefined,
    available: req.query.available as string | undefined,
  });
  res.json(adSlots);
});

// GET /api/ad-slots/:id - Get single ad slot with details (public)
router.get('/:id', async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const adSlot = await adSlotService.getByIdPublic(id);
  res.json(adSlot);
});

// POST /api/ad-slots - Create new ad slot (publisher only)
router.post(
  '/',
  requireAuth,
  requirePublisher,
  validateCreateAdSlot,
  async (req: Request, res: Response) => {
    const { name, description, type, position, width, height, basePrice, cpmFloor } = req.body;

    const adSlot = await adSlotService.create(
      { name, description, type, position, width, height, basePrice, cpmFloor },
      req.user!.publisherId!,
    );

    res.status(201).json(adSlot);
  },
);

// PUT /api/ad-slots/:id - Update ad slot (publisher only, ownership checked in service)
router.put(
  '/:id',
  requireAuth,
  requirePublisher,
  validateUpdateAdSlot,
  async (req: Request, res: Response) => {
    const id = getParam(req.params.id);
    const { name, description, position, width, height, basePrice, cpmFloor, isAvailable } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (position !== undefined) data.position = position;
    if (width !== undefined) data.width = width;
    if (height !== undefined) data.height = height;
    if (basePrice !== undefined) data.basePrice = basePrice;
    if (cpmFloor !== undefined) data.cpmFloor = cpmFloor;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

    const adSlot = await adSlotService.update(id, data, req.user!.publisherId!);
    res.json(adSlot);
  },
);

// DELETE /api/ad-slots/:id - Delete ad slot (publisher only, ownership checked in service)
router.delete('/:id', requireAuth, requirePublisher, async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  await adSlotService.delete(id, req.user!.publisherId!);
  res.status(204).send();
});

// POST /api/ad-slots/:id/book - Book an ad slot (sponsor only)
router.post('/:id/book', requireAuth, requireSponsor, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { message } = req.body;

    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({ error: 'Ad slot is no longer available' });
      return;
    }

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    console.log(
      `Ad slot ${id} booked by sponsor ${req.user!.sponsorId}. Message: ${message || 'None'}`,
    );

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({ error: 'Failed to book ad slot' });
  }
});

// POST /api/ad-slots/:id/unbook - Reset ad slot to available (requires auth)
router.post('/:id/unbook', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({ error: 'Failed to unbook ad slot' });
  }
});

export default router;
