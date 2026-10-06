import { ApiError } from '../../../data/api-error';
import { serverItems, boundedSignal, decodeDraft, decodeIdentity, publicFailure } from '../../../server/items';
const LIMIT = 1024 * 1024;
async function body(request: Request): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') throw new ApiError('invalid-request', 'Expected JSON.');
  const reader = request.body?.getReader(); if (!reader) throw new ApiError('invalid-request', 'Expected a body.');
  const chunks: Uint8Array[] = []; let length = 0;
  try { while (true) { if (request.signal.aborted) throw new ApiError('cancelled', 'Request cancelled.'); const chunk = await reader.read(); if (chunk.done) break; length += chunk.value.byteLength; if (length > LIMIT) throw new ApiError('invalid-request', 'Body too large.'); chunks.push(chunk.value); } }
  finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown; } catch { throw new ApiError('invalid-request', 'Invalid JSON.'); }
}
function identity(request: Request): string { const url = new URL(request.url); if ([...url.searchParams.keys()].some(key => key !== 'id') || url.searchParams.getAll('id').length !== 1) throw new ApiError('invalid-request', 'Expected one item identity.'); return decodeIdentity(url.searchParams.get('id')); }
function noQuery(request: Request) { if (new URL(request.url).search) throw new ApiError('invalid-request', 'Unexpected query.'); }
function failed(error: unknown): Response { const failure = publicFailure(error); return Response.json({ error: failure.message }, { status: failure.status }); }
export async function GET(request: Request): Promise<Response> { try { noQuery(request); return Response.json(await serverItems().list(boundedSignal(request.signal))); } catch (error) { return failed(error); } }
export async function POST(request: Request): Promise<Response> { try { noQuery(request); const draft = decodeDraft(await body(request)); return Response.json(await serverItems().create(draft, boundedSignal(request.signal)), { status: 201 }); } catch (error) { return failed(error); } }
export async function PUT(request: Request): Promise<Response> { try { const id = identity(request); const draft = decodeDraft(await body(request)); return Response.json(await serverItems().update(id, draft, boundedSignal(request.signal))); } catch (error) { return failed(error); } }
export async function DELETE(request: Request): Promise<Response> { try { const id = identity(request); if (request.body) throw new ApiError('invalid-request', 'Unexpected delete body.'); await serverItems().remove(id, boundedSignal(request.signal)); return new Response(null, { status: 204 }); } catch (error) { return failed(error); } }
