import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import type { JwtPayload } from '../types/auth';

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: 'Customer' | 'Admin';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
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

      register: async (email: string, password: string, displayName: string): Promise<boolean> => {
        try {
          const res = await authApi.register({ email, password, displayName, role: 0 });
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
