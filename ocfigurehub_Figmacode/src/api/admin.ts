import API from './client';
import type { Product, ProductDetail } from '../types/product';

export interface AdminCreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  creator: string;
  isPro: boolean;
  tags: string;
}

export interface AdminUpdateProductRequest extends AdminCreateProductRequest {
  isEnabled: boolean;
}

export const adminApi = {
  createProduct: async (req: AdminCreateProductRequest): Promise<Product> => {
    const res = await API.post<Product>('/admin/products', req);
    return res.data;
  },

  updateProduct: async (id: string, req: AdminUpdateProductRequest): Promise<Product> => {
    const res = await API.put<Product>(`/admin/products/${id}`, req);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await API.delete(`/admin/products/${id}`);
  },

  uploadFile: async (
    productId: string,
    fileType: number, // 1=Model, 2=Preview, 3=Thumbnail
    format: string,
    file: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await API.post(`/admin/products/${productId}/upload`, formData, {
      params: { fileType, format },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
