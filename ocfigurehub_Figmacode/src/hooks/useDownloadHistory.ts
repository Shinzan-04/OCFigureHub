import { useQuery } from '@tanstack/react-query';
import { downloadsApi } from '../api/downloads';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function useDownloadHistory() {
  const query = useQuery({
    queryKey: ['download-history'],
    queryFn: () => downloadsApi.getHistory(),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error('Không tải được lịch sử download');
    }
  }, [query.isError]);

  return query;
}
