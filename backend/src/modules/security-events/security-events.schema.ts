import { z } from 'zod';
import { Severity, EventStatus } from '@prisma/client';

export const createSecurityEventSchema = z.object({
  body: z.object({
    eventType: z.string({ required_error: 'Event type is required' }).min(2, 'Event type must be at least 2 characters').trim(),
    severity: z.nativeEnum(Severity, { errorMap: () => ({ message: 'Severity must be LOW, MEDIUM, HIGH, or CRITICAL' }) }),
    status: z.nativeEnum(EventStatus).default(EventStatus.OPEN),
    description: z.string({ required_error: 'Description is required' }).min(5, 'Description must be at least 5 characters').trim(),
  }),
});

export const updateSecurityEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Event ID is required'),
  }),
  body: z.object({
    eventType: z.string().min(2).trim().optional(),
    severity: z.nativeEnum(Severity).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    description: z.string().min(5).trim().optional(),
  }),
});

export const listSecurityEventsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    severity: z.nativeEnum(Severity).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    eventType: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['eventType', 'severity', 'status', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getSecurityEventByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Event ID is required'),
  }),
});

export type CreateSecurityEventInput = z.infer<typeof createSecurityEventSchema>['body'];
export type UpdateSecurityEventInput = z.infer<typeof updateSecurityEventSchema>['body'];
