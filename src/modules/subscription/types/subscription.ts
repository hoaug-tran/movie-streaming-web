export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description: string;
  price: number;
  durationDays: number;
  maxDevices: number;
  videoQuality: string;
  hasAdsFree: boolean;
  isActive: boolean;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  startAt: string;
  endAt: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  autoRenew: boolean;
}

export interface ActiveSubscriptionInfo {
  hasActiveSubscription: boolean;
  hasAdsFree: boolean;
  canWatchPremium: boolean;
  currentPlan: SubscriptionPlan | null;
  subscription: UserSubscription | null;
}

export interface SubscribeRequest {
  planId: number;
}
