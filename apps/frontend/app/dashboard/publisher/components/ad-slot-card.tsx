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
    <div className="bg-white text-black rounded-4xl border shadow-xl p-6 flex flex-col gap-4 border-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg leading-tight">{adSlot.name}</h3>
        <span className={`font-bold rounded-2xl px-3 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
          {adSlot.type}
        </span>
      </div>

      {adSlot.description && (
        <p className="text-sm text-[--color-muted] line-clamp-2 -mt-2">{adSlot.description}</p>
      )}

      {/* Price */}
      <div className="rounded-2xl bg-[#F7F8F9] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[--color-muted]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            Base Price
          </span>
          <span className="text-sm font-bold text-black">
            ${Number(adSlot.basePrice).toLocaleString()}<span className="font-normal text-[--color-muted]">/mo</span>
          </span>
        </div>
      </div>

      {/* Availability + Actions */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={
            adSlot.isAvailable
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium'
          }
        >
          {adSlot.isAvailable ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.2" />
              <circle cx="8" cy="8" r="3" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" />
              <rect x="6" y="6" width="4" height="4" fill="currentColor" />
            </svg>
          )}
          {adSlot.isAvailable ? 'Available' : 'Booked'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="font-bold rounded-2xl bg-[#DBEAFF] px-5 py-2 text-sm text-[#165DFC] hover:opacity-90 hover:cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-2xl font-bold bg-[#FFE2E2] px-5 py-2 text-sm text-[#E7000B] hover:opacity-90 disabled:opacity-50 hover:cursor-pointer"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
