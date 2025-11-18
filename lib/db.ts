import { prisma } from './prisma';
import { Prisma } from './generated/prisma';

/**
 * Tenant-scoped database helpers
 * These functions automatically filter queries by tenantId to ensure data isolation
 */

/**
 * User helpers - tenant-scoped user queries
 */
export const dbUser = {
  /**
   * Find a user by email within a tenant
   */
  async findByEmail(tenantId: string, email: string) {
    return prisma.user.findUnique({
      where: {
        email_tenantId: {
          email,
          tenantId,
        },
      },
    });
  },

  /**
   * Find a user by ID within a tenant
   */
  async findById(tenantId: string, userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });
  },

  /**
   * Find all users for a tenant
   */
  async findMany(tenantId: string, options?: Prisma.UserFindManyArgs) {
    return prisma.user.findMany({
      ...options,
      where: {
        ...options?.where,
        tenantId,
      },
    });
  },

  /**
   * Count users for a tenant
   */
  async count(tenantId: string, options?: Prisma.UserCountArgs) {
    return prisma.user.count({
      ...options,
      where: {
        ...options?.where,
        tenantId,
      },
    });
  },

  /**
   * Create a user for a tenant
   */
  async create(tenantId: string, data: Omit<Prisma.UserCreateInput, 'tenant'>) {
    return prisma.user.create({
      data: {
        ...data,
        tenant: {
          connect: { id: tenantId },
        },
      },
    });
  },

  /**
   * Update a user within a tenant
   */
  async update(tenantId: string, userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.updateMany({
      where: {
        id: userId,
        tenantId,
      },
      data,
    });
  },

  /**
   * Delete a user within a tenant
   */
  async delete(tenantId: string, userId: string) {
    return prisma.user.deleteMany({
      where: {
        id: userId,
        tenantId,
      },
    });
  },
};

/**
 * Session helpers - tenant-scoped session queries
 */
export const dbSession = {
  /**
   * Find a session by token within a tenant
   */
  async findByToken(tenantId: string, token: string) {
    return prisma.session.findFirst({
      where: {
        token,
        tenantId,
      },
    });
  },

  /**
   * Find all sessions for a user within a tenant
   */
  async findByUserId(tenantId: string, userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        tenantId,
      },
    });
  },

  /**
   * Find all sessions for a tenant
   */
  async findMany(tenantId: string, options?: Prisma.SessionFindManyArgs) {
    return prisma.session.findMany({
      ...options,
      where: {
        ...options?.where,
        tenantId,
      },
    });
  },

  /**
   * Count sessions for a tenant
   */
  async count(tenantId: string, options?: Prisma.SessionCountArgs) {
    return prisma.session.count({
      ...options,
      where: {
        ...options?.where,
        tenantId,
      },
    });
  },

  /**
   * Create a session for a tenant
   */
  async create(tenantId: string, data: Omit<Prisma.SessionCreateInput, 'tenant'>) {
    return prisma.session.create({
      data: {
        ...data,
        tenant: {
          connect: { id: tenantId },
        },
      },
    });
  },

  /**
   * Delete a session by token within a tenant
   */
  async deleteByToken(tenantId: string, token: string) {
    return prisma.session.deleteMany({
      where: {
        token,
        tenantId,
      },
    });
  },

  /**
   * Delete all sessions for a user within a tenant
   */
  async deleteByUserId(tenantId: string, userId: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
        tenantId,
      },
    });
  },

  /**
   * Delete expired sessions for a tenant
   */
  async deleteExpired(tenantId: string) {
    return prisma.session.deleteMany({
      where: {
        tenantId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  },
};

/**
 * OrgSettings helpers - tenant-scoped settings queries
 */
export const dbOrgSettings = {
  /**
   * Get org settings for a tenant
   */
  async get(tenantId: string) {
    return prisma.orgSettings.findUnique({
      where: {
        tenantId,
      },
    });
  },

  /**
   * Create or update org settings for a tenant
   */
  async upsert(tenantId: string, settings: Prisma.JsonValue) {
    return prisma.orgSettings.upsert({
      where: {
        tenantId,
      },
      create: {
        tenantId,
        settings,
      },
      update: {
        settings,
      },
    });
  },

  /**
   * Update org settings for a tenant
   */
  async update(tenantId: string, settings: Prisma.JsonValue) {
    return prisma.orgSettings.update({
      where: {
        tenantId,
      },
      data: {
        settings,
      },
    });
  },

  /**
   * Delete org settings for a tenant
   */
  async delete(tenantId: string) {
    return prisma.orgSettings.delete({
      where: {
        tenantId,
      },
    });
  },
};

/**
 * Generic helper to add tenantId to any Prisma where clause
 * Useful for custom queries that need tenant scoping
 */
export function withTenant<T extends { tenantId?: string }>(
  tenantId: string,
  where?: T
): T & { tenantId: string } {
  return {
    ...where,
    tenantId,
  } as T & { tenantId: string };
}

/**
 * Create a tenant-scoped Prisma query helper
 * Returns a function that automatically adds tenantId to queries
 */
export function createTenantScope(tenantId: string) {
  return {
    user: {
      findUnique: (args: Prisma.UserFindUniqueArgs) =>
        prisma.user.findUnique({
          ...args,
          where: withTenant(tenantId, args.where as any),
        }),
      findMany: (args?: Prisma.UserFindManyArgs) =>
        prisma.user.findMany({
          ...args,
          where: withTenant(tenantId, args?.where as any),
        }),
    },
    session: {
      findUnique: (args: Prisma.SessionFindUniqueArgs) =>
        prisma.session.findUnique({
          ...args,
          where: withTenant(tenantId, args.where as any),
        }),
      findMany: (args?: Prisma.SessionFindManyArgs) =>
        prisma.session.findMany({
          ...args,
          where: withTenant(tenantId, args?.where as any),
        }),
    },
    orgSettings: {
      findUnique: () => dbOrgSettings.get(tenantId),
    },
  };
}

