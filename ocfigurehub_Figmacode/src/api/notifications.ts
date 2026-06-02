import API from './client';

export const notificationsApi = {
  getAll: async (page = 1, pageSize = 20) => {
    const res = await API.get('/notifications', { params: { page, pageSize } });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await API.get('/notifications/unread-count');
    return res.data.count as number;
  },

  markRead: async (id: string) => {
    const res = await API.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await API.put('/notifications/read-all');
    return res.data;
  },

  delete: async (id: string) => {
    const res = await API.delete(`/notifications/${id}`);
    return res.data;
  },
};
