# Task 2: Tenant Lookup Service

## Overview
This task creates a service to lookup tenants by subdomain from the database. This service will be used by the middleware in Task 3 to identify which tenant a request belongs to.

## What's Included

### Tenant Service (`lib/tenant.ts`)
- `getTenantBySubdomain(subdomain: string)`: Main function to lookup tenant by subdomain
  - Returns `TenantLookupResult | null`
  - Handles errors gracefully
  - Normalizes subdomain (lowercase, trimmed)
  - Returns null if tenant not found or on error
  
- `tenantExists(subdomain: string)`: Helper function to check if tenant exists
  - Returns boolean
  - Uses `getTenantBySubdomain` internally

### Features
- **Error Handling**: Gracefully handles database errors and returns null
- **Subdomain Normalization**: Converts subdomain to lowercase and trims whitespace
- **Type Safety**: Fully typed with TypeScript interfaces
- **Selective Fields**: Only selects necessary fields (excludes relations for performance)

## Usage Example

```typescript
import { getTenantBySubdomain, tenantExists } from '@/lib/tenant';

// Lookup tenant
const tenant = await getTenantBySubdomain('tenantA');
if (tenant) {
  console.log(`Found tenant: ${tenant.name} (ID: ${tenant.id})`);
} else {
  console.log('Tenant not found');
}

// Check if tenant exists
const exists = await tenantExists('tenantA');
```

## Files Created
1. `lib/tenant.ts` - Tenant lookup service

## Dependencies
- Uses `lib/prisma.ts` (from Task 1)
- Requires Prisma client to be generated (run `npx prisma generate` after setting up database)

## Next Steps
After reviewing this task, proceed to Task 3: Implement middleware.ts to use this service.

