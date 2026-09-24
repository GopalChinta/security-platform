import { Prisma, CampaignStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { parsePagination, createPaginationMeta } from '../../utils/pagination';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';
import { createAuditLog } from '../../utils/audit';
import { AuthUser } from '../../types/auth';
import { CreateCampaignInput, UpdateCampaignInput, AssignUserInput } from './campaigns.schema';

export class CampaignsService {
  /**
   * Validates state transitions according to business requirements:
   * DRAFT -> ACTIVE, CANCELLED
   * ACTIVE -> COMPLETED, CANCELLED
   * COMPLETED -> no transitions
   * CANCELLED -> no transitions
   */
  private validateStatusTransition(currentStatus: CampaignStatus, newStatus: CampaignStatus): void {
    if (currentStatus === newStatus) return;

    if (currentStatus === CampaignStatus.COMPLETED) {
      throw new BadRequestError('Cannot change status of a COMPLETED campaign', 'INVALID_STATUS_TRANSITION');
    }

    if (currentStatus === CampaignStatus.CANCELLED) {
      throw new BadRequestError('Cannot change status of a CANCELLED campaign', 'INVALID_STATUS_TRANSITION');
    }

    if (currentStatus === CampaignStatus.DRAFT) {
      if (newStatus !== CampaignStatus.ACTIVE && newStatus !== CampaignStatus.CANCELLED) {
        throw new BadRequestError(
          `Invalid status transition from DRAFT to ${newStatus}. Allowed transitions: ACTIVE, CANCELLED`,
          'INVALID_STATUS_TRANSITION'
        );
      }
    }

    if (currentStatus === CampaignStatus.ACTIVE) {
      if (newStatus !== CampaignStatus.COMPLETED && newStatus !== CampaignStatus.CANCELLED) {
        throw new BadRequestError(
          `Invalid status transition from ACTIVE to ${newStatus}. Allowed transitions: COMPLETED, CANCELLED`,
          'INVALID_STATUS_TRANSITION'
        );
      }
    }
  }

  async listCampaigns(
    authUser: AuthUser,
    query: {
      page?: string;
      limit?: string;
      search?: string;
      status?: CampaignStatus;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { page, limit, skip, take } = parsePagination(query.page, query.limit);

    // Strict tenant isolation
    const where: Prisma.CampaignWhereInput = {
      tenantId: authUser.tenantId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy = { [sortBy]: sortOrder };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedUsers: {
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
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    const formatted = campaigns.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      name: c.name,
      description: c.description,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      createdBy: c.createdBy,
      assignedUsersCount: c.assignedUsers.length,
      assignedUsers: c.assignedUsers.map((au) => ({
        id: au.user.id,
        name: au.user.name,
        email: au.user.email,
        role: au.user.role,
        assignedAt: au.assignedAt,
      })),
    }));

    return {
      items: formatted,
      pagination: createPaginationMeta(total, page, limit),
    };
  }

  async getCampaignById(id: string, authUser: AuthUser) {
    // Strict tenant isolation query
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId, // Must match tenant
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedUsers: {
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
          orderBy: {
            assignedAt: 'asc',
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    return {
      id: campaign.id,
      tenantId: campaign.tenantId,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      createdBy: campaign.createdBy,
      assignedUsers: campaign.assignedUsers.map((au) => ({
        id: au.user.id,
        name: au.user.name,
        email: au.user.email,
        role: au.user.role,
        assignedAt: au.assignedAt,
      })),
    };
  }

  async createCampaign(input: CreateCampaignInput, authUser: AuthUser, ipAddress?: string) {
    // Validate date logic
    if (input.startDate && input.endDate) {
      if (new Date(input.startDate) > new Date(input.endDate)) {
        throw new BadRequestError('Start date cannot be after end date', 'INVALID_DATES');
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        tenantId: authUser.tenantId, // Always use authenticated tenant
        name: input.name,
        description: input.description || null,
        status: input.status || CampaignStatus.DRAFT,
        createdById: authUser.userId,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'CAMPAIGN_CREATED',
      entityType: 'CAMPAIGN',
      entityId: campaign.id,
      description: `Campaign "${campaign.name}" created with status ${campaign.status}.`,
      metadata: { campaignId: campaign.id, name: campaign.name, status: campaign.status },
      ipAddress,
    });

    return campaign;
  }

  async updateCampaign(id: string, input: UpdateCampaignInput, authUser: AuthUser, ipAddress?: string) {
    // Find campaign inside tenant
    const existing = await prisma.campaign.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    // Validate status transition if changing status
    if (input.status && input.status !== existing.status) {
      this.validateStatusTransition(existing.status, input.status);
    }

    // Validate dates
    const startDate = input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : existing.startDate;
    const endDate = input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : existing.endDate;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestError('Start date cannot be after end date', 'INVALID_DATES');
    }

    const updated = await prisma.campaign.update({
      where: { id: existing.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status && { status: input.status }),
        ...(input.startDate !== undefined && { startDate }),
        ...(input.endDate !== undefined && { endDate }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'CAMPAIGN_UPDATED',
      entityType: 'CAMPAIGN',
      entityId: updated.id,
      description: `Campaign "${updated.name}" updated. Status: ${updated.status}.`,
      metadata: {
        campaignId: updated.id,
        previousStatus: existing.status,
        newStatus: updated.status,
      },
      ipAddress,
    });

    return updated;
  }

  async deleteCampaign(id: string, authUser: AuthUser, ipAddress?: string) {
    // Find campaign inside tenant
    const existing = await prisma.campaign.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    await prisma.campaign.delete({
      where: { id: existing.id },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'CAMPAIGN_DELETED',
      entityType: 'CAMPAIGN',
      entityId: id,
      description: `Campaign "${existing.name}" (ID: ${id}) was deleted.`,
      metadata: { deletedCampaignId: id, name: existing.name },
      ipAddress,
    });

    return { message: 'Campaign deleted successfully' };
  }

  async assignUserToCampaign(campaignId: string, input: AssignUserInput, authUser: AuthUser, ipAddress?: string) {
    // 1. Verify campaign belongs to current tenant
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        tenantId: authUser.tenantId,
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    // 2. Verify target user belongs to current tenant (Prevent Cross-Tenant Assignment!)
    const targetUser = await prisma.user.findFirst({
      where: {
        id: input.userId,
        tenantId: authUser.tenantId,
      },
    });

    if (!targetUser) {
      throw new NotFoundError('User not found in your organization', 'USER_NOT_FOUND');
    }

    // 3. Check for existing assignment
    const existingAssignment = await prisma.campaignUser.findUnique({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictError('User is already assigned to this campaign');
    }

    const assignment = await prisma.campaignUser.create({
      data: {
        campaignId: campaign.id,
        userId: targetUser.id,
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

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'CAMPAIGN_USER_ASSIGNED',
      entityType: 'CAMPAIGN_USER',
      entityId: campaign.id,
      description: `Assigned user ${targetUser.name} (${targetUser.email}) to campaign "${campaign.name}".`,
      metadata: {
        campaignId: campaign.id,
        assignedUserId: targetUser.id,
        assignedUserName: targetUser.name,
      },
      ipAddress,
    });

    return assignment;
  }

  async removeUserFromCampaign(campaignId: string, userId: string, authUser: AuthUser, ipAddress?: string) {
    // 1. Verify campaign belongs to current tenant
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        tenantId: authUser.tenantId,
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    // 2. Verify assignment exists
    const assignment = await prisma.campaignUser.findUnique({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('User assignment not found for this campaign', 'ASSIGNMENT_NOT_FOUND');
    }

    await prisma.campaignUser.delete({
      where: {
        id: assignment.id,
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'CAMPAIGN_USER_REMOVED',
      entityType: 'CAMPAIGN_USER',
      entityId: campaign.id,
      description: `Removed user ${assignment.user.name} from campaign "${campaign.name}".`,
      metadata: {
        campaignId: campaign.id,
        removedUserId: userId,
      },
      ipAddress,
    });

    return { message: 'User assignment removed successfully' };
  }
}

export const campaignsService = new CampaignsService();
