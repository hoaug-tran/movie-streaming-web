"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import {
  alpha,
  Box,
  Chip,
  Container,
  Grid,
  InputBase,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import movieService from "@/modules/movie/api/movie-service";
import { CategoryItem, MovieSummary } from "@/modules/movie/types/movie";

type CategoryDetailPageProps = {
  categorySlug: string;
};

type GenreStyle = {
  accent: string;
  secondary: string;
  glyph: string;
  texture: "slash" | "rings" | "grid" | "beam" | "grain";
};

const GENRE_STYLES: Record<string, GenreStyle> = {
  "Hành động": { accent: "#FF4D2E", secondary: "#FFB000", glyph: "ACT", texture: "slash" },
  "Kinh dị": { accent: "#8B00FF", secondary: "#C8102E", glyph: "FEAR", texture: "rings" },
  "Tình cảm": { accent: "#FF3D7F", secondary: "#FF9BC8", glyph: "LOVE", texture: "beam" },
  "Hài hước": { accent: "#FFD60A", secondary: "#FF7A00", glyph: "FUN", texture: "grain" },
  "Hoạt hình": { accent: "#00C896", secondary: "#00B4D8", glyph: "ANI", texture: "grid" },
  "Khoa học viễn tưởng": {
    accent: "#00B4D8",
    secondary: "#7C3AED",
    glyph: "SCI",
    texture: "rings",
  },
  "Tâm lý": { accent: "#A855F7", secondary: "#C8102E", glyph: "MIND", texture: "beam" },
  "Phiêu lưu": { accent: "#06D6A0", secondary: "#FFB000", glyph: "WILD", texture: "slash" },
  "Tội phạm": { accent: "#EF233C", secondary: "#111827", glyph: "NOIR", texture: "grid" },
  "Võ thuật": { accent: "#FF8C00", secondary: "#C8102E", glyph: "FIST", texture: "slash" },
  "Cổ trang": { accent: "#C9A84C", secondary: "#8B5E34", glyph: "OLD", texture: "grain" },
  "Gia đình": { accent: "#7CB518", secondary: "#00C896", glyph: "HOME", texture: "beam" },
  "Tài liệu": { accent: "#4A90D9", secondary: "#94A3B8", glyph: "DOC", texture: "grid" },
  "Âm nhạc": { accent: "#FF6BCD", secondary: "#7C3AED", glyph: "BEAT", texture: "rings" },
  "Thể thao": { accent: "#FFB703", secondary: "#FB5607", glyph: "RUN", texture: "slash" },
};

const DEFAULT_STYLE: GenreStyle = {
  accent: "#C8102E",
  secondary: "#8B1E2D",
  glyph: "GENRE",
  texture: "beam",
};

const sortOptions = [
  { label: "Mới nhất", value: "createdAt" },
  { label: "Đánh giá cao", value: "averageRating" },
  { label: "Xem nhiều", value: "viewCount" },
];

const typeOptions = [
  { label: "Tất cả", value: "" },
  { label: "Phim lẻ", value: "SINGLE" },
  { label: "Phim bộ", value: "SERIES" },
];

const yearOptions = [
  { label: "Mọi thời kỳ", fromYear: undefined, toYear: undefined },
  { label: "2020s", fromYear: 2020, toYear: 2030 },
  { label: "2010s", fromYear: 2010, toYear: 2019 },
  { label: "2000s", fromYear: 2000, toYear: 2009 },
  { label: "90s", fromYear: 1990, toYear: 1999 },
];

const ratingOptions = [
  { label: "Mọi điểm", value: undefined },
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4 },
  { label: "3.5+", value: 3.5 },
];

const pageSize = 16;

function textureBackground(style: GenreStyle, base: string) {
  if (style.texture === "slash") {
    return `repeating-linear-gradient(115deg, ${alpha(style.accent, 0.16)} 0 2px, transparent 2px 18px), ${base}`;
  }
  if (style.texture === "rings") {
    return `radial-gradient(circle at 76% 34%, transparent 0 10%, ${alpha(style.accent, 0.16)} 10.5% 11%, transparent 11.5% 18%, ${alpha(style.secondary, 0.12)} 18.5% 19%, transparent 19.5%), ${base}`;
  }
  if (style.texture === "grid") {
    return `linear-gradient(${alpha(style.accent, 0.1)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(style.accent, 0.1)} 1px, transparent 1px), ${base}`;
  }
  if (style.texture === "grain") {
    return `radial-gradient(circle at 20% 20%, ${alpha(style.accent, 0.18)} 0 1px, transparent 1.5px), radial-gradient(circle at 70% 62%, ${alpha(style.secondary, 0.16)} 0 1px, transparent 1.5px), ${base}`;
  }
  return `linear-gradient(120deg, ${alpha(style.accent, 0.18)}, transparent 38%), ${base}`;
}

function makeMovieHref(movie: MovieSummary) {
  return `/${movie.movieType === "SERIES" ? "tv" : "movies"}/${movie.slug}`;
}

function CategoryStatePanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box
      sx={{
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ textAlign: "center", maxWidth: 520 }}>
        <Typography variant="h4" fontWeight={950} letterSpacing="-0.035em">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

function CategoryHero({
  category,
  style,
  movieCount,
}: {
  category?: CategoryItem;
  style: GenreStyle;
  movieCount: number;
}) {
  const theme = useTheme();
  const title = category?.name || "Danh mục";
  const base = `linear-gradient(120deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0.86)} 50%, ${alpha(style.accent, 0.24)} 100%)`;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: 420, md: 520 },
        pt: { xs: 12, md: 15 },
        pb: { xs: 5, md: 7 },
        background: textureBackground(style, base),
        backgroundSize: style.texture === "grid" ? "42px 42px, 42px 42px, auto" : "auto",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 16% 24%, ${alpha(style.accent, 0.34)}, transparent 30%), radial-gradient(circle at 88% 18%, ${alpha(style.secondary, 0.3)}, transparent 28%), linear-gradient(0deg, ${theme.palette.background.default}, transparent 42%)`,
        }}
      />
      <Typography
        aria-hidden
        sx={{
          position: "absolute",
          right: { xs: -18, md: 30 },
          bottom: { xs: 24, md: -16 },
          fontSize: { xs: "7rem", md: "15rem" },
          fontWeight: 950,
          letterSpacing: "-0.11em",
          color: alpha(theme.palette.text.primary, 0.045),
          lineHeight: 0.75,
          userSelect: "none",
        }}
      >
        {style.glyph}
      </Typography>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <Stack spacing={3} sx={{ maxWidth: 980 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Genre portal"
              sx={{
                borderRadius: 1,
                bgcolor: alpha(style.accent, 0.18),
                color: style.accent,
                fontWeight: 900,
              }}
            />
            <Chip label={`${movieCount} tín hiệu`} variant="outlined" sx={{ borderRadius: 1 }} />
          </Stack>
          <Typography
            component="h1"
            fontWeight={950}
            letterSpacing={{ xs: "-0.045em", md: "-0.065em" }}
            sx={{ fontSize: { xs: "4rem", sm: "5.8rem", md: "8.6rem" }, lineHeight: 0.9 }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 720, fontSize: { xs: "1rem", md: "1.2rem" }, lineHeight: 1.8 }}
          >
            Một phòng chiếu riêng cho những nhịp phim cùng tần số. Lọc, sắp xếp và lao thẳng vào thế
            giới {title.toLowerCase()} theo cách điện ảnh hơn.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

function ControlDeck({
  sortBy,
  setSortBy,
  keyword,
  setKeyword,
  movieType,
  setMovieType,
  fromYear,
  toYear,
  setYearRange,
  minRating,
  setMinRating,
  style,
}: {
  sortBy: string;
  setSortBy: (value: string) => void;
  keyword: string;
  setKeyword: (value: string) => void;
  movieType: string;
  setMovieType: (value: string) => void;
  fromYear?: number;
  toYear?: number;
  setYearRange: (value: { fromYear?: number; toYear?: number }) => void;
  minRating?: number;
  setMinRating: (value?: number) => void;
  style: GenreStyle;
}) {
  const selectedYear = yearOptions.find(
    (option) => option.fromYear === fromYear && option.toYear === toYear
  );

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: -3, md: -5 }, position: "relative", zIndex: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1.1fr 1.4fr" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <BoltRoundedIcon sx={{ color: style.accent }} />
          <Typography fontWeight={900}>Bộ lọc tín hiệu</Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {sortOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setSortBy(option.value)}
              color={sortBy === option.value ? "primary" : "default"}
              variant={sortBy === option.value ? "filled" : "outlined"}
              sx={{ borderRadius: 1, fontWeight: 850 }}
            />
          ))}
        </Stack>
        <Stack spacing={1.2}>
          <Box
            sx={{
              height: 48,
              px: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "background.default",
            }}
          >
            <SearchRoundedIcon sx={{ color: style.accent }} />
            <InputBase
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm trong danh mục này"
              fullWidth
              sx={{ fontWeight: 650 }}
            />
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {typeOptions.map((option) => (
              <Chip
                key={option.value || "all"}
                label={option.label}
                onClick={() => setMovieType(option.value)}
                color={movieType === option.value ? "primary" : "default"}
                variant={movieType === option.value ? "filled" : "outlined"}
                sx={{ borderRadius: 1, fontWeight: 800 }}
              />
            ))}
            {yearOptions.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                onClick={() => setYearRange({ fromYear: option.fromYear, toYear: option.toYear })}
                color={selectedYear?.label === option.label ? "primary" : "default"}
                variant={selectedYear?.label === option.label ? "filled" : "outlined"}
                sx={{ borderRadius: 1, fontWeight: 800 }}
              />
            ))}
            {ratingOptions.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                onClick={() => setMinRating(option.value)}
                color={minRating === option.value ? "primary" : "default"}
                variant={minRating === option.value ? "filled" : "outlined"}
                sx={{ borderRadius: 1, fontWeight: 800 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

function MovieGrid({ movies, isLoading }: { movies: MovieSummary[]; isLoading: boolean }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <MovieCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!movies.length) {
    return (
      <CategoryStatePanel
        title="Phòng chiếu này vẫn đang lên đèn"
        subtitle="Chưa có nội dung phù hợp với danh mục này. Hãy quay lại sau khi hệ thống cập nhật thêm phim mới."
      />
    );
  }

  return (
    <Grid container spacing={2.5}>
      {movies.map((movie, index) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={`${movie.id}-${index}`}
          onClick={() => router.push(makeMovieHref(movie))}
          sx={{ cursor: "pointer" }}
        >
          <MovieCard {...getMovieCardProps(movie)} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function CategoryDetailPage({ categorySlug }: CategoryDetailPageProps) {
  const [sortBy, setSortBy] = useState("createdAt");
  const [keyword, setKeyword] = useState("");
  const [movieType, setMovieType] = useState("");
  const [fromYear, setFromYear] = useState<number | undefined>();
  const [toYear, setToYear] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();

  const categoriesQuery = useQuery({
    queryKey: ["movie-categories"],
    queryFn: () => movieService.getCategories(),
  });

  const category = useMemo(
    () => categoriesQuery.data?.find((item) => item.slug === categorySlug),
    [categoriesQuery.data, categorySlug]
  );

  const resolvedCategoryId = category?.id;

  const moviesQuery = useInfiniteQuery({
    queryKey: [
      "category-detail-movies",
      resolvedCategoryId,
      sortBy,
      keyword,
      movieType,
      fromYear,
      toYear,
      minRating,
    ],
    queryFn: ({ pageParam = 0 }) =>
      movieService.advancedSearch({
        keyword: keyword.trim() || undefined,
        categoryId: resolvedCategoryId!,
        movieType: movieType || undefined,
        fromYear,
        toYear,
        minRating,
        page: pageParam,
        size: pageSize,
        sortBy,
        sortDirection: "DESC",
      }),
    enabled: !!resolvedCategoryId,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber !== undefined &&
      lastPage.totalPages !== undefined &&
      lastPage.pageNumber < lastPage.totalPages - 1
        ? lastPage.pageNumber + 1
        : undefined,
  });
  const style = category ? (GENRE_STYLES[category.name] ?? DEFAULT_STYLE) : DEFAULT_STYLE;
  const movies = moviesQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const hasMore = Boolean(moviesQuery.hasNextPage);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 520 &&
        moviesQuery.hasNextPage &&
        !moviesQuery.isFetchingNextPage
      ) {
        moviesQuery.fetchNextPage();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [moviesQuery.hasNextPage, moviesQuery.isFetchingNextPage, moviesQuery.fetchNextPage]);

  if (categoriesQuery.isError || moviesQuery.isError) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pt: 12 }}>
        <CategoryStatePanel
          title="Cánh cửa danh mục đang nhiễu sóng"
          subtitle="Dữ liệu chưa thể đồng bộ ở thời điểm này. Thử quay lại sau ít phút nhé."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: { xs: 7, md: 10 } }}>
      <CategoryHero
        category={category}
        style={style}
        movieCount={moviesQuery.data?.pages[0]?.totalElements ?? movies.length}
      />
      <ControlDeck
        sortBy={sortBy}
        setSortBy={setSortBy}
        keyword={keyword}
        setKeyword={setKeyword}
        movieType={movieType}
        setMovieType={setMovieType}
        fromYear={fromYear}
        toYear={toYear}
        setYearRange={({ fromYear: nextFromYear, toYear: nextToYear }) => {
          setFromYear(nextFromYear);
          setToYear(nextToYear);
        }}
        minRating={minRating}
        setMinRating={setMinRating}
        style={style}
      />
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 } }}>
        {moviesQuery.isFetching && !moviesQuery.isFetchingNextPage && (
          <LinearProgress color="primary" sx={{ mb: 3 }} />
        )}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <LocalFireDepartmentRoundedIcon sx={{ color: style.accent }} />
          <Typography variant="h4" fontWeight={950} letterSpacing="-0.035em">
            Nội dung nổi bật
          </Typography>
          <Chip label={`${movies.length} phim`} size="small" sx={{ borderRadius: 1 }} />
        </Stack>
        <MovieGrid movies={movies} isLoading={moviesQuery.isLoading || categoriesQuery.isLoading} />
        {moviesQuery.isFetchingNextPage && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <MovieCardSkeleton />
          </Box>
        )}
        {!hasMore && movies.length > 0 && (
          <Typography color="text.secondary" textAlign="center" sx={{ pt: 7, fontWeight: 700 }}>
            Bạn đã chạm tới cuối phòng chiếu của danh mục này.
          </Typography>
        )}
      </Container>
    </Box>
  );
}
