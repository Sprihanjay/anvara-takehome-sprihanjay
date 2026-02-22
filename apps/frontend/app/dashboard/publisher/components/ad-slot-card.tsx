'use client';

import type { AdSlot } from '@/lib/types';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NATIVE: 'bg-green-100 text-green-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

interface AdSlotCardProps {
  adSlot: AdSlot;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function AdSlotCard({ adSlot, onEdit, onDelete, isDeleting }: AdSlotCardProps) {
  return (
    <div className="bg-white text-black rounded-4xl border shadow-xl p-6 gap-4 border-gray-50">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-extrabold">{adSlot.name}</h3>
        <span className={`font-bold rounded-2xl px-3 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
          {adSlot.type}
        </span>
      </div>

      {adSlot.description && (
        <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
      )}

      <div className="mb-3 flex items-center justify-between">
        <span
          className={`text-sm font-medium ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
        >
          {adSlot.isAvailable ? 'Available' : 'Booked'}
        </span>
        <span className="font-bold text-[#4057FE]">
          ${Number(adSlot.basePrice).toLocaleString()}/mo
        </span>
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
