import 'server-only';
import { ApiClient } from '../data/api-client';
import { ApiError } from '../data/api-error';
import type { Transport } from '../data/api-client';
import { createItemsAPI } from '../features/items/api';
import type { ItemDraft } from '../features/items/model';
import { titleError } from '../features/items/model';
import { backendBaseURL, BackendConfigurationError } from './env';
export function serverItems(base = backendBaseURL(), transport: Transport = fetch) {
  const uncached: Transport = (url, init) => transport(url, { ...init, cache: 'no-store' });
  return createItemsAPI(new ApiClient(base, uncached));
}
export function boundedSignal(signal?: AbortSignal): AbortSignal { const deadline = AbortSignal.timeout(15000); return signal ? AbortSignal.any([signal, deadline]) : deadline; }
export function decodeDraft(value: unknown): ItemDraft {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new ApiError('invalid-request', 'Invalid item.');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).sort().join(',') !== 'completed,title' || typeof v.title !== 'string' || titleError(v.title) || typeof v.completed !== 'boolean') throw new ApiError('invalid-request', 'Enter a valid title and completion value.');
  return { title: v.title.trim(), completed: v.completed };
}
export function decodeIdentity(value: unknown): string { if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new ApiError('invalid-request', 'Invalid item identity.'); return value; }
export function publicFailure(error: unknown): { status: number; message: string } {
  if (error instanceof BackendConfigurationError) return { status: 503, message: 'The backend is not configured.' };
  if (error instanceof ApiError && error.kind === 'invalid-request') return { status: 400, message: error.message };
  if (error instanceof ApiError && error.kind === 'cancelled') return { status: 408, message: 'Request cancelled or timed out.' };
  return { status: 502, message: 'The backend is unavailable.' };
}
