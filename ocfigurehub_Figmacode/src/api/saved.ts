import API from './client';
import type { Product } from '../types/product';

export interface SavedItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  creator: string;
  price: number;
  thumbnailUrl?: string;
  previewModelUrl?: string;
  license: string;
  isPro: boolean;
  savedAt: string;
}

export const savedApi = {
  /** GET /api/users/me/saved — fetch all saved items for current user */
  getAll: async (): Promise<SavedItem[]> => {
    const res = await API.get<SavedItem[]>('/users/me/saved');
    return res.data;
  },

  /** GET /api/users/me/saved/{productId} — check if a product is saved */
  isSaved: async (productId: string): Promise<boolean> => {
    const res = await API.get<boolean>(`/users/me/saved/${productId}`);
    return res.data;
  },

  /** POST /api/users/me/saved/{productId} — save a product */
  save: async (productId: string): Promise<void> => {
    await API.post(`/users/me/saved/${productId}`);
  },

  /** DELETE /api/users/me/saved/{productId} — unsave a product */
  remove: async (productId: string): Promise<void> => {
    await API.delete(`/users/me/saved/${productId}`);
  },
};
