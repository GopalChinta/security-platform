import { CampaignStatus, Severity, EventStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AuthUser } from '../../types/auth';

export class DashboardService {
  async getMetrics(authUser: AuthUser) {
    const tenantId = authUser.tenantId;

    // Parallel tenant-isolated aggregations
    const [
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      draftCampaigns,
      cancelledCampaigns,
      openSecurityEvents,
      criticalSecurityEvents,
      highSecurityEvents,
      resolvedSecurityEvents,
      recentActivity,
      usersByRole,
    ] = await Promise.all([
      // Total users in tenant
      prisma.user.count({ where: { tenantId } }),

      // Campaign counts
      prisma.campaign.count({ where: { tenantId } }),
      prisma.campaign.count({ where: { tenantId, status: CampaignStatus.ACTIVE } }),
      prisma.campaign.count({ where: { tenantId, status: CampaignStatus.COMPLETED } }),
      prisma.campaign.count({ where: { tenantId, status: CampaignStatus.DRAFT } }),
      prisma.campaign.count({ where: { tenantId, status: CampaignStatus.CANCELLED } }),

      // Security event counts
      prisma.securityEvent.count({ where: { tenantId, status: EventStatus.OPEN } }),
      prisma.securityEvent.count({
        where: { tenantId, status: EventStatus.OPEN, severity: Severity.CRITICAL },
      }),
      prisma.securityEvent.count({
        where: { tenantId, status: EventStatus.OPEN, severity: Severity.HIGH },
      }),
      prisma.securityEvent.count({ where: { tenantId, status: EventStatus.RESOLVED } }),

      // Recent tenant activity (audit logs)
      prisma.auditLog.findMany({
        where: { tenantId },
        take: 8,
        orderBy: { createdAt: 'desc' },
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

      // Role distribution
      prisma.user.groupBy({
        by: ['role'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      tenant: {
        id: authUser.tenantId,
        name: authUser.tenantName,
        slug: authUser.tenantSlug,
      },
      metrics: {
        totalUsers,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        draftCampaigns,
        cancelledCampaigns,
        openSecurityEvents,
        criticalSecurityEvents,
        highSecurityEvents,
        resolvedSecurityEvents,
      },
      charts: {
        campaignsByStatus: {
          ACTIVE: activeCampaigns,
          DRAFT: draftCampaigns,
          COMPLETED: completedCampaigns,
          CANCELLED: cancelledCampaigns,
        },
        securityEventsSummary: {
          open: openSecurityEvents,
          critical: criticalSecurityEvents,
          high: highSecurityEvents,
          resolved: resolvedSecurityEvents,
        },
        usersByRole: usersByRole.reduce((acc, curr) => {
          acc[curr.role] = curr._count;
          return acc;
        }, {} as Record<string, number>),
      },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        user: log.user ? { name: log.user.name, email: log.user.email, role: log.user.role } : null,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
