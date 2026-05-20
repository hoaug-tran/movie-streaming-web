"use client";

import { useEffect, useState, useCallback } from "react";
import { isIOSDevice, isSafariBrowser, isStandaloneDisplay } from "@/lib/platform";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePwaReturn {
  isPWA: boolean;
  canInstall: boolean;
  isOnline: boolean;
  mounted: boolean;
  isIOS: boolean;
  isSafari: boolean;
  needsManualInstall: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalCanInstall = false;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    globalCanInstall = true;
    window.dispatchEvent(new Event("pwa-installable"));
  });
  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    globalCanInstall = false;
    try {
      localStorage.setItem("pwa-installed", "1");
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("pwa-installable"));
  });
}

export function usePwa(): UsePwaReturn {
  const [mounted, setMounted] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [canInstall, setCanInstall] = useState(globalCanInstall);
  const [isOnline, setIsOnline] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsIOS(isIOSDevice());
    setIsSafari(isSafariBrowser());
    try {
      setIsInstalled(localStorage.getItem("pwa-installed") === "1" || isStandaloneDisplay());
    } catch {
      setIsInstalled(isStandaloneDisplay());
    }

    const checkPWA = () => {
      setIsPWA(isStandaloneDisplay());
    };

    checkPWA();
    setIsOnline(navigator.onLine);

    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", checkPWA);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleInstallable = () => setCanInstall(globalCanInstall);
    window.addEventListener("pwa-installable", handleInstallable);

    return () => {
      mq.removeEventListener("change", checkPWA);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("pwa-installable", handleInstallable);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!globalDeferredPrompt) return false;
    await globalDeferredPrompt.prompt();
    const { outcome } = await globalDeferredPrompt.userChoice;
    globalDeferredPrompt = null;
    globalCanInstall = false;
    setCanInstall(false);
    return outcome === "accepted";
  }, []);

  const needsManualInstall = mounted && !isPWA && isIOS && !canInstall;

  return {
    isPWA,
    canInstall,
    isOnline,
    mounted,
    isIOS,
    isSafari,
    needsManualInstall,
    isInstalled,
    promptInstall,
  };
}
