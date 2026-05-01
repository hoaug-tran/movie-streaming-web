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
  plan?: SubscriptionPlan;
  remainingSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTransaction {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  providerTransactionId?: string;
  paidAt?: string;
}

export interface Invoice {
  id: number;
  paymentTransactionId: number;
  invoiceNumber: string;
  buyerName?: string;
  buyerEmail?: string;
  amount: number;
  issuedAt?: string;
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

export interface PaymentCheckoutResponse {
  paymentId: number;
  orderCode: string;
  checkoutUrl: string;
  amount: number;
  planName: string;
  billingType?: "NEW" | "RENEWAL" | "UPGRADE";
  originalAmount?: number;
  creditAmount?: number;
  chargedAmount?: number;
  remainingDays?: number;
  currentPlanName?: string;
  newPlanName?: string;
}
