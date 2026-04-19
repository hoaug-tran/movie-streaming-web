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

  if (isError) {
    return null;
  }

  if (!isLoading && movies.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 }, mt: 2 }}>
      <SectionHeader title="Continue Watching" />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280 }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((movie: any) => (
              <Box
                key={movie.id}
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
                  posterUrl={movie.poster_url}
                  variant="default"
                  showProgress
                  progress={Math.random() * 100}
                />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
