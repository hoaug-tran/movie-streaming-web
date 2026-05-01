"use client";

import { useState } from "react";
import { Box, Typography, Avatar, useTheme, alpha, Skeleton } from "@mui/material";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { useRouter } from "next/navigation";
import { MessageSquare, Quote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ACCENT_COLORS = ["#C8102E", "#E85D04", "#7B2FBE", "#1565C0", "#00897B"];

export function SocialEngagementSection() {
  const { topComments, newComments, mostActiveMovies } = useDiscovery();
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === "dark";
  const [activeComment, setActiveComment] = useState(0);

  const loading = topComments.isLoading || newComments.isLoading;

  const allComments = [...(topComments.data || []), ...(newComments.data || [])]
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .slice(0, 5);

  const mostActive = mostActiveMovies.data?.slice(0, 4) || [];

  if (!loading && allComments.length === 0) return null;

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
            <MessageSquare size={14} color={theme.palette.primary.main} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "primary.main",
              }}
            >
              Cộng Đồng
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
            Khán giả{" "}
            <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
              đang nói gì?
            </Box>
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
          <Skeleton
            variant="rounded"
            sx={{ flex: { md: 1 }, height: { xs: 200, md: 320 }, borderRadius: 2 }}
          />
          <Box
            sx={{
              flexShrink: 0,
              width: { md: 260 },
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 2.5 },
            alignItems: { md: "stretch" },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {allComments.slice(0, 4).map((comment, idx) => {
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              const isHighlighted = idx === activeComment;
              return (
                <Box
                  key={comment.id}
                  onClick={() =>
                    router.push(
                      comment.movieSlug
                        ? `/movies/${comment.movieSlug}`
                        : `/movies/details?id=${comment.movieId}`
                    )
                  }
                  onMouseEnter={() => setActiveComment(idx)}
                  sx={{
                    position: "relative",
                    p: { xs: 2, md: 2.25 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isHighlighted ? alpha(accent, 0.45) : "divider",
                    backgroundColor: isHighlighted
                      ? isDark
                        ? alpha(accent, 0.07)
                        : alpha(accent, 0.04)
                      : isDark
                        ? "rgba(255,255,255,0.015)"
                        : "rgba(0,0,0,0.015)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    overflow: "hidden",
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -16,
                      right: -8,
                      color: accent,
                      opacity: 0.07,
                      pointerEvents: "none",
                    }}
                  >
                    <Quote size={80} fill="currentColor" />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 1,
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 26,
                          height: 26,
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          backgroundColor: accent,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {comment.movieTitle?.[0] || "K"}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "text.primary",
                            lineHeight: 1.1,
                          }}
                        >
                          Khán giả
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    {comment.movieTitle && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.75,
                          backgroundColor: alpha(accent, isDark ? 0.18 : 0.1),
                          flexShrink: 0,
                          maxWidth: 120,
                        }}
                      >
                        <Typography
                          noWrap
                          sx={{ fontSize: "0.62rem", fontWeight: 700, color: accent }}
                        >
                          {comment.movieTitle}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: "text.primary",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontStyle: "italic",
                      opacity: isHighlighted ? 1 : 0.72,
                      transition: "opacity 0.25s",
                    }}
                  >
                    &ldquo;{comment.content}&rdquo;
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 280 },
              display: "flex",
              flexDirection: "column",
              gap: 0,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                Bình luận mới nhất
              </Typography>
            </Box>

            {allComments.map((comment, i) => {
              const isActive = i === activeComment;
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <Box
                  key={comment.id}
                  onMouseEnter={() => setActiveComment(i)}
                  onClick={() =>
                    router.push(
                      comment.movieSlug
                        ? `/movies/${comment.movieSlug}`
                        : `/movies/details?id=${comment.movieId}`
                    )
                  }
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    position: "relative",
                    transition: "background-color 0.2s",
                    backgroundColor: isActive ? alpha(accent, isDark ? 0.08 : 0.05) : "transparent",
                    borderBottom: i < allComments.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    "&::before": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3,
                          backgroundColor: accent,
                        }
                      : {},
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      backgroundColor: isActive ? accent : alpha(accent, 0.3),
                      color: "#fff",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {comment.movieTitle?.[0] || "K"}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    {comment.movieTitle && (
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: isActive ? accent : "text.secondary",
                          mb: 0.2,
                          transition: "color 0.2s",
                        }}
                      >
                        {comment.movieTitle}
                      </Typography>
                    )}
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "0.75rem",
                        color: isActive ? "text.primary" : "text.secondary",
                        fontWeight: isActive ? 500 : 400,
                        transition: "color 0.2s",
                      }}
                    >
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            {mostActive.length > 0 && (
              <>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderTop: "1px solid",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    Đang hot
                  </Typography>
                </Box>
                {mostActive.map((movie: any) => (
                  <Box
                    key={movie.id}
                    onClick={() => router.push(`/movies/${movie.slug}`)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      },
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 48,
                        borderRadius: 0.75,
                        background: `url(${movie.posterUrl}) center/cover`,
                        flexShrink: 0,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.primary" }}
                      >
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                        <MessageSquare size={10} color={theme.palette.text.secondary as string} />
                        <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                          {movie.totalReviews || 0} bình luận
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
