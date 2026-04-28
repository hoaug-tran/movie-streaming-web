"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import movieService from "@/modules/movie/api/movie-service";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import type { CategoryItem, Movie } from "@/modules/movie/types/movie";

type BrowseMovieType = "SINGLE" | "SERIES";
type BrowseMood = "cinema" | "series";

interface CinematicBrowsePageProps {
  movieType: BrowseMovieType;
  mood: BrowseMood;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
}

interface BrowseRailConfig {
  id: string;
  title: string;
  description: string;
  sortBy: string;
  size?: number;
  categorySlug?: string;
}

const RAILS: Record<BrowseMovieType, BrowseRailConfig[]> = {
  SINGLE: [
    {
      id: "single-trending",
      title: "Tín hiệu phòng vé",
      description: "Những phim lẻ đang tạo sức nóng mạnh nhất trên Gió Phim",
      sortBy: "viewCount",
      size: 14,
    },
    {
      id: "single-top-rated",
      title: "Điểm sáng điện ảnh",
      description: "Các tựa phim có điểm đánh giá nổi bật từ cộng đồng",
      sortBy: "averageRating",
      size: 14,
    },
    {
      id: "single-newest",
      title: "Vừa cập bến",
      description: "Những phim mới nhất đã sẵn sàng cho buổi xem tối nay",
      sortBy: "createdAt",
      size: 14,
    },
    {
      id: "single-fresh",
      title: "Mới thêm vào rạp nhà",
      description: "Các lựa chọn vừa được đưa vào thư viện phim lẻ",
      sortBy: "createdAt",
      size: 14,
    },
    {
      id: "single-long-watch",
      title: "Đêm phim dài hơi",
      description: "Những phim có đủ sức giữ nhịp cho một buổi xem trọn vẹn",
      sortBy: "createdAt",
      size: 14,
    },
  ],
  SERIES: [
    {
      id: "series-trending",
      title: "Vũ trụ đang bùng nổ",
      description: "Các series đang kéo người xem quay lại từng tập",
      sortBy: "viewCount",
      size: 14,
    },
    {
      id: "series-top-rated",
      title: "Series đáng theo đuổi",
      description: "Những câu chuyện dài hơi có chất lượng ổn định nhất",
      sortBy: "averageRating",
      size: 14,
    },
    {
      id: "series-newest",
      title: "Tập mới lên sóng",
      description: "Các series mới và mùa mới vừa được cập nhật",
      sortBy: "createdAt",
      size: 14,
    },
    {
      id: "series-fresh",
      title: "Mùa mới trong Gió Phim",
      description: "Những series vừa được bổ sung để bạn bắt đầu hành trình mới",
      sortBy: "createdAt",
      size: 14,
    },
    {
      id: "series-deep-dive",
      title: "Phim cuốn theo mùa",
      description: "Các lựa chọn phù hợp cho những buổi cày series dài hơi",
      sortBy: "createdAt",
      size: 14,
    },
  ],
};

function formatCompactNumber(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(
    value
  );
}

function getDetailPath(movie: Movie) {
  return `/${movie.movieType === "SERIES" ? "tv" : "movies"}/${movie.slug}`;
}

function pickHeroMovie(movies: Movie[]) {
  return movies.find((movie) => movie.bannerUrl) || movies[0] || null;
}

function metricLabel(movieType: BrowseMovieType) {
  return movieType === "SERIES" ? "series" : "phim";
}

function BrowseSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 9, md: 12 } }}>
      <Skeleton variant="rounded" height={460} sx={{ borderRadius: 4 }} />
      <Box sx={{ mt: 5 }}>
        <HorizontalScrollGrid itemWidth={280}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index} sx={{ minWidth: 280, scrollSnapAlign: "start" }}>
              <MovieCardSkeleton />
            </Box>
          ))}
        </HorizontalScrollGrid>
      </Box>
    </Container>
  );
}

function MovieRail({
  config,
  movieType,
  categoryId,
}: {
  config: BrowseRailConfig;
  movieType: BrowseMovieType;
  categoryId?: number;
}) {
  const router = useRouter();
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["cinematic-browse", movieType, config.id, categoryId || "all"],
    queryFn: async () => {
      const movies = await movieService.getBrowseMoviesByType(movieType, {
        categoryId,
        sortBy: config.sortBy,
        sortDirection: "DESC",
        size: config.size || 12,
      });

      return movies.filter((movie) => movie.movieType === movieType);
    },
  });

  if (!isLoading && movies.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 4, md: 5 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.45rem", md: "2rem" },
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            {config.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 620 }}>
            {config.description}
          </Typography>
        </Box>
      </Stack>

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Box key={`skeleton-${index}`} sx={{ minWidth: 280, scrollSnapAlign: "start" }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((movie) => (
              <Box
                key={movie.id}
                onClick={() => router.push(getDetailPath(movie))}
                sx={{ minWidth: 280, scrollSnapAlign: "start", cursor: "pointer" }}
              >
                <MovieCard {...getMovieCardProps(movie)} />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}

export default function CinematicBrowsePage({
  movieType,
  mood,
  eyebrow,
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
}: CinematicBrowsePageProps) {
  const theme = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  const { data: categories = [] } = useQuery({
    queryKey: ["cinematic-browse", "categories"],
    queryFn: movieService.getCategories.bind(movieService),
  });

  const { data: heroMovies = [], isLoading } = useQuery({
    queryKey: ["cinematic-browse", movieType, "hero", selectedCategory || "all"],
    queryFn: async () => {
      const movies = await movieService.getBrowseMoviesByType(movieType, {
        categoryId: selectedCategory,
        sortBy: "averageRating",
        sortDirection: "DESC",
        size: 12,
      });

      return movies.filter((movie) => movie.movieType === movieType);
    },
  });

  const { data: popularMovies = [] } = useQuery({
    queryKey: ["cinematic-browse", movieType, "popular", selectedCategory || "all"],
    queryFn: async () => {
      const movies = await movieService.getBrowseMoviesByType(movieType, {
        categoryId: selectedCategory,
        sortBy: "viewCount",
        sortDirection: "DESC",
        size: 12,
      });

      return movies.filter((movie) => movie.movieType === movieType);
    },
  });

  const heroMovie = pickHeroMovie(heroMovies);
  const label = metricLabel(movieType);
  const accent = mood === "series" ? theme.palette.secondary.main : theme.palette.primary.main;

  if (isLoading) return <BrowseSkeleton />;

  if (!heroMovie) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          minHeight: { xs: "54vh", md: "62vh" },
          display: "grid",
          placeItems: "center",
          py: { xs: 10, md: 14 },
          textAlign: "center",
        }}
      >
        <Box sx={{ maxWidth: 620, mx: "auto" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "3.25rem" },
              fontWeight: 950,
              letterSpacing: "-0.06em",
              lineHeight: 0.95,
            }}
          >
            Kho nội dung đang được làm mới
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 2, fontSize: { xs: "0.95rem", md: "1.05rem" }, lineHeight: 1.7 }}
          >
            Hiện chưa tìm thấy {label} đã xuất bản từ backend. Khi dữ liệu mới sẵn sàng, chúng tôi
            sẽ tự động đưa vào không gian này.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pb: { xs: 6, md: 10 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 5 } }}>
        <Box
          component="section"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.88fr) minmax(360px, 0.62fr)" },
            gap: { xs: 2, md: 3 },
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 420, md: 520 },
              p: { xs: 3, sm: 4, md: 6 },
              borderRadius: { xs: 3, md: 4 },
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.08,
                backgroundImage: `linear-gradient(90deg, ${accent} 1px, transparent 1px), linear-gradient(180deg, ${accent} 1px, transparent 1px)`,
                backgroundSize: "42px 42px",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                right: { xs: -90, md: -70 },
                bottom: { xs: -120, md: -90 },
                width: { xs: 260, md: 420 },
                height: { xs: 260, md: 420 },
                borderRadius: "50%",
                border: "1px solid",
                borderColor: alpha(accent, 0.24),
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
              <Chip
                label={eyebrow}
                sx={{
                  mb: 2.5,
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  border: "1px solid",
                  borderColor: alpha(accent, 0.28),
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                }}
              />
              <Typography
                component="h1"
                variant="h1"
                sx={{
                  fontSize: { xs: "2.45rem", sm: "3.75rem", md: "5.25rem" },
                  lineHeight: { xs: 1.04, md: 0.98 },
                  fontWeight: 950,
                  letterSpacing: { xs: "-0.045em", md: "-0.065em" },
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 2.5,
                  maxWidth: 660,
                  fontSize: { xs: "1rem", md: "1.14rem" },
                  lineHeight: 1.72,
                }}
              >
                {subtitle}
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ position: "relative", zIndex: 1, mt: { xs: 5, md: 8 } }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(getDetailPath(heroMovie))}
                sx={{ px: 3, py: 1.25, borderRadius: 999, textTransform: "none", fontWeight: 900 }}
              >
                {primaryLabel}
              </Button>
            </Stack>
          </Box>

          <Box
            onClick={() => router.push(getDetailPath(heroMovie))}
            sx={{
              position: "relative",
              minHeight: { xs: 440, md: 520 },
              borderRadius: { xs: 3, md: 4 },
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "transform 240ms ease, border-color 240ms ease",
              "&:hover": {
                transform: { md: "translateY(-4px)" },
                borderColor: alpha(accent, 0.5),
              },
            }}
          >
            <Image
              src={heroMovie.bannerUrl || heroMovie.posterUrl || ""}
              alt={heroMovie.title}
              fill
              sizes="(max-width: 1200px) 100vw, 42vw"
              priority
              style={{ objectFit: "cover" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, transparent 8%, rgba(0,0,0,.18) 42%, rgba(0,0,0,.88) 100%)",
              }}
            />
            <Stack sx={{ position: "absolute", left: 24, right: 24, bottom: 24 }} spacing={1.5}>
              <Typography
                sx={{
                  color: "common.white",
                  fontSize: { xs: "1.55rem", md: "2rem" },
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                }}
              >
                {heroMovie.title}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${heroMovie.releaseYear || "Mới"}`}
                  sx={{ color: "common.white", bgcolor: alpha(theme.palette.common.white, 0.14) }}
                />
                <Chip
                  label={`${(heroMovie.averageRating || 0).toFixed(1)} điểm`}
                  sx={{ color: "common.white", bgcolor: alpha(theme.palette.common.white, 0.14) }}
                />
                <Chip
                  label={`${formatCompactNumber(heroMovie.viewCount)} lượt xem`}
                  sx={{ color: "common.white", bgcolor: alpha(theme.palette.common.white, 0.14) }}
                />
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }}>
          {[
            [`${heroMovies.length}+`, `${label} tuyển chọn`],
            [formatCompactNumber(popularMovies[0]?.viewCount), "lượt xem dẫn đầu"],
            [`${(heroMovie.averageRating || 0).toFixed(1)}`, "điểm spotlight"],
          ].map(([value, caption]) => (
            <Box
              key={caption}
              sx={{
                flex: 1,
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography sx={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.06em" }}>
                {value}
              </Typography>
              <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                {caption}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box
          component="section"
          sx={{
            mt: 4,
            p: { xs: 2, md: 2.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              onClick={() => setSelectedCategory(undefined)}
              variant={!selectedCategory ? "contained" : "outlined"}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}
            >
              Tất cả
            </Button>
            {(categories as CategoryItem[]).map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "contained" : "outlined"}
                sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}
              >
                {category.name}
              </Button>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mt: 2 }}>
          {RAILS[movieType].map((config) => (
            <MovieRail
              key={config.id}
              config={config}
              movieType={movieType}
              categoryId={selectedCategory}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
