import { NextRequest, NextResponse } from 'next/server';

/**
 * Extract subdomain from hostname
 */
function getSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0];
  
  // Skip localhost for local development
  if (host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  
  const parts = host.split('.');
  return parts.length >= 3 ? parts[0].toLowerCase() : null;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);

  // Clone headers and add tenant subdomain
  const headers = new Headers(request.headers);
  if (subdomain) {
    headers.set('x-tenant-subdomain', subdomain);
  }

  return NextResponse.next({
    request: { headers },
  });
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

