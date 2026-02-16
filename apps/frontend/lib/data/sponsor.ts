import type { Campaign } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function getSponsorCampaigns(sponsorId: string): Promise<Campaign[]> {
  const res = await fetch(`${API_URL}/api/campaigns?sponsorId=${sponsorId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  return res.json();
}
