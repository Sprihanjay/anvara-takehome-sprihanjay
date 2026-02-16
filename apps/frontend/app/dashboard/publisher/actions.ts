'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

const VALID_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

export interface ActionResult {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getAuthCookie(): Promise<string> {
  const requestHeaders = await headers();
  return requestHeaders.get('cookie') || '';
}

export async function createAdSlot(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const type = formData.get('type') as string;
  const basePriceStr = formData.get('basePrice') as string;
  const widthStr = formData.get('width') as string;
  const heightStr = formData.get('height') as string;

  const fieldErrors: Record<string, string> = {};

  if (!name || name.trim().length < 3) {
    fieldErrors.name = 'Name must be at least 3 characters';
  }
  if (!type || !VALID_TYPES.includes(type)) {
    fieldErrors.type = 'Please select a valid type';
  }
  const basePrice = parseFloat(basePriceStr);
  if (isNaN(basePrice) || basePrice <= 0) {
    fieldErrors.basePrice = 'Price must be a positive number';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const cookie = await getAuthCookie();
  const body: Record<string, unknown> = { name: name.trim(), type, basePrice };
  if (description?.trim()) body.description = description.trim();
  if (widthStr) body.width = parseInt(widthStr, 10);
  if (heightStr) body.height = parseInt(heightStr, 10);

  const res = await fetch(`${API_URL}/api/ad-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error || data?.message || 'Failed to create ad slot' };
  }

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

export async function updateAdSlot(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const basePriceStr = formData.get('basePrice') as string;
  const widthStr = formData.get('width') as string;
  const heightStr = formData.get('height') as string;
  const isAvailable = formData.get('isAvailable') === 'on';

  const fieldErrors: Record<string, string> = {};

  if (name !== null && name.trim().length < 3) {
    fieldErrors.name = 'Name must be at least 3 characters';
  }
  if (basePriceStr) {
    const basePrice = parseFloat(basePriceStr);
    if (isNaN(basePrice) || basePrice <= 0) {
      fieldErrors.basePrice = 'Price must be a positive number';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const cookie = await getAuthCookie();
  const body: Record<string, unknown> = { isAvailable };
  if (name?.trim()) body.name = name.trim();
  if (description !== null) body.description = description?.trim() || null;
  if (basePriceStr) body.basePrice = parseFloat(basePriceStr);
  if (widthStr) body.width = parseInt(widthStr, 10);
  if (heightStr) body.height = parseInt(heightStr, 10);

  const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 404) return { error: 'Ad slot not found' };
    if (res.status === 403) return { error: 'You do not have permission to edit this ad slot' };
    const data = await res.json().catch(() => null);
    return { error: data?.error || data?.message || 'Failed to update ad slot' };
  }

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

export async function deleteAdSlot(id: string): Promise<ActionResult> {
  const cookie = await getAuthCookie();

  const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
    method: 'DELETE',
    headers: { cookie },
  });

  if (!res.ok) {
    if (res.status === 404) return { error: 'Ad slot not found' };
    if (res.status === 403) return { error: 'You do not have permission to delete this ad slot' };
    return { error: 'Failed to delete ad slot' };
  }

  revalidatePath('/dashboard/publisher');
  return { success: true };
}
