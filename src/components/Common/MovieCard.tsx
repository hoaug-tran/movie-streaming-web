import React, { useState, useRef, useEffect } from "react";
import { Card, Box, Typography, Skeleton, IconButton, Portal } from "@mui/material";
import Image from "next/image";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl?: string;
  bannerUrl?: string;
  rating?: number;
  variant?: "default" | "ranked" | "preview";
  ranking?: number;
  releaseDate?: string;
  ageRating?: string;
  movieType?: string;
  onPlay?: (id: number) => void;
  onAddToList?: (id: number) => void;
  progress?: number;
  showProgress?: boolean;
}

export function MovieCard({
  id,
  title,
  posterUrl,
  bannerUrl,
  rating,
  variant = "default",
  ranking,
  releaseDate,
  ageRating,
  movieType,
  onPlay,
  onAddToList,
  progress = 0,
  showProgress = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const leaveTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (posterRef.current) {
      setRect(posterRef.current.getBoundingClientRect());
    }
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setHasMounted(true);
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    leaveTimeout.current = setTimeout(() => setIsHovered(false), 200);
  };

  const handlePortalMouseEnter = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
  };

  const HOVER_WIDTH = 340;
  const APPROX_METADATA_HEIGHT = 80;
  const HOVER_HEIGHT = HOVER_WIDTH * (9 / 16) + APPROX_METADATA_HEIGHT;

  let portalLeft = 0;
  let portalTop = 0;

  if (rect && typeof window !== "undefined") {
    portalLeft = rect.left + window.scrollX - (HOVER_WIDTH - rect.width) / 2;
    if (portalLeft < 24) portalLeft = 24;
    else if (portalLeft + HOVER_WIDTH > document.documentElement.clientWidth - 24) {
      portalLeft = document.documentElement.clientWidth - HOVER_WIDTH - 24;
    }
    portalTop = rect.top + window.scrollY - (HOVER_HEIGHT - rect.height) / 2;
  }

  const renderBaseCard = () => {
    if (variant === "ranked") {
      return (
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
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
            ref={posterRef}
            sx={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "55%",
              height: "100%",
              borderRadius: 1,
              overflow: "hidden",
              zIndex: 2,
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

            {rating && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  color: "#FFD700",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  zIndex: 2,
                  backdropFilter: "blur(4px)",
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
        ref={posterRef}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": {
            borderColor: "rgba(255,255,255,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
          },
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
              color: "#ffffff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
        </Box>
        {releaseDate && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.75)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "11px",
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
              bottom: showProgress ? 16 : 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#FFD700",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <StarRoundedIcon sx={{ fontSize: 16 }} />
            {rating.toFixed(1)}
          </Box>
        )}
        {showProgress && progress > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Box sx={{ height: "100%", width: `${progress}%`, backgroundColor: "primary.main" }} />
          </Box>
        )}
      </Card>
    );
  };

  return (
    <>
      <Box
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: "relative",
          width: "100%",
          height: variant === "ranked" ? 220 : "auto",
          aspectRatio: variant === "ranked" ? "auto" : "16 / 9",
          cursor: "pointer",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": { transform: "translateY(-4px)" },
        }}
      >
        {renderBaseCard()}
      </Box>

      {hasMounted && rect && typeof window !== "undefined" && (
        <Portal>
          <Box
            onMouseEnter={handlePortalMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              position: "absolute",
              top: portalTop,
              left: portalLeft,
              width: HOVER_WIDTH,
              zIndex: isHovered ? 99999 : -1,
              pointerEvents: isHovered ? "auto" : "none",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Card
              sx={{
                width: "100%",
                borderRadius: 1,
                overflow: "hidden",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isHovered ? "scale(1)" : "scale(0.85)",
                transformOrigin: "center center",
                boxShadow: isHovered ? "0 10px 40px rgba(0,0,0,0.9)" : "none",
                bgcolor: "#141414",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  bgcolor: "#000",
                }}
              >
                {!(bannerUrl || posterUrl) || imageError ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : (
                  <Image
                    src={bannerUrl || posterUrl!}
                    alt={title}
                    fill
                    sizes="340px"
                    style={{ objectFit: "cover" }}
                    onError={() => setImageError(true)}
                  />
                )}

                {showProgress && progress > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${progress}%`,
                        backgroundColor: "primary.main",
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box
                sx={{ px: 1.5, pt: 1, pb: 1.5, height: isHovered ? "auto" : 0, overflow: "hidden" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay?.(id);
                      }}
                      sx={{
                        bgcolor: "white",
                        color: "black",
                        width: 32,
                        height: 32,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.8)" },
                      }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToList?.(id);
                      }}
                      sx={{
                        border: "2px solid rgba(255,255,255,0.5)",
                        color: "white",
                        width: 32,
                        height: 32,
                        "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      sx={{
                        border: "2px solid rgba(255,255,255,0.5)",
                        color: "white",
                        width: 32,
                        height: 32,
                        "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      <ThumbUpOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  <IconButton
                    sx={{
                      border: "2px solid rgba(255,255,255,0.5)",
                      color: "white",
                      width: 32,
                      height: 32,
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    flexWrap: "wrap",
                    lineHeight: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: "#46d369", fontSize: "0.85rem" }}
                  >
                    {rating ? `${Math.round(rating * 20)}% Độ phù hợp` : "Top lựa chọn"}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid rgba(255,255,255,0.4)",
                      px: 0.6,
                      py: 0.2,
                      borderRadius: 0.5,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {ageRating || "T13"}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "white", fontSize: "0.8rem" }}
                  >
                    {movieType === "SERIES" ? "Loạt phim Netflix" : "Phim lẻ"}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid rgba(255,255,255,0.4)",
                      px: 0.6,
                      py: 0.2,
                      borderRadius: 0.5,
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    HD
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Cưng muốn xỉu
                  </Typography>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.4)",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Lãng mạn
                  </Typography>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.4)",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Kịch tính
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Portal>
      )}
    </>
  );
}

export function MovieCardSkeleton() {
  return (
    <Card sx={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 1 }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Card>
  );
}
