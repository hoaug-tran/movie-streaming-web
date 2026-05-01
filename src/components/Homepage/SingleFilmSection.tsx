"use client";

import { useMemo, useState } from "react";
import { Box, Typography, Skeleton, alpha, useTheme, Chip, ButtonBase } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { ArrowRight, Play, Sparkles, Star, Ticket } from "lucide-react";
import { usePlayNavigation } from "@/hooks/use-play-navigation";

const railNumbers = ["01", "02", "03", "04", "05", "06"];

export function SingleFilmSection() {
  const router = useRouter();
  const theme = useTheme();
  const { navigateToWatch } = usePlayNavigation();
  const { topRatedMovies, weeklyNewMovies } = useDiscovery();
  const [activeIdx, setActiveIdx] = useState(0);

  const isDark = theme.palette.mode === "dark";
  const isLoading = topRatedMovies.isLoading && weeklyNewMovies.isLoading;

  const films = useMemo(
    () =>
      [...(topRatedMovies.data || []), ...(weeklyNewMovies.data || [])]
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
        .filter(
          (m) =>
            !m.movieType ||
            m.movieType.toUpperCase() === "SINGLE" ||
            m.movieType.toUpperCase() === "MOVIE"
        )
        .slice(0, 6),
    [topRatedMovies.data, weeklyNewMovies.data]
  );

  if (!isLoading && films.length === 0) return null;

  const featured = films[activeIdx] || films[0];
  const poster = featured?.posterUrl || featured?.bannerUrl;
  const backdrop = featured?.bannerUrl || featured?.posterUrl;
  const categories =
    featured?.categories
      ?.slice(0, 3)
      .flatMap((category) => (category.name ? [category.name] : [])) || [];

  const openDetail = (slug?: string) => {
    if (slug) router.push(`/movies/${slug}`);
  };

  const playFeatured = () => {
    if (!featured) return;
    navigateToWatch({
      movieSlug: featured.slug ?? "",
      movieId: featured.id,
      isPremiumOnly: featured.isPremiumOnly,
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
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(
                theme.palette.common.black,
                0.96
              )})`
            : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(
                theme.palette.primary.main,
                0.045
              )})`,
          boxShadow: isDark
            ? `0 28px 90px ${alpha(theme.palette.common.black, 0.34)}`
            : `0 24px 70px ${alpha(theme.palette.text.primary, 0.08)}`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 8% 18%, ${alpha(
              theme.palette.primary.main,
              0.2
            )}, transparent 34%), radial-gradient(circle at 86% 10%, ${alpha(
              theme.palette.text.primary,
              isDark ? 0.13 : 0.07
            )}, transparent 32%)`,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.9fr) minmax(360px, 1.1fr)" },
            minHeight: { xs: "auto", lg: 540 },
          }}
        >
          <Box
            sx={{
              p: { xs: 2.25, sm: 3, lg: 4 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: { xs: 3, md: 4 },
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
                  <Ticket size={16} />
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
                  Phim lẻ tuyển chọn
                </Typography>
              </Box>

              <Typography
                component="h2"
                sx={{
                  maxWidth: 560,
                  fontSize: { xs: "2.15rem", sm: "3rem", lg: "4.6rem" },
                  fontWeight: 950,
                  letterSpacing: "-0.075em",
                  lineHeight: { xs: 0.96, md: 0.9 },
                  color: "text.primary",
                }}
              >
                Một phim
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "primary.main",
                    transform: { xs: "translateX(24px)", sm: "translateX(42px)" },
                    textShadow: `0 18px 50px ${alpha(theme.palette.primary.main, 0.22)}`,
                  }}
                >
                  một đêm.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: { xs: 2, md: 2.5 },
                  maxWidth: 470,
                  color: "text.secondary",
                  fontSize: { xs: "0.92rem", md: "1rem" },
                  lineHeight: 1.8,
                }}
              >
                Một lựa chọn đủ mạnh cho cả buổi tối: ít phân vân, nhiều cảm xúc, bấm xem là vào
                thẳng không khí điện ảnh.
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ display: "flex", gap: 1.25, overflow: "hidden" }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`single-rail-${railNumbers[index]}`}
                    variant="rounded"
                    sx={{ width: 86, height: 122, borderRadius: 2, flexShrink: 0 }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(3, minmax(0, 1fr))", sm: "repeat(6, 1fr)" },
                  gap: { xs: 1, md: 1.25 },
                }}
              >
                {films.map((movie, index) => {
                  const isActive = index === activeIdx;
                  return (
                    <ButtonBase
                      key={movie.id}
                      onMouseEnter={() => setActiveIdx(index)}
                      onFocus={() => setActiveIdx(index)}
                      onClick={() => openDetail(movie.slug)}
                      aria-label={`Mở phim ${movie.title}`}
                      sx={{
                        position: "relative",
                        display: "block",
                        height: { xs: 118, sm: 132, lg: 146 },
                        borderRadius: 2,
                        overflow: "hidden",
                        transform: isActive ? "translateY(-8px)" : "translateY(0)",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        boxShadow: isActive
                          ? `0 18px 42px ${alpha(theme.palette.primary.main, 0.24)}`
                          : "none",
                        outline: isActive
                          ? `2px solid ${alpha(theme.palette.primary.main, 0.55)}`
                          : `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                        outlineOffset: 0,
                      }}
                    >
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 600px) 30vw, (max-width: 1200px) 14vw, 110px"
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
                            0.72
                          )}, transparent 60%)`,
                        }}
                      />
                      <Typography
                        sx={{
                          position: "absolute",
                          left: 8,
                          bottom: 7,
                          color: theme.palette.common.white,
                          fontSize: "0.64rem",
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {railNumbers[index]}
                      </Typography>
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 430, sm: 500, lg: "auto" },
              m: { xs: 1.25, sm: 1.75, lg: 2 },
              borderRadius: { xs: 2.5, md: 3.5 },
              overflow: "hidden",
              isolation: "isolate",
              backgroundColor: "action.hover",
            }}
          >
            {isLoading ? (
              <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />
            ) : (
              featured && (
                <>
                  {backdrop && (
                    <Image
                      key={featured.id}
                      src={backdrop}
                      alt={featured.title}
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
                      background: `linear-gradient(90deg, ${alpha(
                        theme.palette.common.black,
                        0.86
                      )} 0%, ${alpha(theme.palette.common.black, 0.46)} 48%, ${alpha(
                        theme.palette.common.black,
                        0.12
                      )} 100%)`,
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
                          alt={featured.title}
                          fill
                          sizes="138px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1.5 }}>
                        {categories.map((category) => (
                          <Chip
                            key={category}
                            label={category}
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
                        {featured.title}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.4, mb: 2 }}>
                        {featured.averageRating != null && featured.averageRating > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.45 }}>
                            <Star size={15} fill="#FFD700" color="#FFD700" />
                            <Typography
                              sx={{ color: "#FFD700", fontWeight: 900, fontSize: "0.9rem" }}
                            >
                              {featured.averageRating.toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                        {featured.releaseYear && (
                          <Typography
                            sx={{
                              color: alpha(theme.palette.common.white, 0.68),
                              fontSize: "0.85rem",
                            }}
                          >
                            {featured.releaseYear}
                          </Typography>
                        )}
                        {featured.country && (
                          <Typography
                            sx={{
                              color: alpha(theme.palette.common.white, 0.68),
                              fontSize: "0.85rem",
                            }}
                          >
                            {featured.country}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                        <ButtonBase
                          onClick={playFeatured}
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
                          href="/movies?type=single"
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

                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: 18, md: 28 },
                      right: { xs: 18, md: 28 },
                      width: { xs: 68, md: 86 },
                      height: { xs: 68, md: 86 },
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: theme.palette.common.white,
                      backgroundColor: alpha(theme.palette.common.black, 0.34),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <Sparkles size={24} />
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
