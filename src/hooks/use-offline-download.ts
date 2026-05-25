"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadEpisode, DownloadProgress, DownloadStatus } from "@/lib/offline-downloader";
import { offlineStorage, OfflineMovieRecord } from "@/lib/offline-storage";
import { usePwa } from "./use-pwa";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSubscription } from "./use-subscription";
import { precacheOfflineApp } from "@/lib/sw-client";

interface UseOfflineDownloadReturn {
  status: DownloadStatus;
  progress: DownloadProgress | null;
  record: OfflineMovieRecord | null;
  isPWA: boolean;
  mounted: boolean;
  canInstall: boolean;
  isIOS: boolean;
  isSafari: boolean;
  needsManualInstall: boolean;
  isInstalled: boolean;
  canDownloadOffline: boolean;
  startDownload: (quality?: string) => Promise<void>;
  cancelDownload: () => void;
  deleteDownload: () => Promise<void>;
  promptInstall: () => Promise<boolean>;
}

export function useOfflineDownload(episodeId: number): UseOfflineDownloadReturn {
  const {
    isPWA,
    canInstall,
    promptInstall,
    mounted,
    isIOS,
    isSafari,
    needsManualInstall,
    isInstalled,
  } = usePwa();
  const { isAuthenticated } = useAuth();
  const { hasActiveSubscription, currentPlan } = useSubscription();
  const canDownloadOffline =
    isAuthenticated && hasActiveSubscription && currentPlan?.code === "PREMIUM_PLUS";
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [record, setRecord] = useState<OfflineMovieRecord | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!episodeId) return;

    let cancelled = false;

    offlineStorage.isDownloaded(episodeId).then((downloaded) => {
      if (cancelled) return;

      if (downloaded) {
        offlineStorage.getMovie(episodeId).then(async (rec) => {
          if (cancelled) return;

          setRecord(rec ?? null);

          await precacheOfflineApp().catch(() => null);

          if (!cancelled) {
            setStatus("downloaded");
          }
        });
      } else {
        setStatus("idle");
        setRecord(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  const startDownload = useCallback(
    async (quality = "720p") => {
      if (!isPWA || !canDownloadOffline) return;
      if (status === "downloading") return;

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("downloading");
      setProgress({ downloaded: 0, total: 0, percent: 0, bytesDownloaded: 0 });

      try {
        await downloadEpisode(episodeId, quality, setProgress, controller.signal);

        const rec = await offlineStorage.getMovie(episodeId);
        setRecord(rec ?? null);

        
        await precacheOfflineApp();

        setStatus("downloaded");
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") {
          setStatus("idle");
        } else {
          console.error("[OfflineDownload] download failed", err);
          setStatus("error");
        }
      } finally {
        abortRef.current = null;
        setProgress(null);
      }
    },
    [episodeId, isPWA, canDownloadOffline, status]
  );

  const cancelDownload = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
    setProgress(null);
  }, []);

  const deleteDownload = useCallback(async () => {
    await offlineStorage.deleteMovie(episodeId);
    setRecord(null);
    setStatus("idle");
  }, [episodeId]);

  return {
    status,
    progress,
    record,
    isPWA: mounted ? isPWA : false,
    mounted,
    canInstall,
    isIOS,
    isSafari,
    needsManualInstall,
    isInstalled: mounted ? isInstalled : false,
    canDownloadOffline: mounted ? canDownloadOffline : false,
    startDownload,
    cancelDownload,
    deleteDownload,
    promptInstall,
  };
}
