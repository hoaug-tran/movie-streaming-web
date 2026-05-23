"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_KEYS } from "./useNotifications";

export function useNotificationSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "REFRESH_NOTIFICATIONS") {
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, [queryClient]);
}
