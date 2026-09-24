import { apiClient } from './client';
import { ApiResponse, DashboardMetrics } from '../types';

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard');
    return res.data.data;
  },
};
