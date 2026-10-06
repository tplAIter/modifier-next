import { serverItems, boundedSignal, publicFailure } from '../../server/items';
import { ItemForm } from '../../components/ItemForm.client';
export const dynamic = 'force-dynamic';
export default async function ItemsPage() {
  try { const items = await serverItems().list(boundedSignal()); return <section><h1>Items</h1><ItemForm initialItems={items} /></section>; }
  catch (error) { return <section><h1>Items unavailable</h1><p role="alert">{publicFailure(error).message}</p><p>Configure an explicit backend and reload this page.</p></section>; }
}
