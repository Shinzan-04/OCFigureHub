import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import toast from 'react-hot-toast';

export function useProducts() {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isError) {
    toast.error('Không tải được danh sách sản phẩm');
  }

  return query;
}
