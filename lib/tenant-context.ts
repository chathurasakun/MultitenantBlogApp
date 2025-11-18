import { NextRequest } from 'next/server';
import { getTenantBySubdomain, TenantLookupResult } from './tenant';

/**
 * Get tenant from request headers
 * This function should be called in route handlers (Node.js runtime) to resolve the tenant
 * @param request - Next.js request object
 * @returns Tenant information if found, null otherwise
 */
export async function getTenantFromRequest(
  request: NextRequest
): Promise<TenantLookupResult | null> {
  // Get subdomain from header (set by middleware)
  const subdomain = request.headers.get('x-tenant-subdomain');

  if (!subdomain) {
    return null;
  }

  // Lookup tenant using the tenant service
  return await getTenantBySubdomain(subdomain);
}

/**
 * Get tenant ID from request headers
 * Convenience function to get just the tenant ID
 * @param request - Next.js request object
 * @returns Tenant ID if found, null otherwise
 */
export async function getTenantIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const tenant = await getTenantFromRequest(request);
  return tenant?.id || null;
}

