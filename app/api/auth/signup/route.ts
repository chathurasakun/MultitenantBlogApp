import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant-context';
import { dbUser } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';

/**
 * POST /api/auth/signup
 * Signup route handler with tenantId filtering
 * Creates a new user and automatically logs them in
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
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists in tenant
    const existingUser = await dbUser.findByEmail(tenant.id, email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 } // Conflict
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in tenant
    const user = await dbUser.create(tenant.id, {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name?.trim() || null,
    });

    // Automatically create session and log user in
    await createSession(user.id, tenant.id);

    // Return success response (exclude password from response)
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 } // Created
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

