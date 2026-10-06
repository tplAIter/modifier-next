import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ClientProviders } from '../components/ClientProviders';
import '../styles.css';
export const metadata: Metadata = { title: 'Typed application', description: 'Public App Router example with explicit backend boundaries.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><header><nav aria-label="Main"><Link href="/">Home</Link> <Link href="/items">Items</Link></nav></header><ClientProviders><main id="main">{children}</main></ClientProviders></body></html>;
}
