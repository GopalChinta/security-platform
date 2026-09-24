import { z } from 'zod';
import { CampaignStatus } from '@prisma/client';

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Campaign name is required' }).min(2, 'Name must be at least 2 characters').trim(),
    description: z.string().optional(),
    status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
    startDate: z.string().datetime({ message: 'Invalid start date format' }).optional().nullable(),
    endDate: z.string().datetime({ message: 'Invalid end date format' }).optional().nullable(),
  }),
});

export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Campaign ID is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
    description: z.string().optional().nullable(),
    status: z.nativeEnum(CampaignStatus).optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
  }),
});

export const listCampaignsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(CampaignStatus).optional(),
    sortBy: z.enum(['name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getCampaignByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Campaign ID is required'),
  }),
});

export const assignUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Campaign ID is required'),
  }),
  body: z.object({
    userId: z.string({ required_error: 'User ID is required' }).min(1, 'User ID is required'),
  }),
});

export const removeUserAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Campaign ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>['body'];
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>['body'];
export type AssignUserInput = z.infer<typeof assignUserSchema>['body'];
