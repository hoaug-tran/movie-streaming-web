"use client";

import { useMemo, useState } from "react";
import { Box, Typography, Skeleton, useTheme, alpha, ButtonBase, Chip } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, Star, Tv2 } from "lucide-react";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { usePlayNavigation } from "@/hooks/use-play-navigation";

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

  const active = allSeries[activeIdx] ?? allSeries[0];
  const backdrop = active?.bannerUrl ?? active?.posterUrl;
  const poster = active?.posterUrl ?? active?.bannerUrl;
  const categories = active?.categories?.slice(0, 3).flatMap((c) => (c.name ? [c.name] : [])) ?? [];

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
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(theme.palette.common.black, 0.96)})`
            : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.045)})`,
          boxShadow: isDark
            ? `0 28px 90px ${alpha(theme.palette.common.black, 0.34)}`
            : `0 24px 70px ${alpha(theme.palette.text.primary, 0.08)}`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 92% 18%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)}, transparent 36%), radial-gradient(circle at 8% 82%, ${alpha(theme.palette.text.primary, isDark ? 0.1 : 0.06)}, transparent 30%)`,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.82fr) minmax(340px, 1.18fr)" },
            minHeight: { xs: "auto", lg: 470 },
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5, lg: 3.25 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: { xs: 2.5, md: 3 },
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
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "primary.main",
                  }}
                >
                  Series xem dài hơi
                </Typography>
              </Box>

              <Typography
                component="h2"
                sx={{
                  maxWidth: 440,
                  fontSize: { xs: "1.75rem", sm: "2.35rem", lg: "3.25rem" },
                  fontWeight: 900,
                  letterSpacing: "-0.055em",
                  lineHeight: { xs: 1.02, md: 0.96 },
                  color: "text.primary",
                }}
              >
                Nhiều tập,
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "primary.main",
                    transform: { xs: "translateX(14px)", sm: "translateX(26px)" },
                    textShadow: `0 14px 34px ${alpha(theme.palette.primary.main, 0.18)}`,
                  }}
                >
                  mãi không chán.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: { xs: 1.5, md: 2 },
                  maxWidth: 420,
                  color: "text.secondary",
                  fontSize: { xs: "0.86rem", md: "0.94rem" },
                  lineHeight: 1.7,
                }}
              >
                Những bộ series đủ sức giữ bạn qua nhiều đêm - cốt truyện cuốn, nhân vật sâu, không
                thể dừng lại.
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={`binge-sk-${i}`}
                    variant="rounded"
                    sx={{ height: 64, borderRadius: 1.5 }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                {allSeries.map((movie, index) => {
                  const isActive = index === activeIdx;
                  const thumb = movie.posterUrl ?? movie.bannerUrl;
                  return (
                    <ButtonBase
                      key={movie.id}
                      onMouseEnter={() => setActiveIdx(index)}
                      onFocus={() => setActiveIdx(index)}
                      onClick={() => movie.slug && router.push(`/movies/${movie.slug}`)}
                      aria-label={`Mở series ${movie.title}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.75,
                        py: 1.25,
                        textAlign: "left",
                        position: "relative",
                        transition: "background-color 0.2s",
                        backgroundColor: isActive
                          ? isDark
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.06)
                          : "transparent",
                        borderBottom: index < allSeries.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                        "&::before": isActive
                          ? {
                              content: '""',
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 3,
                              backgroundColor: "primary.main",
                              borderRadius: "0 2px 2px 0",
                            }
                          : {},
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 44,
                          height: 60,
                          borderRadius: 1,
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid",
                          borderColor: isActive
                            ? alpha(theme.palette.primary.main, 0.4)
                            : "divider",
                          transition: "border-color 0.2s",
                        }}
                      >
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={movie.title}
                            fill
                            sizes="44px"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Box sx={{ width: "100%", height: "100%", bgcolor: "action.hover" }} />
                        )}
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color: isActive ? "primary.main" : "text.primary",
                            transition: "color 0.2s",
                            lineHeight: 1.2,
                          }}
                        >
                          {movie.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.4 }}>
                          {movie.averageRating != null && movie.averageRating > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                              <Star size={10} fill="#FFD700" color="#FFD700" />
                              <Typography
                                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#FFD700" }}
                              >
                                {movie.averageRating.toFixed(1)}
                              </Typography>
                            </Box>
                          )}
                          {movie.releaseYear && (
                            <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                              {movie.releaseYear}
                            </Typography>
                          )}
                          {movie.country && (
                            <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                              {movie.country}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          color: isActive ? "primary.contrastText" : "text.secondary",
                          backgroundColor: isActive
                            ? "primary.main"
                            : alpha(theme.palette.text.primary, 0.06),
                          transition: "background-color 0.2s, color 0.2s",
                        }}
                      >
                        <Play size={11} fill="currentColor" />
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 380, sm: 440, lg: "auto" },
              m: { xs: 1, sm: 1.5, lg: 1.75 },
              borderRadius: { xs: 2.5, md: 3.5 },
              overflow: "hidden",
              isolation: "isolate",
              backgroundColor: "action.hover",
            }}
          >
            {isLoading ? (
              <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />
            ) : (
              active && (
                <>
                  {backdrop && (
                    <Image
                      key={active.id}
                      src={backdrop}
                      alt={active.title}
                      fill
                      priority
                      sizes="(max-width: 1200px) 100vw, 54vw"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, ${alpha(theme.palette.common.black, 0.86)} 0%, ${alpha(theme.palette.common.black, 0.46)} 48%, ${alpha(theme.palette.common.black, 0.12)} 100%)`,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: "auto 0 0 0",
                      p: { xs: 2.25, sm: 3, lg: 4 },
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "138px minmax(0, 1fr)" },
                      gap: { xs: 2, sm: 2.5 },
                      alignItems: "end",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        display: { xs: "none", sm: "block" },
                        height: 202,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
                        boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.38)}`,
                      }}
                    >
                      {poster && (
                        <Image
                          src={poster}
                          alt={active.title}
                          fill
                          sizes="138px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1.5 }}>
                        {categories.map((cat) => (
                          <Chip
                            key={cat}
                            label={cat}
                            size="small"
                            sx={{
                              height: 24,
                              borderRadius: 99,
                              color: theme.palette.common.white,
                              backgroundColor: alpha(theme.palette.common.white, 0.13),
                              backdropFilter: "blur(10px)",
                              fontWeight: 800,
                              fontSize: "0.66rem",
                            }}
                          />
                        ))}
                      </Box>

                      <Typography
                        sx={{
                          color: theme.palette.common.white,
                          fontWeight: 950,
                          fontSize: { xs: "1.55rem", sm: "2rem", lg: "2.5rem" },
                          lineHeight: 1,
                          letterSpacing: "-0.055em",
                          maxWidth: 560,
                        }}
                      >
                        {active.title}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.4, mb: 2 }}>
                        {active.averageRating != null && active.averageRating > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.45 }}>
                            <Star size={15} fill="#FFD700" color="#FFD700" />
                            <Typography
                              sx={{ color: "#FFD700", fontWeight: 900, fontSize: "0.9rem" }}
                            >
                              {active.averageRating.toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                        {active.releaseYear && (
                          <Typography
                            sx={{
                              color: alpha(theme.palette.common.white, 0.68),
                              fontSize: "0.85rem",
                            }}
                          >
                            {active.releaseYear}
                          </Typography>
                        )}
                        {active.country && (
                          <Typography
                            sx={{
                              color: alpha(theme.palette.common.white, 0.68),
                              fontSize: "0.85rem",
                            }}
                          >
                            {active.country}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                        <ButtonBase
                          onClick={playActive}
                          sx={{
                            px: 2.2,
                            py: 1.15,
                            borderRadius: 99,
                            color: theme.palette.primary.contrastText,
                            backgroundColor: "primary.main",
                            fontWeight: 900,
                            gap: 1,
                            boxShadow: `0 18px 40px ${alpha(theme.palette.primary.main, 0.34)}`,
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 24px 54px ${alpha(theme.palette.primary.main, 0.42)}`,
                            },
                          }}
                        >
                          <Play size={17} fill="currentColor" />
                          Xem ngay
                        </ButtonBase>
                        <Box
                          component={NextLink}
                          href="/movies?type=series"
                          sx={{
                            px: 2,
                            py: 1.1,
                            borderRadius: 99,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.8,
                            color: theme.palette.common.white,
                            textDecoration: "none",
                            fontWeight: 850,
                            border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                            backgroundColor: alpha(theme.palette.common.white, 0.09),
                            backdropFilter: "blur(12px)",
                            "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.14) },
                          }}
                        >
                          Xem tất cả <ArrowRight size={16} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              )
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
