"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useContinueWatchingMovies } from "@/modules/movie/hooks/useClientMovies";
import { useRouter } from "next/navigation";

export function ContinueWatchingSection() {
  const router = useRouter();
  const { data: movies = [], isLoading, isError } = useContinueWatchingMovies(true);

  if (isError || (!isLoading && movies.length === 0)) {
    return null;
  }

  if (isError) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 }, mt: 2 }}>
      <SectionHeader title="Tiếp tục xem" />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280 }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((item: any) => {
              if (!item.movie) return null;
              const movie = item.movie;
              const progress =
                item.watchedDurationSeconds && item.watchedDurationSeconds > 0
                  ? (item.stoppedAtSecond / item.watchedDurationSeconds) * 100
                  : 0;

              return (
                <Box
                  key={item.movieId || movie.id}
                  sx={{
                    minWidth: 280,
                    cursor: "pointer",
                    scrollSnapAlign: "start",
                  }}
                  onClick={() => router.push(`/movies/${movie.slug}`)}
                >
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl ?? undefined}
                    bannerUrl={movie.bannerUrl ?? undefined}
                    variant="default"
                    showProgress
                    progress={progress}
                  />
                </Box>
              );
            })}
      </HorizontalScrollGrid>
    </Box>
  );
}
