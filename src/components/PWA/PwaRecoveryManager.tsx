"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Snackbar } from "@mui/material";
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
    if ("BroadcastChannel" in window) channel = new BroadcastChannel(CHANNEL);

    const broadcast = (type: string) => {
      channel?.postMessage({ type, at: Date.now() });
      window.localStorage.setItem(CHANNEL, JSON.stringify({ type, at: Date.now() }));
    };

    const recover = async (source: "online" | "probe" | "broadcast") => {
      if (probingRef.current) return;
      probingRef.current = true;
      setRecovering(true);
      const ok = await probeServer();
      probingRef.current = false;
      setRecovering(false);
      if (!ok) return;

      setOffline(false);
      const shouldReload = wasOfflineRef.current && canReloadNow();
      wasOfflineRef.current = false;
      broadcast("RECOVERED");

      if (shouldReload || source === "broadcast") {
        window.sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
        if (document.visibilityState === "visible") {
          window.location.reload();
        } else {
          router.refresh();
        }
      } else {
        router.refresh();
      }
    };

    const markOffline = () => {
      wasOfflineRef.current = true;
      setOffline(true);
      broadcast("OFFLINE");
    };

    const handleOnline = () => recover("online");
    const handleOffline = () => markOffline();
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && wasOfflineRef.current) recover("probe");
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OFFLINE") {
        wasOfflineRef.current = true;
        setOffline(true);
      }
      if (event.data?.type === "RECOVERED") recover("broadcast");
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CHANNEL || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue);
        if (data.type === "OFFLINE") {
          wasOfflineRef.current = true;
          setOffline(true);
        }
        if (data.type === "RECOVERED") recover("broadcast");
      } catch {}
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    channel?.addEventListener("message", handleMessage);

    if (!navigator.onLine) markOffline();
    const interval = window.setInterval(() => {
      if (wasOfflineRef.current || !navigator.onLine) recover("probe");
    }, PROBE_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      channel?.removeEventListener("message", handleMessage);
      channel?.close();
      window.clearInterval(interval);
    };
  }, [router]);

  return (
    <Snackbar
      open={offline || recovering}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ zIndex: 1600 }}
    >
      <Box>
        <Alert
          severity={offline ? "warning" : "info"}
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Tải lại
            </Button>
          }
        >
          {offline
            ? "Bạn đang offline hoặc máy chủ chưa phản hồi. Gió Phim sẽ tự đồng bộ khi kết nối trở lại."
            : "Kết nối đã khôi phục, đang đồng bộ ứng dụng..."}
        </Alert>
      </Box>
    </Snackbar>
  );
}
