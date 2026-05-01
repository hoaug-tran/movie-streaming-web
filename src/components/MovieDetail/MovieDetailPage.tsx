"use client";

import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Link from "next/link";
import { useMemo } from "react";

import { useMovieDetailPage } from "@/modules/movie/hooks/useMovieDetailPage";
import { Episode, MovieComment, MovieDetail, MovieReview } from "@/modules/movie/types/movie";
import { usePlayNavigation } from "@/hooks/use-play-navigation";

type MovieDetailPageProps = {
  slug: string;
  routeType: "movies" | "tv";
};

const fallbackImage = "http://localhost/stream/test/banner.jpg";

function formatRuntime(seconds?: number) {
  if (!seconds) return "Đang cập nhật";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes} phút`;
  return `${hours} giờ ${minutes} phút`;
}

function formatNumber(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(
    value
  );
}

function findEpisodeLabel(comment: MovieComment, episodes: Episode[]) {
  if (!comment.episodeId) return "Toàn phim";
  const episode = episodes.find((item) => item.id === comment.episodeId);
  if (!episode) return `Tập ${comment.episodeId}`;
  return `Tập ${episode.episodeNumber ?? "?"}: ${episode.title ?? "Chưa có tiêu đề"}`;
}

function DetailSkeleton() {
  return (
    <Box sx={{ minHeight: "100vh", pt: 12, backgroundColor: "background.default" }}>
      <Container maxWidth="xl">
        <LinearProgress color="primary" />
        <Typography sx={{ mt: 4 }} color="text.secondary">
          Đang dựng phòng chiếu chi tiết...
        </Typography>
      </Container>
    </Box>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: "hot" }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        background:
          tone === "hot"
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.42)}, ${alpha(theme.palette.background.paper, 0.64)})`
            : alpha(theme.palette.background.paper, 0.66),
        backdropFilter: "blur(18px)",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.14em" }}
      >
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em">
        {value}
      </Typography>
    </Paper>
  );
}

function DetailAction({
  onClick,
  label,
  primary,
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
}) {
  const theme = useTheme();
  return (
    <ButtonBase
      id={primary ? "movie-detail-play-button" : "movie-detail-list-button"}
      onClick={onClick}
      sx={{
        minWidth: primary ? 176 : 62,
        height: 58,
        px: primary ? 2.8 : 0,
        borderRadius: 1,
        color: primary ? theme.palette.common.white : theme.palette.text.primary,
        background: primary
          ? theme.palette.primary.main
          : alpha(theme.palette.background.paper, 0.78),
        border: `1px solid ${primary ? alpha(theme.palette.primary.light, 0.42) : alpha(theme.palette.text.primary, 0.16)}`,
        boxShadow: "none",
        backdropFilter: "blur(16px)",
        display: "inline-flex",
        gap: 1.1,
        fontWeight: 900,
        letterSpacing: primary ? "0.02em" : 0,
        textTransform: "uppercase",
        transition: "transform .2s ease, background-color .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          backgroundColor: primary
            ? theme.palette.primary.dark
            : alpha(theme.palette.text.primary, 0.08),
          borderColor: primary
            ? alpha(theme.palette.primary.light, 0.6)
            : alpha(theme.palette.text.primary, 0.28),
          boxShadow: "none",
        },
      }}
      aria-label={label}
    >
      {primary ? (
        <PlayArrowRoundedIcon sx={{ fontSize: 28 }} />
      ) : (
        <AddRoundedIcon sx={{ fontSize: 28 }} />
      )}
      {primary && <Box component="span">Phát</Box>}
    </ButtonBase>
  );
}

function MovieHero({ movie }: { movie: MovieDetail }) {
  const theme = useTheme();
  const { navigateToWatch } = usePlayNavigation();
  const firstEpisode = movie.episodes?.[0];

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: { xs: "auto", md: "78vh" },
        pt: { xs: 10, md: 13 },
        pb: { xs: 5, md: 5 },
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(90deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0.86)} 35%, ${alpha(theme.palette.background.default, 0.24)} 100%), linear-gradient(0deg, ${theme.palette.background.default} 0%, transparent 35%), url(${movie.bannerUrl || fallbackImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.15) contrast(1.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 18% 20%, ${alpha(theme.palette.primary.main, 0.36)}, transparent 31%), radial-gradient(circle at 86% 16%, ${alpha(theme.palette.text.primary, 0.14)}, transparent 24%)`,
        }}
      />
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          <Grid item xs={12} md={4} lg={3.2}>
            <Box
              sx={{
                position: "relative",
                width: { xs: 196, sm: 246, md: "100%" },
                mx: { xs: "auto", md: 0 },
                aspectRatio: "2/3",
                borderRadius: 1.5,
                overflow: "hidden",
                boxShadow: `0 34px 90px ${alpha(theme.palette.common.black, 0.42)}`,
                border: `1px solid ${alpha(theme.palette.common.white, 0.13)}`,
              }}
            >
              <Box
                component="img"
                src={movie.posterUrl || fallbackImage}
                alt={movie.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={8} lg={8.8}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={movie.movieType === "SERIES" ? "Phim bộ" : "Phim lẻ"}
                  color="primary"
                />
                {movie.isPremiumOnly && <Chip label="Premium" variant="outlined" color="primary" />}
                {movie.ageRating && <Chip label={movie.ageRating} variant="outlined" />}
                {movie.releaseYear && <Chip label={movie.releaseYear} variant="outlined" />}
              </Stack>
              <Box>
                <Typography
                  component="h1"
                  fontWeight={950}
                  letterSpacing={{ xs: "-0.035em", md: "-0.045em" }}
                  sx={{ fontSize: { xs: "3rem", md: "6.2rem" }, lineHeight: 0.98, maxWidth: 1040 }}
                >
                  {movie.title}
                </Typography>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <Typography variant="h5" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>
                    {movie.originalTitle}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 840, lineHeight: 1.65, fontWeight: 400 }}
              >
                {movie.description || "Thông tin phim đang được cập nhật."}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <DetailAction
                  onClick={() =>
                    navigateToWatch({
                      movieSlug: movie.slug,
                      movieId: movie.id,
                      isPremiumOnly: movie.isPremiumOnly,
                      episodeId: firstEpisode?.id,
                      isFreePreview: firstEpisode?.isFreePreview,
                    })
                  }
                  label="Phát phim"
                  primary
                />
                <DetailAction onClick={() => {}} label="Thêm vào danh sách" />
                <Typography color="text.secondary" sx={{ maxWidth: 240, fontSize: "0.92rem" }}>
                  Phát ngay hoặc lưu vào danh sách xem sau của bạn.
                </Typography>
              </Stack>
              <Box sx={{ maxWidth: 920 }}>
                <Grid container spacing={1.25}>
                  <Grid item xs={6} md={3}>
                    <MetricCard
                      label="Đánh giá"
                      value={`${Number(movie.averageRating || 0).toFixed(1)}/5`}
                      tone="hot"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MetricCard label="Lượt xem" value={formatNumber(movie.viewCount)} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MetricCard label="Yêu thích" value={formatNumber(movie.favoriteCount)} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MetricCard label="Review" value={formatNumber(movie.totalReviews)} />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      {eyebrow && (
        <Typography
          variant="overline"
          color="primary"
          fontWeight={900}
          sx={{ letterSpacing: "0.2em" }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h3" component="h2" fontWeight={950} letterSpacing="-0.035em">
        {title}
      </Typography>
    </Box>
  );
}

function InfoSection({ movie }: { movie: MovieDetail }) {
  const theme = useTheme();
  const facts = [
    ["Quốc gia", movie.country || "Đang cập nhật"],
    ["Ngôn ngữ", movie.language || "Đang cập nhật"],
    ["Trạng thái", movie.movieStatus || "Đang cập nhật"],
    ["Số tập", `${movie.episodes?.length || 1}`],
    [
      "Ngày phát hành",
      movie.publishedAt ? new Date(movie.publishedAt).toLocaleDateString("vi-VN") : "Đang cập nhật",
    ],
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: -1, md: -3 }, pb: { xs: 4, md: 5 } }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7.4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              background: `linear-gradient(120deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.primary.main, 0.08)})`,
              backdropFilter: "blur(22px)",
            }}
          >
            <SectionTitle eyebrow="Hồ sơ phim" title="Tín hiệu quan trọng" />
            <Grid container spacing={2}>
              {facts.map(([label, value]) => (
                <Grid item xs={6} md={2.4} key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography fontWeight={850}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
              {movie.categories?.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  component={Link}
                  href={`/movies/category/${item.slug}`}
                  clickable
                  sx={{
                    transition: "all .2s ease",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                />
              ))}
              {movie.tags?.map((item) => (
                <Chip key={item.id} label={item.name} variant="outlined" />
              ))}
              {movie.studios?.map((item) => (
                <Chip key={item.id} label={item.name} variant="outlined" />
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4.6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 1.5,
              height: "100%",
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.background.paper, 0.78)})`,
            }}
          >
            <SectionTitle eyebrow="Cast & Crew" title="Người tạo nên nhịp phim" />
            <Stack spacing={1.35}>
              {movie.persons?.length ? (
                movie.persons.map((person) => (
                  <Box
                    key={`${person.id}-${person.role}`}
                    sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography fontWeight={850}>{person.name}</Typography>
                    <Typography color="text.secondary">{person.role}</Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Đang cập nhật nhân sự.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function EpisodeSection({ episodes, movie }: { episodes: Episode[]; movie: MovieDetail }) {
  const theme = useTheme();
  const { navigateToWatch } = usePlayNavigation();
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <SectionTitle eyebrow="Xem thôi nào" title="Tập phim" />
      <Grid container spacing={2}>
        {episodes.map((episode) => (
          <Grid item xs={12} md={6} lg={4} key={episode.id}>
            <Paper
              elevation={0}
              onClick={() =>
                navigateToWatch({
                  movieSlug: movie.slug,
                  movieId: movie.id,
                  isPremiumOnly: movie.isPremiumOnly,
                  episodeId: episode.id,
                  isFreePreview: episode.isFreePreview,
                })
              }
              sx={{
                position: "relative",
                overflow: "hidden",
                minHeight: 230,
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                backgroundColor: "background.paper",
                cursor: "pointer",
                transition: "transform .28s ease, border-color .28s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(0deg, ${alpha(theme.palette.background.default, 0.96)} 0%, ${alpha(theme.palette.background.default, 0.42)} 70%), url(${episode.thumbnailUrl || movie.bannerUrl || fallbackImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Stack
                sx={{ position: "relative", minHeight: 230, p: 2.4, justifyContent: "flex-end" }}
              >
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    color="primary"
                    label={`Tập ${episode.episodeNumber ?? "?"}`}
                  />
                  {episode.isFreePreview && (
                    <Chip size="small" label="Free preview" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="h5" fontWeight={950} letterSpacing="-0.035em">
                  {episode.title || "Chưa có tiêu đề"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatRuntime(episode.durationSeconds)} · {episode.status || "PUBLISHED"}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function ReviewSection({ reviews }: { reviews: MovieReview[] }) {
  const theme = useTheme();
  const track = reviews.length ? [...reviews, ...reviews] : [];

  return (
    <Box sx={{ py: { xs: 4, md: 7 }, overflow: "hidden" }}>
      <Container maxWidth="xl">
        <SectionTitle eyebrow="Đánh giá" title="Đánh giá của khán giả" />
      </Container>
      {track.length ? (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: "max-content",
            animation: "reviewFloat 5s linear infinite",
            "@keyframes reviewFloat": {
              from: { transform: "translateX(0)" },
              to: { transform: "translateX(-50%)" },
            },
            "&:hover": { animationPlayState: "paused" },
          }}
        >
          {track.map((review, index) => (
            <Paper
              key={`${review.id}-${index}`}
              elevation={0}
              sx={{
                width: { xs: 300, md: 420 },
                ml: index === 0 ? { xs: 2, md: 4 } : 0,
                p: 2.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                background: `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.background.paper, 0.84)})`,
                backdropFilter: "blur(18px)",
              }}
            >
              <Typography color="primary" fontWeight={950} sx={{ mb: 1 }}>
                {"★".repeat(Math.max(1, Math.min(5, review.rating || 0)))}
              </Typography>
              <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em">
                {review.title || "Review không tiêu đề"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                {review.content || "Người dùng chưa để lại nội dung review."}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                {review.likeCount || 0} lượt thích {review.isEdited ? "· đã chỉnh sửa" : ""}
              </Typography>
            </Paper>
          ))}
        </Box>
      ) : (
        <Container maxWidth="xl">
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              backgroundColor: "background.paper",
            }}
          >
            <Typography color="text.secondary">
              Chưa có review nào. Review chỉ nên mở khi người dùng đã xem hết nội dung.
            </Typography>
          </Paper>
        </Container>
      )}
    </Box>
  );
}

function CommentSection({ comments, episodes }: { comments: MovieComment[]; episodes: Episode[] }) {
  const theme = useTheme();
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <SectionTitle eyebrow="Bình luận" title="Bình luận của cộng đồng" />
      <Stack spacing={1.5}>
        {comments.length ? (
          comments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              sx={{
                p: { xs: 2.2, md: 2.8 },
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.main, 0.06)})`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  label={findEpisodeLabel(comment, episodes)}
                  color={comment.episodeId ? "primary" : "default"}
                />
                <Typography variant="caption" color="text.secondary">
                  Người xem
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "1.02rem", lineHeight: 1.75 }}>
                {comment.content}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1.5, display: "block" }}
              >
                {comment.likeCount} lượt thích · {comment.replyCount} phản hồi
              </Typography>
            </Paper>
          ))
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              backgroundColor: "background.paper",
            }}
          >
            <Typography color="text.secondary">Chưa có bình luận nào cho phim này.</Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

export default function MovieDetailPage({ slug }: MovieDetailPageProps) {
  const { data, isLoading, isError } = useMovieDetailPage(slug);
  const comments = useMemo(() => data?.comments ?? [], [data?.comments]);
  const reviews = useMemo(() => data?.reviews ?? [], [data?.reviews]);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Typography component="h1" variant="h3" fontWeight={950} letterSpacing="-0.035em">
            Ôi, phim đã biến mất rồi
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
            Nội dung có thể đã được di chuyển, chưa phát hành hoặc hệ thống đang đồng bộ lại dữ
            liệu. Thử quay lại sau ít phút nhé.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <MovieHero movie={data.movie} />
      <InfoSection movie={data.movie} />
      <EpisodeSection episodes={data.movie.episodes || []} movie={data.movie} />
      <ReviewSection reviews={reviews} />
      <CommentSection comments={comments} episodes={data.movie.episodes || []} />
    </Box>
  );
}
