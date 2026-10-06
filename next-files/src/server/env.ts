import 'server-only';
export class BackendConfigurationError extends Error { constructor() { super('The backend is not configured.'); this.name = 'BackendConfigurationError'; } }
export function backendBaseURL(value: string | undefined = process.env.NEXT_BACKEND_BASE_URL): string {
  if (!value) throw new BackendConfigurationError();
  let url: URL; try { url = new URL(value); } catch { throw new BackendConfigurationError(); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new BackendConfigurationError();
  return url.toString();
}
