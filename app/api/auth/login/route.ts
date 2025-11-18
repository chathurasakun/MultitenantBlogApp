import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant-context';
import { dbUser } from '@/lib/db';
import { comparePassword } from '@/lib/password';
import { createSession } from '@/lib/session';

/**
 * POST /api/auth/login
 * Login route handler with tenantId filtering
 */
export async function POST(request: NextRequest) {
  try {
    // Get tenant from request (set by middleware)
    const tenant = await getTenantFromRequest(request);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email within tenant (tenant-scoped query)
    const user = await dbUser.findByEmail(tenant.id, email);

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session (automatically sets cookie)
    await createSession(user.id, tenant.id);

    // Return success response (exclude password from response)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

