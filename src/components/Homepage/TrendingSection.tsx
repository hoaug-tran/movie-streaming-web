"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useTrendingMovies } from "@/modules/movie/hooks/useClientMovies";
import { useRouter } from "next/navigation";

export function TrendingSection() {
  const { data: movies = [], isLoading, isError } = useTrendingMovies();
  const router = useRouter();

  return (
    <Box
      sx={{
        width: "100%",
        pt: { xs: 1, sm: 1, md: 2 },
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
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.posterUrl ?? undefined}
                  rating={movie.averageRating}
                  ranking={index + 1}
                  variant="ranked"
                />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
