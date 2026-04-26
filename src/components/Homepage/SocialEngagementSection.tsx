"use client";

import { Box, Typography, Avatar, Paper, Grid, alpha, useTheme, Button } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";
import { useRouter } from "next/navigation";
import { MessageSquare, Star, TrendingUp, Clock } from "lucide-react";
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

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 } }}>
      <SectionHeader title="Thảo luận sôi nổi" subtitle="Cộng đồng đang nói gì?" />

      <Grid container spacing={4}>
        {/* Top Comments Column */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Star size={20} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={700}>
              Top bình luận
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {topComments.data?.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </Box>
        </Grid>

        {/* Most Active Movies Column */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingUp size={20} color={theme.palette.secondary.main} />
            <Typography variant="h6" fontWeight={700}>
              Sôi nổi nhất
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(mostActiveMovies.data || []).map((movie: any) => (
              <ActiveMovieCard key={movie.id} movie={movie} />
            ))}
          </Box>
        </Grid>

        {/* New Comments Column */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Clock size={20} color={theme.palette.info.main} />
            <Typography variant="h6" fontWeight={700}>
              Bình luận mới
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {newComments.data?.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function CommentCard({ comment }: { comment: any }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: alpha(theme.palette.text.primary, 0.03),
        border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: alpha(theme.palette.text.primary, 0.06),
          transform: "translateY(-2px)",
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
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "primary.main" }}>
          U
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.85rem" }}>
            Người dùng ẩn danh
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "0.85rem",
              lineHeight: 1.4,
            }}
          >
            {comment.content}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <MessageSquare size={14} />
              <Typography variant="caption">{comment.replyCount || 0}</Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function ActiveMovieCard({ movie }: { movie: any }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        display: "flex",
        gap: 2,
        backgroundColor: alpha(theme.palette.text.primary, 0.03),
        border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: alpha(theme.palette.text.primary, 0.06),
        },
      }}
      onClick={() => router.push(`/movies/${movie.slug}`)}
    >
      <Box
        sx={{
          width: 60,
          height: 80,
          borderRadius: 1.5,
          overflow: "hidden",
          flexShrink: 0,
          background: `url(${movie.posterUrl}) center/cover`,
        }}
      />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {movie.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {movie.totalReviews || 0} bình luận sôi nổi
        </Typography>
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Star size={12} fill={theme.palette.warning.main} color={theme.palette.warning.main} />
          <Typography variant="caption" fontWeight={700}>
            {movie.averageRating}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
