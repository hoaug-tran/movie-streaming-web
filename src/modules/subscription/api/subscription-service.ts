import apiClient from "@/services/api-client";
import {
  Invoice,
  PaymentCheckoutResponse,
  PaymentTransaction,
  PaymentVerificationResponse,
  SubscriptionPlan,
  UserSubscription,
} from "@/modules/subscription/types/subscription";

class SubscriptionService {
  async getMySubscriptions(): Promise<UserSubscription[]> {
    return apiClient.get<UserSubscription[]>("/subscriptions/me/history");
  }

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    return apiClient.get<SubscriptionPlan[]>("/subscriptions/plans");
  }

  async getMyPayments(): Promise<PaymentTransaction[]> {
    return apiClient.get<PaymentTransaction[]>("/subscriptions/payments/me");
  }

  async getMyInvoices(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>("/subscriptions/invoices/me");
  }

  async getActiveSubscription(): Promise<UserSubscription | null> {
    try {
      const subscription = await apiClient.get<UserSubscription>("/subscriptions/me/current");
      return subscription?.id ? subscription : null;
    } catch (error: any) {
      if (error?.status === 204) {
        return null;
      }
      return null;
    }
  }

  async updateAutoRenew(autoRenew: boolean): Promise<UserSubscription> {
    return apiClient.patch<UserSubscription>("/subscriptions/me/current/auto-renew", { autoRenew });
  }

  async createCheckout(planId: number): Promise<PaymentCheckoutResponse> {
    return apiClient.post<PaymentCheckoutResponse>("/payments/checkout", undefined, {
      params: { planId },
    });
  }

  async verifyPayment(orderCode: string): Promise<PaymentVerificationResponse> {
    return apiClient.get<PaymentVerificationResponse>("/payments/success", {
      params: { orderCode },
    });
  }

  async verifyPaymentManually(orderCode: string): Promise<PaymentVerificationResponse> {
    return apiClient.post<PaymentVerificationResponse>(`/payments/${orderCode}/verify`);
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
