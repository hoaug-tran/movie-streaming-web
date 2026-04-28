"use client";

import { Box, Typography, Skeleton, useTheme } from "@mui/material";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { useRouter } from "next/navigation";
import { ArrowRight, Tv2 } from "lucide-react";
import NextLink from "next/link";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";

export function BingeUniverseSection() {
  const { topSeries, seriesDrama } = useDiscovery();
  const router = useRouter();
  const theme = useTheme();

  const series = topSeries.data || [];
  const drama = seriesDrama.data || [];
  const allSeries = [...series, ...drama]
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .slice(0, 8);

  const isLoading = topSeries.isLoading;
  if (!isLoading && allSeries.length === 0) return null;

  const HEIGHTS = [280, 220, 260, 200, 240, 210, 250, 220];

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: { xs: 2.5, md: 3 },
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Tv2 size={14} color={theme.palette.primary.main} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "primary.main",
              }}
            >
              Phim Bộ
            </Typography>
          </Box>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "text.primary",
            }}
          >
            Thế nào gọi là{" "}
            <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
              dàiiiiiiii
            </Box>{" "}
            ?
          </Typography>
        </Box>
        <Box
          component={NextLink}
          href="/movies?type=series"
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
            color: "text.secondary",
            textDecoration: "none",
            fontSize: "0.8rem",
            fontWeight: 500,
            pb: 0.5,
            transition: "color 0.2s",
            "&:hover": { color: "primary.main" },
          }}
        >
          Xem tất cả <ArrowRight size={15} />
        </Box>
      </Box>

      {/* Desktop: staggered height row */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          gap: 1.5,
          alignItems: "flex-end",
        }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  flex: i === 0 ? "0 0 200px" : "1",
                  minWidth: 0,
                  height: HEIGHTS[i] ?? 220,
                }}
              >
                <Skeleton
                  variant="rounded"
                  sx={{ width: "100%", height: "100%", borderRadius: 1 }}
                />
              </Box>
            ))
          : allSeries.map((movie, i) => (
              <Box
                key={movie.id}
                onClick={() => router.push(`/movies/${movie.slug}`)}
                sx={{
                  flex: i === 0 ? "0 0 200px" : "1",
                  minWidth: 0,
                  height: HEIGHTS[i] ?? 220,
                  cursor: "pointer",
                }}
              >
                <MovieCard
                  {...getMovieCardProps(movie)}
                  variant="default"
                  onPlay={() => router.push(`/movies/${movie.slug}`)}
                  sx={{
                    height: "100%",
                    aspectRatio: "unset",
                  }}
                />
              </Box>
            ))}
      </Box>

      {/* Mobile: horizontal scroll */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          gap: 1.25,
          overflowX: "auto",
          pb: 1,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  flexShrink: 0,
                  width: 160,
                  aspectRatio: "2/3",
                  scrollSnapAlign: "start",
                }}
              >
                <MovieCardSkeleton />
              </Box>
            ))
          : allSeries.map((movie) => (
              <Box
                key={movie.id}
                onClick={() => router.push(`/movies/${movie.slug}`)}
                sx={{
                  flexShrink: 0,
                  width: 160,
                  aspectRatio: "2/3",
                  scrollSnapAlign: "start",
                  cursor: "pointer",
                }}
              >
                <MovieCard
                  {...getMovieCardProps(movie)}
                  variant="default"
                  onPlay={() => router.push(`/movies/${movie.slug}`)}
                  sx={{ height: "100%", aspectRatio: "unset" }}
                />
              </Box>
            ))}
      </Box>
    </Box>
  );
}
