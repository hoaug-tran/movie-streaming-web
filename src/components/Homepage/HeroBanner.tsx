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
    }, 5000);

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
          backgroundColor: "background.paper",
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
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
              transform: imageLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 1.2s ease, transform 1.5s cubic-bezier(0.33, 1, 0.68, 1)",
            }}
            onLoad={() => setImageLoaded(true)}
          />
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background:
              "linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,0.4) 30%, rgba(26,26,26,0.8) 70%, #1A1A1A 100%)",
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            pt: { xs: 10, sm: 11, md: 12 },
            pb: { xs: 25, md: 45 }, // Increased padding bottom even more to move content higher up
            px: { xs: 2, md: 4 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            maxWidth: { xs: "100%", md: "60%" },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              mb: 0.75,
              fontSize: { xs: "28px", sm: "36px", md: "48px" },
              maxWidth: "600px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {currentMovie?.title}
          </Typography>

          {currentMovie?.description && (
            <Typography
              variant="body2"
              sx={{
                maxWidth: "500px",
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.5,
                fontSize: { xs: "12px", md: "14px" },
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {currentMovie.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mb: 1.5, flexWrap: "wrap" }}>
            <Button
              size="large"
              onClick={() => router.push(`/movies/${currentMovie?.slug}`)}
              sx={{
                px: 4,
                py: 1.2,
                bgcolor: "#ffffff",
                color: "#000000",
                borderRadius: 0,
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#e0e0e0",
                },
              }}
            >
              Xem Ngay
            </Button>

            <Button
              size="large"
              sx={{
                px: 4,
                py: 1.2,
                border: "1px solid #ffffff",
                color: "#ffffff",
                borderRadius: 0,
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Thêm Danh Sách
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: { xs: "260px", md: "340px" }, // Moved thumb cards down to align better with text info on the left
          right: { xs: 14, md: 22 },
          zIndex: 10,
          display: "flex",
          gap: 1.2,
        }}
      >
        {movies.slice(0, 4).map((movie, index) => (
          <Box
            key={movie.id}
            onClick={() => handleCardClick(index)}
            sx={{
              cursor: "pointer",
              width: { xs: 100, sm: 120, md: 140 },
              height: { xs: 56, sm: 68, md: 80 },
              borderRadius: 0,
              overflow: "hidden",
              border:
                currentIndex === index ? "1px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.25s ease",
              position: "relative",
              flexShrink: 0,
              "&:hover": {
                borderColor: "white",
                transform: "scale(1.05)",
              },
            }}
          >
            {movie.bannerUrl && (
              <Image
                src={movie.bannerUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 100px, 140px"
                style={{ objectFit: "cover" }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
