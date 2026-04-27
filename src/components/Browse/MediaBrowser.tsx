"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Box, Chip, Grid, Typography, CircularProgress, Stack, Container } from "@mui/material";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import movieService from "@/modules/movie/api/movie-service";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";

interface MediaBrowserProps {
  movieType: "MOVIE" | "TV";
}

export default function MediaBrowser({ movieType }: MediaBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("createdAt");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await movieService.getCategories();
      return response || [];
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["media", movieType, selectedCategory, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await movieService.searchMovies({
        movieType,
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
        page: pageParam,
        size: 12,
        sortBy,
        sortDirection: "DESC",
      });
      return response?.content || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  const combinedMovies = data?.pages.flat() || [];
  const moviesCount = combinedMovies.length;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filteredCategories = categories.filter((cat: any) =>
    movieType === "MOVIE" 
      ? cat.slug !== "series" 
      : cat.slug === "series"
  );

  return (
    <Box sx={{ py: 2 }}>
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              mb: 2,
              color: "text.secondary",
            }}
          >
            THẺLỌC
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              label="Tất cả"
              onClick={() => setSelectedCategory(undefined)}
              variant={selectedCategory === undefined ? "filled" : "outlined"}
              color={selectedCategory === undefined ? "primary" : "default"}
              sx={{
                fontWeight: 600,
                borderRadius: 1,
                fontSize: "0.8rem",
                transition: "all 0.2s ease",
                py: 0.5,
              }}
            />
            {filteredCategories.slice(0, 10).map((cat: any) => (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => setSelectedCategory(cat.id.toString())}
                variant={selectedCategory === cat.id.toString() ? "filled" : "outlined"}
                color={selectedCategory === cat.id.toString() ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  transition: "all 0.2s ease",
                  py: 0.5,
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              mb: 2,
              color: "text.secondary",
            }}
          >
            SẮPXẾP
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {[
              { label: "Mới nhất", value: "createdAt" },
              { label: "Đánh giá cao", value: "rating" },
              { label: "Phổ biến", value: "popularity" },
            ].map((sort) => (
              <Chip
                key={sort.value}
                label={sort.label}
                onClick={() => setSortBy(sort.value)}
                variant={sortBy === sort.value ? "filled" : "outlined"}
                color={sortBy === sort.value ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  transition: "all 0.2s ease",
                  py: 0.5,
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box ref={containerRef} sx={{ position: "relative", minHeight: "50vh" }}>
          {moviesCount > 0 ? (
            <Grid container spacing={3}>
              {combinedMovies.map((movie: any, index: number) => (
                <Grid item xs={12} sm={6} lg={4} key={`${movie.id}-${index}`}>
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl || ""}
                    bannerUrl={movie.bannerUrl || undefined}
                    rating={movie.averageRating}
                    releaseDate={movie.releaseYear?.toString() || movie.createdAt}
                    ageRating={movie.ageRating}
                    movieType={movie.movieType}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                color: "text.secondary",
              }}
            >
              <Typography variant="body1">Không có phim nào</Typography>
            </Box>
          )}

          {isFetchingNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
