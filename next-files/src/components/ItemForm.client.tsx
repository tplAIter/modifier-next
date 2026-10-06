'use client';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from './Button';
import { Field } from './Field';
import { titleError } from '../features/items/model';
import type { Item } from '../features/items/model';
import { createItem, updateItem, deleteItem } from '../app/items/actions';
export function ItemForm({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems); const [title, setTitle] = useState(''); const [error, setError] = useState<string>(); const [pending, setPending] = useState(false);
  const alive = useRef(false); const locked = useRef(false); const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  function fail(message: string) { setError(message); queueMicrotask(() => summary.current?.focus()); }
  async function mutate(operation: () => Promise<void>) { if (locked.current) return; locked.current = true; setPending(true); setError(undefined); try { await operation(); } catch { if (alive.current) fail('The operation failed. Try again.'); } finally { locked.current = false; if (alive.current) setPending(false); } }
  function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const invalid = titleError(title); if (invalid) { fail(invalid); return; } void mutate(async () => { const result = await createItem({ title: title.trim(), completed: false }); if (!alive.current) return; if (!result.ok) { fail(result.message); return; } setItems(old => [...old.filter(item => item.id !== result.data.id), result.data]); setTitle(''); }); }
  return <><form onSubmit={create} noValidate><Field label="Title" value={title} onChange={event => setTitle(event.target.value)} disabled={pending} error={titleError(title)} /><Button type="submit" disabled={pending}>Add item</Button></form>{pending && <p role="status">Saving…</p>}{error && <div ref={summary} tabIndex={-1} role="alert">{error}</div>}<ul>{items.map(item => <li key={item.id}><span>{item.title}</span><Button disabled={pending} onClick={() => void mutate(async () => { const result = await updateItem(item.id, { title: item.title, completed: !item.completed }); if (!alive.current) return; if (!result.ok) { fail(result.message); return; } setItems(old => old.map(value => value.id === item.id ? result.data : value)); })}>{item.completed ? 'Mark incomplete' : 'Complete'} {item.title}</Button><Button disabled={pending} onClick={() => void mutate(async () => { const result = await deleteItem(item.id); if (!alive.current) return; if (!result.ok) { fail(result.message); return; } setItems(old => old.filter(value => value.id !== item.id)); })}>Delete {item.title}</Button></li>)}</ul></>;
}
