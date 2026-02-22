'use client';

import type { Campaign } from '@/lib/types';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function CampaignCard({ campaign, onEdit, onDelete, isDeleting }: CampaignCardProps) {
  const progress =
    campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;

  return (
    <div className="bg-white text-black rounded-4xl border shadow-xl p-6 gap-4 border-gray-50">
      <div className="mb-2 flex items-start justify-between">
        <h3 className=" font-extrabold">{campaign.name}</h3>
        <span
          className={`font-bold rounded-2xl px-3 py-0.5 text-xs ${statusColors[campaign.status] || 'bg-gray-100'}`}
        >
          {campaign.status}
        </span>
      </div>

      {campaign.description && (
        <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{campaign.description}</p>
      )}

      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span className="flex items-center text-[--color-muted]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet h-3 w-3 text-blue-600 mr-1" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
            Budget
          </span>
          <span>
            ${Number(campaign.spent).toLocaleString()} / ${Number(campaign.budget).toLocaleString()}
          </span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-[--color-primary]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mb-3 text-xs text-[--color-muted]">
        {new Date(campaign.startDate).toLocaleDateString()} -{' '}
        {new Date(campaign.endDate).toLocaleDateString()}
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onEdit}
          className="font-bold rounded-2xl bg-[#DBEAFF] px-3 py-1 text-xs text-[#165DFC] hover:opacity-90 hover:cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-2xl font-bold bg-[#FFE2E2] px-3 py-1 text-xs text-[#E7000B] hover:opacity-90 disabled:opacity-50 hover:cursor-pointer"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
