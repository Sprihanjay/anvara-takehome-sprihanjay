'use client';

import { useEffect, useState } from 'react';
import type { UserRole } from '@/types/marketplace.types';
import { getUserRole } from '@/services/auth.service';

export function useUserRole(userId: string | undefined): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      return;
    }

    getUserRole(userId)
      .then((data) => setRole(data?.role ?? null))
      .catch(() => setRole(null));

    return () => setRole(null);
  }, [userId]);

  return role;
}
