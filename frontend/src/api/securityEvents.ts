import { apiClient } from './client';
import { ApiResponse, EventStatus, PaginationMeta, SecurityEvent, Severity } from '../types';

export interface SecurityEventListParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: Severity | '';
  status?: EventStatus | '';
  eventType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSecurityEventPayload {
  eventType: string;
  severity: Severity;
  status?: EventStatus;
  description: string;
}

export interface UpdateSecurityEventPayload {
  eventType?: string;
  severity?: Severity;
  status?: EventStatus;
  description?: string;
}

export const securityEventsApi = {
  getEvents: async (params?: SecurityEventListParams): Promise<{ items: SecurityEvent[]; pagination: PaginationMeta }> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
    );
    const res = await apiClient.get<ApiResponse<SecurityEvent[]>>('/security-events', { params: cleanParams });
    return {
      items: res.data.data,
      pagination: res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  getEventById: async (id: string): Promise<SecurityEvent> => {
    const res = await apiClient.get<ApiResponse<SecurityEvent>>(`/security-events/${id}`);
    return res.data.data;
  },

  createEvent: async (payload: CreateSecurityEventPayload): Promise<SecurityEvent> => {
    const res = await apiClient.post<ApiResponse<SecurityEvent>>('/security-events', payload);
    return res.data.data;
  },

  updateEvent: async (id: string, payload: UpdateSecurityEventPayload): Promise<SecurityEvent> => {
    const res = await apiClient.patch<ApiResponse<SecurityEvent>>(`/security-events/${id}`, payload);
    return res.data.data;
  },
};
