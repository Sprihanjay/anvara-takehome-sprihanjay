import { prisma, type Campaign, type CampaignStatus } from '../db.js';

type PrismaClient = typeof prisma;

export interface CreateCampaignInput {
  name: string;
  description?: string;
  budget: number;
  cpmRate?: number;
  cpcRate?: number;
  startDate: Date;
  endDate: Date;
  targetCategories?: string[];
  targetRegions?: string[];
  status?: CampaignStatus;
  sponsorId: string;
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  budget?: number;
  cpmRate?: number;
  cpcRate?: number;
  startDate?: Date;
  endDate?: Date;
  targetCategories?: string[];
  targetRegions?: string[];
  status?: CampaignStatus;
}

export class CampaignRepository {
  constructor(private db: PrismaClient) {}

  async findAllBySponsor(sponsorId: string, statusFilter?: string): Promise<Campaign[]> {
    return this.db.campaign.findMany({
      where: {
        sponsorId,
        ...(statusFilter && { status: statusFilter as CampaignStatus }),
      },
      include: {
        sponsor: { select: { id: true, name: true, logo: true } },
        _count: { select: { creatives: true, placements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndSponsor(id: string, sponsorId: string): Promise<Campaign | null> {
    return this.db.campaign.findFirst({
      where: { id, sponsorId },
    });
  }

  async findByIdWithDetails(id: string, sponsorId: string): Promise<Campaign | null> {
    return this.db.campaign.findFirst({
      where: { id, sponsorId },
      include: {
        sponsor: true,
        creatives: true,
        placements: {
          include: {
            adSlot: true,
            publisher: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });
  }

  async create(data: CreateCampaignInput): Promise<Campaign> {
    return this.db.campaign.create({
      data: {
        ...data,
        targetCategories: data.targetCategories ?? [],
        targetRegions: data.targetRegions ?? [],
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });
  }

  async updateById(id: string, data: UpdateCampaignInput): Promise<Campaign> {
    return this.db.campaign.update({
      where: { id },
      data,
      include: {
        sponsor: { select: { id: true, name: true, logo: true } },
        _count: { select: { creatives: true, placements: true } },
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.db.campaign.delete({ where: { id } });
  }
}
