import type { UserRole } from '@/types/marketplace.types';
import { API_URL } from '@/constants/api';

export interface RoleInfo {
  role: UserRole | null;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

export async function getUserRole(userId: string): Promise<RoleInfo | null> {
  const res = await fetch(`${API_URL}/api/auth/role/${userId}`);
  if (!res.ok) return null;
  return res.json();
}
