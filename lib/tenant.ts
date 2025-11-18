import { prisma } from './prisma';

/**
 * Tenant lookup result
 */
export interface TenantLookupResult {
  id: string;
  subdomain: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lookup tenant by subdomain
 * @param subdomain - The subdomain to lookup (e.g., "tenantA")
 * @returns Tenant information if found, null otherwise
 */
export async function getTenantBySubdomain(
  subdomain: string
): Promise<TenantLookupResult | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        subdomain: subdomain.toLowerCase().trim(),
      },
      select: {
        id: true,
        subdomain: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return tenant;
  } catch (error) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error looking up tenant by subdomain:', error);
    }
    // Return null if tenant not found or on error
    return null;
  }
}

/**
 * Check if a tenant exists by subdomain
 * @param subdomain - The subdomain to check
 * @returns true if tenant exists, false otherwise
 */
export async function tenantExists(subdomain: string): Promise<boolean> {
  const tenant = await getTenantBySubdomain(subdomain);
  return tenant !== null;
}

