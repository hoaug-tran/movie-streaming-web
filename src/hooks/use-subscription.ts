"use client";

import { useQuery } from "@tanstack/react-query";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ActiveSubscriptionInfo } from "@/modules/subscription/types/subscription";

export function useSubscription(): ActiveSubscriptionInfo & { isLoading: boolean } {
  const { isAuthenticated } = useAuth();

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionService.getActivePlans(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: activeSub, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionService.getActiveSubscription(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  if (!isAuthenticated || !activeSub) {
    return {
      hasActiveSubscription: false,
      hasAdsFree: false,
      canWatchPremium: false,
      currentPlan: null,
      subscription: null,
      isLoading: false,
    };
  }

  const plan = plans?.find((p) => p.id === activeSub.planId) ?? null;
  const canWatchPremium =
    plan?.code === "PREMIUM_PLUS" || plan?.code === "PREMIUM";

  return {
    hasActiveSubscription: true,
    hasAdsFree: plan?.hasAdsFree ?? false,
    canWatchPremium,
    currentPlan: plan ?? null,
    subscription: activeSub,
    isLoading,
  };
}
