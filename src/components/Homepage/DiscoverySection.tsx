"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { Movie } from "@/modules/movie/types/movie";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface DiscoverySectionProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  isLoading: boolean;
  isError: boolean;
  href?: string;
  variant?: "default" | "ranked" | "compact";
  icon?: LucideIcon;
  hideRating?: boolean;
}

export function DiscoverySection({
  title,
  subtitle,
  movies,
  isLoading,
  isError,
  href,
  variant = "default",
  hideRating = false,
}: DiscoverySectionProps) {
  const router = useRouter();

  if (isError) return null;

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 4 },
      }}
    >
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLink={href ? { label: "Xem tất cả", href } : undefined}
      />

      <HorizontalScrollGrid itemWidth={variant === "compact" ? 220 : 280}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={`skeleton-${i}`}
                sx={{
                  minWidth: variant === "compact" ? 220 : 280,
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
                  minWidth: variant === "compact" ? 220 : 280,
                  cursor: "pointer",
                  scrollSnapAlign: "start",
                }}
              >
                <MovieCard
                  {...getMovieCardProps(movie, {
                    rating: hideRating ? undefined : movie.averageRating,
                    ranking: variant === "ranked" ? index + 1 : undefined,
                    variant: variant === "ranked" ? "ranked" : "default",
                    releaseDate:
                      movie.publishedAt ||
                      (movie.releaseYear ? `${movie.releaseYear}-01-01` : undefined),
                  })}
                />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
