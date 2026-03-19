import { NextRequest, NextResponse } from 'next/server';

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function resolveBackendBaseUrl() {
  const configured =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_URL;

  if (configured && configured.trim().length > 0) {
    const normalized = normalizeUrl(configured.trim());
    return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
  }

  return 'http://localhost:5000/api';
}

function buildTargetUrl(request: NextRequest, path: string[]) {
  const backendBase = resolveBackendBaseUrl();
  const joinedPath = path.join('/');
  const target = new URL(`${backendBase}/${joinedPath}`);
  target.search = request.nextUrl.search;
  return target.toString();
}

async function proxy(request: NextRequest, path: string[]) {
  const targetUrl = buildTargetUrl(request, path);

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          'Backend service is unavailable. If this is Render, it may be waking up. Please try again in a few seconds.',
      },
      { status: 503 }
    );
  }
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
