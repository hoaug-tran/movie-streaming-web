"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Grid,
  Typography,
  Slider,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import movieService from "@/modules/movie/api/movie-service";
import { SearchMovieRequest } from "@/modules/movie/types/movie";
import { CasinoOutlined, TuneOutlined } from "@mui/icons-material";
import { MovieCard } from "@/components/Common/MovieCard";
import { useRouter } from "next/navigation";

export default function VibeExplorer() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchMovieRequest>({
    categoryId: undefined,
    fromYear: undefined,
    toYear: undefined,
    minRating: undefined,
    sortBy: "createdAt",
    sortDirection: "DESC",
    size: 12,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => movieService.getCategories(),
  });

  const {
    data: searchResults,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["advancedSearch", filters],
    queryFn: ({ pageParam = 0 }) => movieService.advancedSearch({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber !== undefined && lastPage.totalPages !== undefined) {
        return lastPage.pageNumber < lastPage.totalPages - 1 ? lastPage.pageNumber + 1 : undefined;
      }
      return undefined;
    },
  });

  const handleCategoryClick = (id: number) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === id ? undefined : id,
    }));
  };

  const handleRandomize = () => {
    if (!categories || categories.length === 0) return;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const decades = [
      { from: 1990, to: 1999 },
      { from: 2000, to: 2009 },
      { from: 2010, to: 2019 },
      { from: 2020, to: 2030 },
    ];
    const randomDecade = decades[Math.floor(Math.random() * decades.length)];
    const sorts = ["createdAt", "averageRating", "viewCount"];
    const randomSort = sorts[Math.floor(Math.random() * sorts.length)];

    setFilters({
      categoryId: randomCategory.id,
      fromYear: randomDecade.from,
      toYear: randomDecade.to,
      minRating: 4.0,
      sortBy: randomSort,
      sortDirection: "DESC",
      size: 12,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const moviesCount = searchResults?.pages.flatMap((p) => p.content).length || 0;
  const combinedMovies = searchResults?.pages.flatMap((p) => p.content) || [];

  const decades = [
    { label: "Những năm 90s", from: 1990, to: 1999 },
    { label: "Thập niên 2000", from: 2000, to: 2009 },
    { label: "Thập niên 2010", from: 2010, to: 2019 },
    { label: "Thập niên 2020", from: 2020, to: 2030 },
  ];

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Sidebar Command Center */}
        <Grid item xs={12} md={3} sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "sticky",
              top: { xs: 80, md: 100 },
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<CasinoOutlined />}
              onClick={handleRandomize}
              sx={{ mb: 4, py: 1.5, borderRadius: "50px", fontWeight: 700 }}
            >
              I&apos;m feeling lucky
            </Button>

            <Box mb={4}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TuneOutlined fontSize="small" color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  Vibe của bạn
                </Typography>
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {categories?.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    onClick={() => handleCategoryClick(cat.id)}
                    color={filters.categoryId === cat.id ? "primary" : "default"}
                    variant={filters.categoryId === cat.id ? "filled" : "outlined"}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 1,
                      fontSize: "0.8rem",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Box mb={4}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Thời kỳ (Era)
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {decades.map((era) => {
                  const isActive = filters.fromYear === era.from;
                  return (
                    <Chip
                      key={era.label}
                      label={era.label}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          fromYear: isActive ? undefined : era.from,
                          toYear: isActive ? undefined : era.to,
                        }));
                      }}
                      color={isActive ? "primary" : "default"}
                      variant={isActive ? "filled" : "outlined"}
                      sx={{ fontWeight: 600, borderRadius: 1, fontSize: "0.8rem" }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Box mb={4}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Sắp xếp theo
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mb={4}>
                {[
                  { label: "Mới nhất", value: "createdAt" },
                  { label: "Đánh giá cao", value: "averageRating" },
                  { label: "Xem nhiều", value: "viewCount" },
                ].map((sort) => (
                  <Chip
                    key={sort.value}
                    label={sort.label}
                    onClick={() => setFilters((prev) => ({ ...prev, sortBy: sort.value }))}
                    color={filters.sortBy === sort.value ? "primary" : "default"}
                    variant={filters.sortBy === sort.value ? "filled" : "outlined"}
                    sx={{ fontWeight: 600, borderRadius: 1, fontSize: "0.8rem" }}
                  />
                ))}
              </Stack>

              <Typography variant="h6" fontWeight={700} mb={3}>
                Chất lượng tối thiểu
              </Typography>
              <Box px={2} pb={2}>
                <Slider
                  value={filters.minRating || 0}
                  min={0}
                  max={5}
                  step={0.5}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 5, label: "5 Sao" },
                  ]}
                  valueLabelDisplay="auto"
                  onChange={(_, value) =>
                    setFilters((prev) => ({ ...prev, minRating: value as number }))
                  }
                  sx={{ color: "primary.main" }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box sx={{ position: "relative", minHeight: "50vh" }}>
            {moviesCount > 0 ? (
              <Grid container spacing={3}>
                {combinedMovies.map((movie, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    key={`${movie.id}-${index}`}
                    onClick={() =>
                      router.push(
                        `/${movie.movieType === "SERIES" ? "tv" : "movies"}/${movie.slug}`
                      )
                    }
                    sx={{ cursor: "pointer" }}
                  >
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
              !isLoading && (
                <Box textAlign="center" py={10}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Không tìm thấy nội dung phù hợp
                  </Typography>
                  <Typography color="text.secondary">
                    Hãy thử điều chỉnh lại bộ lọc để khám phá thêm nhé.
                  </Typography>
                </Box>
              )
            )}

            {isFetchingNextPage && (
              <Box display="flex" justifyContent="center" width="100%" mt={4} mb={2}>
                <CircularProgress color="primary" />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
