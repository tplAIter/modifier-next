'use server';
import type { Item } from '../../features/items/model';
import { serverItems, boundedSignal, decodeDraft, decodeIdentity, publicFailure } from '../../server/items';
type Result<T> = { ok: true; data: T } | { ok: false; message: string };
export async function createItem(value: unknown): Promise<Result<Item>> { try { const draft = decodeDraft(value); return { ok: true, data: await serverItems().create(draft, boundedSignal()) }; } catch (error) { return { ok: false, message: publicFailure(error).message }; } }
export async function updateItem(id: unknown, value: unknown): Promise<Result<Item>> { try { const identity = decodeIdentity(id); const draft = decodeDraft(value); return { ok: true, data: await serverItems().update(identity, draft, boundedSignal()) }; } catch (error) { return { ok: false, message: publicFailure(error).message }; } }
export async function deleteItem(id: unknown): Promise<Result<null>> { try { const identity = decodeIdentity(id); await serverItems().remove(identity, boundedSignal()); return { ok: true, data: null }; } catch (error) { return { ok: false, message: publicFailure(error).message }; } }
