import { NextRequest, NextResponse } from 'next/server';
import { deleteCurrentSession } from '@/lib/session';

/**
 * POST /api/auth/logout
 * Logout route handler - deletes session and clears cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Delete session and clear cookie
    await deleteCurrentSession();

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Also support GET for logout (redirects after logout)
 */
export async function GET(request: NextRequest) {
  try {
    await deleteCurrentSession();
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

