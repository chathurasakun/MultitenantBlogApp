import { cookies } from 'next/headers';
import { prisma } from './prisma';
import crypto from 'crypto';

// Session cookie name
const SESSION_COOKIE_NAME = 'session_token';

// Session expiration time (30 days)
const SESSION_EXPIRATION_DAYS = 30;

/**
 * Generate a secure random session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 * @param userId - User ID
 * @param tenantId - Tenant ID (must match user's tenant)
 * @returns Session token
 */
export async function createSession(
  userId: string,
  tenantId: string
): Promise<string> {
  // Generate secure token
  const token = generateSessionToken();

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

  // Create session in database
  await prisma.session.create({
    data: {
      userId,
      tenantId,
      token,
      expiresAt,
    },
  });

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRATION_DAYS * 24 * 60 * 60, // Convert days to seconds
    path: '/',
  });

  return token;
}

/**
 * Get session from cookie and validate it
 * @param tenantId - Optional tenant ID to validate against (for security)
 * @returns Session data if valid, null otherwise
 */
export async function getSession(
  tenantId?: string
): Promise<{
  userId: string;
  tenantId: string;
  token: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token },
      select: {
        userId: true,
        tenantId: true,
        token: true,
        expiresAt: true,
      },
    });

    // Check if session exists
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await deleteSession(token);
      return null;
    }

    // If tenantId is provided, validate it matches
    if (tenantId && session.tenantId !== tenantId) {
      // Session belongs to different tenant - invalid
      return null;
    }

    return {
      userId: session.userId,
      tenantId: session.tenantId,
      token: session.token,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting session:', error);
    }
    return null;
  }
}

/**
 * Delete a session by token
 * @param token - Session token
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    // Delete from database
    await prisma.session.delete({
      where: { token },
    });
  } catch (error) {
    // Session might not exist, ignore error
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting session:', error);
    }
  }
}

/**
 * Delete current session (from cookie)
 */
export async function deleteCurrentSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await deleteSession(token);
    }

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting current session:', error);
    }
  }
}

/**
 * Validate session and get user with tenant context
 * @param tenantId - Tenant ID to validate against
 * @returns User data if session is valid, null otherwise
 */
export async function getSessionUser(tenantId: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
} | null> {
  const session = await getSession(tenantId);

  if (!session) {
    return null;
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      tenantId: true,
    },
  });

  // Verify user belongs to the tenant
  if (!user || user.tenantId !== tenantId) {
    return null;
  }

  return user;
}

/**
 * Clean up expired sessions (can be run as a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

