// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { backendBaseURL } from '../server/env';
import { decodeDraft, decodeIdentity, serverItems, boundedSignal } from '../server/items';
describe('server data contract', () => {
  it('refuses missing/credential-bearing configuration and closed invalid inputs', () => {
    for (const value of ['', 'file:///example', 'https://user:password@example.invalid/', 'https://example.invalid/?token=x']) expect(() => backendBaseURL(value)).toThrow();
    expect(backendBaseURL('https://example.invalid/api/')).toBe('https://example.invalid/api/');
    for (const value of [null, { title: 'ok', completed: false, extra: true }, { title: '', completed: false }, { title: 'ok', completed: 'false' }]) expect(() => decodeDraft(value)).toThrow();
    expect(decodeDraft({ title: '  Example  ', completed: false })).toEqual({ title: 'Example', completed: false });
    expect(() => decodeIdentity('../escape')).toThrow();
  });
  it('uses no-store/credential omission, actual decoder and abort propagation', async () => {
    const transport = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => { expect(init?.cache).toBe('no-store'); expect(init?.credentials).toBe('omit'); expect(init?.redirect).toBe('error'); return Response.json([{ id: 'a', title: 'Example', completed: false }]); });
    const controller = new AbortController(); const api = serverItems('https://example.invalid/api/', transport); expect(await api.list(boundedSignal(controller.signal))).toHaveLength(1); controller.abort(); await expect(api.list(boundedSignal(controller.signal))).rejects.toThrow(); expect(transport).toHaveBeenCalledOnce();
  });
});
