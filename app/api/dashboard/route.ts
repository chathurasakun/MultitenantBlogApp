import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant-context';
import { dbUser, dbSession, dbOrgSettings } from '@/lib/db';

/**
 * GET /api/dashboard
 * Protected route that returns tenant-specific dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (validates session and tenant)
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tenant info
    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Fetch tenant-specific data
    const [userCount, sessionCount, orgSettings] = await Promise.all([
      // Count users in tenant
      dbUser.count(tenant.id),
      // Count active sessions in tenant
      dbSession.count(tenant.id, {
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
      // Get org settings
      dbOrgSettings.get(tenant.id),
    ]);

    // Return dashboard data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        name: tenant.name,
      },
      stats: {
        totalUsers: userCount,
        activeSessions: sessionCount,
      },
      settings: orgSettings?.settings || null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

