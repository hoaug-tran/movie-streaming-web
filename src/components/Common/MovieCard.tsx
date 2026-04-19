import { Card, Box, Typography, IconButton, Skeleton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import Image from "next/image";
import { useState } from "react";

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl?: string;
  rating?: number;
  variant?: "default" | "ranked" | "preview";
  ranking?: number;
  releaseDate?: string;
  onPlay?: (id: number) => void;
  onAddToList?: (id: number) => void;
  progress?: number;
  showProgress?: boolean;
}


export function MovieCard({
  id,
  title,
  posterUrl,
  rating,
  variant = "default",
  ranking,
  releaseDate,
  onPlay,
  onAddToList,
  progress = 0,
  showProgress = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        borderRadius: 1,
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid #222222",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 6,
          zIndex: 10,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!posterUrl || imageError ? (
        <Skeleton variant="rectangular" width="100%" height="100%" />
      ) : (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
            onError={() => setImageError(true)}
            priority={false}
          />
        </Box>
      )}

      {isHovered && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <IconButton
            size="large"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(id);
            }}
          >
            <PlayArrowIcon />
          </IconButton>
          <IconButton
            size="large"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToList?.(id);
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      )}

      {ranking && variant === "ranked" && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "primary.main",
            color: "white",
            width: 40,
            height: 40,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          {ranking}
        </Box>
      )}

      {releaseDate && variant === "default" && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "info.main",
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {new Date(releaseDate).getFullYear()}
        </Box>
      )}

      {rating && (
        <Box
          sx={{
            position: "absolute",
            bottom: 48,
            left: 8,
            backgroundColor: "secondary.main",
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          ★ {rating.toFixed(1)}
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          p: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>
      </Box>

      {showProgress && progress > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: "#333333",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "primary.main",
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Card>
  );
}

export function MovieCardSkeleton() {
  return (
    <Card
      sx={{
        width: "100%",
        aspectRatio: "2 / 3",
        borderRadius: 1,
      }}
    >
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Card>
  );
}
