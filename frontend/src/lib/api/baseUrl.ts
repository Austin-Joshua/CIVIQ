function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '');
}

/**
 * Browser-facing API base: same-origin `/api` → Next.js catch-all proxy → Go backend.
 * Keeps JWT + cookies on one origin and avoids CORS for dashboard fetches.
 */
export function getApiBaseUrl() {
  return '/api';
}

/**
 * Used by `src/app/api/[...path]/route.ts` (server-side) to reach the Go API.
 */
export function getBackendProxyTarget() {
  const configured =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_URL;
  if (configured?.trim()) {
    const n = normalizeUrl(configured.trim());
    return n.endsWith('/api') ? n : `${n}/api`;
  }
  return 'http://127.0.0.1:5000/api';
}

export function getAiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_AI_API_URL;
  if (configured && configured.trim().length > 0) {
    return normalizeUrl(configured);
  }

  // Avoid hard build failures when AI URL is not configured yet.
  // In production, default to same-origin AI proxy path.
  if (process.env.NODE_ENV === 'production') {
    return '/ai';
  }

  return 'http://localhost:8000';
}

