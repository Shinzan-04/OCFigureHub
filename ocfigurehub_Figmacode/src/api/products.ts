import API from './client';
import type { Product, ProductDetail } from '../types/product';

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await API.get<Product[]>('/products');
    return res.data;
  },

  getDetail: async (id: string): Promise<ProductDetail> => {
    const res = await API.get<ProductDetail>(`/products/${id}`);
    return res.data;
  },
};
