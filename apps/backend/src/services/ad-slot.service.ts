import { type AdSlot } from '../db.js';
import { NotFoundError } from '../errors/index.js';
import {
  AdSlotRepository,
  type CreateAdSlotInput,
  type UpdateAdSlotInput,
  type AdSlotFilters,
} from '../repositories/ad-slot.repository.js';

export class AdSlotService {
  constructor(private repository: AdSlotRepository) {}

  async listPublic(filters: AdSlotFilters): Promise<AdSlot[]> {
    return this.repository.findAllPublic(filters);
  }

  async getByIdPublic(id: string): Promise<AdSlot> {
    const adSlot = await this.repository.findByIdPublic(id);
    if (!adSlot) {
      throw new NotFoundError('Ad slot not found');
    }
    return adSlot;
  }

  async create(
    dto: Omit<CreateAdSlotInput, 'publisherId'>,
    publisherId: string,
  ): Promise<AdSlot> {
    return this.repository.create({ ...dto, publisherId });
  }

  async update(
    id: string,
    dto: UpdateAdSlotInput,
    publisherId: string,
  ): Promise<AdSlot> {
    const existing = await this.repository.findByIdAndPublisher(id, publisherId);
    if (!existing) {
      throw new NotFoundError('Ad slot not found');
    }
    return this.repository.updateById(id, dto);
  }

  async delete(id: string, publisherId: string): Promise<void> {
    const existing = await this.repository.findByIdAndPublisher(id, publisherId);
    if (!existing) {
      throw new NotFoundError('Ad slot not found');
    }
    await this.repository.deleteById(id);
  }
}
