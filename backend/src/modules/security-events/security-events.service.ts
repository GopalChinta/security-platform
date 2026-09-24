import { Prisma, Severity, EventStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { parsePagination, createPaginationMeta } from '../../utils/pagination';
import { NotFoundError } from '../../utils/errors';
import { createAuditLog } from '../../utils/audit';
import { AuthUser } from '../../types/auth';
import { CreateSecurityEventInput, UpdateSecurityEventInput } from './security-events.schema';

export class SecurityEventsService {
  async listEvents(
    authUser: AuthUser,
    query: {
      page?: string;
      limit?: string;
      search?: string;
      severity?: Severity;
      status?: EventStatus;
      eventType?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { page, limit, skip, take } = parsePagination(query.page, query.limit);

    // Strict tenant isolation
    const where: Prisma.SecurityEventWhereInput = {
      tenantId: authUser.tenantId,
      ...(query.severity && { severity: query.severity }),
      ...(query.status && { status: query.status }),
      ...(query.eventType && {
        eventType: { contains: query.eventType, mode: 'insensitive' },
      }),
      ...(query.search && {
        OR: [
          { eventType: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
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

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return {
      items: events,
      pagination: createPaginationMeta(total, page, limit),
    };
  }

  async getEventById(id: string, authUser: AuthUser) {
    // Tenant-isolated query
    const event = await prisma.securityEvent.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
    });

    if (!event) {
      throw new NotFoundError('Security event not found', 'EVENT_NOT_FOUND');
    }

    return event;
  }

  async createEvent(input: CreateSecurityEventInput, authUser: AuthUser, ipAddress?: string) {
    const event = await prisma.securityEvent.create({
      data: {
        tenantId: authUser.tenantId, // Always use authenticated tenant
        eventType: input.eventType.toUpperCase(),
        severity: input.severity,
        status: input.status || EventStatus.OPEN,
        description: input.description,
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'SECURITY_EVENT_CREATED',
      entityType: 'SECURITY_EVENT',
      entityId: event.id,
      description: `Security event [${event.severity}] ${event.eventType} was created.`,
      metadata: {
        eventId: event.id,
        eventType: event.eventType,
        severity: event.severity,
        status: event.status,
      },
      ipAddress,
    });

    return event;
  }

  async updateEvent(id: string, input: UpdateSecurityEventInput, authUser: AuthUser, ipAddress?: string) {
    // Tenant isolation lookup
    const existing = await prisma.securityEvent.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Security event not found', 'EVENT_NOT_FOUND');
    }

    const updated = await prisma.securityEvent.update({
      where: { id: existing.id },
      data: {
        ...(input.eventType && { eventType: input.eventType.toUpperCase() }),
        ...(input.severity && { severity: input.severity }),
        ...(input.status && { status: input.status }),
        ...(input.description && { description: input.description }),
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'SECURITY_EVENT_UPDATED',
      entityType: 'SECURITY_EVENT',
      entityId: updated.id,
      description: `Security event ${updated.id} was updated. Status: ${updated.status}, Severity: ${updated.severity}.`,
      metadata: {
        eventId: updated.id,
        previousStatus: existing.status,
        newStatus: updated.status,
        previousSeverity: existing.severity,
        newSeverity: updated.severity,
      },
      ipAddress,
    });

    return updated;
  }
}

export const securityEventsService = new SecurityEventsService();
