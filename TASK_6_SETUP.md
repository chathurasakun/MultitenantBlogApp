# Task 6: Login Route Handler

## Overview
This task implements a login API route handler that validates user credentials with tenantId filtering, ensuring users can only login to their own tenant.

## What's Included

### Login Route Handler (`app/api/auth/login/route.ts`)
- **POST /api/auth/login** - Login endpoint
- Validates tenant from request headers
- Finds user by email within tenant (tenant-scoped)
- Compares password using bcrypt
- Creates session on successful login
- Returns user data (excluding password)

### Password Utilities (`lib/password.ts`)
- `hashPassword()` - Hash passwords for storage
- `comparePassword()` - Compare plain text with hashed password

## Features

### Security
- **Tenant Isolation**: Users can only login to their own tenant
- **Password Hashing**: Uses bcrypt with 10 salt rounds
- **Secure Responses**: Generic error messages (doesn't reveal if user exists)
- **Session Management**: Creates secure HTTP-only session cookie

### Validation
- Validates tenant exists
- Validates email and password are provided
- Validates user exists within tenant
- Validates password matches

## How It Works

1. **Request arrives** → Middleware extracts subdomain → sets `x-tenant-subdomain` header
2. **Get tenant** → Route handler looks up tenant from subdomain
3. **Validate input** → Checks email and password are provided
4. **Find user** → Uses `dbUser.findByEmail()` (tenant-scoped query)
5. **Compare password** → Uses bcrypt to verify password
6. **Create session** → Creates session and sets HTTP-only cookie
7. **Return response** → Returns user data (excluding password)

## API Endpoint

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses:**

- **400 Bad Request**: Missing email or password
  ```json
  { "error": "Email and password are required" }
  ```

- **401 Unauthorized**: Invalid credentials
  ```json
  { "error": "Invalid email or password" }
  ```

- **404 Not Found**: Tenant not found
  ```json
  { "error": "Tenant not found" }
  ```

- **500 Internal Server Error**: Server error
  ```json
  { "error": "Internal server error" }
  ```

## Usage Example

### Frontend Login

```typescript
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.user;
}
```

### cURL Example

```bash
curl -X POST http://tenantA.localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Security Considerations

1. **Tenant Scoping**: 
   - Uses `dbUser.findByEmail(tenantId, email)` which automatically filters by tenant
   - Prevents users from logging into wrong tenant

2. **Password Security**:
   - Passwords are hashed with bcrypt (10 salt rounds)
   - Never returned in responses
   - Generic error messages don't reveal if user exists

3. **Session Security**:
   - Session created with tenantId validation
   - HTTP-only cookie prevents XSS attacks
   - Secure flag in production (HTTPS only)

4. **Error Handling**:
   - Generic error messages prevent user enumeration
   - Proper HTTP status codes
   - Error logging for debugging

## Integration with Other Tasks

- **Task 1**: Uses Prisma schema (User model)
- **Task 2**: Uses tenant lookup service
- **Task 3**: Uses tenant context from middleware
- **Task 4**: Uses session management
- **Task 5**: Uses tenant-scoped database helpers (`dbUser`)

## Password Hashing

When creating users, passwords must be hashed:

```typescript
import { hashPassword } from '@/lib/password';

const hashedPassword = await hashPassword('plaintextpassword');

await dbUser.create(tenantId, {
  email: 'user@example.com',
  password: hashedPassword,
  name: 'User Name',
});
```

## Files Created
1. `app/api/auth/login/route.ts` - Login API route handler
2. `lib/password.ts` - Password hashing utilities

## Dependencies Added
- `bcrypt` - Password hashing library
- `@types/bcrypt` - TypeScript types for bcrypt

## Testing

### Test Login Flow

1. **Create a test user** (with hashed password):
   ```typescript
   import { hashPassword } from '@/lib/password';
   import { dbUser } from '@/lib/db';
   
   const hashedPassword = await hashPassword('testpassword');
   await dbUser.create(tenantId, {
     email: 'test@example.com',
     password: hashedPassword,
     name: 'Test User',
   });
   ```

2. **Test login**:
   ```bash
   curl -X POST http://tenantA.localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword"}'
   ```

3. **Verify session cookie** is set in response headers

## Next Steps
After reviewing this task, proceed to Task 7: Implement dashboard route handler.

