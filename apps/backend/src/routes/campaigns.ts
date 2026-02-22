import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireSponsor } from '../middleware/role.js';
import { validateCreateCampaign, validateUpdateCampaign } from '../validators/campaign.validator.js';
import { CampaignRepository } from '../repositories/campaign.repository.js';
import { CampaignService } from '../services/campaign.service.js';

const router: IRouter = Router();

const campaignRepository = new CampaignRepository(prisma);
const campaignService = new CampaignService(campaignRepository);

// GET /api/campaigns - List authenticated sponsor's campaigns
router.get('/', requireSponsor, async (req: Request, res: Response) => {
  const statusFilter = req.query.status as string | undefined;
  const campaigns = await campaignService.list(req.user!.sponsorId!, statusFilter);
  res.json(campaigns);
});

// GET /api/campaigns/:id - Get single campaign (ownership checked in service)
router.get('/:id', requireSponsor, async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const campaign = await campaignService.getById(id, req.user!.sponsorId!);
  res.json(campaign);
});

// POST /api/campaigns - Create new campaign
router.post('/', requireSponsor, validateCreateCampaign, async (req: Request, res: Response) => {
  const { name, description, budget, cpmRate, cpcRate, startDate, endDate, targetCategories, targetRegions, status } =
    req.body;

  const campaign = await campaignService.create(
    {
      name,
      description,
      budget,
      cpmRate,
      cpcRate,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetCategories,
      targetRegions,
      ...(status !== undefined && { status }),
    },
    req.user!.sponsorId!,
  );

  res.status(201).json(campaign);
});

// PUT /api/campaigns/:id - Update campaign
router.put(
  '/:id',
  requireSponsor,
  validateUpdateCampaign,
  async (req: Request, res: Response) => {
    const id = getParam(req.params.id);
    const { name, description, budget, cpmRate, cpcRate, startDate, endDate, targetCategories, targetRegions, status } =
      req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (budget !== undefined) data.budget = budget;
    if (cpmRate !== undefined) data.cpmRate = cpmRate;
    if (cpcRate !== undefined) data.cpcRate = cpcRate;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    if (targetCategories !== undefined) data.targetCategories = targetCategories;
    if (targetRegions !== undefined) data.targetRegions = targetRegions;
    if (status !== undefined) data.status = status;

    const campaign = await campaignService.update(id, data, req.user!.sponsorId!);
    res.json(campaign);
  },
);

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', requireSponsor, async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  await campaignService.delete(id, req.user!.sponsorId!);
  res.status(204).send();
});

export default router;
