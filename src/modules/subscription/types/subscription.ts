/* Subscription Domain Types */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  plan?: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
}

export interface SubscribeRequest {
  planId: string;
}
