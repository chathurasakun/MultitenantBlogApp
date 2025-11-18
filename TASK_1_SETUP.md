# Task 1: Prisma Database Setup

## Overview
This task sets up Prisma ORM with PostgreSQL database schema for the multi-tenant blog application.

## What's Included

### Database Schema
- **Tenant**: Stores tenant information with unique subdomain
- **User**: Stores users with tenantId foreign key (allows same email across tenants)
- **Session**: Stores user sessions with tenantId
- **OrgSettings**: Stores organization/tenant-specific settings as JSON

### Files Created/Modified
1. `prisma/schema.prisma` - Database schema with all models and relations
2. `lib/prisma.ts` - Prisma client singleton for Next.js
3. `package.json` - Added Prisma dependencies

## Setup Instructions

1. **Set up PostgreSQL database** and create a `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/multitenant_blog?schema=public"
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run migrations** (after setting up database):
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Optional: Open Prisma Studio** to view/manage data:
   ```bash
   npx prisma studio
   ```

## Database Models

### Tenant
- `id`: UUID primary key
- `subdomain`: Unique subdomain identifier (e.g., "tenantA")
- `name`: Tenant display name
- Relations: users, sessions, orgSettings

### User
- `id`: UUID primary key
- `email`: User email (unique per tenant)
- `password`: Hashed password
- `name`: Optional user name
- `tenantId`: Foreign key to Tenant
- Unique constraint: (email, tenantId) - allows same email across tenants

### Session
- `id`: UUID primary key
- `userId`: Foreign key to User
- `tenantId`: Foreign key to Tenant
- `token`: Unique session token
- `expiresAt`: Session expiration timestamp

### OrgSettings
- `id`: UUID primary key
- `tenantId`: Unique foreign key to Tenant (one-to-one)
- `settings`: JSON field for flexible tenant settings

## Next Steps
After reviewing this task, proceed to Task 2: Create tenant lookup service.

