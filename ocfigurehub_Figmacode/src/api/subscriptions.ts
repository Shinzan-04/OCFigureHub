import API from './client';
import type { SubscriptionPlan, Subscription, SubscribeRequest } from '../types/subscription';

export const subscriptionsApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await API.get<SubscriptionPlan[]>('/subscription-plans');
    return res.data;
  },

  getCurrent: async (): Promise<Subscription> => {
    const res = await API.get<Subscription>('/subscriptions/me');
    return res.data;
  },

  subscribe: async (data: SubscribeRequest): Promise<Subscription> => {
    const res = await API.post<Subscription>('/subscriptions/subscribe', data);
    return res.data;
  },
};
