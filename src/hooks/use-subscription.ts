"use client";

import { useQuery } from "@tanstack/react-query";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  ActiveSubscriptionInfo,
  SubscriptionPlan,
  UserSubscription,
} from "@/modules/subscription/types/subscription";
import { getFromLocalStorage, setInLocalStorage } from "@/utils/helpers";

export type VideoQuality = "720p" | "1080p" | "4K";

// Cache vào localStorage để hook hoạt động khi offline.
// Khi không có mạng, react-query fail nhưng initialData từ cache giúp UI vẫn
// hiển thị đúng gói Premium Plus (border avatar, quyền canDownloadOffline...).
const PLANS_CACHE_KEY = "cached-subscription-plans";
const SUB_CACHE_KEY = "cached-my-subscription";

export function useSubscription(): ActiveSubscriptionInfo & {
  isLoading: boolean;
  maxQuality: VideoQuality;
} {
  const { isAuthenticated } = useAuth();

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const result = await subscriptionService.getActivePlans();
      if (Array.isArray(result) && result.length > 0) {
        setInLocalStorage(PLANS_CACHE_KEY, result);
      }
      return result;
    },
    staleTime: 10 * 60 * 1000,
    initialData: () => getFromLocalStorage<SubscriptionPlan[]>(PLANS_CACHE_KEY) ?? undefined,
  });

  const { data: activeSub, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const result = await subscriptionService.getActiveSubscription();
      if (result) {
        setInLocalStorage(SUB_CACHE_KEY, result);
      }
      return result;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    initialData: () =>
      isAuthenticated
        ? (getFromLocalStorage<UserSubscription>(SUB_CACHE_KEY) ?? undefined)
        : undefined,
  });

  if (!isAuthenticated || !activeSub) {
    return {
      hasActiveSubscription: false,
      hasAdsFree: false,
      canWatchPremium: false,
      currentPlan: null,
      subscription: null,
      isLoading: false,
      maxQuality: "720p",
    };
  }

  // Resolve plan: ưu tiên plans list, fallback sang plan kèm trong subscription
  // (để khi offline plans null thì vẫn lấy được plan.code từ snapshot trong sub).
  const plan = plans?.find((p) => p.id === activeSub.planId) ?? activeSub.plan ?? null;
  const canWatchPremium = plan?.code === "PREMIUM_PLUS" || plan?.code === "PREMIUM";
  const maxQuality: VideoQuality =
    plan?.code === "PREMIUM_PLUS" ? "4K" : plan?.code === "PREMIUM" ? "1080p" : "720p";

  return {
    hasActiveSubscription: true,
    hasAdsFree: plan?.hasAdsFree ?? false,
    canWatchPremium,
    currentPlan: plan ?? null,
    subscription: activeSub,
    isLoading,
    maxQuality,
  };
}
