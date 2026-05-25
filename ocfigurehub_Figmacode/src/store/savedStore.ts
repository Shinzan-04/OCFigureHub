import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { savedApi, type SavedItem } from '../api/saved';
import { useAuthStore } from './authStore';

interface SavedState {
  /** List of saved product IDs for quick lookup */
  savedIds: string[];
  /** Full saved items (with product details) for SavedPage display */
  savedItems: SavedItem[];
  /** Whether we have fetched from API at least once */
  isLoaded: boolean;
  /** Loading state for the saved list */
  isLoading: boolean;

  /** Fetch saved items from API */
  fetchSaved: () => Promise<void>;

  /** Add a product to saved list (calls API + updates local state) */
  saveItem: (productId: string) => Promise<void>;

  /** Remove a product from saved list (calls API + updates local state) */
  removeItem: (productId: string) => Promise<void>;

  /** Toggle save state for a product */
  toggleSaved: (productId: string) => Promise<void>;

  /** Check if a product is saved */
  isSaved: (productId: string) => boolean;

  /** Reset all saved state (e.g. on logout) */
  reset: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedItems: [],
      isLoaded: false,
      isLoading: false,

      fetchSaved: async () => {
        const { isLoggedIn } = useAuthStore.getState();
        if (!isLoggedIn) {
          set({ savedIds: [], savedItems: [], isLoaded: true });
          return;
        }

        set({ isLoading: true });
        try {
          const items = await savedApi.getAll();
          const ids = items.map((i) => i.productId);
          set({ savedIds: ids, savedItems: items, isLoaded: true });
        } catch (err: any) {
          toast.error('Không thể tải danh sách yêu thích.');
          set({ isLoaded: true });
        } finally {
          set({ isLoading: false });
        }
      },

      saveItem: async (productId: string) => {
        try {
          await savedApi.save(productId);
          set((state) => ({
            savedIds: state.savedIds.includes(productId)
              ? state.savedIds
              : [...state.savedIds, productId],
          }));
        } catch (err: any) {
          toast.error('Không thể lưu sản phẩm.');
          throw err;
        }
      },

      removeItem: async (productId: string) => {
        try {
          await savedApi.remove(productId);
          set((state) => ({
            savedIds: state.savedIds.filter((id) => id !== productId),
            savedItems: state.savedItems.filter((i) => i.productId !== productId),
          }));
        } catch (err: any) {
          toast.error('Không thể xóa sản phẩm khỏi danh sách yêu thích.');
          throw err;
        }
      },

      toggleSaved: async (productId: string) => {
        const { isLoggedIn } = useAuthStore.getState();
        if (!isLoggedIn) {
          toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
          return;
        }

        const saved = get().isSaved(productId);
        if (saved) {
          await get().removeItem(productId);
          toast.success('Đã xóa khỏi danh sách yêu thích.');
        } else {
          await get().saveItem(productId);
          toast.success('Đã lưu vào danh sách yêu thích!');
        }
      },

      isSaved: (productId: string) => {
        return get().savedIds.includes(productId);
      },

      reset: () => {
        set({ savedIds: [], savedItems: [], isLoaded: false, isLoading: false });
      },
    }),
    {
      name: 'oc-saved',
      partialize: (state) => ({ savedIds: state.savedIds }),
    }
  )
);
