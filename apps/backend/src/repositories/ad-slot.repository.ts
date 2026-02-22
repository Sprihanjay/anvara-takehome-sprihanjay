import { prisma, type AdSlot, type AdSlotType } from '../db.js';

type PrismaClient = typeof prisma;

export interface CreateAdSlotInput {
  name: string;
  description?: string;
  type: AdSlotType;
  position?: string;
  width?: number;
  height?: number;
  basePrice: number;
  cpmFloor?: number;
  publisherId: string;
}

export interface UpdateAdSlotInput {
  name?: string;
  description?: string;
  position?: string;
  width?: number;
  height?: number;
  basePrice?: number;
  cpmFloor?: number;
  isAvailable?: boolean;
}

export interface AdSlotFilters {
  publisherId?: string;
  type?: string;
  available?: string;
}

export class AdSlotRepository {
  constructor(private db: PrismaClient) {}

  async findAllPublic(filters: AdSlotFilters): Promise<AdSlot[]> {
    const { publisherId, type, available } = filters;

    return this.db.adSlot.findMany({
      where: {
        ...(publisherId && { publisherId }),
        ...(type && { type: type as AdSlotType }),
        ...(available === 'true' && { isAvailable: true }),
      },
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true, isVerified: true } },
        _count: { select: { placements: true } },
      },
      orderBy: { basePrice: 'desc' },
    });
  }

  async findByIdPublic(id: string): Promise<AdSlot | null> {
    return this.db.adSlot.findUnique({
      where: { id },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });
  }

  async findByIdAndPublisher(id: string, publisherId: string): Promise<AdSlot | null> {
    return this.db.adSlot.findFirst({
      where: { id, publisherId },
    });
  }

  async create(data: CreateAdSlotInput): Promise<AdSlot> {
    return this.db.adSlot.create({
      data,
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });
  }

  async updateById(id: string, data: UpdateAdSlotInput): Promise<AdSlot> {
    return this.db.adSlot.update({
      where: { id },
      data,
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.db.adSlot.delete({ where: { id } });
  }
}
