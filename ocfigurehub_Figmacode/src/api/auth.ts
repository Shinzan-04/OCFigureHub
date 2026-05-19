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
};
