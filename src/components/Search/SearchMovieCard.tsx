import React, { useState } from "react";
import { Card, Box, Typography, Skeleton } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/modules/movie/types/movie";
import { PlayArrowOutlined } from "@mui/icons-material";

interface SearchMovieCardProps {
  movie: Movie;
  onClose: () => void;
}

const SearchMovieCard: React.FC<SearchMovieCardProps> = ({ movie, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onClose();
  };

  return (
    <Link href={`/movies/${movie.id}`} onClick={handleClick}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: "relative",
          cursor: "pointer",
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          overflow: "hidden",
          borderRadius: "8px",
          aspectRatio: "2/3",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isHovered ? "scale(1.05) translateY(-8px)" : "scale(1) translateY(0)",
          "&:hover": {
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {!imageLoaded && !imageError && (
            <Skeleton
              variant="rectangular"
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              }}
            />
          )}

          {!imageError && movie.posterUrl && (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              style={{
                objectFit: "cover",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {isHovered && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "flex-end",
                padding: "12px",
                justifyContent: "space-between",
                animation: "slideUp 0.3s ease",
                "@keyframes slideUp": {
                  from: { transform: "translateY(8px)", opacity: 0 },
                  to: { transform: "translateY(0)", opacity: 1 },
                },
              }}
            >
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography
                  sx={{
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {movie.title}
                </Typography>
                {movie.releaseYear && (
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                    }}
                  >
                    {movie.releaseYear}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <PlayArrowOutlined
                  sx={{
                    fontSize: 20,
                    color: "#ffffff",
                    cursor: "pointer",
                    opacity: 0.8,
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: 1 },
                  }}
                />
              </Box>
            </Box>
          )}

          {movie.averageRating && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(8px)",
                padding: "4px 8px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Typography
                sx={{
                  color: "#FFD700",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {(movie.averageRating || 0).toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Link>
  );
};

export default SearchMovieCard;
