"use client";

import { Box, Typography, Avatar, Paper, Grid, useTheme } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { useRouter } from "next/navigation";
import { MessageSquare, Star, TrendingUp } from "lucide-react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function SocialEngagementSection() {
  const { topComments, newComments, mostActiveMovies } = useDiscovery();
  const theme = useTheme();
  const router = useRouter();

  const loading = topComments.isLoading || newComments.isLoading || mostActiveMovies.isLoading;

  if (!loading && topComments.data?.length === 0 && newComments.data?.length === 0) {
    return null;
  }

  const featuredMovie = mostActiveMovies.data?.[0];
  const otherActiveMovies = mostActiveMovies.data?.slice(1, 4) || [];

  const allComments = [...(topComments.data || []), ...(newComments.data || [])]
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .slice(0, 8);

  const leftColComments = allComments.filter((_, i) => i % 2 === 0);
  const rightColComments = allComments.filter((_, i) => i % 2 !== 0);

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 } }}>
      <SectionHeader title="Thảo luận sôi nổi" subtitle="Cộng đồng đang bàn tán điều gì?" />

      <Grid container spacing={4}>
        {/* Left Column: Trending Buzz Movies */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}
          >
            <TrendingUp size={20} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={700} color="white">
              Tâm điểm bàn luận
            </Typography>
          </Box>

          {featuredMovie && (
            <Box
              onClick={() => router.push(`/movies/${featuredMovie.slug}`)}
              sx={{
                position: "relative",
                height: 380,
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                mb: 2,
                "&:hover .featured-img": { transform: "scale(1.05)" },
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Box
                className="featured-img"
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: `url(${featuredMovie.posterUrl}) center/cover`,
                  transition: "transform 0.5s ease",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(15,15,15,1) 0%, rgba(15,15,15,0.3) 50%, transparent 100%)",
                }}
              />

              <Box sx={{ position: "absolute", bottom: 0, left: 0, width: "100%", p: 3 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: "primary.main",
                    color: "white",
                    borderRadius: 1,
                    mb: 1.5,
                  }}
                >
                  <MessageSquare size={14} />
                  <Typography variant="caption" fontWeight={800}>
                    {featuredMovie.totalReviews || 0} Bình luận
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="white"
                  sx={{ mb: 1, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                >
                  {featuredMovie.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Typography fontWeight={700} color="#FFD700">
                    {featuredMovie.averageRating}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {otherActiveMovies.map((movie: any, idx: number) => (
              <Box
                key={movie.id}
                onClick={() => router.push(`/movies/${movie.slug}`)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  cursor: "pointer",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  transition: "all 0.2s",
                  border: "1px solid rgba(255,255,255,0.02)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: "rgba(255,255,255,0.2)", width: 24, textAlign: "center" }}
                >
                  {idx + 2}
                </Typography>
                <Box
                  sx={{
                    width: 48,
                    height: 64,
                    borderRadius: 1,
                    background: `url(${movie.posterUrl}) center/cover`,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="white" noWrap>
                    {movie.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {movie.totalReviews || 0} lượt bàn luận
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right Column: Comment Wall */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <MessageSquare size={20} color={theme.palette.secondary.main} />
            <Typography variant="h6" fontWeight={700} color="white">
              Cộng đồng nói gì?
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {leftColComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: { xs: 0, sm: 4 } }}>
                {rightColComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

function CommentCard({ comment }: { comment: any }) {
  const router = useRouter();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        backgroundColor: "rgba(20, 20, 20, 0.5)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "rgba(35, 35, 35, 0.8)",
          borderColor: "rgba(255, 255, 255, 0.15)",
          transform: "translateY(-4px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
        },
      }}
      onClick={() =>
        router.push(
          comment.movieSlug
            ? `/movies/${comment.movieSlug}`
            : `/movies/details?id=${comment.movieId}`
        )
      }
    >
      <Box
        sx={{
          position: "absolute",
          top: -15,
          right: -15,
          opacity: 0.03,
          transform: "rotate(10deg)",
        }}
      >
        <MessageSquare size={80} fill="currentColor" />
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, alignItems: "center" }}>
          <Avatar
            sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "#333", color: "white" }}
          >
            M
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.9)" }}
            >
              Khán giả Web
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block", mt: -0.2 }}
            >
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.85)",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            fontWeight: 500,
            mb: 2,
          }}
        >
          {comment.content}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            pt: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
            <MessageSquare size={14} />
            <Typography variant="caption">{comment.replyCount || 0} Phản hồi</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Tham gia <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
