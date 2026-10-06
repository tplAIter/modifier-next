import 'server-only';
export function requestDeadline(signal: AbortSignal): AbortSignal { return AbortSignal.any([signal, AbortSignal.timeout(15000)]); }
