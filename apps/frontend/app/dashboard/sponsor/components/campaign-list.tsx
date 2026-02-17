'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteCampaign } from '../actions';
import { CampaignForm } from './campaign-form';
import { CampaignCard } from './campaign-card';
import type { Campaign } from '@/lib/types';

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    startTransition(async () => {
      const result = await deleteCampaign(id);
      if (result.error) {
        alert(result.error);
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Campaigns</h2>
        <Link
          href="/dashboard/sponsor/new"
          className="rounded-lg bg-[--color-primary] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
          No campaigns yet. Create your first campaign to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id}>
              {editingId === campaign.id ? (
                <div className="rounded-lg border border-[--color-border] p-4">
                  <h3 className="mb-4 text-lg font-semibold">Edit Campaign</h3>
                  <CampaignForm campaign={campaign} />
                  <button
                    onClick={() => setEditingId(null)}
                    className="mt-2 text-sm text-[--color-muted] hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <CampaignCard
                  campaign={campaign}
                  onEdit={() => setEditingId(campaign.id)}
                  onDelete={() => handleDelete(campaign.id)}
                  isDeleting={isPending}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
