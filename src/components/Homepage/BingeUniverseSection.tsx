"use client";

import { useMemo, useState } from "react";
import { Box, Typography, Skeleton, useTheme, alpha, ButtonBase, Chip } from "@mui/material";
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
  const activeCategories =
    active?.categories?.slice(0, 3).flatMap((category) => (category.name ? [category.name] : [])) || [];

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
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 2, md: 2.5 },
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
            p: { xs: 2.25, sm: 3, lg: 4 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
            gap: { xs: 3, lg: 4 },
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { xs: "auto", lg: 420 },
              gap: 3,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                  }}
                >
                  <Tv2 size={16} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "primary.main",
                  }}
                >
                  Phim bộ marathon
                </Typography>
              </Box>

              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "1.85rem", sm: "2.35rem", lg: "3rem" },
                  fontWeight: 950,
                  letterSpacing: "-0.065em",
                  lineHeight: 0.96,
                  color: "text.primary",
                }}
              >
                Thế nào gọi là
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    width: "fit-content",
                    mt: 0.5,
                    px: 1.1,
                    pb: 0.35,
                    color: "primary.main",
                    fontStyle: "italic",
                    borderBottom: `3px solid ${alpha(theme.palette.primary.main, 0.34)}`,
                  }}
                >
                  dàiiiiiiii?
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  fontSize: { xs: "0.9rem", md: "0.96rem" },
                  lineHeight: 1.75,
                }}
              >
                Một hàng phim bộ đủ dài để xem theo nhịp riêng: chọn poster, xem nhanh, hoặc mở
                trang chi tiết khi muốn theo dõi trọn mùa.
              </Typography>
            </Box>

            {active && !isLoading && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08)}`,
                  backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.54 : 0.72),
                  backdropFilter: "blur(14px)",
                }}
              >
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1 }}>
                  {activeCategories.map((category) => (
                    <Typography
                      key={category}
                      sx={{
                        color: "primary.main",
                        fontSize: "0.64rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {category}
                    </Typography>
                  ))}
                </Box>
                <Typography
                  sx={{
                    color: "text.primary",
                    fontWeight: 950,
                    letterSpacing: "-0.035em",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    lineHeight: 1.1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {active.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <ButtonBase
                    onClick={playActive}
                    sx={{
                      px: 1.6,
                      py: 0.95,
                      borderRadius: 99,
                      gap: 0.8,
                      color: theme.palette.primary.contrastText,
                      backgroundColor: "primary.main",
                      fontWeight: 900,
                      fontSize: "0.82rem",
                      boxShadow: `0 14px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    <Play size={15} fill="currentColor" />
                    Xem ngay
                  </ButtonBase>
                  <Box
                    component={NextLink}
                    href="/movies?type=series"
                    sx={{
                      px: 1.45,
                      py: 0.95,
                      borderRadius: 99,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.7,
                      color: "text.primary",
                      textDecoration: "none",
                      fontWeight: 850,
                      fontSize: "0.82rem",
                      border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.1)}`,
                      backgroundColor: alpha(theme.palette.background.paper, 0.48),
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Tất cả <ArrowRight size={15} />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Box>
            {isLoading ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: { xs: 1, sm: 1.25, lg: 1.35 },
                }}
              >
                {EPISODE_LABELS.map((label) => (
                  <Skeleton
                    key={`binge-${label}`}
                    variant="rounded"
                    sx={{ height: { xs: 190, sm: 224, lg: 260 }, borderRadius: { xs: 1.25, md: 1.5 } }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: { xs: 1, sm: 1.25, lg: 1.35 },
                }}
              >
                {allSeries.map((movie, index) => {
                  const isActive = index === activeIdx;
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
                        height: { xs: 190, sm: 224, lg: 260 },
                        borderRadius: { xs: 1.25, md: 1.5 },
                        overflow: "hidden",
                        transform: isActive ? "translateY(-4px)" : "translateY(0)",
                        transition: "transform 0.22s ease, box-shadow 0.22s ease, outline-color 0.22s ease",
                        boxShadow: isActive
                          ? `0 20px 48px ${alpha(theme.palette.primary.main, 0.2)}`
                          : `0 12px 30px ${alpha(theme.palette.common.black, isDark ? 0.22 : 0.1)}`,
                        outline: isActive
                          ? `2px solid ${alpha(theme.palette.primary.main, 0.55)}`
                          : `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                      }}
                    >
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 600px) 46vw, (max-width: 1200px) 30vw, 160px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Box sx={{ width: "100%", height: "100%", bgcolor: "action.hover" }} />
                      )}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(to top, ${alpha(
                            theme.palette.common.black,
                            0.82
                          )}, transparent 64%)`,
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          display: "flex",
                          gap: 0.75,
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={EPISODE_LABELS[index] || "EP"}
                          size="small"
                          sx={{
                            height: 23,
                            borderRadius: 99,
                            backgroundColor: alpha(theme.palette.primary.main, 0.94),
                            color: theme.palette.primary.contrastText,
                            fontSize: "0.62rem",
                            fontWeight: 950,
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: "absolute",
                          left: { xs: 11, sm: 14 },
                          right: { xs: 11, sm: 14 },
                          bottom: { xs: 11, sm: 14 },
                          textAlign: "left",
                        }}
                      >
                        <Typography
                          sx={{
                            color: theme.palette.common.white,
                            fontWeight: 950,
                            fontSize: { xs: "0.86rem", sm: "1rem" },
                            lineHeight: 1.08,
                            letterSpacing: "-0.035em",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {movie.title}
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
