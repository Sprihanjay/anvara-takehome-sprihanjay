'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { API_URL } from '@/constants/api';
import { VALID_CAMPAIGN_STATUSES } from '@/constants/campaign';

export interface ActionResult {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getAuthCookie(): Promise<string> {
  const requestHeaders = await headers();
  return requestHeaders.get('cookie') || '';
}

export async function createCampaign(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const budgetStr = formData.get('budget') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  const fieldErrors: Record<string, string> = {};

  if (!name || name.trim().length < 3) {
    fieldErrors.name = 'Name must be at least 3 characters';
  }
  const budget = parseFloat(budgetStr);
  if (isNaN(budget) || budget < 0) {
    fieldErrors.budget = 'Budget must be a non-negative number';
  }
  if (!startDate) {
    fieldErrors.startDate = 'Start date is required';
  }
  if (!endDate) {
    fieldErrors.endDate = 'End date is required';
  }
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    fieldErrors.endDate = 'End date must be after start date';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const cookie = await getAuthCookie();
  const isDraft = formData.get('status') === 'draft';
  const body: Record<string, unknown> = {
    name: name.trim(),
    budget,
    startDate,
    endDate,
    status: isDraft ? 'DRAFT' : 'ACTIVE',
  };
  if (description?.trim()) body.description = description.trim();

  const res = await fetch(`${API_URL}/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error || data?.message || 'Failed to create campaign' };
  }

  revalidatePath('/dashboard/sponsor');
  redirect('/dashboard/sponsor');
}

export async function updateCampaign(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const budgetStr = formData.get('budget') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as string;

  const fieldErrors: Record<string, string> = {};

  if (name !== null && name.trim().length < 3) {
    fieldErrors.name = 'Name must be at least 3 characters';
  }
  if (budgetStr) {
    const budget = parseFloat(budgetStr);
    if (isNaN(budget) || budget < 0) {
      fieldErrors.budget = 'Budget must be a non-negative number';
    }
  }
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    fieldErrors.endDate = 'End date must be after start date';
  }
  if (status && !VALID_CAMPAIGN_STATUSES.includes(status)) {
    fieldErrors.status = 'Invalid status';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const cookie = await getAuthCookie();
  const body: Record<string, unknown> = {};
  if (name?.trim()) body.name = name.trim();
  if (description !== null) body.description = description?.trim() || null;
  if (budgetStr) body.budget = parseFloat(budgetStr);
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;
  if (status) body.status = status;

  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 404) return { error: 'Campaign not found' };
    if (res.status === 403) return { error: 'You do not have permission to edit this campaign' };
    const data = await res.json().catch(() => null);
    return { error: data?.error || data?.message || 'Failed to update campaign' };
  }

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const cookie = await getAuthCookie();

  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'DELETE',
    headers: { cookie },
  });

  if (!res.ok) {
    if (res.status === 404) return { error: 'Campaign not found' };
    if (res.status === 403) return { error: 'You do not have permission to delete this campaign' };
    return { error: 'Failed to delete campaign' };
  }

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}
