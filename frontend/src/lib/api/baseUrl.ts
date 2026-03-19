function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.trim().length > 0) {
    return normalizeUrl(configured);
  }

  // Keep builds and prerendering stable even when env vars are missing.
  // In production, default to same-origin API routes/proxy.
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }

  return 'http://localhost:5000/api';
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

