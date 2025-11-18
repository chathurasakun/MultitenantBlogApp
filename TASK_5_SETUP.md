# Task 5: Prisma Client Helpers for Tenant-Scoped Queries

## Overview
This task creates helper functions that automatically scope database queries by tenantId, ensuring data isolation and making it easier to write tenant-aware queries.

## What's Included

### Database Helpers (`lib/db.ts`)

#### User Helpers (`dbUser`)
- `findByEmail(tenantId, email)` - Find user by email within tenant
- `findById(tenantId, userId)` - Find user by ID within tenant
- `findMany(tenantId, options?)` - Find all users for tenant
- `count(tenantId, options?)` - Count users for tenant
- `create(tenantId, data)` - Create user for tenant
- `update(tenantId, userId, data)` - Update user within tenant
- `delete(tenantId, userId)` - Delete user within tenant

#### Session Helpers (`dbSession`)
- `findByToken(tenantId, token)` - Find session by token within tenant
- `findByUserId(tenantId, userId)` - Find all sessions for user within tenant
- `findMany(tenantId, options?)` - Find all sessions for tenant
- `count(tenantId, options?)` - Count sessions for tenant
- `create(tenantId, data)` - Create session for tenant
- `deleteByToken(tenantId, token)` - Delete session by token
- `deleteByUserId(tenantId, userId)` - Delete all sessions for user
- `deleteExpired(tenantId)` - Delete expired sessions for tenant

#### OrgSettings Helpers (`dbOrgSettings`)
- `get(tenantId)` - Get org settings for tenant
- `upsert(tenantId, settings)` - Create or update org settings
- `update(tenantId, settings)` - Update org settings
- `delete(tenantId)` - Delete org settings

#### Utility Functions
- `withTenant(tenantId, where?)` - Add tenantId to any Prisma where clause
- `createTenantScope(tenantId)` - Create a tenant-scoped query helper

## Features

### Automatic Tenant Scoping
All helper functions automatically add `tenantId` to queries, ensuring:
- **Data Isolation**: Queries only return data for the specified tenant
- **Security**: Prevents accidental cross-tenant data access
- **Simplicity**: No need to manually add `tenantId` to every query

### Type Safety
- Fully typed with TypeScript
- Uses Prisma generated types
- IntelliSense support for all operations

### Flexibility
- Supports Prisma query options (where, select, include, etc.)
- Can be combined with custom Prisma queries
- Works with all Prisma operations (find, create, update, delete)

## Usage Examples

### User Operations

```typescript
import { dbUser } from '@/lib/db';

// Find user by email within tenant
const user = await dbUser.findByEmail(tenantId, 'user@example.com');

// Find all users for tenant with pagination
const users = await dbUser.findMany(tenantId, {
  take: 10,
  skip: 0,
  orderBy: { createdAt: 'desc' },
});

// Create a new user
const newUser = await dbUser.create(tenantId, {
  email: 'newuser@example.com',
  password: hashedPassword,
  name: 'New User',
});

// Update user
await dbUser.update(tenantId, userId, {
  name: 'Updated Name',
});

// Count users
const userCount = await dbUser.count(tenantId);
```

### Session Operations

```typescript
import { dbSession } from '@/lib/db';

// Find session by token
const session = await dbSession.findByToken(tenantId, token);

// Find all sessions for a user
const userSessions = await dbSession.findByUserId(tenantId, userId);

// Delete expired sessions
await dbSession.deleteExpired(tenantId);

// Delete all sessions for a user (logout from all devices)
await dbSession.deleteByUserId(tenantId, userId);
```

### OrgSettings Operations

```typescript
import { dbOrgSettings } from '@/lib/db';

// Get org settings
const settings = await dbOrgSettings.get(tenantId);

// Create or update settings
await dbOrgSettings.upsert(tenantId, {
  theme: 'dark',
  language: 'en',
  features: ['feature1', 'feature2'],
});

// Update settings
await dbOrgSettings.update(tenantId, {
  theme: 'light',
});
```

### Using withTenant Helper

```typescript
import { withTenant } from '@/lib/db';
import { prisma } from '@/lib/prisma';

// Custom query with tenant scoping
const result = await prisma.user.findMany({
  where: withTenant(tenantId, {
    email: {
      contains: '@example.com',
    },
  }),
});
```

### Using createTenantScope

```typescript
import { createTenantScope } from '@/lib/db';

// Create a tenant-scoped query helper
const tenantDb = createTenantScope(tenantId);

// Use it for queries
const users = await tenantDb.user.findMany({
  take: 10,
});
```

## Benefits

1. **Prevents Data Leakage**: Automatic tenant scoping prevents accidental cross-tenant queries
2. **Cleaner Code**: No need to manually add `tenantId` to every query
3. **Type Safety**: Full TypeScript support with Prisma types
4. **Consistency**: Standardized way to query tenant-scoped data
5. **Maintainability**: Centralized query logic, easier to update

## Security Considerations

⚠️ **Important**: Always use these helpers instead of direct Prisma queries for tenant-scoped models. Direct queries without tenantId filtering can lead to data leakage.

**Good** ✅:
```typescript
const user = await dbUser.findByEmail(tenantId, email);
```

**Bad** ❌:
```typescript
const user = await prisma.user.findUnique({
  where: { email }, // Missing tenantId!
});
```

## Integration with Other Tasks

- **Task 1**: Uses Prisma client from `lib/prisma.ts`
- **Task 3**: Can be used with tenant context from `lib/tenant-context.ts`
- **Task 4**: Works with session management from `lib/session.ts`
- **Task 6**: Will be used in login route handler
- **Task 7**: Will be used in dashboard route handler

## Files Created
1. `lib/db.ts` - Tenant-scoped database helpers

## Dependencies
- Uses `lib/prisma.ts` (from Task 1)
- Uses Prisma generated types

## Next Steps
After reviewing this task, proceed to Task 6: Implement login route handler using these helpers.

