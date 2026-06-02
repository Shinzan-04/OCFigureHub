import API from './client';

export const reviewsApi = {
  getByProduct: async (productId: string) => {
    const res = await API.get(`/reviews/product/${productId}`);
    return res.data;
  },

  addReview: async (productId: string, data: { rating: number; comment?: string }) => {
    const res = await API.post(`/reviews/product/${productId}`, data);
    return res.data;
  },

  deleteReview: async (reviewId: string) => {
    const res = await API.delete(`/reviews/${reviewId}`);
    return res.data;
  },
};
