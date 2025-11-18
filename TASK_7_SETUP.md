# Task 7: Dashboard Route Handler

## Overview
This task implements a protected dashboard page and API route that reads tenantId from session and displays tenant-specific data. The dashboard is only accessible to authenticated users.

## What's Included

### Dashboard Page (`app/dashboard/page.tsx`)
- **GET /dashboard** - Protected dashboard page
- Server component that checks authentication
- Displays user information
- Shows tenant-specific statistics
- Redirects to home if not authenticated

### Dashboard API Route (`app/api/dashboard/route.ts`)
- **GET /api/dashboard** - Protected API endpoint
- Returns tenant-specific dashboard data
- Validates session and tenant
- Returns user info, tenant info, and statistics

### Logout Route (`app/api/auth/logout/route.ts`)
- **POST /api/auth/logout** - Logout endpoint
- **GET /api/auth/logout** - Logout with redirect
- Deletes session and clears cookie

### Server Auth Helpers (`lib/auth-server.ts`)
- `getServerAuthUser()` - Get authenticated user in server components
- `getServerTenant()` - Get tenant info in server components

## Features

### Authentication
- **Protected Route**: Dashboard requires authentication
- **Session Validation**: Validates session and tenant match
- **Automatic Redirect**: Redirects to home if not authenticated
- **Tenant Scoping**: All data is tenant-specific

### Dashboard Data
- **User Information**: Displays logged-in user details
- **Tenant Information**: Shows tenant name and subdomain
- **Statistics**: Total users and active sessions in tenant
- **Org Settings**: Displays tenant-specific settings (if available)

## How It Works

1. **User visits /dashboard** → Server component checks authentication
2. **Get tenant** → Extracts subdomain from hostname
3. **Validate session** → Checks if user has valid session for tenant
4. **Fetch data** → Gets tenant-specific statistics from database
5. **Render page** → Displays dashboard with tenant-scoped data

## Dashboard Page

### Access
- **URL**: `/dashboard`
- **Authentication**: Required
- **Redirect**: Redirects to `/` if not authenticated

### Displayed Information
- User name, email, and ID
- Tenant name and subdomain
- Total users in tenant
- Active sessions count
- Logout button

## API Endpoint

### GET /api/dashboard

**Authentication**: Required (session cookie)

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "tenant": {
    "id": "tenant-uuid",
    "subdomain": "tenantA",
    "name": "Tenant A"
  },
  "stats": {
    "totalUsers": 10,
    "activeSessions": 5
  },
  "settings": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Error Responses:**

- **401 Unauthorized**: Not authenticated
  ```json
  { "error": "Unauthorized" }
  ```

- **404 Not Found**: Tenant not found
  ```json
  { "error": "Tenant not found" }
  ```

## Logout Endpoint

### POST /api/auth/logout

**Request**: No body required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/logout

**Request**: No parameters required

**Response**: Redirects to home page (`/`)

## Usage Examples

### Access Dashboard

```typescript
// After login, user can access dashboard
// Navigate to: http://tenantA.yourapp.com/dashboard
```

### Fetch Dashboard Data (API)

```typescript
const response = await fetch('/api/dashboard', {
  credentials: 'include', // Include session cookie
});

if (response.ok) {
  const data = await response.json();
  console.log(data.user, data.tenant, data.stats);
}
```

### Logout

```typescript
// POST request
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});

// Or navigate to GET endpoint
window.location.href = '/api/auth/logout';
```

## Security Considerations

1. **Authentication Required**: 
   - Dashboard page checks authentication before rendering
   - API route validates session before returning data

2. **Tenant Isolation**:
   - All data queries are tenant-scoped
   - Users can only see data from their tenant

3. **Session Validation**:
   - Validates session exists and is valid
   - Validates session belongs to current tenant
   - Checks session hasn't expired

4. **Server-Side Rendering**:
   - Authentication check happens on server
   - Data fetching happens on server
   - No sensitive data exposed to client

## Integration with Other Tasks

- **Task 1**: Uses Prisma schema (User, Session, OrgSettings models)
- **Task 2**: Uses tenant lookup service
- **Task 3**: Uses tenant context (extracts subdomain)
- **Task 4**: Uses session management (`getSessionUser`)
- **Task 5**: Uses tenant-scoped database helpers (`dbUser`, `dbSession`, `dbOrgSettings`)
- **Task 6**: Uses authentication flow (login/signup)

## Files Created
1. `app/dashboard/page.tsx` - Dashboard page component
2. `app/api/dashboard/route.ts` - Dashboard API route
3. `app/api/auth/logout/route.ts` - Logout route handler
4. `lib/auth-server.ts` - Server component auth helpers

## Testing

### Test Dashboard Access

1. **Login first**:
   ```bash
   curl -X POST http://tenantA.localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}' \
     -c cookies.txt
   ```

2. **Access dashboard**:
   ```bash
   curl http://tenantA.localhost:3000/api/dashboard \
     -b cookies.txt
   ```

3. **Access dashboard page**:
   - Navigate to `http://tenantA.localhost:3000/dashboard` in browser
   - Should see dashboard if authenticated
   - Should redirect to home if not authenticated

## Next Steps

The multi-tenant architecture is now complete! You have:
- ✅ Database schema with tenant isolation
- ✅ Tenant lookup service
- ✅ Middleware for subdomain extraction
- ✅ Session management with tenantId
- ✅ Tenant-scoped database helpers
- ✅ Login and signup endpoints
- ✅ Protected dashboard page

You can now:
- Add more protected routes
- Extend dashboard with more features
- Add more tenant-specific functionality
- Implement additional API endpoints

