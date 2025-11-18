import { NextRequest, NextResponse } from 'next/server';

// Note: Next.js middleware runs on Edge runtime, which cannot use Prisma.
// We extract the subdomain here and pass it as a header.
// Route handlers (which run on Node.js runtime) will perform the actual tenant lookup.

/**
 * Extract subdomain from hostname
 * Examples:
 * - tenantA.yourapp.com -> tenantA
 * - localhost:3000 -> null (for local development)
 * - tenantA.localhost:3000 -> tenantA (for local development with subdomain)
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0];

  // Handle localhost for local development
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    // For local development, you might want to use a query param or header
    // For now, return null - you can customize this behavior
    return null;
  }

  // Split by dots
  const parts = hostWithoutPort.split('.');

  // If we have at least 3 parts (subdomain.domain.tld), extract subdomain
  // For example: tenantA.yourapp.com -> ['tenantA', 'yourapp', 'com']
  if (parts.length >= 3) {
    return parts[0]; // Return the first part as subdomain
  }

  // If only 2 parts, might be domain.tld (no subdomain)
  return null;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Extract subdomain from hostname
  const subdomain = extractSubdomain(hostname);

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // If subdomain found, add it as a header for route handlers to process
  // Route handlers (running on Node.js runtime) will perform the actual tenant lookup
  if (subdomain) {
    requestHeaders.set('x-tenant-subdomain', subdomain);
  }

  // Return response with modified headers
  // Note: The actual tenant lookup will happen in route handlers/API routes
  // which have access to Node.js runtime and can use Prisma
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
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

