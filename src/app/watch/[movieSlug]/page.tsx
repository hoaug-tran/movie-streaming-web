"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";
import movieService from "@/modules/movie/api/movie-service";
import { useQuery } from "@tanstack/react-query";
import { offlineStorage } from "@/lib/offline-storage";
import { Episode, MovieDetail } from "@/modules/movie/types/movie";

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

interface WatchPageProps {
  params: Promise<{ movieSlug: string }>;
}



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

function WatchPageContent({ movieSlug }: { movieSlug: string }) {
  const searchParams = useSearchParams();
  const episodeIdParam = searchParams.get("episode");
  const resumeSecondParam = searchParams.get("t");
  const isOfflineMode = searchParams.get("offline") === "1";
  const episodeId = episodeIdParam ? parseInt(episodeIdParam, 10) : undefined;
  const resumeSecond = resumeSecondParam ? Math.max(0, parseInt(resumeSecondParam, 10)) : undefined;

  const [offlineData, setOfflineData] = useState<{
    movie: MovieDetail;
    episode: Episode;
  } | null>(null);
  const [offlineLoading, setOfflineLoading] = useState(isOfflineMode);
  const [offlineError, setOfflineError] = useState(false);

  useEffect(() => {
    if (!isOfflineMode || !episodeId) return;
    let cancelled = false;
    buildOfflineMovie(episodeId)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setOfflineData(data);
        } else {
          setOfflineError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setOfflineError(true);
      })
      .finally(() => {
        if (!cancelled) setOfflineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOfflineMode, episodeId]);

  const {
    data: movieDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["movie-for-watch", movieSlug],
    queryFn: () => movieService.getMovieDetailBySlug(movieSlug),
    staleTime: 5 * 60 * 1000,
    enabled: !isOfflineMode,
    retry: 0,
  });

  useEffect(() => {
    if (!isError || !episodeId || isOfflineMode) return;

    let cancelled = false;
    offlineStorage.getMovie(episodeId).then((cached) => {
      if (cancelled) return;
      if (cached) {
        window.location.href = `/watch/offline?episode=${episodeId}&slug=${movieSlug}`;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isError, episodeId, movieSlug, isOfflineMode]);

  if ((isOfflineMode && offlineLoading) || (!isOfflineMode && isLoading)) {
    return (
      <Box
        suppressHydrationWarning
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

  let movie: MovieDetail | null = null;
  let currentEpisode: Episode | null = null;

  if (isOfflineMode) {
    if (offlineError || !offlineData) {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100dvh",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            flexDirection: "column",
            gap: 2,
            textAlign: "center",
            p: 3,
          }}
        >
          <Box sx={{ fontSize: "1.2rem", fontWeight: 600 }}>Không tìm thấy phim đã tải</Box>
          <Box sx={{ fontSize: "0.95rem", opacity: 0.7 }}>
            Phim có thể đã bị xoá hoặc hết hạn. Vui lòng kết nối mạng và tải lại.
          </Box>
        </Box>
      );
    }
    movie = offlineData.movie;
    currentEpisode = offlineData.episode;
  } else {
    if (isError || !movieDetail?.movie) {
      notFound();
    }
    movie = movieDetail!.movie;
    const episodes = movie.episodes ?? [];
    currentEpisode = episodes.find((e) => e.id === episodeId) ?? episodes[0] ?? null;
  }

  if (!currentEpisode?.videoUrl) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100dvh",
          bgcolor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ fontSize: "1.2rem", opacity: 0.7 }}>Tập phim chưa có video</Box>
      </Box>
    );
  }

  return (
    <WatchPlayer
      movie={movie!}
      episodes={movie!.episodes ?? []}
      currentEpisode={currentEpisode}
      initialResumeSecond={resumeSecond}
    />
  );
}

export default function WatchPage({ params }: WatchPageProps) {
  const { movieSlug } = use(params);

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
        <WatchPageContent movieSlug={movieSlug} />
      </Suspense>
    </Box>
  );
}
