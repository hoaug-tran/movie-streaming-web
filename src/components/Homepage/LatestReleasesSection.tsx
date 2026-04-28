"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useLatestMovies } from "@/modules/movie/hooks/useClientMovies";
import { useRouter } from "next/navigation";

export function LatestReleasesSection() {
  const { data: movies = [], isLoading, isError } = useLatestMovies();
  const router = useRouter();

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 } }}>
      <SectionHeader
        title="Phim mới tuần này"
        subtitle="Cập nhật mới trong tuần"
        actionLink={{ label: "Xem tất cả", href: "/movies?sort=latest" }}
      />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 8 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280 }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((movie) => (
              <Box
                key={movie.id}
                onClick={() => router.push(`/movies/${movie.slug}`)}
                sx={{
                  minWidth: 280,
                  cursor: "pointer",
                  scrollSnapAlign: "start",
                }}
              >
                <MovieCard
                  {...getMovieCardProps(movie, {
                    releaseDate:
                      movie.publishedAt ||
                      (movie.releaseYear ? `${movie.releaseYear}-01-01` : undefined),
                    variant: "default",
                  })}
                />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
