# Task 4: Session Management Setup

## Overview
This task sets up session management with tenantId support. Sessions are stored in the database and managed via secure HTTP-only cookies.

## What's Included

### Session Service (`lib/session.ts`)
- **createSession()**: Create a new session for a user with tenantId
- **getSession()**: Validate and retrieve session from cookie
- **deleteSession()**: Delete a session by token
- **deleteCurrentSession()**: Delete current session and clear cookie
- **getSessionUser()**: Get user data from session with tenant validation
- **cleanupExpiredSessions()**: Utility to clean up expired sessions

### Auth Helper (`lib/auth.ts`)
- **getAuthenticatedUser()**: Get authenticated user with tenant context validation
- **isAuthenticated()**: Check if user is authenticated for current tenant

## Features

### Security
- **Secure Token Generation**: Uses crypto.randomBytes for secure token generation
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: Enabled in production (HTTPS only)
- **SameSite Protection**: Lax mode for CSRF protection
- **Tenant Validation**: Sessions are validated against tenantId for security

### Session Management
- **30-Day Expiration**: Sessions expire after 30 days
- **Automatic Cleanup**: Expired sessions are automatically removed
- **Database Storage**: Sessions stored in PostgreSQL with indexes
- **Tenant Isolation**: Sessions are tenant-scoped

## How It Works

1. **User Logs In** → `createSession(userId, tenantId)` is called
   - Generates secure token
   - Stores session in database
   - Sets HTTP-only cookie

2. **Request Arrives** → `getSession(tenantId)` validates session
   - Reads token from cookie
   - Validates against database
   - Checks expiration
   - Validates tenantId matches

3. **User Logs Out** → `deleteCurrentSession()` is called
   - Deletes session from database
   - Clears cookie

## Usage Examples

### Creating a Session (Login)

```typescript
import { createSession } from '@/lib/session';

// After validating user credentials
const token = await createSession(user.id, user.tenantId);
```

### Getting Current User

```typescript
import { getAuthenticatedUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // User is authenticated and belongs to the current tenant
  // Use user.id, user.email, etc.
}
```

### Checking Authentication

```typescript
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // User is authenticated
}
```

### Logging Out

```typescript
import { deleteCurrentSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  await deleteCurrentSession();
  return new NextResponse('Logged out', { status: 200 });
}
```

### Getting Session with Tenant Validation

```typescript
import { getSessionUser } from '@/lib/session';

// In a route handler with tenant context
const tenant = await getTenantFromRequest(request);
if (!tenant) {
  return new NextResponse('Tenant not found', { status: 404 });
}

const user = await getSessionUser(tenant.id);
if (!user) {
  return new NextResponse('Unauthorized', { status: 401 });
}
```

## Session Cookie Configuration

- **Name**: `session_token`
- **HttpOnly**: `true` (prevents JavaScript access)
- **Secure**: `true` in production (HTTPS only)
- **SameSite**: `lax` (CSRF protection)
- **MaxAge**: 30 days
- **Path**: `/` (available site-wide)

## Security Considerations

1. **Tenant Isolation**: Sessions are validated against tenantId
   - A session from tenantA cannot be used for tenantB
   - Even if token is stolen, tenant mismatch prevents access

2. **Token Security**: 
   - 64-character hex token (256 bits of entropy)
   - Cryptographically secure random generation
   - Stored in HTTP-only cookie

3. **Expiration**:
   - Sessions expire after 30 days
   - Expired sessions are automatically cleaned up

4. **Database Indexes**:
   - Indexed on `token` for fast lookups
   - Indexed on `(userId, tenantId)` for user queries
   - Indexed on `tenantId` for tenant queries

## Maintenance

### Cleanup Expired Sessions

You can run this periodically (e.g., via cron job):

```typescript
import { cleanupExpiredSessions } from '@/lib/session';

// Returns count of deleted sessions
const deletedCount = await cleanupExpiredSessions();
```

## Files Created
1. `lib/session.ts` - Session management service
2. `lib/auth.ts` - Authentication helpers with tenant context

## Dependencies
- Uses `lib/prisma.ts` (from Task 1)
- Uses `lib/tenant-context.ts` (from Task 3)
- Uses Next.js `cookies()` API
- Uses Node.js `crypto` module (built-in)

## Next Steps
After reviewing this task, proceed to Task 5: Create Prisma client helpers for tenant-scoped queries.

