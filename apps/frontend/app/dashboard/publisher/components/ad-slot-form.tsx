'use client';

import { useActionState, useEffect, useState } from 'react';
import { createAdSlot, updateAdSlot, type ActionResult } from '../actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { AdSlot } from '@/lib/types';
import { AD_SLOT_TYPES } from '@/constants/ad-slot';

interface AdSlotFormProps {
  adSlot?: AdSlot;
  onCancel?: () => void;
  onSave?: (updated: AdSlot) => void;
}

const initialState: ActionResult = {};

export function AdSlotForm({ adSlot, onCancel, onSave }: AdSlotFormProps) {
  const isEdit = !!adSlot;
  const [isAvailable, setIsAvailable] = useState(adSlot?.isAvailable ?? true);

  const boundAction = isEdit ? updateAdSlot.bind(null, adSlot.id) : createAdSlot;

  const [state, formAction] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) {
      if (onSave && state.updatedSlot) {
        onSave(state.updatedSlot as unknown as AdSlot);
      }
      if (onCancel) onCancel();
    }
  }, [state.success, state.updatedSlot, onSave, onCancel]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="adslot-name" className="block text-md font-medium">
          Name
        </label>
        <input
          type="text"
          id="adslot-name"
          name="name"
          defaultValue={adSlot?.name}
          required
          minLength={3}
          placeholder="Enter your ad slot name"
          className="py-3 mt-2 block w-full rounded-xl bg-[var(--color-background)] px-4 text-sm border border-transparent focus:outline-none focus:border-2 focus:invalid:border-red-500 focus:valid:border-black"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="adslot-description" className="block text-md font-medium">
          Description
        </label>
        <textarea
          id="adslot-description"
          name="description"
          defaultValue={adSlot?.description ?? ''}
          rows={2}
          className="py-3 mt-2 block w-full rounded-xl bg-[var(--color-background)] px-4 text-sm border border-transparent focus:outline-none focus:border-2 focus:invalid:border-red-500 focus:valid:border-black"
        />
      </div>

      <div>
        <label htmlFor="adslot-position" className="block text-md font-medium">
          Position
        </label>
        <input
          type="text"
          id="adslot-position"
          name="position"
          defaultValue={adSlot?.position ?? ''}
          placeholder="e.g. Header, Sidebar, Footer, In-article"
          className="py-3 mt-2 block w-full rounded-xl bg-[var(--color-background)] px-4 text-sm border border-transparent focus:outline-none focus:border-2 focus:valid:border-black"
        />
      </div>

      {!isEdit && (
        <div>
          <label htmlFor="adslot-type" className="block text-md font-medium">
            Type
          </label>
          <select
            id="adslot-type"
            name="type"
            required
            className="mt-2 block w-full rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-3 text-sm focus:border-2 focus:border-black focus:outline-none"
          >
            <option value="">Select type...</option>
            {AD_SLOT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {state.fieldErrors?.type && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.type}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="adslot-basePrice" className="block text-md font-medium">
          Base Price ($)
        </label>
        <input
          type="number"
          id="adslot-basePrice"
          name="basePrice"
          defaultValue={adSlot ? Number(adSlot.basePrice) : undefined}
          required
          min="0.01"
          step="0.01"
          placeholder="0.00"
          className="mt-2 block w-full rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-3 text-sm focus:outline-none focus:border-2 focus:invalid:border-red-500 focus:valid:border-black"
        />
        {state.fieldErrors?.basePrice && (
          <p className="mt-2 text-xs text-red-600">{state.fieldErrors.basePrice}</p>
        )}
      </div>

      {isEdit && (
        <div className="flex items-center gap-2">
          <input type="hidden" name="isAvailable" value={isAvailable ? 'on' : 'off'} />
          <input
            type="checkbox"
            id="adslot-isAvailable"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
          />
          <label htmlFor="adslot-isAvailable" className="text-sm font-medium">
            Available for booking
          </label>
        </div>
      )}

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-black hover:text-[var(--text-primary)] transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
        )}
        <SubmitButton
          label={isEdit ? 'Save Changes' : 'Create Ad Slot'}
          pendingLabel={isEdit ? 'Saving...' : 'Creating...'}
          className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-btn-primary-hover transition-colors disabled:opacity-50 hover:cursor-pointer"
        />
      </div>
    </form>
  );
}
