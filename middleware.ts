import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySubdomain } from './lib/tenant';

// Note: Next.js middleware runs on Edge runtime by default.
// Prisma requires Node.js runtime. For production, consider:
// 1. Using Prisma Accelerate (Edge-compatible)
// 2. Caching tenant lookups
// 3. Moving tenant resolution to API routes
// For local development, this should work if middleware can access Node.js runtime.

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

  // If no subdomain found, continue without tenant context
  // You might want to redirect or show an error page instead
  if (!subdomain) {
    // For local development, you might want to allow requests without subdomain
    // or use a default tenant. For now, we'll continue without tenant context.
    return NextResponse.next();
  }

  // Lookup tenant by subdomain
  const tenant = await getTenantBySubdomain(subdomain);

  // If tenant not found, you can:
  // 1. Return 404
  // 2. Redirect to a "tenant not found" page
  // 3. Continue without tenant context
  if (!tenant) {
    // Option: Redirect to tenant-not-found page
    // return NextResponse.redirect(new URL('/tenant-not-found', request.url));
    
    // Option: Return 404
    // return new NextResponse('Tenant not found', { status: 404 });
    
    // For now, continue without tenant context
    // You can customize this behavior based on your requirements
    return NextResponse.next();
  }

  // Clone the request headers and add x-tenant-id
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-subdomain', tenant.subdomain);
  requestHeaders.set('x-tenant-name', tenant.name);

  // Return response with modified headers
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

