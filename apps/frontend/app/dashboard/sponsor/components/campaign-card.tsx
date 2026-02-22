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
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const remaining = budget - spent;
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="bg-white text-black rounded-4xl border shadow-xl p-6 flex flex-col gap-4 border-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg leading-tight">{campaign.name}</h3>
        <span
          className={`font-bold rounded-2xl px-3 py-0.5 text-xs ${statusColors[campaign.status] || 'bg-gray-100'}`}
        >
          {campaign.status}
        </span>
      </div>

      {campaign.description && (
        <p className="text-sm text-[--color-muted] line-clamp-2 -mt-2">{campaign.description}</p>
      )}

      {/* Budget */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[--color-muted]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            Budget
          </span>
          <span className="text-sm font-bold text-black">
            ${spent.toLocaleString()} <span className="font-normal text-[--color-muted]">/ ${budget.toLocaleString()}</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-2 rounded-full bg-black transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-[--color-muted]">
          {Math.round(progress)}% used · ${remaining.toLocaleString()} remaining
        </p>
      </div>

      {/* Campaign Duration */}
      <div className="rounded-2xl bg-[var(--color-background)] px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-black">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Campaign Duration
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-[--color-muted]">Start Date</p>
            <p className="text-sm font-bold text-black">{formatDate(campaign.startDate)}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <div>
            <p className="text-xs text-[--color-muted]">End Date</p>
            <p className="text-sm font-bold text-black">{formatDate(campaign.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onEdit}
          className="font-bold rounded-2xl bg-btn-edit px-5 py-2 text-sm text-btn-edit hover:opacity-90 hover:cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-2xl font-bold bg-btn-delete px-5 py-2 text-sm text-btn-delete hover:opacity-90 disabled:opacity-50 hover:cursor-pointer"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
