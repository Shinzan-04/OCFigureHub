export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  monthlyQuotaDownloads: number;
}

export interface Subscription {
  subscriptionId: string;
  planId: string;
  startAtUtc: string;
  endAtUtc: string;
  isActive: boolean;
}

export interface SubscribeRequest {
  planId: string;
}
