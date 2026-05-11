import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import toast from 'react-hot-toast';
import type { ProductQueryParams } from '../types/pagination';

export function useProducts(params?: ProductQueryParams) {
  const query = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isError) {
    toast.error('Không tải được danh sách sản phẩm');
  }

  return query;
}
