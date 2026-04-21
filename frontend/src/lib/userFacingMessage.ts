/**
 * Maps technical failures and leaked infrastructure details to calm, public-sector copy.
 * Never surfaces hostnames, ports, URLs, stack traces, or low-level runtime errors.
 */

const NETWORK_HINTS = [
  'failed to fetch',
  'networkerror',
  'network request failed',
  'load failed',
  'econnrefused',
  'econnreset',
  'enotfound',
  'etimedout',
  'epipe',
  'socket hang up',
  'fetch failed',
  'connection refused',
  'connection reset',
  'the internet connection appears',
  'offline',
];

const DEFAULT_GENERIC =
  'This request could not be completed. Please try again later. If the problem continues, contact your system administrator.';

const DEFAULT_NETWORK =
  'The service is temporarily unavailable. Please wait a moment and try again.';

const DEFAULT_AUTH =
  'We could not verify your credentials. Please check your information and try again.';

export type UserFacingContext = 'generic' | 'network' | 'auth';

function extractMessage(err: unknown): string {
  if (err instanceof Error && typeof err.message === 'string') {
    return err.message.trim();
  }
  if (typeof err === 'string') {
    return err.trim();
  }
  return '';
}

function looksTechnical(s: string): boolean {
  const t = s;
  if (/https?:\/\//i.test(t)) return true;
  if (/localhost\b/i.test(t)) return true;
  if (/\b127\.0\.0\.1\b/.test(t)) return true;
  if (/\b0\.0\.0\.0\b/.test(t)) return true;
  if (/\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/.test(t)) return true;
  if (/port\s+\d{2,5}\b/i.test(t)) return true;
  if (/(localhost|127\.0\.0\.1|https?:)/i.test(t) && /:\d{2,5}\b/.test(t)) return true;
  if (/\.(go|ts|tsx|js|jsx|py):\d+/i.test(t)) return true;
  if (/\bat\s+[\w$.]+\s*\(/i.test(t)) return true;
  if (/mongo|postgresql|prisma|sql\b|stack trace|ECONN[A-Z]+|ENOT[A-Z]+|ETIMEDOUT|syscall/i.test(t)) {
    return true;
  }
  return false;
}

function isNetworkFailure(message: string): boolean {
  const lower = message.toLowerCase();
  return NETWORK_HINTS.some((h) => lower.includes(h));
}

function fallbackFor(context: UserFacingContext): string {
  switch (context) {
    case 'network':
      return DEFAULT_NETWORK;
    case 'auth':
      return DEFAULT_AUTH;
    default:
      return DEFAULT_GENERIC;
  }
}

/**
 * Use for any toast or inline alert derived from `catch` or API errors.
 */
export function userFacingError(
  err: unknown,
  options?: { context?: UserFacingContext; fallback?: string }
): string {
  const context = options?.context ?? 'generic';
  const fallback = options?.fallback ?? fallbackFor(context);
  const raw = extractMessage(err);
  if (!raw) {
    return fallback;
  }
  if (isNetworkFailure(raw)) {
    return DEFAULT_NETWORK;
  }
  if (looksTechnical(raw)) {
    return fallback;
  }
  return raw;
}

/**
 * Sanitize a string that may come from an API `message` field before showing it.
 */
export function userFacingApiMessage(message: string | undefined | null, fallback: string = DEFAULT_GENERIC): string {
  if (message == null || typeof message !== 'string') {
    return fallback;
  }
  const raw = message.trim();
  if (!raw) {
    return fallback;
  }
  if (isNetworkFailure(raw) || looksTechnical(raw)) {
    return fallback;
  }
  return raw;
}
