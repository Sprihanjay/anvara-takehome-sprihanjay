'use client';

import { useEffect, useState } from 'react';
import { getCampaigns } from '@/lib/api';
import { authClient } from '@/auth-client';
import { getUserRole } from '@/lib/auth-helpers';
import type { Campaign } from '@/lib/types';
import { CampaignCard } from './campaign-card';

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function loadCampaigns() {
      if (!session?.user?.id) return;

      try {
        const roleData = await getUserRole(session.user.id);

        if (roleData.sponsorId) {
          const data = await getCampaigns(roleData.sponsorId);
          setCampaigns(data);
        } else {
          setCampaigns([]);
        }
      } catch {
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [session?.user?.id]);

  if (loading) {
    return <div className="py-8 text-center text-[--color-muted]">Loading campaigns...</div>;
  }

  if (error) {
    return <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
        No campaigns yet. Create your first campaign to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
