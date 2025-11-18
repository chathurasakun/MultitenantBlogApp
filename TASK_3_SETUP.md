# Task 3: Middleware Implementation

## Overview
This task implements Next.js middleware to extract subdomain from incoming requests, lookup the tenant, and inject the `x-tenant-id` header for downstream route handlers.

## What's Included

### Middleware (`middleware.ts`)
- **Subdomain Extraction**: Extracts subdomain from request hostname
- **Tenant Lookup**: Uses `getTenantBySubdomain()` from Task 2
- **Header Injection**: Adds `x-tenant-id`, `x-tenant-subdomain`, and `x-tenant-name` headers
- **Error Handling**: Handles cases where subdomain or tenant is not found

### Features
- **Subdomain Parsing**: Handles both production (tenantA.yourapp.com) and local development scenarios
- **Tenant Validation**: Verifies tenant exists before injecting headers
- **Flexible Routing**: Configurable matcher to exclude static files and API routes
- **Node.js Runtime**: Configured to use Node.js runtime (required for Prisma)

## How It Works

1. **Request arrives** → Middleware intercepts
2. **Extract subdomain** → Parses hostname (e.g., "tenantA" from "tenantA.yourapp.com")
3. **Lookup tenant** → Queries database using tenant service
4. **Inject headers** → Adds `x-tenant-id` and related headers to request
5. **Continue** → Request proceeds to route handlers with tenant context

## Local Development

For local development, you have a few options:

### Option 1: Use localhost with query parameter
Modify the middleware to accept a tenant query parameter:
```
http://localhost:3000?tenant=tenantA
```

### Option 2: Configure hosts file
Add entries to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 tenantA.localhost
127.0.0.1 tenantB.localhost
```

Then access: `http://tenantA.localhost:3000`

### Option 3: Use a default tenant for localhost
Modify middleware to use a default tenant when subdomain is not found.

## Configuration

The middleware is configured to run on all routes except:
- `/api/*` - API routes (handled separately)
- `/_next/static/*` - Static files
- `/_next/image/*` - Image optimization
- `/favicon.ico` - Favicon

## Headers Injected

- `x-tenant-id`: UUID of the tenant
- `x-tenant-subdomain`: Subdomain identifier
- `x-tenant-name`: Display name of the tenant

## Usage in Route Handlers

Route handlers can now access tenant information:

```typescript
// app/api/example/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  const tenantSubdomain = request.headers.get('x-tenant-subdomain');
  
  // Use tenantId for database queries
  // ...
}
```

## Error Handling

Currently, if tenant is not found, the middleware continues without tenant context. You can customize this behavior:

- **Redirect to error page**: `NextResponse.redirect(new URL('/tenant-not-found', request.url))`
- **Return 404**: `new NextResponse('Tenant not found', { status: 404 })`
- **Use default tenant**: Continue with a fallback tenant

## Runtime Note

⚠️ **Important**: Next.js middleware runs on Edge runtime by default, which cannot use Prisma. 

**Solution**: The middleware only extracts the subdomain and passes it as a header (`x-tenant-subdomain`). The actual tenant lookup happens in route handlers/API routes which run on Node.js runtime and can use Prisma.

**How it works**:
1. Middleware (Edge runtime) extracts subdomain → sets `x-tenant-subdomain` header
2. Route handlers (Node.js runtime) read header → perform tenant lookup using Prisma
3. Route handlers can then set `x-tenant-id` header for downstream use

**Usage in Route Handlers**:
```typescript
import { getTenantFromRequest } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  const tenant = await getTenantFromRequest(request);
  if (!tenant) {
    return new NextResponse('Tenant not found', { status: 404 });
  }
  // Use tenant.id for database queries
}
```

## Files Created
1. `middleware.ts` - Next.js middleware implementation

## Dependencies
- Uses `lib/tenant.ts` (from Task 2)
- Uses `lib/prisma.ts` (from Task 1)

## Next Steps
After reviewing this task, proceed to Task 4: Set up session management with tenantId support.

