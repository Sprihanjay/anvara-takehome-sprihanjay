'use client';

import { useState, useTransition } from 'react';
import { deleteAdSlot } from '../actions';
import { AdSlotForm } from './ad-slot-form';
import { AdSlotCard } from './ad-slot-card';
import type { AdSlot } from '@/lib/types';

interface AdSlotListProps {
  adSlots: AdSlot[];
}

export function AdSlotList({ adSlots }: AdSlotListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this ad slot?')) return;

    startTransition(async () => {
      const result = await deleteAdSlot(id);
      if (result.error) {
        alert(result.error);
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Ad Slots</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-[--color-primary] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Create Ad Slot
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 rounded-lg border border-[--color-border] bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold">New Ad Slot</h3>
          <AdSlotForm onSuccess={() => setShowCreateForm(false)} />
          <button
            onClick={() => setShowCreateForm(false)}
            className="mt-2 text-sm text-[--color-muted] hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {adSlots.length === 0 && !showCreateForm ? (
        <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
          No ad slots yet. Create your first ad slot to start earning.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adSlots.map((slot) => (
            <div key={slot.id}>
              {editingId === slot.id ? (
                <div className="rounded-lg border border-[--color-border] p-4">
                  <h3 className="mb-4 text-lg font-semibold">Edit Ad Slot</h3>
                  <AdSlotForm adSlot={slot} onSuccess={() => setEditingId(null)} />
                  <button
                    onClick={() => setEditingId(null)}
                    className="mt-2 text-sm text-[--color-muted] hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <AdSlotCard
                  adSlot={slot}
                  onEdit={() => setEditingId(slot.id)}
                  onDelete={() => handleDelete(slot.id)}
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
