import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { parsePagination, createPaginationMeta } from '../../utils/pagination';
import { NotFoundError } from '../../utils/errors';
import { AuthUser } from '../../types/auth';

export class AuditLogsService {
  async listLogs(
    authUser: AuthUser,
    query: {
      page?: string;
      limit?: string;
      action?: string;
      entityType?: string;
      userId?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { page, limit, skip, take } = parsePagination(query.page, query.limit);

    // Strict tenant isolation
    const where: Prisma.AuditLogWhereInput = {
      tenantId: authUser.tenantId,
      ...(query.action && { action: query.action }),
      ...(query.entityType && { entityType: query.entityType }),
      ...(query.userId && { userId: query.userId }),
      ...(query.search && {
        OR: [
          { description: { contains: query.search, mode: 'insensitive' } },
          { action: { contains: query.search, mode: 'insensitive' } },
          { entityType: { contains: query.search, mode: 'insensitive' } },
          { ipAddress: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...((query.startDate || query.endDate) && {
        createdAt: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          ...(query.endDate && { lte: new Date(query.endDate) }),
        },
      }),
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy = { [sortBy]: sortOrder };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs,
      pagination: createPaginationMeta(total, page, limit),
    };
  }

  async getLogById(id: string, authUser: AuthUser) {
    // Tenant isolation lookup
    const log = await prisma.auditLog.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundError('Audit log entry not found', 'AUDIT_LOG_NOT_FOUND');
    }

    return log;
  }
}

export const auditLogsService = new AuditLogsService();
