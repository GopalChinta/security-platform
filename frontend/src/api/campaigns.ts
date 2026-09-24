import { apiClient } from './client';
import { ApiResponse, Campaign, CampaignStatus, CampaignUser, PaginationMeta } from '../types';

export interface CampaignListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CampaignStatus | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  status?: CampaignStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string | null;
  status?: CampaignStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export const campaignsApi = {
  getCampaigns: async (params?: CampaignListParams): Promise<{ items: Campaign[]; pagination: PaginationMeta }> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
    );
    const res = await apiClient.get<ApiResponse<Campaign[]>>('/campaigns', { params: cleanParams });
    return {
      items: res.data.data,
      pagination: res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return res.data.data;
  },

  createCampaign: async (payload: CreateCampaignPayload): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>('/campaigns', payload);
    return res.data.data;
  },

  updateCampaign: async (id: string, payload: UpdateCampaignPayload): Promise<Campaign> => {
    const res = await apiClient.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, payload);
    return res.data.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/campaigns/${id}`);
  },

  assignUser: async (campaignId: string, userId: string): Promise<CampaignUser> => {
    const res = await apiClient.post<ApiResponse<CampaignUser>>(`/campaigns/${campaignId}/users`, { userId });
    return res.data.data;
  },

  removeUser: async (campaignId: string, userId: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/campaigns/${campaignId}/users/${userId}`);
  },
};
