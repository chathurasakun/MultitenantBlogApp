# Signup Route Handler

## Overview
This implements a signup (user registration) API route handler that creates new users with tenantId filtering and automatically logs them in after successful registration.

## What's Included

### Signup Route Handler (`app/api/auth/signup/route.ts`)
- **POST /api/auth/signup** - User registration endpoint
- Validates tenant from request headers
- Checks if email already exists in tenant
- Hashes password before storage
- Creates user within tenant (tenant-scoped)
- Automatically creates session and logs user in

## Features

### Security
- **Tenant Isolation**: Users are created within their tenant only
- **Password Hashing**: Uses bcrypt with 10 salt rounds
- **Email Validation**: Basic email format validation
- **Password Strength**: Minimum 6 characters requirement
- **Duplicate Prevention**: Checks if email already exists in tenant

### Validation
- Validates tenant exists
- Validates email and password are provided
- Validates email format
- Validates password length (minimum 6 characters)
- Checks for duplicate email in tenant
- Normalizes email (lowercase, trimmed)

## How It Works

1. **Request arrives** → Middleware extracts subdomain → sets `x-tenant-subdomain` header
2. **Get tenant** → Route handler looks up tenant from subdomain
3. **Validate input** → Checks email format, password length
4. **Check duplicate** → Verifies email doesn't exist in tenant
5. **Hash password** → Uses bcrypt to hash password
6. **Create user** → Uses `dbUser.create()` (tenant-scoped)
7. **Create session** → Automatically logs user in
8. **Return response** → Returns user data (excluding password)

## API Endpoint

### POST /api/auth/signup

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name" // optional
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses:**

- **400 Bad Request**: Missing or invalid input
  ```json
  { "error": "Email and password are required" }
  { "error": "Invalid email format" }
  { "error": "Password must be at least 6 characters long" }
  ```

- **404 Not Found**: Tenant not found
  ```json
  { "error": "Tenant not found" }
  ```

- **409 Conflict**: Email already exists
  ```json
  { "error": "User with this email already exists" }
  ```

- **500 Internal Server Error**: Server error
  ```json
  { "error": "Internal server error" }
  ```

## Usage Example

### Frontend Signup

```typescript
async function signup(email: string, password: string, name?: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.user; // User is automatically logged in
}
```

### cURL Example

```bash
curl -X POST http://tenantA.localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123","name":"New User"}'
```

## Security Considerations

1. **Tenant Scoping**: 
   - Uses `dbUser.create(tenantId, ...)` which automatically links user to tenant
   - Prevents users from being created in wrong tenant

2. **Password Security**:
   - Passwords are hashed with bcrypt (10 salt rounds)
   - Never returned in responses
   - Minimum length requirement

3. **Email Validation**:
   - Basic format validation
   - Normalized (lowercase, trimmed)
   - Duplicate check within tenant

4. **Automatic Login**:
   - Creates session immediately after signup
   - Better UX (user doesn't need to login separately)
   - Session is tenant-scoped

## Integration with Other Tasks

- **Task 1**: Uses Prisma schema (User model)
- **Task 2**: Uses tenant lookup service
- **Task 3**: Uses tenant context from middleware
- **Task 4**: Uses session management (`createSession`)
- **Task 5**: Uses tenant-scoped database helpers (`dbUser.create`)
- **Task 6**: Uses password hashing (`hashPassword`)

## Differences from Login

| Feature | Login | Signup |
|---------|-------|--------|
| Purpose | Authenticate existing user | Create new user |
| Email Check | Must exist | Must NOT exist |
| Password | Compare with hash | Hash before storage |
| Session | Create if valid | Always create |
| Status Code | 200 OK | 201 Created |

## Files Created
1. `app/api/auth/signup/route.ts` - Signup API route handler

## Dependencies
- Uses `lib/password.ts` (hashPassword)
- Uses `lib/db.ts` (dbUser.create)
- Uses `lib/session.ts` (createSession)
- Uses `lib/tenant-context.ts` (getTenantFromRequest)

