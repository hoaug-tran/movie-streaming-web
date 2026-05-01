"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";
import movieService from "@/modules/movie/api/movie-service";
import { useQuery } from "@tanstack/react-query";

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

function WatchPageContent({ movieSlug }: { movieSlug: string }) {
  const searchParams = useSearchParams();
  const episodeIdParam = searchParams.get("episode");
  const resumeSecondParam = searchParams.get("t");
  const episodeId = episodeIdParam ? parseInt(episodeIdParam, 10) : undefined;
  const resumeSecond = resumeSecondParam ? Math.max(0, parseInt(resumeSecondParam, 10)) : undefined;

  const {
    data: movieDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["movie-for-watch", movieSlug],
    queryFn: () => movieService.getMovieDetailBySlug(movieSlug),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
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

  if (isError || !movieDetail?.movie) {
    notFound();
  }

  const movie = movieDetail!.movie;
  const episodes = movie.episodes ?? [];

  const currentEpisode = episodes.find((e) => e.id === episodeId) ?? episodes[0] ?? null;

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
      movie={movie}
      episodes={episodes}
      currentEpisode={currentEpisode}
      initialResumeSecond={resumeSecond}
    />
  );
}

export default function WatchPage({ params }: WatchPageProps) {
  const { movieSlug } = use(params);

  return (
    <Box
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
