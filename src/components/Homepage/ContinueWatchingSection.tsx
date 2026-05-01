"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useContinueWatching } from "@/modules/watch-history/hooks/useWatchHistory";
import { useRouter } from "next/navigation";

export function ContinueWatchingSection() {
  const router = useRouter();
  const { data: items = [], isLoading, isError } = useContinueWatching(true);

  if (isError || (!isLoading && items.length === 0)) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 }, mt: 2 }}>
      <SectionHeader title="Tiếp tục xem" />

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280 }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : items.map((item) => {
              if (!item.movie?.slug) return null;
              const progress = Math.max(0, Math.min(100, item.progressPercent ?? 0));

              return (
                <Box
                  key={`${item.movieId}-${item.episodeId}`}
                  sx={{
                    minWidth: 280,
                    cursor: "pointer",
                    scrollSnapAlign: "start",
                  }}
                  onClick={() => {
                    const params = new URLSearchParams({ episode: String(item.episodeId) });
                    if (item.resumeSecond > 0) {
                      params.set("t", String(item.resumeSecond));
                    }
                    router.push(`/watch/${item.movie.slug}?${params.toString()}`);
                  }}
                >
                  <MovieCard
                    {...getMovieCardProps(item.movie, {
                      variant: "default",
                      showProgress: true,
                      progress,
                    })}
                  />
                </Box>
              );
            })}
      </HorizontalScrollGrid>
    </Box>
  );
}
