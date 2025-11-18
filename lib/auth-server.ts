import { headers } from 'next/headers';
import { getTenantBySubdomain } from './tenant';
import { getSessionUser } from './session';

/**
 * Extract subdomain from hostname (helper function)
 */
function extractSubdomain(hostname: string): string | null {
  const hostWithoutPort = hostname.split(':')[0];
  
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return null;
  }
  
  const parts = hostWithoutPort.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

/**
 * Get authenticated user in server components
 * This is for use in Server Components (not route handlers)
 * @returns User data if authenticated, null otherwise
 */
export async function getServerAuthUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
} | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const subdomain = extractSubdomain(host);
    
    if (!subdomain) {
      return null;
    }
    
    const tenant = await getTenantBySubdomain(subdomain);
    if (!tenant) {
      return null;
    }
    
    return await getSessionUser(tenant.id);
  } catch (error) {
    return null;
  }
}

/**
 * Get tenant info in server components
 */
export async function getServerTenant(): Promise<{
  id: string;
  subdomain: string;
  name: string;
} | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const subdomain = extractSubdomain(host);
    
    if (!subdomain) {
      return null;
    }
    
    const tenant = await getTenantBySubdomain(subdomain);
    if (!tenant) {
      return null;
    }
    
    return {
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name,
    };
  } catch (error) {
    return null;
  }
}

