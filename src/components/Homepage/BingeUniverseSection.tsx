"use client";

import { useMemo, useState } from "react";
import { Box, Typography, Skeleton, useTheme, alpha, ButtonBase } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, Tv2 } from "lucide-react";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { usePlayNavigation } from "@/hooks/use-play-navigation";

const EPISODE_LABELS = ["EP 08", "EP 12", "EP 16", "EP 24", "EP 32", "EP 48"];

export function BingeUniverseSection() {
  const { topSeries, seriesDrama } = useDiscovery();
  const router = useRouter();
  const { navigateToWatch } = usePlayNavigation();
  const theme = useTheme();
  const [activeIdx, setActiveIdx] = useState(0);

  const isDark = theme.palette.mode === "dark";
  const isLoading = topSeries.isLoading;

  const allSeries = useMemo(
    () =>
      [...(topSeries.data || []), ...(seriesDrama.data || [])]
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
        .slice(0, 6),
    [seriesDrama.data, topSeries.data]
  );

  if (!isLoading && allSeries.length === 0) return null;

  const active = allSeries[activeIdx] || allSeries[0];
  const activeImage = active?.bannerUrl || active?.posterUrl;

  const openDetail = (slug?: string) => {
    if (slug) router.push(`/movies/${slug}`);
  };

  const playActive = () => {
    if (!active) return;
    navigateToWatch({
      movieSlug: active.slug ?? "",
      movieId: active.id,
      isPremiumOnly: active.isPremiumOnly,
    });
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 1.75, md: 2 },
          border: "1px solid",
          borderColor: alpha(theme.palette.text.primary, isDark ? 0.1 : 0.08),
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.96)}, ${alpha(
                theme.palette.common.black,
                0.92
              )})`
            : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(
                theme.palette.primary.main,
                0.035
              )})`,
          boxShadow: isDark
            ? `0 24px 78px ${alpha(theme.palette.common.black, 0.28)}`
            : `0 22px 64px ${alpha(theme.palette.text.primary, 0.07)}`,
        }}
      >
        {activeImage && !isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: isDark ? 0.12 : 0.08,
              filter: "blur(18px)",
              transform: "scale(1.04)",
              pointerEvents: "none",
            }}
          >
            <Image
              key={active.id}
              src={activeImage}
              alt={active.title}
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </Box>
        )}

        <Box
          sx={{
            position: "relative",
            p: { xs: 1.25, sm: 1.5, lg: 1.75 },
            display: "grid",
            gap: { xs: 1.1, lg: 1.25 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.25,
              px: 0.25,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                  flexShrink: 0,
                }}
              >
                <Tv2 size={11} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h2"
                  sx={{
                    color: "text.primary",
                    fontSize: { xs: "0.86rem", sm: "0.95rem" },
                    fontWeight: 850,
                    letterSpacing: "-0.015em",
                    lineHeight: 1.1,
                  }}
                >
                  Series xem dài hơi
                </Typography>
                {active && !isLoading && (
                  <Typography
                    sx={{
                      display: { xs: "none", sm: "block" },
                      color: "text.secondary",
                      fontSize: "0.68rem",
                      fontWeight: 650,
                      mt: 0.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 340,
                    }}
                  >
                    Đang chọn: {active.title}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
              {active && !isLoading && (
                <ButtonBase
                  onClick={playActive}
                  sx={{
                    px: 1,
                    py: 0.55,
                    borderRadius: 99,
                    gap: 0.5,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: "primary.main",
                    fontWeight: 850,
                    fontSize: "0.7rem",
                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.22)}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.28)}`,
                    },
                  }}
                >
                  <Play size={12} fill="currentColor" />
                  Xem
                </ButtonBase>
              )}

              <Box
                component={NextLink}
                href="/movies?type=series"
                sx={{
                  px: 0.95,
                  py: 0.52,
                  borderRadius: 99,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.45,
                  color: "text.primary",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.1)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  "&:hover": { color: "primary.main" },
                }}
              >
                Tất cả <ArrowRight size={12} />
              </Box>
            </Box>
          </Box>

          <Box>
            {isLoading ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: { xs: 0.8, sm: 1, lg: 1 },
                }}
              >
                {EPISODE_LABELS.map((label) => (
                  <Skeleton
                    key={`binge-${label}`}
                    variant="rounded"
                    sx={{
                      height: { xs: 112, sm: 128, lg: 138 },
                      borderRadius: 1.25,
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: { xs: 0.8, sm: 1, lg: 1 },
                }}
              >
                {allSeries.map((movie, index) => {
                  const isActive = index === activeIdx;
                  const cardImage = movie.bannerUrl || movie.posterUrl;

                  return (
                    <ButtonBase
                      key={movie.id}
                      onMouseEnter={() => setActiveIdx(index)}
                      onFocus={() => setActiveIdx(index)}
                      onClick={() => openDetail(movie.slug)}
                      aria-label={`Mở phim bộ ${movie.title}`}
                      sx={{
                        position: "relative",
                        display: "block",
                        height: { xs: 112, sm: 128, lg: 138 },
                        borderRadius: 1.25,
                        overflow: "hidden",
                        transform: isActive ? "translateY(-2px)" : "translateY(0)",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, outline-color 0.2s ease",
                        boxShadow: isActive
                          ? `0 14px 32px ${alpha(theme.palette.primary.main, 0.18)}`
                          : `0 8px 20px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.08)}`,
                        outline: isActive
                          ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}`
                          : `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                      }}
                    >
                      {cardImage ? (
                        <Image
                          src={cardImage}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 600px) 92vw, (max-width: 1200px) 44vw, 28vw"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Box sx={{ width: "100%", height: "100%", bgcolor: "action.hover" }} />
                      )}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(90deg, ${alpha(
                            theme.palette.common.black,
                            0.82
                          )} 0%, ${alpha(theme.palette.common.black, 0.35)} 58%, ${alpha(
                            theme.palette.common.black,
                            0.08
                          )} 100%)`,
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: { xs: 12, sm: 14 },
                          right: { xs: 12, sm: 14 },
                          bottom: { xs: 10, sm: 12 },
                          textAlign: "left",
                        }}
                      >
                        <Typography
                          sx={{
                            color: theme.palette.common.white,
                            fontWeight: 900,
                            fontSize: { xs: "0.84rem", sm: "0.92rem" },
                            lineHeight: 1.1,
                            letterSpacing: "-0.025em",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            maxWidth: "78%",
                          }}
                        >
                          {movie.title}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.45,
                            color: alpha(theme.palette.common.white, 0.78),
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {EPISODE_LABELS[index] || "SERIES"}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
