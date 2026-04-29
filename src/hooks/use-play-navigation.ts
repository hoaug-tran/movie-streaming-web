"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSubscription } from "@/hooks/use-subscription";

interface PlayOptions {
  movieSlug: string;
  movieId: number;
  isPremiumOnly?: boolean;
  episodeId?: number;
  isFreePreview?: boolean;
}

export function usePlayNavigation() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { canWatchPremium } = useSubscription();

  const navigateToWatch = useCallback(
    (options: PlayOptions) => {
      const { movieSlug, isPremiumOnly, episodeId, isFreePreview } = options;

      if (isPremiumOnly) {
        if (!isAuthenticated) {
          router.push("/pricing");
          return;
        }
        if (!canWatchPremium) {
          router.push("/pricing");
          return;
        }
      } else {
        if (!isFreePreview && !isAuthenticated) {
          router.push(`/auth/login?redirect=/watch/${movieSlug}`);
          return;
        }
      }

      const url = episodeId
        ? `/watch/${movieSlug}?episode=${episodeId}`
        : `/watch/${movieSlug}`;

      router.push(url);
    },
    [router, isAuthenticated, canWatchPremium]
  );

  return { navigateToWatch };
}
