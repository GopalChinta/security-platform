export type Role = 'ADMIN' | 'MANAGER' | 'USER';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventStatus = 'OPEN' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string;
  tenantName?: string;
  tenantSlug?: string;
  assignedCampaignsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface CampaignUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  assignedAt: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role?: Role;
  };
  assignedUsersCount?: number;
  assignedUsers?: CampaignUser[];
}

export interface SecurityEvent {
  id: string;
  tenantId: string;
  eventType: string;
  severity: Severity;
  status: EventStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: Role;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface DashboardMetrics {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  metrics: {
    totalUsers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    draftCampaigns: number;
    cancelledCampaigns: number;
    openSecurityEvents: number;
    criticalSecurityEvents: number;
    highSecurityEvents: number;
    resolvedSecurityEvents: number;
  };
  charts: {
    campaignsByStatus: Record<CampaignStatus, number>;
    securityEventsSummary: {
      open: number;
      critical: number;
      high: number;
      resolved: number;
    };
    usersByRole: Record<Role, number>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    description: string;
    ipAddress?: string | null;
    createdAt: string;
    user?: {
      name: string;
      email: string;
      role: Role;
    } | null;
  }>;
}
