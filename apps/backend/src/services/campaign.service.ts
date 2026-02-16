import { type Campaign } from '../db.js';
import { NotFoundError } from '../errors/index.js';
import {
  CampaignRepository,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from '../repositories/campaign.repository.js';

export class CampaignService {
  constructor(private repository: CampaignRepository) {}

  async list(sponsorId: string, statusFilter?: string): Promise<Campaign[]> {
    return this.repository.findAllBySponsor(sponsorId, statusFilter);
  }

  async getById(id: string, sponsorId: string): Promise<Campaign> {
    const campaign = await this.repository.findByIdWithDetails(id, sponsorId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }
    return campaign;
  }

  async create(
    dto: Omit<CreateCampaignInput, 'sponsorId'>,
    sponsorId: string,
  ): Promise<Campaign> {
    return this.repository.create({ ...dto, sponsorId });
  }

  async update(
    id: string,
    dto: UpdateCampaignInput,
    sponsorId: string,
  ): Promise<Campaign> {
    const existing = await this.repository.findByIdAndSponsor(id, sponsorId);
    if (!existing) {
      throw new NotFoundError('Campaign not found');
    }
    return this.repository.updateById(id, dto);
  }

  async delete(id: string, sponsorId: string): Promise<void> {
    const existing = await this.repository.findByIdAndSponsor(id, sponsorId);
    if (!existing) {
      throw new NotFoundError('Campaign not found');
    }
    await this.repository.deleteById(id);
  }
}
