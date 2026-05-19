"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadEpisode, DownloadProgress, DownloadStatus } from "@/lib/offline-downloader";
import { offlineStorage, OfflineMovieRecord } from "@/lib/offline-storage";
import { usePwa } from "./use-pwa";

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
  startDownload: (quality?: string) => Promise<void>;
  cancelDownload: () => void;
  deleteDownload: () => Promise<void>;
  promptInstall: () => Promise<boolean>;
}

export function useOfflineDownload(episodeId: number): UseOfflineDownloadReturn {
  const { isPWA, canInstall, promptInstall, mounted, isIOS, isSafari, needsManualInstall } =
    usePwa();
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [record, setRecord] = useState<OfflineMovieRecord | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    offlineStorage.isDownloaded(episodeId).then((downloaded) => {
      if (downloaded) {
        offlineStorage.getMovie(episodeId).then((rec) => {
          setRecord(rec ?? null);
          setStatus("downloaded");
        });
      } else {
        setStatus("idle");
        setRecord(null);
      }
    });
  }, [episodeId]);

  const startDownload = useCallback(
    async (quality = "720p") => {
      if (!isPWA) return;
      if (status === "downloading") return;

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("downloading");
      setProgress({ downloaded: 0, total: 0, percent: 0, bytesDownloaded: 0 });

      try {
        await downloadEpisode(episodeId, quality, setProgress, controller.signal);
        const rec = await offlineStorage.getMovie(episodeId);
        setRecord(rec ?? null);
        setStatus("downloaded");
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") {
          setStatus("idle");
        } else {
          setStatus("error");
        }
      } finally {
        abortRef.current = null;
        setProgress(null);
      }
    },
    [episodeId, isPWA, status]
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
    startDownload,
    cancelDownload,
    deleteDownload,
    promptInstall,
  };
}
