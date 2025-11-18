import { NextRequest } from 'next/server';
import { getTenantFromRequest } from './tenant-context';
import { getSessionUser } from './session';

/**
 * Get authenticated user from request with tenant validation
 * This combines tenant context and session validation
 * @param request - Next.js request object
 * @returns User data if authenticated and tenant matches, null otherwise
 */
export async function getAuthenticatedUser(request: NextRequest) {
  // Get tenant from request
  const tenant = await getTenantFromRequest(request);

  if (!tenant) {
    return null;
  }

  // Get user from session (validates tenantId matches)
  const user = await getSessionUser(tenant.id);

  return user;
}

/**
 * Check if user is authenticated for the current tenant
 * @param request - Next.js request object
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  return user !== null;
}

