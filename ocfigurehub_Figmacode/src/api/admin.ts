import API from './client';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  totalAmount: number;
  planName?: string;
  createdAt: string;
  paidAt?: string;
  itemCount: number;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalDownloads: number;
  totalRevenue: number;
}

export const adminApi = {
  // Products (existing)
  createProduct: async (req: any) => {
    const res = await API.post('/admin/products', req);
    return res.data;
  },
  updateProduct: async (id: string, req: any) => {
    const res = await API.put(`/admin/products/${id}`, req);
    return res.data;
  },
  deleteProduct: async (id: string) => {
    await API.delete(`/admin/products/${id}`);
  },
  uploadFile: async (productId: string, fileType: number, format: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    await API.post(`/admin/products/${productId}/upload`, formData, {
      params: { fileType, format },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Users
  getUsers: async (page = 1, pageSize = 20, search?: string): Promise<PagedResponse<AdminUser>> => {
    const res = await API.get<PagedResponse<AdminUser>>('/admin/users', {
      params: { page, pageSize, search },
    });
    return res.data;
  },
  updateUserStatus: async (userId: string, status: string) => {
    const res = await API.put(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  // Orders
  getOrders: async (page = 1, pageSize = 20): Promise<PagedResponse<AdminOrder>> => {
    const res = await API.get<PagedResponse<AdminOrder>>('/admin/orders', {
      params: { page, pageSize },
    });
    return res.data;
  },

  // Dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const res = await API.get<DashboardStats>('/admin/reports/dashboard');
    return res.data;
  },

  // Reports
  getSalesReport: async (fromUtc: string, toUtc: string) => {
    const res = await API.get('/admin/reports/sales', { params: { fromUtc, toUtc } });
    return res.data;
  },
  getDownloadsReport: async (fromUtc: string, toUtc: string) => {
    const res = await API.get('/admin/reports/downloads', { params: { fromUtc, toUtc } });
    return res.data;
  },

  // Site Settings
  getSettings: async (group?: string) => {
    const res = await API.get('/admin/sitesettings', { params: group ? { group } : {} });
    return res.data;
  },
  saveSettings: async (data: Record<string, Record<string, string>>) => {
    const res = await API.put('/admin/sitesettings', data);
    return res.data;
  },
  uploadHeroModel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await API.post('/admin/sitesettings/upload-hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  sendTestEmail: async () => {
    const res = await API.post('/admin/sitesettings/test-email');
    return res.data as { message: string };
  },

  // CMS Content
  getCmsAll: async () => {
    const res = await API.get('/admin/cms');
    return res.data;
  },
  getCmsByType: async (type: string) => {
    const res = await API.get(`/admin/cms/${type}`);
    return res.data;
  },
  createCms: async (data: any) => {
    const res = await API.post('/admin/cms', data);
    return res.data;
  },
  updateCms: async (id: string, data: any) => {
    const res = await API.put(`/admin/cms/${id}`, data);
    return res.data;
  },
  deleteCms: async (id: string) => {
    const res = await API.delete(`/admin/cms/${id}`);
    return res.data;
  },

  // Membership & Saved Items
  getMembershipData: async () => {
    const res = await API.get('/admin/membership');
    return res.data;
  },
  getSavedItemsData: async () => {
    const res = await API.get('/admin/saved-items');
    return res.data;
  },

  // Subscription Plans
  updateSubscriptionPlan: async (id: string, data: { monthlyPrice: number, monthlyQuotaDownloads: number }) => {
    const res = await API.put(`/subscription-plans/${id}`, data);
    return res.data;
  },
};
// Force HMR update
