'use client';

import { useActionState, useEffect } from 'react';
import { createCampaign, updateCampaign, type ActionResult } from '../actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import type { Campaign } from '@/lib/types';
import { CAMPAIGN_STATUSES } from '@/constants/campaign';

interface CampaignFormProps {
  campaign?: Campaign;
  onCancel?: () => void;
}

const initialState: ActionResult = {};

function toDateInputValue(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

export function CampaignForm({ campaign, onCancel }: CampaignFormProps) {
  const isEdit = !!campaign;

  const boundAction = isEdit ? updateCampaign.bind(null, campaign.id) : createCampaign;

  const [state, formAction] = useActionState(boundAction, initialState);

  // Close the form after successful save
  useEffect(() => {
    if (state.success && onCancel) {
      onCancel();
    }
  }, [state.success, onCancel]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="campaign-name" className="block text-md font-medium">
          Campaign Name
        </label>
        <input
          type="text"
          id="campaign-name"
          name="name"
          defaultValue={campaign?.name}
          required
          minLength={3}
          placeholder="Enter your campaign name"
          className="py-3 mt-2 block w-full rounded-xl bg-[var(--bg-input)] px-4 text-sm border border-transparent focus:outline-none focus:border-2 focus:invalid:border-red-500 focus:valid:border-black"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="campaign-description" className="block text-md font-medium">
          Description
        </label>
        <textarea
          id="campaign-description"
          name="description"
          defaultValue={campaign?.description ?? ''}
          rows={2}
          className="py-3 mt-2 block w-full rounded-xl bg-[var(--bg-input)] px-4 text-sm border border-transparent focus:outline-none focus:border-2 focus:invalid:border-red-500 focus:valid:border-black"
        />
      </div>

      <div>
        <label htmlFor="campaign-budget" className="block text-md font-medium">
          Budget ($)
        </label>
        <input
          type="number"
          id="campaign-budget"
          name="budget"
          defaultValue={campaign ? Number(campaign.budget) : undefined}
          required
          min="0"
          step="0.01"
          placeholder='25000'
          className="mt-2 block w-full rounded-xl border border-transparent bg-[var(--bg-input)] px-4 py-3 text-sm focus:outline-none focus:border-2 focus:invalid:border-red-500 focus:valid:border-black"
        />
        {state.fieldErrors?.budget && (
          <p className="mt-2 text-xs text-red-600">{state.fieldErrors.budget}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="campaign-startDate" className="block text-md font-medium">
            Start Date
          </label>
          <input
            type="date"
            id="campaign-startDate"
            name="startDate"
            defaultValue={campaign ? toDateInputValue(campaign.startDate) : undefined}
            required
            className="mt-2 block w-full rounded-xl border border-transparent bg-[var(--bg-input)] px-4 py-3 text-sm focus:border-2 focus:outline-none focus:invalid:border-red-500 focus:valid:border-black text-gray-500 valid:text-black"
          />
          {state.fieldErrors?.startDate && (
            <p className="mt-2 text-xs text-red-600">{state.fieldErrors.startDate}</p>
          )}
        </div>
        <div>
          <label htmlFor="campaign-endDate" className="block text-md font-medium">
            End Date
          </label>
          <input
            type="date"
            id="campaign-endDate"
            name="endDate"
            defaultValue={campaign ? toDateInputValue(campaign.endDate) : undefined}
            required
            className="mt-2 block w-full rounded-xl border border-transparent bg-[var(--bg-input)] px-4 py-3 text-sm focus:border-2 focus:outline-none focus:invalid:border-red-500 focus:valid:border-black text-gray-500 valid:text-black"
          />
          {state.fieldErrors?.endDate && (
            <p className="mt-2 text-xs text-red-600">{state.fieldErrors.endDate}</p>
          )}
        </div>
      </div>

      {isEdit && (
        <div>
          <label htmlFor="campaign-status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="campaign-status"
            name="status"
            defaultValue={campaign.status}
            className="mt-2 block w-full rounded-xl border border-transparent bg-[var(--bg-input)] px-4 py-3 text-sm focus:border-2 focus:border-black focus:outline-none"
          >
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status && (
            <p className="mt-2 text-xs text-red-600">{state.fieldErrors.status}</p>
          )}
        </div>
      )}

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end gap-4">
        {isEdit && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-black hover:text-[var(--text-primary)] transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
        ) : null}
        {!isEdit && (
          <button
            type="submit"
            name="status"
            value="draft"
            className="text-sm font-semibold text-black hover:text-[var(--text-primary)] transition-colors hover:cursor-pointer"
          >
            Save as draft
          </button>
        )}
        <SubmitButton
          label={isEdit ? 'Save Changes' : 'Create Campaign'}
          pendingLabel={isEdit ? 'Saving...' : 'Creating...'}
          className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-btn-primary-hover transition-colors disabled:opacity-50 hover:cursor-pointer"
        />
      </div>
    </form>
  );
}
