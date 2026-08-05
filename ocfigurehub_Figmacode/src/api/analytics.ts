import API from './client';

export const analyticsApi = {
  monthlyTrends: async (months = 8) => {
    const res = await API.get('/admin/analytics/monthly-trends', { params: { months } });
    return res.data;
  },

  activity: async (period = 'week') => {
    const res = await API.get('/admin/analytics/activity', { params: { period } });
    return res.data;
  },

  topProducts: async (period = 'week', limit = 10) => {
    const res = await API.get('/admin/analytics/top-products', { params: { period, limit } });
    return res.data;
  },

  categoryDistribution: async (period = 'week') => {
    const res = await API.get('/admin/analytics/category-distribution', { params: { period } });
    return res.data;
  },

  dashboardStats: async (period = 'week') => {
    const res = await API.get('/admin/analytics/dashboard-stats', { params: { period } });
    return res.data;
  },

  revenueSummary: async () => {
    const res = await API.get('/admin/analytics/revenue-summary');
    return res.data;
  },
};

export const categoriesApi = {
  getAll: async () => {
    const res = await API.get('/categories');
    return res.data;
  },

  getAllAdmin: async () => {
    const res = await API.get('/categories/admin');
    return res.data;
  },

  create: async (data: { name: string; slug?: string; description?: string; icon?: string; color?: string; sortOrder?: number }) => {
    const res = await API.post('/categories', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await API.put(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await API.delete(`/categories/${id}`);
    return res.data;
  },
};
