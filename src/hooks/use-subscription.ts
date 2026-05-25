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

const PLANS_CACHE_KEY = "cached-subscription-plans";
const SUB_CACHE_KEY = "cached-my-subscription";

export function useSubscription(): ActiveSubscriptionInfo & {
  isLoading: boolean;
  maxQuality: VideoQuality;
} {
  const { isAuthenticated, user } = useAuth();

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

  const isAdminOrMod = user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MODERATOR";

  if (!isAuthenticated || (!activeSub && !isAdminOrMod)) {
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

  const plan = plans?.find((p) => p.id === activeSub?.planId) ?? activeSub?.plan ?? null;
  const canWatchPremium = isAdminOrMod || plan?.code === "PREMIUM_PLUS" || plan?.code === "PREMIUM";
  const maxQuality: VideoQuality =
    isAdminOrMod || plan?.code === "PREMIUM_PLUS"
      ? "4K"
      : plan?.code === "PREMIUM"
        ? "1080p"
        : "720p";

  return {
    hasActiveSubscription: true,
    hasAdsFree: plan?.hasAdsFree ?? false,
    canWatchPremium,
    currentPlan: plan ?? null,
    subscription: activeSub ?? null,
    isLoading,
    maxQuality,
  };
}
