"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Slider,
  CircularProgress,
  alpha,
  useTheme,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import movieService from "@/modules/movie/api/movie-service";
import { SearchMovieRequest } from "@/modules/movie/types/movie";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import { usePlayNavigation } from "@/hooks/use-play-navigation";
import {
  Shuffle,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  TrendingUp,
  Film,
  Tv,
  ChevronDown,
  SearchX,
} from "lucide-react";

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "createdAt", icon: Clock },
  { label: "Đánh giá", value: "averageRating", icon: Star },
  { label: "Xem nhiều", value: "viewCount", icon: TrendingUp },
];

const TYPE_OPTIONS = [
  { label: "Tất cả", value: undefined },
  { label: "Phim lẻ", value: "SINGLE", icon: Film },
  { label: "Phim bộ", value: "SERIES", icon: Tv },
];

const DECADES = [
  { label: "90s", from: 1990, to: 1999 },
  { label: "2000s", from: 2000, to: 2009 },
  { label: "2010s", from: 2010, to: 2019 },
  { label: "2020s", from: 2020, to: 2030 },
];

const DEFAULT_FILTERS: SearchMovieRequest = {
  categoryId: undefined,
  fromYear: undefined,
  toYear: undefined,
  minRating: undefined,
  sortBy: "createdAt",
  sortDirection: "DESC",
  size: 16,
};

export default function VibeExplorer() {
  const { navigateToWatch } = usePlayNavigation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [filters, setFilters] = useState<SearchMovieRequest>(DEFAULT_FILTERS);
  const [movieType, setMovieType] = useState<string | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => movieService.getCategories(),
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["discovery-explore", filters, movieType],
    queryFn: ({ pageParam = 0 }) =>
      movieService.advancedSearch({
        ...filters,
        movieType: movieType as any,
        page: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber !== undefined && lastPage.totalPages !== undefined) {
        return lastPage.pageNumber < lastPage.totalPages - 1 ? lastPage.pageNumber + 1 : undefined;
      }
      return undefined;
    },
  });

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleRandomize = () => {
    if (!categories?.length) return;
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const dec = DECADES[Math.floor(Math.random() * DECADES.length)];
    const sort = SORT_OPTIONS[Math.floor(Math.random() * SORT_OPTIONS.length)];
    setRatingValue(3.5);
    setFilters({
      categoryId: cat.id,
      fromYear: dec.from,
      toYear: dec.to,
      minRating: 3.5,
      sortBy: sort.value,
      sortDirection: "DESC",
      size: 16,
    });
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setMovieType(undefined);
    setRatingValue(0);
  };

  const allMovies = data?.pages.flatMap((p) => p.content) || [];
  const totalCount = data?.pages[0]?.totalElements;
  const activeCat = categories?.find((c) => c.id === filters.categoryId);
  const activeDec = DECADES.find((d) => d.from === filters.fromYear);

  const hasActiveFilters =
    filters.categoryId !== undefined ||
    filters.fromYear !== undefined ||
    ratingValue > 0 ||
    movieType !== undefined ||
    filters.sortBy !== "createdAt";

  return (
    <Box>
      <Box
        onClick={handleRandomize}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 1.75, md: 2 },
          mb: 3,
          borderRadius: 1.5,
          background: isDark
            ? "linear-gradient(135deg, rgba(200,16,46,0.18) 0%, rgba(200,16,46,0.06) 100%)"
            : "linear-gradient(135deg, rgba(200,16,46,0.08) 0%, rgba(200,16,46,0.02) 100%)",
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, isDark ? 0.25 : 0.15),
          cursor: "pointer",
          transition: "all 0.25s ease",
          "&:hover": {
            borderColor: "primary.main",
            background: isDark
              ? "linear-gradient(135deg, rgba(200,16,46,0.28) 0%, rgba(200,16,46,0.1) 100%)"
              : "linear-gradient(135deg, rgba(200,16,46,0.14) 0%, rgba(200,16,46,0.04) 100%)",
            "& .shuffle-icon": { transform: "rotate(180deg)" },
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "0.7rem", md: "0.72rem" },
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "primary.main",
              mb: 0.25,
            }}
          >
            Cảm thấy hên hôm nay?
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.15rem" },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "text.primary",
            }}
          >
            Để Gió Phim chọn phim cho bạn
          </Typography>
        </Box>
        <Box
          className="shuffle-icon"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "primary.main",
            color: "#fff",
            flexShrink: 0,
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <Shuffle size={20} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {TYPE_OPTIONS.map((t) => (
            <Chip
              key={String(t.value)}
              label={t.label}
              onClick={() => setMovieType(t.value)}
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: 1,
                border: "1px solid",
                height: 34,
                borderColor: (
                  t.value === undefined ? movieType === undefined : movieType === t.value
                )
                  ? "primary.main"
                  : "divider",
                backgroundColor: (
                  t.value === undefined ? movieType === undefined : movieType === t.value
                )
                  ? alpha(theme.palette.primary.main, 0.12)
                  : "transparent",
                color: (t.value === undefined ? movieType === undefined : movieType === t.value)
                  ? "primary.main"
                  : "text.secondary",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: "primary.main",
                },
              }}
            />
          ))}

          <Box
            sx={{
              width: "1px",
              height: 20,
              backgroundColor: "divider",
              display: { xs: "none", sm: "block" },
            }}
          />

          {SORT_OPTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = filters.sortBy === s.value;
            return (
              <Chip
                key={s.value}
                icon={<Icon size={13} />}
                label={s.label}
                onClick={() => setFilters((p) => ({ ...p, sortBy: s.value }))}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  borderRadius: 1,
                  border: "1px solid",
                  height: 34,
                  borderColor: isActive ? "primary.main" : "divider",
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  transition: "all 0.2s",
                  "& .MuiChip-icon": { color: "inherit" },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: "primary.main",
                  },
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Bộ lọc nâng cao">
            <IconButton
              onClick={() => setFiltersOpen((p) => !p)}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: filtersOpen ? "primary.main" : "divider",
                borderRadius: 1,
                color: filtersOpen ? "primary.main" : "text.secondary",
                backgroundColor: filtersOpen
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "transparent",
                transition: "all 0.2s",
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <SlidersHorizontal size={16} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, ml: 0.5 }}>Lọc</Typography>
              <ChevronDown
                size={14}
                style={{
                  marginLeft: 2,
                  transition: "transform 0.2s",
                  transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </IconButton>
          </Tooltip>

          {hasActiveFilters && (
            <Tooltip title="Xóa bộ lọc">
              <IconButton
                onClick={handleReset}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "error.main",
                  borderRadius: 1,
                  color: "error.main",
                  px: 1.5,
                  py: 0.75,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <X size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Collapse in={filtersOpen}>
        <Box
          sx={{
            mb: 3,
            p: { xs: 2, md: 3 },
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Thể loại
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {categories?.map((cat) => {
                const isActive = filters.categoryId === cat.id;
                return (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    size="small"
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        categoryId: isActive ? undefined : cat.id,
                      }))
                    }
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 0.75,
                      border: "1px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.12)
                        : "transparent",
                      color: isActive ? "primary.main" : "text.secondary",
                      transition: "all 0.15s",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box sx={{ minWidth: 180 }}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Thập niên
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {DECADES.map((dec) => {
                const isActive = filters.fromYear === dec.from;
                return (
                  <Chip
                    key={dec.label}
                    label={dec.label}
                    size="small"
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        fromYear: isActive ? undefined : dec.from,
                        toYear: isActive ? undefined : dec.to,
                      }))
                    }
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 0.75,
                      border: "1px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.12)
                        : "transparent",
                      color: isActive ? "primary.main" : "text.secondary",
                      transition: "all 0.15s",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "text.secondary",
                mt: 2.5,
                mb: 1,
              }}
            >
              Sao tối thiểu — {ratingValue > 0 ? `${ratingValue}★` : "Tất cả"}
            </Typography>
            <Box sx={{ px: 0.5 }}>
              <Slider
                value={ratingValue}
                min={0}
                max={5}
                step={0.5}
                marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5★" },
                ]}
                valueLabelDisplay="auto"
                onChange={(_, v) => {
                  const val = v as number;
                  setRatingValue(val);
                  setFilters((p) => ({ ...p, minRating: val > 0 ? val : undefined }));
                }}
                sx={{
                  color: "primary.main",
                  "& .MuiSlider-markLabel": { fontSize: "0.65rem" },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Collapse>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {activeCat && (
            <Chip
              size="small"
              label={activeCat.name}
              onDelete={() => setFilters((p) => ({ ...p, categoryId: undefined }))}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                borderRadius: 0.75,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.3),
                "& .MuiChip-deleteIcon": { color: "primary.main", fontSize: 14 },
              }}
            />
          )}
          {activeDec && (
            <Chip
              size="small"
              label={activeDec.label}
              onDelete={() => setFilters((p) => ({ ...p, fromYear: undefined, toYear: undefined }))}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                borderRadius: 0.75,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.3),
                "& .MuiChip-deleteIcon": { color: "primary.main", fontSize: 14 },
              }}
            />
          )}
          {ratingValue > 0 && (
            <Chip
              size="small"
              label={`≥ ${ratingValue}★`}
              onDelete={() => {
                setRatingValue(0);
                setFilters((p) => ({ ...p, minRating: undefined }));
              }}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                borderRadius: 0.75,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.3),
                "& .MuiChip-deleteIcon": { color: "primary.main", fontSize: 14 },
              }}
            />
          )}
        </Box>

        {totalCount !== undefined && !isLoading && (
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "text.secondary",
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {totalCount.toLocaleString("vi-VN")} kết quả
          </Typography>
        )}
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </Box>
      ) : allMovies.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 16,
            gap: 1.5,
          }}
        >
          <SearchX size={36} strokeWidth={1.5} color={theme.palette.text.disabled} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}>
            Không tìm thấy kết quả
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {allMovies.map((movie, i) => (
            <Box key={`${movie.id}-${i}`} sx={{ cursor: "pointer" }}>
              <MovieCard
                {...getMovieCardProps(movie)}
                onPlay={() =>
                  navigateToWatch({
                    movieSlug: movie.slug ?? "",
                    movieId: movie.id,
                    isPremiumOnly: movie.isPremiumOnly,
                  })
                }
              />
            </Box>
          ))}
        </Box>
      )}

      {isFetchingNextPage && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mt: 5,
            mb: 2,
          }}
        >
          <CircularProgress size={16} color="primary" thickness={5} />
          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", fontWeight: 500 }}>
            Đang tải thêm phim...
          </Typography>
        </Box>
      )}

      {!isLoading && !isFetchingNextPage && !hasNextPage && allMovies.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mt: 5,
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, height: "1px", backgroundColor: "divider" }} />
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "text.disabled",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Đã hiển thị tất cả {allMovies.length} phim
          </Typography>
          <Box sx={{ flex: 1, height: "1px", backgroundColor: "divider" }} />
        </Box>
      )}
    </Box>
  );
}
