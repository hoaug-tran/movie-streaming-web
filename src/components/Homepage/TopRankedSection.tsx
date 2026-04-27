"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useTopRatedMovies } from "@/modules/movie/hooks/useClientMovies";
import { useRouter } from "next/navigation";

export function TopRankedSection() {
  const { data: movies = [], isLoading, isError } = useTopRatedMovies();
  const router = useRouter();

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 } }}>
      <SectionHeader
        title="Đánh giá cao nhất"
        subtitle="Nội dung được đánh giá cao nhất mọi thời đại"
      />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 8 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280 }}>
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
                  bannerUrl={movie.bannerUrl ?? undefined}
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
