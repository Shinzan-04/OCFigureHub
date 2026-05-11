import API from './client';
import type { Product, ProductDetail } from '../types/product';
import type { PagedResult, ProductQueryParams } from '../types/pagination';

export const productsApi = {
  getAll: async (params?: ProductQueryParams): Promise<PagedResult<Product>> => {
    const res = await API.get<PagedResult<Product>>('/products', { params });
    return res.data;
  },

  getDetail: async (id: string): Promise<ProductDetail> => {
    const res = await API.get<ProductDetail>(`/products/${id}`);
    return res.data;
  },
};
