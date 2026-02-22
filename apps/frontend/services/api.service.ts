import type { Campaign, AdSlot, Placement, DashboardStats } from '@/types/marketplace.types';
import { API_URL } from '@/constants/api';

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error('API request failed');
  if (res.status === 204) return {} as T;
  return res.json();
}

export const getCampaigns = (sponsorId?: string) =>
  api<Campaign[]>(
    sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns'
  );
export const getCampaign = (id: string) =>
  api<Campaign>(`/api/campaigns/${id}`);
export const createCampaign = (data: Partial<Campaign>) =>
  api<Campaign>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getAdSlots = (publisherId?: string) =>
  api<AdSlot[]>(
    publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots'
  );
export const getAdSlot = (id: string) =>
  api<AdSlot>(`/api/ad-slots/${id}`);
export const createAdSlot = (data: Partial<AdSlot>) =>
  api<AdSlot>('/api/ad-slots', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const deleteAdSlot = (id: string) =>
  api<void>(`/api/ad-slots/${id}`, { method: 'DELETE' });

export const getPlacements = () => api<Placement[]>('/api/placements');
export const createPlacement = (data: Partial<Placement>) =>
  api<Placement>('/api/placements', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getStats = () => api<DashboardStats>('/api/dashboard/stats');
