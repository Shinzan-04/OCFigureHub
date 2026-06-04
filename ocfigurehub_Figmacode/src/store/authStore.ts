import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useSavedStore } from './savedStore';
import { usersApi } from '../api/users';
import type { JwtPayload } from '../types/auth';

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: 'Customer' | 'Admin';
  avatarUrl?: string | null;
  bio?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  facebookLogin: (accessToken: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
  updateProfile: (displayName: string, bio?: string) => Promise<boolean>;
  updateAvatar: (avatarUrl: string) => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          const res = await authApi.login({ email, password });
          try {
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            const user: AuthUser = {
              userId: res.userId,
              email: res.email,
              displayName: res.displayName,
              role: res.role as 'Customer' | 'Admin',
            };
            set({ token: res.accessToken, user, isLoggedIn: true });
            toast.success(`Xin chào, ${user.displayName}!`);
            useSavedStore.getState().fetchSaved();
            return true;
          } catch {
            set({ token: null, user: null, isLoggedIn: false });
            toast.error('Token không hợp lệ');
            return false;
          }
        } catch (err: any) {
          const msg = err.response?.data?.error || err.response?.data || 'Đăng nhập thất bại';
          toast.error(typeof msg === 'string' ? msg : 'Đăng nhập thất bại');
          return false;
        }
      },

      googleLogin: async (credential: string): Promise<boolean> => {
        try {
          const res = await authApi.googleLogin(credential);
          try {
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            const user: AuthUser = {
              userId: res.userId,
              email: res.email,
              displayName: res.displayName,
              role: res.role as 'Customer' | 'Admin',
            };
            set({ token: res.accessToken, user, isLoggedIn: true });
            toast.success(`Xin chào, ${user.displayName}!`);
            useSavedStore.getState().fetchSaved();
            return true;
          } catch {
            set({ token: null, user: null, isLoggedIn: false });
            toast.error('Token không hợp lệ');
            return false;
          }
        } catch (err: any) {
          const msg = err.response?.data?.error || err.response?.data || 'Đăng nhập Google thất bại';
          toast.error(typeof msg === 'string' ? msg : 'Đăng nhập Google thất bại');
          return false;
        }
      },

      facebookLogin: async (accessToken: string): Promise<boolean> => {
        try {
          const res = await authApi.facebookLogin(accessToken);
          try {
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            const user: AuthUser = {
              userId: res.userId,
              email: res.email,
              displayName: res.displayName,
              role: res.role as 'Customer' | 'Admin',
            };
            set({ token: res.accessToken, user, isLoggedIn: true });
            toast.success(`Xin chào, ${user.displayName}!`);
            useSavedStore.getState().fetchSaved();
            return true;
          } catch {
            set({ token: null, user: null, isLoggedIn: false });
            toast.error('Token không hợp lệ');
            return false;
          }
        } catch (err: any) {
          const msg = err.response?.data?.error || err.response?.data || 'Đăng nhập Facebook thất bại';
          toast.error(typeof msg === 'string' ? msg : 'Đăng nhập Facebook thất bại');
          return false;
        }
      },

      register: async (email: string, password: string, displayName: string): Promise<boolean> => {
        try {
          const res = await authApi.register({ email, password, displayName, role: 1 });
          try {
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            const user: AuthUser = {
              userId: res.userId,
              email: res.email,
              displayName: res.displayName,
              role: res.role as 'Customer' | 'Admin',
            };
            set({ token: res.accessToken, user, isLoggedIn: true });
            toast.success('Đăng ký thành công!');
            useSavedStore.getState().fetchSaved();
            return true;
          } catch {
            set({ token: null, user: null, isLoggedIn: false });
            toast.error('Token không hợp lệ');
            return false;
          }
        } catch (err: any) {
          const msg = err.response?.data?.error || err.response?.data || 'Đăng ký thất bại';
          toast.error(typeof msg === 'string' ? msg : 'Đăng ký thất bại');
          return false;
        }
      },

      logout: () => {
        useSavedStore.getState().reset();
        set({ token: null, user: null, isLoggedIn: false });
        toast.success('Đã đăng xuất');
      },

      hydrate: () => {
        const { token } = get();
        if (!token) return;
        try {
          const payload = jwtDecode<JwtPayload>(token);
          if (payload.exp * 1000 < Date.now()) {
            set({ token: null, user: null, isLoggedIn: false });
            toast.error('Phiên đăng nhập đã hết hạn');
            return;
          }
          // Token is still valid — user is already restored by persist
        } catch {
          set({ token: null, user: null, isLoggedIn: false });
        }
      },

      updateProfile: async (displayName: string, bio?: string): Promise<boolean> => {
        try {
          const updated = await usersApi.updateProfile({ displayName, bio });
          set((state) => ({
            user: state.user
              ? { ...state.user, displayName: updated.displayName, bio: updated.bio }
              : null,
          }));
          toast.success('Cập nhật thông tin thành công!');
          return true;
        } catch (err: any) {
          const msg = err.response?.data?.error || err.response?.data || 'Cập nhật thất bại';
          toast.error(typeof msg === 'string' ? msg : 'Cập nhật thất bại');
          return false;
        }
      },

      updateAvatar: (avatarUrl: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl } : null,
        }));
      },

      refreshProfile: async () => {
        const { isLoggedIn } = get();
        if (!isLoggedIn) return;
        try {
          const profile = await usersApi.getMyProfile();
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  displayName: profile.displayName,
                  avatarUrl: profile.avatarUrl,
                  bio: profile.bio,
                }
              : null,
          }));
        } catch {
          // Silent fail on refresh — don't bother user
        }
      },
    }),
    {
      name: 'oc-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
