"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { useRouter } from "next/navigation";

export function TrendingSection() {
  const { trendingMovies } = useDiscovery();
  const { data: movies = [], isLoading, isError } = trendingMovies;
  const router = useRouter();

  return (
    <Box
      sx={{
        width: "100%",
        pt: { xs: 0, sm: 1 },
        pb: { xs: 0.75, md: 1 },
        px: { xs: 2, md: 4 },
      }}
    >
      <SectionHeader
        title="Đang thịnh hành"
        subtitle="Xem nhiều nhất tuần này"
        actionLink={{ label: "Xem tất cả", href: "/movies?sort=trending" }}
      />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={`skeleton-${i}`}
                sx={{
                  minWidth: 280,
                  scrollSnapAlign: "start",
                }}
              >
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((movie, index) => (
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
                  {...getMovieCardProps(movie, { ranking: index + 1, variant: "ranked" })}
                />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
