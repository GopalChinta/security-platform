import { apiClient } from './client';
import { ApiResponse, PaginationMeta, Role, User } from '../types';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export const usersApi = {
  getUsers: async (params?: UserListParams): Promise<{ items: User[]; pagination: PaginationMeta }> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
    );
    const res = await apiClient.get<ApiResponse<User[]>>('/users', { params: cleanParams });
    return {
      items: res.data.data,
      pagination: res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>('/users', payload);
    return res.data.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/users/${id}`);
  },
};
