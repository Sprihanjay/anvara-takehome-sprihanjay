'use client';

import { useActionState, useEffect } from 'react';
import { createCampaign, updateCampaign, type ActionResult } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { Campaign } from '@/lib/types';

const CAMPAIGN_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
] as const;

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess?: () => void;
}

const initialState: ActionResult = {};

function toDateInputValue(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

export function CampaignForm({ campaign, onSuccess }: CampaignFormProps) {
  const isEdit = !!campaign;

  const boundAction = isEdit ? updateCampaign.bind(null, campaign.id) : createCampaign;

  const [state, formAction] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="campaign-name" className="block text-sm font-medium">
          Campaign Name
        </label>
        <input
          type="text"
          id="campaign-name"
          name="name"
          defaultValue={campaign?.name}
          required
          minLength={3}
          className="mt-1 block w-full rounded border border-[--color-border] bg-transparent px-3 py-2 text-sm"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="campaign-description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="campaign-description"
          name="description"
          defaultValue={campaign?.description ?? ''}
          rows={2}
          className="mt-1 block w-full rounded border border-[--color-border] bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="campaign-budget" className="block text-sm font-medium">
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
          className="mt-1 block w-full rounded border border-[--color-border] bg-transparent px-3 py-2 text-sm"
        />
        {state.fieldErrors?.budget && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.budget}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="campaign-startDate" className="block text-sm font-medium">
            Start Date
          </label>
          <input
            type="date"
            id="campaign-startDate"
            name="startDate"
            defaultValue={campaign ? toDateInputValue(campaign.startDate) : undefined}
            required
            className="mt-1 block w-full rounded border border-[--color-border] bg-transparent px-3 py-2 text-sm"
          />
          {state.fieldErrors?.startDate && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.startDate}</p>
          )}
        </div>
        <div>
          <label htmlFor="campaign-endDate" className="block text-sm font-medium">
            End Date
          </label>
          <input
            type="date"
            id="campaign-endDate"
            name="endDate"
            defaultValue={campaign ? toDateInputValue(campaign.endDate) : undefined}
            required
            className="mt-1 block w-full rounded border border-[--color-border] bg-transparent px-3 py-2 text-sm"
          />
          {state.fieldErrors?.endDate && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.endDate}</p>
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
            className="mt-1 block w-full rounded border border-[--color-border] bg-transparent px-3 py-2 text-sm"
          >
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.status}</p>
          )}
        </div>
      )}

      {state.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <SubmitButton
        label={isEdit ? 'Save Changes' : 'Create Campaign'}
        pendingLabel={isEdit ? 'Saving...' : 'Creating...'}
      />
    </form>
  );
}
