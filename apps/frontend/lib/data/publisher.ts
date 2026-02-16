import { headers } from 'next/headers';
import type { AdSlot } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function getPublisherAdSlots(publisherId: string): Promise<AdSlot[]> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') || '';

  const res = await fetch(`${API_URL}/api/ad-slots?publisherId=${publisherId}`, {
    cache: 'no-store',
    headers: { cookie },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch ad slots');
  }

  return res.json();
}
