import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions';
import toast from 'react-hot-toast';

export function useSubscriptionPlans() {
  const query = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getPlans(),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.isError) {
    toast.error('Không tải được danh sách gói');
  }

  return query;
}
