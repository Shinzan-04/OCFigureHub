import API from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await API.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await API.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const res = await API.post<AuthResponse>('/auth/google', { credential });
    return res.data;
  },

  facebookLogin: async (accessToken: string): Promise<AuthResponse> => {
    const res = await API.post<AuthResponse>('/auth/facebook', { accessToken });
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await API.post<{ message: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; email: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await API.post<{ message: string }>('/auth/reset-password', data);
    return res.data;
  },
};
