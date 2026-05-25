"use client";

import { Box, Typography, Button, Stack, Skeleton } from "@mui/material";
import Image from "next/image";
import { useCarouselMovies } from "@/modules/movie/hooks/useClientMovies";
import { useState, useEffect } from "react";
import { usePlayNavigation } from "@/hooks/use-play-navigation";
import { WatchlistToggleButton } from "@/modules/watchlist/components/WatchlistToggleButton";

export function HeroBanner() {
  const { data: movies = [], isLoading, isError } = useCarouselMovies();
  const { navigateToWatch } = usePlayNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  const currentMovie = movies[currentIndex];

  useEffect(() => {
    if (!autoPlayEnabled || movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setImageLoaded(false);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlayEnabled, movies.length]);

  const handleCardClick = (index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
    setAutoPlayEnabled(false);
    setTimeout(() => setAutoPlayEnabled(true), 8000);
  };

  if (isLoading || isError || !movies.length) {
    return (
      <Box
        sx={{
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#0C0C0C",
        }}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ bgcolor: "rgba(255,255,255,0.04)" }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", overflow: "hidden", mt: { xs: -7.5, md: -8.5 } }}>
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {currentMovie?.bannerUrl && (
          <Image
            key={currentMovie.id}
            src={currentMovie.bannerUrl}
            alt={currentMovie.title}
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
              transform: imageLoaded ? "scale(1)" : "scale(1.03)",
              transition: "opacity 1.4s ease, transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onLoad={() => setImageLoaded(true)}
          />
        )}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(12,12,12,0.95) 0%, rgba(12,12,12,0.4) 50%, transparent 100%)",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "70%",
            background:
              "linear-gradient(to top, #0C0C0C 0%, rgba(12,12,12,0.8) 30%, rgba(12,12,12,0.4) 60%, transparent 100%)",
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            pb: { xs: "190px", sm: "260px", md: "300px" },
            pt: { xs: 12, md: 0 },
            px: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: { xs: "center", md: "flex-end" },
            textAlign: { xs: "center", md: "left" },
            width: "100%",
            height: "100%",
            maxWidth: { xs: "100%", md: "55%" },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-start" },
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 18,
                backgroundColor: "primary.main",
                borderRadius: 0,
                boxShadow: "0 0 15px rgba(200, 16, 46, 0.4)",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              Đề xuất cho bạn
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              mb: 2,
              fontSize: { xs: "2.6rem", sm: "2.75rem", md: "3.5rem" },
              maxWidth: { xs: "100%", md: "800px" },
              fontWeight: 950,
              color: "#ffffff",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              textShadow: "0 10px 40px rgba(0,0,0,0.6)",
            }}
          >
            {currentMovie?.title}
          </Typography>

          {currentMovie?.description && (
            <Typography
              variant="body1"
              sx={{
                maxWidth: { xs: "100%", md: "480px" },
                mb: { xs: 3, md: 4.5 },
                display: "-webkit-box",
                WebkitLineClamp: { xs: 3, md: 2 },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
                fontSize: { xs: "0.95rem", md: "1rem" },
                color: "rgba(255, 255, 255, 0.75)",
                fontWeight: 400,
                px: { xs: 1, md: 0 },
              }}
            >
              {currentMovie.description}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={2}
            sx={{
              flexWrap: "wrap",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                navigateToWatch({
                  movieSlug: currentMovie?.slug ?? "",
                  movieId: currentMovie?.id ?? 0,
                  isPremiumOnly: currentMovie?.isPremiumOnly,
                });
              }}
              sx={{
                px: { xs: 4, md: 4 },
                py: 1.4,
                bgcolor: "#ffffff",
                color: "#000000",
                borderRadius: 1.5,
                fontWeight: 800,
                fontSize: "0.9rem",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(255,255,255,0.2)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              ▶ Xem Ngay
            </Button>

            <WatchlistToggleButton
              movieId={currentMovie.id}
              movieTitle={currentMovie.title}
              size="large"
            />
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 170, sm: 210, md: "270px" },
          left: { xs: 0, md: "auto" },
          right: { xs: 0, md: 32 },
          px: { xs: 2.5, md: 0 },
          py: 1,
          zIndex: 10,
          display: "flex",
          gap: { xs: 1.25, md: 2 },
          justifyContent: { xs: "center", md: "flex-end" },
          alignItems: "center",
          pointerEvents: "auto",
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            gap: 1,
            alignItems: "center",
            overflowX: "auto",
            maxWidth: "100%",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {movies.slice(0, 4).map((movie, index) => (
            <Box
              key={movie.id}
              onClick={() => handleCardClick(index)}
              sx={{
                cursor: "pointer",
                width: 86,
                height: 50,
                borderRadius: 1,
                overflow: "hidden",
                border: "1.5px solid",
                borderColor: currentIndex === index ? "#ffffff" : "rgba(255,255,255,0.18)",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                flexShrink: 0,
                opacity: currentIndex === index ? 1 : 0.55,
                boxShadow: currentIndex === index ? "0 6px 18px rgba(0,0,0,0.55)" : "none",
              }}
            >
              {movie.bannerUrl && (
                <Image
                  src={movie.bannerUrl}
                  alt={movie.title}
                  fill
                  sizes="86px"
                  style={{ objectFit: "cover" }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          {movies.slice(0, 4).map((movie, index) => (
            <Box
              key={movie.id}
              onClick={() => handleCardClick(index)}
              sx={{
                cursor: "pointer",
                width: { md: 160 },
                height: { md: 90 },
                borderRadius: 1.5,
                overflow: "hidden",
                border: "2px solid",
                borderColor: currentIndex === index ? "#ffffff" : "rgba(255,255,255,0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                flexShrink: 0,
                opacity: currentIndex === index ? 1 : 0.4,
                scale: currentIndex === index ? "1.05" : "1",
                "&:hover": { borderColor: "rgba(255,255,255,0.6)", opacity: 0.8 },
                boxShadow: currentIndex === index ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
                display: { md: index >= 2 ? "none" : "block", lg: "block" },
              }}
            >
              {movie.bannerUrl && (
                <Image
                  src={movie.bannerUrl}
                  alt={movie.title}
                  fill
                  sizes="160px"
                  style={{ objectFit: "cover" }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
