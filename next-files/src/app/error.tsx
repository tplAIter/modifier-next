'use client';
export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <section role="alert"><h1>Unable to load this page</h1><p>Try again when the service is available.</p><button type="button" onClick={reset}>Try again</button></section>; }
