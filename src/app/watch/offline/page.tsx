"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { offlineStorage } from "@/lib/offline-storage";
import type { Episode, MovieDetail } from "@/modules/movie/types/movie";

const WatchPlayer = dynamic(() => import("@/components/Watch/WatchPlayer"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: "100vw",
        height: "100dvh",
        bgcolor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress sx={{ color: "#C8102E" }} />
    </Box>
  ),
});

async function buildOfflineMovie(episodeId: number): Promise<{
  movie: MovieDetail;
  episode: Episode;
} | null> {
  const record = await offlineStorage.getMovie(episodeId);
  if (!record) return null;

  const episode: Episode = {
    id: record.episodeId,
    title: record.episodeTitle,
    episodeNumber: record.episodeNumber,
    videoUrl: `/__offline__/playlist/${record.episodeId}.m3u8`,
    durationSeconds: record.durationSeconds,
    availableQualities: [record.quality],
  };

  const movie: MovieDetail = {
    id: record.movieId,
    title: record.movieTitle,
    slug: record.movieSlug,
    posterUrl: record.posterUrl ?? null,
    episodes: [episode],
    categories: [],
    tags: [],
    persons: [],
    studios: [],
  };

  return { movie, episode };
}

function OfflineWatchContent() {
  const searchParams = useSearchParams();
  const episodeIdParam = searchParams.get("episode");
  const episodeId = episodeIdParam ? parseInt(episodeIdParam, 10) : NaN;

  const [data, setData] = useState<{ movie: MovieDetail; episode: Episode } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(episodeId)) {
      setError("Thiếu mã tập phim trên đường dẫn.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    buildOfflineMovie(episodeId)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setData(result);
        } else {
          setError("Không tìm thấy phim đã tải. Phim có thể đã bị xoá hoặc hết hạn 48h.");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Không đọc được dữ liệu offline.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100dvh",
          bgcolor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#C8102E" }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100dvh",
          bgcolor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          textAlign: "center",
          px: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Không thể phát phim ngoại tuyến
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 420 }}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            window.location.href = "/downloads";
          }}
        >
          Về thư viện đã tải
        </Button>
      </Box>
    );
  }

  return <WatchPlayer movie={data.movie} episodes={[data.episode]} currentEpisode={data.episode} />;
}

export default function OfflineWatchPage() {
  return (
    <Box
      suppressHydrationWarning
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#000",
        zIndex: 9000,
      }}
    >
      <Suspense
        fallback={
          <Box
            sx={{
              width: "100vw",
              height: "100dvh",
              bgcolor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ color: "#C8102E" }} />
          </Box>
        }
      >
        <OfflineWatchContent />
      </Suspense>
    </Box>
  );
}
