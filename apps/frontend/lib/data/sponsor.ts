import { headers } from 'next/headers';
import type { Campaign } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function getSponsorCampaigns(): Promise<Campaign[]> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') || '';

  const res = await fetch(`${API_URL}/api/campaigns`, {
    cache: 'no-store',
    headers: { cookie },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  return res.json();
}
