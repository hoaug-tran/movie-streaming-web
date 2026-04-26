import { Card, Box, Typography, Button, Skeleton } from "@mui/material";
import Image from "next/image";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
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

  if (variant === "ranked") {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 220,
          display: "flex",
          cursor: "pointer",
          "&:hover .poster-card": {
            transform: "scale(1.05)",
            boxShadow: "-12px 10px 25px rgba(0,0,0,0.8)",
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {ranking && (
          <Typography
            sx={{
              position: "absolute",
              left: 4,
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              fontSize: "200px",
              fontWeight: 900,
              lineHeight: 1,
              color: "background.default",
              WebkitTextStroke: "4px #555555",
              fontFamily: "Impact, 'Arial Black', sans-serif",
              letterSpacing: "-0.08em",
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {ranking}
          </Typography>
        )}

        <Card
          className="poster-card"
          sx={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "55%",
            height: "100%",
            borderRadius: 1,
            overflow: "hidden",
            zIndex: 2,
            transition: "all 0.3s ease",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "-8px 0px 20px rgba(0,0,0,0.6)",
          }}
        >
          {!posterUrl || imageError ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            <Image
              src={posterUrl}
              alt={title}
              fill
              sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 25vw"
              style={{ objectFit: "cover" }}
              onError={() => setImageError(true)}
              priority={false}
            />
          )}

          {isHovered && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                animation: "fadeIn 0.2s ease",
              }}
            >
              <Button
                size="small"
                sx={{
                  backgroundColor: "primary.main",
                  color: "#ffffff",
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  padding: 0,
                  "&:hover": { backgroundColor: "primary.dark", transform: "scale(1.1)" },
                  transition: "all 0.2s",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.(id);
                }}
              >
                ▶
              </Button>
            </Box>
          )}

          {rating && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#FFD700",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "12px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                zIndex: 2,
              }}
            >
              ★ {rating.toFixed(1)}
            </Box>
          )}
        </Card>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        borderRadius: 0,
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid",
        borderColor: "divider",
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
          <Button
            size="small"
            sx={{
              backgroundColor: "text.primary",
              color: "background.paper",
              borderRadius: 0,
              px: 2,
              fontWeight: 600,
              letterSpacing: "0.05em",
              "&:hover": { backgroundColor: "text.secondary" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(id);
            }}
          >
            PHÁT
          </Button>
          <Button
            size="small"
            sx={{
              backgroundColor: "transparent",
              border: "1px solid",
              borderColor: "text.primary",
              color: "text.primary",
              borderRadius: 0,
              px: 2,
              fontWeight: 600,
              letterSpacing: "0.05em",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToList?.(id);
            }}
          >
            + DANH SÁCH
          </Button>
        </Box>
      )}

      {releaseDate && variant === "default" && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            color: "#ffffff",
            border: "1px solid",
            borderColor: "rgba(255,255,255,0.2)",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          {new Date(releaseDate).getFullYear()}
        </Box>
      )}

      {rating && (
        <Box
          sx={{
            position: "absolute",
            bottom: showProgress ? 16 : 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#FFD700",
            border: "1px solid",
            borderColor: "rgba(255, 215, 0, 0.3)",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 2,
          }}
        >
          <StarRoundedIcon sx={{ fontSize: 16 }} />
          {rating.toFixed(1)}
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
          p: 1.5,
          pt: 4,
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "#ffffff",
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
        aspectRatio: "16 / 9",
        borderRadius: 0,
      }}
    >
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Card>
  );
}
