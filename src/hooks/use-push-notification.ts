"use client";

import { useCallback, useEffect, useState } from "react";
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSupported,
  getNotificationPermission,
} from "@/lib/push-notification";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface UsePushNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

let subscribePromise: Promise<boolean> | null = null;

function subscribeOnce(): Promise<boolean> {
  if (!subscribePromise) {
    subscribePromise = subscribeToPush().finally(() => {
      subscribePromise = null;
    });
  }
  return subscribePromise;
}

export function usePushNotification(): UsePushNotificationReturn {
  const { isAuthenticated } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const currentPermission = getNotificationPermission();
    console.log(
      "[PushHook] mount — isAuthenticated:",
      isAuthenticated,
      "permission:",
      currentPermission
    );
    setPermission(currentPermission);

    if (!isPushSupported()) {
      console.warn("[PushHook] Push not supported on this browser");
      return;
    }
    if (!isAuthenticated) {
      console.log("[PushHook] Not authenticated, skipping");
      return;
    }

    if (currentPermission === "granted") {
      console.log("[PushHook] Permission already granted — auto-subscribing...");
      subscribeOnce().then((ok) => {
        if (cancelled) return;
        console.log("[PushHook] auto-subscribe result:", ok);
        setIsSubscribed(ok);
      });
      return () => {
        cancelled = true;
      };
    }

    console.log(
      "[PushHook] Permission not granted (",
      currentPermission,
      "), checking existing sub"
    );
    navigator.serviceWorker.ready.then((reg) => {
      if (cancelled) return;
      reg.pushManager.getSubscription().then((sub) => {
        if (cancelled) return;
        console.log("[PushHook] existing sub:", sub ? sub.endpoint : "none");
        setIsSubscribed(!!sub);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const subscribe = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const ok = await subscribeOnce();
      if (ok) {
        setIsSubscribed(true);
        setPermission("granted");
      } else {
        setPermission(getNotificationPermission());
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported: isPushSupported(),
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
