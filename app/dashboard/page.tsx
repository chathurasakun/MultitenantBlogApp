import { redirect } from 'next/navigation';
import { getServerAuthUser, getServerTenant } from '@/lib/auth-server';
import { dbUser, dbSession, dbOrgSettings } from '@/lib/db';

export default async function DashboardPage() {
  // Check authentication
  const user = await getServerAuthUser();
  const tenant = await getServerTenant();

  // Redirect to login if not authenticated
  if (!user || !tenant) {
    redirect('/');
  }

  // Fetch tenant-specific data directly from database
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to {tenant.name} ({tenant.subdomain})
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Information
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {user.name || 'N/A'}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">User ID:</span> {user.id}
            </p>
          </div>
        </div>

        {/* Tenant Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tenant Statistics
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Total Users:</span> {userCount}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Active Sessions:</span>{' '}
                {sessionCount}
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tenant Information
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Tenant Name:</span> {tenant.name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Subdomain:</span>{' '}
                {tenant.subdomain}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="space-x-4">
            <a
              href="/api/auth/logout"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

