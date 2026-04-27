"use client";

import { Box, Typography, Button, Stack, Skeleton } from "@mui/material";
import Image from "next/image";
import { useCarouselMovies } from "@/modules/movie/hooks/useClientMovies";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function HeroBanner() {
  const { data: movies = [], isLoading, isError } = useCarouselMovies();
  const router = useRouter();
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
    <Box sx={{ position: "relative", overflow: "hidden" }}>
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
              "linear-gradient(to right, rgba(12,12,12,0.9) 0%, rgba(12,12,12,0.3) 60%, transparent 100%)",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background:
              "linear-gradient(to top, #0C0C0C 0%, rgba(12,12,12,0.6) 50%, transparent 100%)",
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            pb: { xs: "220px", sm: "260px", md: "300px" },
            px: { xs: 2.5, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            maxWidth: { xs: "100%", md: "55%" },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 3,
                height: 20,
                backgroundColor: "primary.main",
                borderRadius: 0,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
              }}
            >
              Đề xuất cho bạn
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              mb: 1.5,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
              maxWidth: "640px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            {currentMovie?.title}
          </Typography>

          {currentMovie?.description && (
            <Typography
              variant="body1"
              sx={{
                maxWidth: "480px",
                mb: 3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
                fontSize: { xs: "0.875rem", md: "1rem" },
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: 400,
              }}
            >
              {currentMovie.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            <Button
              size="large"
              onClick={() => router.push(`/movies/${currentMovie?.slug}`)}
              sx={{
                px: 4,
                py: 1.4,
                bgcolor: "#ffffff",
                color: "#000000",
                borderRadius: 1,
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.02em",
                "&:hover": { bgcolor: "rgba(255,255,255,0.88)" },
              }}
            >
              ▶ Xem Ngay
            </Button>

            <Button
              size="large"
              sx={{
                px: 3.5,
                py: 1.4,
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.9)",
                borderRadius: 1,
                fontWeight: 600,
                fontSize: "0.9rem",
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255,255,255,0.06)",
                "&:hover": {
                  border: "1px solid rgba(255,255,255,0.7)",
                  bgcolor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              + Thêm Danh Sách
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: { xs: "200px", sm: "240px", md: "270px" },
          right: { xs: 16, md: 32 },
          zIndex: 10,
          display: "flex",
          gap: 1.5,
        }}
      >
        {movies.slice(0, 4).map((movie, index) => (
          <Box
            key={movie.id}
            onClick={() => handleCardClick(index)}
            sx={{
              cursor: "pointer",
              width: { xs: 96, sm: 120, md: 148 },
              height: { xs: 54, sm: 68, md: 84 },
              borderRadius: 1,
              overflow: "hidden",
              border:
                currentIndex === index ? "2px solid #ffffff" : "2px solid rgba(255,255,255,0.15)",
              transition: "all 0.3s ease",
              position: "relative",
              flexShrink: 0,
              opacity: currentIndex === index ? 1 : 0.55,
              "&:hover": { borderColor: "rgba(255,255,255,0.7)", opacity: 1 },
            }}
          >
            {movie.bannerUrl && (
              <Image
                src={movie.bannerUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 96px, 148px"
                style={{ objectFit: "cover" }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
