import API from './client';
import type { AuthResponse } from '../types/auth';

export interface VipInfo {
  planName: string | null;
  monthlyPrice: number | null;
  monthlyQuota: number | null;
  downloadsUsed: number;
  isActive: boolean;
  endAt: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  vipInfo: VipInfo | null;
}

export interface UpdateProfileRequest {
  displayName: string;
  bio?: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export const usersApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const res = await API.get<UserProfile>('/users/me');
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const res = await API.put<UserProfile>('/users/me', data);
    return res.data;
  },

  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await API.post<UploadAvatarResponse>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
