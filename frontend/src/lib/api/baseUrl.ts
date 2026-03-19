function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.trim().length > 0) {
    return normalizeUrl(configured);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing NEXT_PUBLIC_API_URL in production environment.');
  }

  return 'http://localhost:5000/api';
}

export function getAiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_AI_API_URL;
  if (configured && configured.trim().length > 0) {
    return normalizeUrl(configured);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing NEXT_PUBLIC_AI_API_URL in production environment.');
  }

  return 'http://localhost:8000';
}

