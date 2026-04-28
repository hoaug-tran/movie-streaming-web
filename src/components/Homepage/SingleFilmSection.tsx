"use client";

import { useState } from "react";
import { Box, Typography, Skeleton, alpha, useTheme, Chip } from "@mui/material";
import Image from "next/image";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { Movie } from "@/modules/movie/types/movie";
import { useRouter } from "next/navigation";
import { Play, Star, ArrowRight, Film } from "lucide-react";
import NextLink from "next/link";

function PosterCard({
  movie,
  isActive,
  onClick,
}: {
  movie: Movie;
  isActive: boolean;
  onClick: () => void;
}) {
  const img = movie.posterUrl;

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        width: { xs: 80, md: 96 },
        height: { xs: 110, md: 132 },
        flexShrink: 0,
        borderRadius: 1.5,
        overflow: "hidden",
        cursor: "pointer",
        border: "2px solid",
        borderColor: isActive ? "primary.main" : "transparent",
        transition: "all 0.25s ease",
        opacity: isActive ? 1 : 0.55,
        "&:hover": { opacity: 1, borderColor: isActive ? "primary.main" : "rgba(255,255,255,0.3)" },
      }}
    >
      {img ? (
        <Image src={img} alt={movie.title} fill style={{ objectFit: "cover" }} />
      ) : (
        <Box sx={{ width: "100%", height: "100%", bgcolor: "action.hover" }} />
      )}
    </Box>
  );
}

export function SingleFilmSection() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { topRatedMovies, weeklyNewMovies } = useDiscovery();

  const [activeIdx, setActiveIdx] = useState(0);

  const isLoading = topRatedMovies.isLoading && weeklyNewMovies.isLoading;

  const allMovies = [...(topRatedMovies.data || []), ...(weeklyNewMovies.data || [])]
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .filter(
      (m) =>
        !m.movieType ||
        m.movieType.toUpperCase() === "SINGLE" ||
        m.movieType.toUpperCase() === "MOVIE"
    )
    .slice(0, 7);

  const films = allMovies.length > 0 ? allMovies : (topRatedMovies.data || []).slice(0, 7);
  if (!isLoading && films.length === 0) return null;

  const featured = films[activeIdx] || films[0];
  const banner = featured?.bannerUrl || featured?.posterUrl;
  const categories =
    featured?.categories
      ?.slice(0, 3)
      .map((c) => c.name)
      .filter(Boolean) || [];

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
            <Film size={14} color={theme.palette.primary.main} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "primary.main",
              }}
            >
              Phim Lẻ
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
            Một phim.{" "}
            <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
              Một đêm.
            </Box>
          </Typography>
        </Box>

        <Box
          component={NextLink}
          href="/movies?type=single"
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

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            height: { xs: "auto", md: 380 },
          }}
        >
          <Skeleton
            variant="rounded"
            sx={{ borderRadius: 2, flex: { md: "1" }, height: { xs: 220, md: "100%" } }}
          />
          <Box
            sx={{
              flexShrink: 0,
              width: { md: 200 },
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 1.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{
                  borderRadius: 1.5,
                  width: { xs: 80, md: "100%" },
                  height: { xs: 110, md: 60 },
                }}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 },
            height: { xs: "auto", md: 300 },
            borderRadius: 1.5,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {featured && (
            <Box
              onClick={() => router.push(`/movies/${featured.slug}`)}
              sx={{
                position: "relative",
                width: { xs: "100%", md: "55%" },
                flexShrink: 0,
                height: { xs: 200, md: "100%" },
                cursor: "pointer",
                overflow: "hidden",
                "&:hover .sf-play": { opacity: 1 },
              }}
            >
              {banner ? (
                <Box
                  className="sf-img"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <Image
                    src={banner}
                    alt={featured.title}
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </Box>
              ) : (
                <Box sx={{ position: "absolute", inset: 0, bgcolor: "action.hover" }} />
              )}

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(60deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, transparent 100%)",
                }}
              />

              <Box
                className="sf-play"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  boxShadow: "0 0 40px rgba(200,16,46,0.55)",
                  zIndex: 2,
                }}
              >
                <Play size={24} fill="#fff" color="#fff" />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  p: { xs: 2, md: 3 },
                  zIndex: 2,
                  maxWidth: { md: "75%" },
                }}
              >
                {categories.length > 0 && (
                  <Box sx={{ display: "flex", gap: 0.75, mb: 1.25, flexWrap: "wrap" }}>
                    {categories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          backgroundColor: "rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(4px)",
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: { xs: "1.15rem", md: "1.5rem" },
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    mb: 0.75,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {featured.title}
                </Typography>

                {featured.description && (
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.8rem",
                      lineHeight: 1.55,
                      display: { xs: "none", md: "-webkit-box" },
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1.25,
                    }}
                  >
                    {featured.description}
                  </Typography>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {featured.averageRating != null && featured.averageRating > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Star size={13} fill="#FFD700" color="#FFD700" />
                      <Typography sx={{ color: "#FFD700", fontSize: "0.78rem", fontWeight: 800 }}>
                        {featured.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                  {featured.releaseYear && (
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                      {featured.releaseYear}
                    </Typography>
                  )}
                  {featured.country && (
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                      {featured.country}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              backgroundColor: "background.paper",
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 99,
              },
            }}
          >
            {films.map((movie, i) => {
              const isActive = i === activeIdx;
              const img = movie.posterUrl;

              return (
                <Box
                  key={movie.id}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => router.push(`/movies/${movie.slug}`)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.75,
                    py: 1.25,
                    cursor: "pointer",
                    position: "relative",
                    transition: "background-color 0.2s",
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, isDark ? 0.08 : 0.05)
                      : "transparent",
                    borderBottom: i < films.length - 1 ? "1px solid" : "none",
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
                      width: 36,
                      height: 52,
                      flexShrink: 0,
                      borderRadius: 0.75,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {img ? (
                      <Image src={img} alt={movie.title} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", bgcolor: "action.hover" }} />
                    )}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.8rem",
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                        color: isActive ? "text.primary" : "text.secondary",
                        transition: "color 0.2s",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 0.5,
                      }}
                    >
                      {movie.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      {movie.averageRating != null && movie.averageRating > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                          <Star size={9} fill="#FFD700" color="#FFD700" />
                          <Typography
                            sx={{ fontSize: "0.65rem", color: "#FFD700", fontWeight: 700 }}
                          >
                            {movie.averageRating.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                      {movie.releaseYear && (
                        <Typography sx={{ fontSize: "0.65rem", color: "text.disabled" }}>
                          {movie.releaseYear}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
