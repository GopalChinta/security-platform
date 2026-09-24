import { apiClient } from './client';
import { ApiResponse, AuditLog, PaginationMeta } from '../types';

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const auditLogsApi = {
  getLogs: async (params?: AuditLogListParams): Promise<{ items: AuditLog[]; pagination: PaginationMeta }> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
    );
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', { params: cleanParams });
    return {
      items: res.data.data,
      pagination: res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  getLogById: async (id: string): Promise<AuditLog> => {
    const res = await apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
    return res.data.data;
  },
};
