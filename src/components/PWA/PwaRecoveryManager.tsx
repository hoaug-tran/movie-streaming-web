"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";

const CHANNEL = "giophim-pwa-recovery";
const LAST_RELOAD_KEY = "giophim.pwa.last-recovery-reload";
const RELOAD_COOLDOWN_MS = 30_000;
const PROBE_INTERVAL_MS = 8_000;

function canReloadNow() {
  const last = Number(window.sessionStorage.getItem(LAST_RELOAD_KEY) || 0);
  return Date.now() - last > RELOAD_COOLDOWN_MS;
}

async function probeServer() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch("/api/v1/health", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    });

    return res.ok || res.status === 404;
  } catch {
    try {
      const res = await fetch("/manifest.json?probe=" + Date.now(), {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      return res.ok;
    } catch {
      return false;
    }
  } finally {
    window.clearTimeout(timer);
  }
}

export default function PwaRecoveryManager() {
  const router = useRouter();
  const [offline, setOffline] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const wasOfflineRef = useRef(false);
  const probingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL);
    }

    const broadcast = (type: string) => {
      const payload = { type, at: Date.now() };
      channel?.postMessage(payload);
      window.localStorage.setItem(CHANNEL, JSON.stringify(payload));
    };

    const recover = async () => {
      if (probingRef.current || !wasOfflineRef.current) return;

      probingRef.current = true;
      setRecovering(true);

      const ok = await probeServer();

      probingRef.current = false;
      setRecovering(false);

      if (!ok) return;

      setOffline(false);

      const shouldReload = canReloadNow();
      wasOfflineRef.current = false;

      broadcast("RECOVERED");

      if (shouldReload) {
        window.sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));

        if (document.visibilityState === "visible") {
          window.location.reload();
        } else {
          router.refresh();
        }
      }
    };

    const markOffline = () => {
      wasOfflineRef.current = true;
      setOffline(true);
      broadcast("OFFLINE");
    };

    const handleOnline = () => {
      if (wasOfflineRef.current) {
        recover();
      }
    };
    const handleOffline = () => markOffline();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && wasOfflineRef.current) {
        recover();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OFFLINE") {
        wasOfflineRef.current = true;
        setOffline(true);
      }

      if (event.data?.type === "RECOVERED" && wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setOffline(false);
        router.refresh();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CHANNEL || !event.newValue) return;

      try {
        const data = JSON.parse(event.newValue);

        if (data.type === "OFFLINE") {
          wasOfflineRef.current = true;
          setOffline(true);
        }

        if (data.type === "RECOVERED" && wasOfflineRef.current) {
          wasOfflineRef.current = false;
          setOffline(false);
          router.refresh();
        }
      } catch {}
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    channel?.addEventListener("message", handleMessage);

    let initialOfflineTimer: number | undefined;
    if (!navigator.onLine) {
      initialOfflineTimer = window.setTimeout(() => {
        if (!navigator.onLine) {
          markOffline();
        }
      }, 3000);
    }

    const interval = window.setInterval(() => {
      if (wasOfflineRef.current) {
        recover();
      }
    }, PROBE_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      channel?.removeEventListener("message", handleMessage);
      channel?.close();
      window.clearInterval(interval);
      if (initialOfflineTimer) window.clearTimeout(initialOfflineTimer);
    };
  }, [router]);

  return (
    <Snackbar
      open={offline || recovering}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        zIndex: 1600,
        bottom: {
          xs: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
          md: 32,
        },
        left: "50% !important",
        right: "auto !important",
        transform: "translateX(-50%)",
        width: {
          xs: "80vw",
          sm: "min(80vw, 520px)",
        },
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <Alert
        severity={offline ? "warning" : "info"}
        variant="filled"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => window.location.reload()}
            sx={{
              alignSelf: "center",
              whiteSpace: "nowrap",
            }}
          >
            Tải lại
          </Button>
        }
        sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 18px 60px rgba(0,0,0,0.38)",
          alignItems: "center",
          "& .MuiAlert-icon": {
            alignItems: "center",
            pt: 0,
          },
          "& .MuiAlert-message": {
            width: "100%",
            lineHeight: 1.35,
          },
          "& .MuiAlert-action": {
            alignItems: "center",
            pt: 0,
            pl: 1,
          },
        }}
      >
        {offline ? "Mất kết nối. Sẽ tự đồng bộ lại." : "Đang đồng bộ lại ứng dụng..."}
      </Alert>
    </Snackbar>
  );
}
