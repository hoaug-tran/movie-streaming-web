"use client";

import { Box, Button, Chip, Paper, Skeleton, Typography, alpha, useTheme } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { Movie } from "@/modules/movie/types/movie";

const lanes = [
  {
    key: "action",
    title: "Adrenaline",
    subtitle: "Nhịp nhanh, cháy màn hình",
    href: "/movies?category=hanh-dong",
    icon: LocalFireDepartmentRoundedIcon,
    tone: "primary" as const,
  },
  {
    key: "thriller",
    title: "Căng não",
    subtitle: "Bí ẩn, tội phạm, plot twist",
    href: "/movies?category=kinh-di",
    icon: PsychologyRoundedIcon,
    tone: "secondary" as const,
  },
  {
    key: "anime",
    title: "Anime nổi bật",
    subtitle: "Thế giới rực rỡ, giàu cảm xúc",
    href: "/movies?category=anime",
    icon: AutoAwesomeRoundedIcon,
    tone: "info" as const,
  },
];

export function GenrePulseSection() {
  const theme = useTheme();
  const router = useRouter();
  const { actionMovies, thrillerMovies, animeMovies, animeSeries } = useDiscovery();
  const animeFeed = (animeMovies.data?.length ? animeMovies.data : animeSeries.data) || [];
  const laneData = {
    action: actionMovies.data || [],
    thriller: thrillerMovies.data || [],
    anime: animeFeed,
  };
  const isLoading = actionMovies.isLoading || thrillerMovies.isLoading || animeMovies.isLoading;
  const hasMovies = Object.values(laneData).some((movies) => movies.length > 0);

  if (!isLoading && !hasMovies) return null;

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 } }}>
      <SectionHeader
        title="Dòng chảy thể loại"
        subtitle="Ba nhịp phim khác nhau để trang chủ luôn nhiều sắc thái"
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {lanes.map((lane) => {
          const movies = laneData[lane.key as keyof typeof laneData];
          return isLoading && movies.length === 0 ? (
            <Skeleton key={lane.key} variant="rounded" height={360} sx={{ borderRadius: 2 }} />
          ) : (
            <Paper
              key={lane.key}
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                minHeight: { xs: 300, md: 380 },
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(theme.palette.common.black, 0.78)})`
                    : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette[lane.tone].main, 0.08)})`,
                border: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.1)}`,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: "auto -20% -32% auto",
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${alpha(theme.palette[lane.tone].main, 0.3)}, transparent 68%)`,
                  pointerEvents: "none",
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, mb: 1.6 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
                      <lane.icon sx={{ color: `${lane.tone}.main`, fontSize: 20 }} />
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.04em" }}
                      >
                        {lane.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {lane.subtitle}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => router.push(lane.href)}
                    size="small"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      minWidth: "auto",
                      alignSelf: "flex-start",
                      color: "text.secondary",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      px: 1,
                    }}
                  >
                    Xem
                  </Button>
                </Box>

                <Box sx={{ display: "grid", gap: 1 }}>
                  {movies.slice(0, 4).map((movie, index) => (
                    <GenrePulseCard
                      key={`${lane.key}-${movie.slug || movie.id}-${index}`}
                      movie={movie}
                      index={index}
                      tone={lane.tone}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

function GenrePulseCard({
  movie,
  index,
  tone,
}: {
  movie: Movie;
  index: number;
  tone: "primary" | "secondary" | "info";
}) {
  const theme = useTheme();
  const router = useRouter();
  const image = movie.bannerUrl || movie.posterUrl;
  const categories = movie.categories
    ?.slice(0, 2)
    .map((category) => category.name)
    .join(" • ");

  return (
    <Box
      onClick={() => router.push(`/movies/${movie.slug}`)}
      sx={{
        minHeight: index === 0 ? 142 : 76,
        display: "grid",
        gridTemplateColumns: index === 0 ? "1fr" : "58px minmax(0, 1fr)",
        alignItems: "end",
        gap: 1.1,
        position: "relative",
        overflow: "hidden",
        borderRadius: 1.5,
        p: index === 0 ? 1.4 : 1,
        cursor: "pointer",
        isolation: "isolate",
        background: image
          ? `linear-gradient(90deg, ${alpha(theme.palette.common.black, 0.82)}, ${alpha(theme.palette.common.black, index === 0 ? 0.2 : 0.56)}), url(${image}) center/cover`
          : alpha(theme.palette[tone].main, 0.12),
        border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.1 : 0.16)}`,
        transition: "transform 0.24s ease, border-color 0.24s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(theme.palette[tone].main, 0.38),
        },
      }}
    >
      {index !== 0 && movie.posterUrl && (
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: 1,
            background: `url(${movie.posterUrl}) center/cover`,
            border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
          }}
        />
      )}
      <Box sx={{ minWidth: 0, position: "relative", zIndex: 1 }}>
        <Chip
          size="small"
          label={index === 0 ? "Tiêu điểm" : `0${index + 1}`}
          sx={{
            height: 22,
            mb: 0.8,
            color: "common.white",
            fontSize: "0.66rem",
            fontWeight: 900,
            bgcolor: alpha(theme.palette[tone].main, 0.82),
          }}
        />
        <Typography
          noWrap
          sx={{
            color: "common.white",
            fontSize: index === 0 ? "1.12rem" : "0.86rem",
            fontWeight: 900,
          }}
        >
          {movie.title}
        </Typography>
        <Typography
          noWrap
          sx={{ color: alpha(theme.palette.common.white, 0.7), fontSize: "0.72rem", mt: 0.3 }}
        >
          {categories || movie.releaseYear || "Đang được khám phá"}
        </Typography>
      </Box>
    </Box>
  );
}
