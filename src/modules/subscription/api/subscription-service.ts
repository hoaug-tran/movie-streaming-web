import apiClient from "@/services/api-client";
import { SubscriptionPlan, UserSubscription } from "@/modules/subscription/types/subscription";

class SubscriptionService {
  async getMySubscriptions(): Promise<UserSubscription[]> {
    return apiClient.get<UserSubscription[]>("/subscriptions/me");
  }

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    return apiClient.get<SubscriptionPlan[]>("/subscriptions/plans");
  }

  async getActiveSubscription(): Promise<UserSubscription | null> {
    try {
      const subs = await this.getMySubscriptions();
      return subs.find((s) => s.status === "ACTIVE") ?? null;
    } catch {
      return null;
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
