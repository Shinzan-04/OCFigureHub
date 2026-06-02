import API from './client';

export const newsletterApi = {
  subscribe: async (email: string) => {
    const res = await API.post('/newsletter/subscribe', { email });
    return res.data;
  },

  unsubscribe: async (email: string) => {
    const res = await API.post('/newsletter/unsubscribe', { email });
    return res.data;
  },
};
