"use client";

import { useEffect, useState } from "react";
import { offlineStorage } from "@/lib/offline-storage";

interface UseOfflinePosterOptions {
  episodeId: number;
  fallbackUrl?: string;
  enabled?: boolean;
}

export function useOfflinePoster({
  episodeId,
  fallbackUrl,
  enabled = true,
}: UseOfflinePosterOptions): string | undefined {
  const [src, setSrc] = useState<string | undefined>(fallbackUrl);

  useEffect(() => {
    if (!enabled || !episodeId) {
      setSrc(fallbackUrl);
      return;
    }

    let blobUrl: string | null = null;
    let cancelled = false;

    offlineStorage
      .getPoster(episodeId)
      .then((rec) => {
        if (cancelled) return;
        if (rec?.data) {
          blobUrl = URL.createObjectURL(new Blob([rec.data], { type: rec.contentType }));
          setSrc(blobUrl);
        } else {
          setSrc(fallbackUrl);
        }
      })
      .catch(() => {
        if (!cancelled) setSrc(fallbackUrl);
      });

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [episodeId, fallbackUrl, enabled]);

  return src;
}
