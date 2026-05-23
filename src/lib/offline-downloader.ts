import apiClient from "@/services/api-client";
import { offlineStorage } from "./offline-storage";

export interface OfflinePackage {
  offlineToken: string;
  expiresAt: string;
  segments: Array<{ url: string; keyUrl?: string }>;
  metadata: {
    movieId: number;
    movieSlug: string;
    movieTitle: string;
    episodeId: number;
    episodeTitle?: string;
    episodeNumber?: number;
    posterUrl?: string;
    durationSeconds: number;
    quality: string;
  };
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percent: number;
  bytesDownloaded: number;
}

export type DownloadStatus = "idle" | "downloading" | "downloaded" | "error" | "expired";

export async function fetchOfflinePackage(
  episodeId: number,
  quality: string
): Promise<OfflinePackage> {
  return apiClient.get<OfflinePackage>(`/stream/offline/episodes/${episodeId}/${quality}/package`);
}

async function cachePoster(episodeId: number, posterUrl: string | undefined): Promise<void> {
  if (!posterUrl) return;
  try {
    const res = await fetch(posterUrl, { mode: "cors", credentials: "omit" });
    if (!res.ok) return;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const data = await res.arrayBuffer();
    await offlineStorage.savePoster(episodeId, contentType, data);
  } catch {
    // ignore
  }
}

export async function downloadEpisode(
  episodeId: number,
  quality: string,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const pkg = await fetchOfflinePackage(episodeId, quality);

  const { segments, offlineToken, expiresAt, metadata } = pkg;
  const total = segments.length;
  let downloaded = 0;
  let bytesDownloaded = 0;
  const segmentUrls: string[] = segments.map((s) => s.url);

  await cachePoster(episodeId, metadata.posterUrl);

  let keyData: ArrayBuffer | undefined;
  if (segments[0]?.keyUrl) {
    const keyUrl = `${segments[0].keyUrl}?token=${encodeURIComponent(offlineToken)}`;
    const keyRes = await fetch(keyUrl, { signal });
    if (!keyRes.ok) throw new Error("Không thể tải key giải mã");
    keyData = await keyRes.arrayBuffer();
    await offlineStorage.saveKey(episodeId, quality, keyData);
  }

  const BATCH = 5;
  for (let i = 0; i < segments.length; i += BATCH) {
    if (signal?.aborted) throw new DOMException("Download cancelled", "AbortError");

    const batch = segments.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (seg) => {
        const res = await fetch(seg.url, {
          signal,
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Segment fetch failed: ${res.status}`);
        const data = await res.arrayBuffer();
        await offlineStorage.saveSegment(seg.url, data);
        downloaded++;
        bytesDownloaded += data.byteLength;
        onProgress?.({
          downloaded,
          total,
          percent: Math.round((downloaded / total) * 100),
          bytesDownloaded,
        });
      })
    );
  }

  await offlineStorage.saveMovie({
    episodeId,
    movieId: metadata.movieId,
    movieSlug: metadata.movieSlug,
    movieTitle: metadata.movieTitle,
    episodeTitle: metadata.episodeTitle,
    episodeNumber: metadata.episodeNumber,
    posterUrl: metadata.posterUrl,
    quality,
    durationSeconds: metadata.durationSeconds,
    segmentUrls,
    downloadedAt: new Date().toISOString(),
    expiresAt,
    sizeBytes: bytesDownloaded,
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
