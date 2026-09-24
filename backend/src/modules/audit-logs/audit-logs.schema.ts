import { z } from 'zod';

export const listAuditLogsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    action: z.string().optional(),
    entityType: z.string().optional(),
    userId: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['action', 'entityType', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getAuditLogByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Audit log ID is required'),
  }),
});
