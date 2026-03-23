import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import toast from 'react-hot-toast';

export function useProductDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getDetail(id!),
    enabled: !!id,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isError) {
    toast.error('Không tải được chi tiết sản phẩm');
  }

  return query;
}
