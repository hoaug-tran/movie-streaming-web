"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useRecommendedMovies } from "@/modules/movie/hooks/useClientMovies";
import { useRouter } from "next/navigation";

export function RecommendedSection() {
  const { data: movies = [], isLoading, isError } = useRecommendedMovies();
  const router = useRouter();

  if (isError || (!isLoading && movies.length === 0)) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 } }}>
      <SectionHeader
        title="Phim dành cho bạn"
        subtitle="Theo lịch sử xem của bạn"
        actionLink={{ label: "Xem tất cả", href: "/movies?sort=recommended" }}
      />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 8 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280 }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((item: any) => {
              if (!item.movie) return null;
              const movie = item.movie;
              return (
                <Box
                  key={item.id || movie.id}
                  onClick={() => router.push(`/movies/${movie.slug}`)}
                  sx={{
                    minWidth: 160,
                    cursor: "pointer",
                    scrollSnapAlign: "start",
                  }}
                >
                  <MovieCard {...getMovieCardProps(movie)} />
                </Box>
              );
            })}
      </HorizontalScrollGrid>
    </Box>
  );
}
