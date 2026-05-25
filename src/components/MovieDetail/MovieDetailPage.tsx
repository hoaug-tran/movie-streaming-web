"use client";

import {
  Avatar,
  alpha,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useMovieDetailPage } from "@/modules/movie/hooks/useMovieDetailPage";
import { Episode, MovieDetail, MovieReview } from "@/modules/movie/types/movie";
import { usePlayNavigation } from "@/hooks/use-play-navigation";
import { FavoriteToggleButton } from "@/modules/favorite/components/FavoriteToggleButton";
import { WatchlistToggleButton } from "@/modules/watchlist/components/WatchlistToggleButton";
import { MovieCommentsSection } from "@/modules/comment/components/MovieCommentsSection";
import {
  useCreateMovieReview,
  useMovieReviewsPage,
  useToggleReviewLike,
} from "@/modules/review/hooks/useMovieReviews";
import { useMyWatchHistories } from "@/modules/watch-history/hooks/useWatchHistory";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { getAbsoluteAvatarUrl } from "@/utils/avatar";
import { ReportContentDialog } from "@/modules/report/components/ReportContentDialog";
import OfflineDownloadButton from "@/components/PWA/OfflineDownloadButton";
import SeriesDownloadModal from "@/components/PWA/SeriesDownloadModal";
import { Download } from "lucide-react";

type MovieDetailPageProps = {
  slug: string;
  routeType: "movies" | "tv";
};

const fallbackImage = "http://localhost/stream/test/banner.jpg";
const reviewMaxLength = 800;
const reviewMinLength = 8;
const reviewEligibilityPercent = 80;
const compactViFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatRuntime(seconds?: number) {
  if (!seconds) return "Đang cập nhật";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes} phút`;
  return `${hours} giờ ${minutes} phút`;
}

function formatNumber(value?: number) {
  if (!value) return "0";
  return compactViFormatter.format(value);
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

function DetailAction({ onClick, label }: { onClick: () => void; label: string }) {
  const theme = useTheme();
  return (
    <ButtonBase
      id="movie-detail-play-button"
      onClick={onClick}
      sx={{
        width: { xs: "auto", sm: "auto" },
        minWidth: { xs: 118, sm: 176 },
        height: { xs: 46, md: 58 },
        px: { xs: 1.8, md: 2.8 },
        borderRadius: 1,
        color: theme.palette.common.white,
        background: theme.palette.primary.main,
        border: `1px solid ${alpha(theme.palette.primary.light, 0.42)}`,
        boxShadow: "none",
        backdropFilter: "blur(16px)",
        display: "inline-flex",
        justifyContent: "center",
        gap: 1.1,
        fontWeight: 900,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        transition: "transform .2s ease, background-color .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          backgroundColor: theme.palette.primary.dark,
          borderColor: alpha(theme.palette.primary.light, 0.6),
          boxShadow: "none",
        },
      }}
      aria-label={label}
    >
      <PlayArrowRoundedIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
      <Box component="span">Phát</Box>
    </ButtonBase>
  );
}

function MovieHero({ movie }: { movie: MovieDetail }) {
  const theme = useTheme();
  const { navigateToWatch } = usePlayNavigation();
  const firstEpisode = movie.episodes?.[0];
  const [showSeriesDownload, setShowSeriesDownload] = useState(false);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: { xs: "auto", md: "78vh" },
        pt: { xs: 9, sm: 10, md: 13 },
        pb: { xs: 4, sm: 5, md: 5 },
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: {
            xs: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.24)} 0%, ${alpha(theme.palette.background.default, 0.86)} 52%, ${theme.palette.background.default} 100%), url(${movie.bannerUrl || fallbackImage})`,
            md: `linear-gradient(90deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0.86)} 35%, ${alpha(theme.palette.background.default, 0.24)} 100%), linear-gradient(0deg, ${theme.palette.background.default} 0%, transparent 35%), url(${movie.bannerUrl || fallbackImage})`,
          },
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
      <Container maxWidth="xl" sx={{ position: "relative", px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2.5, sm: 3, md: 6 }} alignItems="center">
          <Grid item xs={12} md={4} lg={3.2}>
            <Box
              sx={{
                position: "relative",
                width: { xs: 148, sm: 210, md: "100%" },
                maxWidth: { xs: 180, sm: 246, md: "none" },
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
                  sx={{
                    fontSize: { xs: "clamp(1.6rem, 8vw, 2.4rem)", sm: "2.8rem", md: "3.8rem" },
                    lineHeight: { xs: 1.05, md: 1.0 },
                    maxWidth: 1040,
                    overflowWrap: "anywhere",
                  }}
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
                sx={{
                  maxWidth: 840,
                  lineHeight: { xs: 1.5, md: 1.6 },
                  fontWeight: 400,
                  fontSize: { xs: "0.875rem", sm: "0.925rem", md: "1rem" },
                }}
              >
                {movie.description || "Thông tin phim đang được cập nhật."}
              </Typography>
              <Stack
                direction="row"
                spacing={{ xs: 1.25, sm: 2 }}
                alignItems="center"
                justifyContent={{ xs: "space-between", sm: "flex-start" }}
              >
                {movie.movieStatus === "UPCOMING" ? (
                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      width: { xs: "auto", sm: "auto" },
                      minWidth: { xs: 118, sm: 176 },
                      height: { xs: 46, md: 58 },
                      px: { xs: 1.8, md: 2.8 },
                      borderRadius: 1,
                      fontSize: "1rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      "&.Mui-disabled": {
                        color: "rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Sắp chiếu
                  </Button>
                ) : (
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
                  />
                )}
                <Stack direction="row" spacing={1.25} justifyContent="flex-end" alignItems="center">
                  <WatchlistToggleButton movieId={movie.id} movieTitle={movie.title} size="large" />
                  <FavoriteToggleButton movieId={movie.id} movieTitle={movie.title} size="large" />

                  {movie.movieStatus !== "UPCOMING" &&
                    (movie.movieType === "SERIES" && movie.episodes && movie.episodes.length > 0 ? (
                      <Button
                        onClick={() => setShowSeriesDownload(true)}
                        variant="outlined"
                        size="small"
                        startIcon={<Download size={15} />}
                        sx={{
                          height: 36,
                          px: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 1.5,
                          fontSize: "0.78rem",
                          borderColor: "rgba(255,255,255,0.18)",
                          color: "#F0F0F0",
                          bgcolor: "rgba(255,255,255,0.04)",
                          "&:hover": {
                            borderColor: "rgba(255,255,255,0.35)",
                            bgcolor: "rgba(255,255,255,0.08)",
                          },
                        }}
                      >
                        Tải phim
                      </Button>
                    ) : firstEpisode ? (
                      <OfflineDownloadButton
                        episodeId={firstEpisode.id}
                        availableQualities={firstEpisode.availableQualities}
                        durationSeconds={firstEpisode.durationSeconds}
                        variant="pill"
                        size="small"
                      />
                    ) : null)}
                </Stack>
                <Typography
                  color="text.secondary"
                  sx={{ maxWidth: 300, fontSize: "0.92rem", display: { xs: "none", md: "block" } }}
                >
                  Xem ngay, lưu xem sau hoặc thêm yêu thích.
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

      {movie.movieType === "SERIES" && movie.episodes && (
        <SeriesDownloadModal
          open={showSeriesDownload}
          onClose={() => setShowSeriesDownload(false)}
          episodes={movie.episodes}
        />
      )}
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
      <Typography
        variant="h3"
        component="h2"
        fontWeight={950}
        letterSpacing="-0.035em"
        sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }, lineHeight: 1.08 }}
      >
        {title}
      </Typography>
    </Box>
  );
}

interface PersonRoleInfo {
  role: string;
  characterName?: string;
}

interface GroupedPerson {
  personId: number;
  displayName: string;
  avatarUrl?: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
  roles: PersonRoleInfo[];
}

interface StudioInfo {
  id: number;
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  country?: string;
  website?: string;
}

const translatePersonRole = (role: string) => {
  switch (role.toUpperCase()) {
    case "DIRECTOR":
      return "Đạo diễn";
    case "ACTOR":
      return "Diễn viên";
    case "PRODUCER":
      return "Nhà sản xuất";
    case "WRITER":
      return "Biên kịch";
    default:
      return role;
  }
};

const formatPersonRole = (item: PersonRoleInfo) => {
  const tRole = translatePersonRole(item.role);
  return item.characterName ? `${tRole} • vai ${item.characterName}` : tRole;
};

function PersonCard({ person }: { person: GroupedPerson }) {
  const theme = useTheme();
  const hasHoverPointer = useMediaQuery("(hover: hover) and (pointer: fine)", {
    defaultMatches: false,
  });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isValidAvatar =
    person.avatarUrl &&
    !person.avatarUrl.startsWith("blob:") &&
    !person.avatarUrl.startsWith("https://example.com");
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.displayName)}&background=random&color=fff&size=64`;
  const avatarSrc = isValidAvatar ? person.avatarUrl! : fallbackAvatar;

  const content = (
    <Box>
      <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
        <Avatar src={avatarSrc} alt={person.displayName} sx={{ width: 52, height: 52 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={800}>{person.displayName}</Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.4 }}>
            {person.roles.map((role) => (
              <Chip
                key={`${role.role}-${role.characterName ?? "crew"}`}
                label={formatPersonRole(role)}
                size="small"
                color="primary"
                sx={{ fontSize: "0.65rem", height: 20 }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
      {person.birthDate && (
        <Typography variant="caption" color="text.secondary" display="block">
          Sinh: {new Date(person.birthDate).toLocaleDateString("vi-VN")}
        </Typography>
      )}
      {person.nationality && (
        <Typography variant="caption" color="text.secondary" display="block">
          Quốc tịch: {person.nationality}
        </Typography>
      )}
      {person.biography && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: { xs: 8, sm: 4 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {person.biography}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      <Box
        onClick={!hasHoverPointer ? () => setDialogOpen(true) : undefined}
        onMouseEnter={hasHoverPointer ? (e) => setAnchor(e.currentTarget) : undefined}
        onMouseLeave={hasHoverPointer ? () => setAnchor(null) : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 0.75,
          px: 1,
          borderRadius: 1,
          cursor: hasHoverPointer ? "default" : "pointer",
          transition: "background .18s, transform .18s",
          "&:hover": {
            background: alpha(theme.palette.primary.main, 0.08),
            transform: "translateX(2px)",
          },
        }}
      >
        <Avatar
          src={avatarSrc}
          alt={person.displayName}
          sx={{ width: 36, height: 36, flexShrink: 0 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>
            {person.displayName}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.3 }}>
            {person.roles.map((role) => (
              <Chip
                key={`${role.role}-${role.characterName ?? "crew"}`}
                label={formatPersonRole(role)}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: "0.65rem", height: 18, "& .MuiChip-label": { px: 0.8 } }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: "none" }}
        PaperProps={{
          onMouseEnter: () => {},
          onMouseLeave: () => setAnchor(null),
          sx: {
            pointerEvents: "auto",
            p: 2,
            minWidth: 260,
            maxWidth: 340,
            background: alpha(theme.palette.background.paper, 0.96),
            backdropFilter: "blur(18px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
          },
        }}
      >
        {content}
      </Menu>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pr: 6 }}>Thông tin nhân sự</DialogTitle>
        <IconButton
          aria-label="Đóng thông tin nhân sự"
          onClick={() => setDialogOpen(false)}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          ×
        </IconButton>
        <DialogContent>{content}</DialogContent>
      </Dialog>
    </>
  );
}

function StudioChip({ studio }: { studio: StudioInfo }) {
  const theme = useTheme();
  const hasHoverPointer = useMediaQuery("(hover: hover) and (pointer: fine)", {
    defaultMatches: false,
  });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const logoSrc =
    studio.logoUrl &&
    !studio.logoUrl.startsWith("blob:") &&
    !studio.logoUrl.startsWith("https://example.com")
      ? studio.logoUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(studio.name)}&background=111827&color=fff&size=96`;

  const content = (
    <Box sx={{ maxWidth: 330 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Avatar src={logoSrc} alt={studio.name} variant="rounded" sx={{ width: 52, height: 52 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={900} noWrap>
            {studio.name}
          </Typography>
          <Typography variant="caption" color="primary" fontWeight={800}>
            Studio / Nhà xuất bản
          </Typography>
        </Box>
      </Stack>
      {studio.country && (
        <Typography variant="caption" color="text.secondary" display="block">
          Quốc gia: {studio.country}
        </Typography>
      )}
      {studio.website && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ overflowWrap: "anywhere" }}
        >
          Website: {studio.website}
        </Typography>
      )}
      {studio.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.55 }}>
          {studio.description}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.55 }}>
          Đơn vị phát hành / sản xuất liên quan đến bộ phim này.
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      <Chip
        label={studio.name}
        variant="outlined"
        size="small"
        onClick={!hasHoverPointer ? () => setDialogOpen(true) : undefined}
        onMouseEnter={hasHoverPointer ? (e) => setAnchor(e.currentTarget) : undefined}
        onMouseLeave={hasHoverPointer ? () => setAnchor(null) : undefined}
        sx={{
          cursor: "pointer",
          borderColor: alpha(theme.palette.primary.main, 0.35),
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            borderColor: theme.palette.primary.main,
          },
        }}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: "none" }}
        PaperProps={{
          onMouseEnter: () => {},
          onMouseLeave: () => setAnchor(null),
          sx: {
            pointerEvents: "auto",
            p: 2,
            minWidth: 260,
            maxWidth: 360,
            background: alpha(theme.palette.background.paper, 0.96),
            backdropFilter: "blur(18px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
          },
        }}
      >
        {content}
      </Menu>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pr: 6 }}>Thông tin studio</DialogTitle>
        <IconButton
          aria-label="Đóng thông tin studio"
          onClick={() => setDialogOpen(false)}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          ×
        </IconButton>
        <DialogContent>{content}</DialogContent>
      </Dialog>
    </>
  );
}

const translateMovieStatus = (status?: string) => {
  if (!status) return "Đang cập nhật";
  switch (status.toUpperCase()) {
    case "DRAFT":
      return "Bản nháp";
    case "PUBLISHED":
      return "Đang phát sóng";
    case "UPCOMING":
      return "Sắp chiếu";
    case "ARCHIVED":
      return "Đã lưu trữ";
    case "COMPLETED":
      return "Đã hoàn thành";
    case "ONGOING":
      return "Đang chiếu";
    case "TRAILER":
      return "Trailer";
    default:
      return status;
  }
};

function InfoSection({ movie }: { movie: MovieDetail }) {
  const theme = useTheme();
  const facts = [
    ["Quốc gia", movie.country || "Đang cập nhật"],
    ["Ngôn ngữ", movie.language || "Đang cập nhật"],
    ["Trạng thái", translateMovieStatus(movie.movieStatus)],
    ["Số tập", `${movie.episodes?.length || 1}`],
    [
      "Ngày phát hành",
      movie.publishedAt ? new Date(movie.publishedAt).toLocaleDateString("vi-VN") : "Đang cập nhật",
    ],
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: -1, md: -3 }, pb: { xs: 4, md: 5 } }}>
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} lg={7.4} sx={{ display: "flex", flexDirection: "column" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 1.5,
              flex: 1,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              background: `linear-gradient(120deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.primary.main, 0.08)})`,
              backdropFilter: "blur(22px)",
            }}
          >
            <SectionTitle eyebrow="Hồ sơ phim" title="Tín hiệu quan trọng" />
            <Grid container spacing={2}>
              {facts.map(([label, value]) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={label}>
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
            </Stack>
            {movie.tags?.length || movie.studios?.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                {movie.tags?.map((item) => (
                  <Chip key={item.id} label={item.name} variant="outlined" size="small" />
                ))}
                {movie.studios?.map((raw) => {
                  const source = (raw as any).studio ?? raw;
                  const studio: StudioInfo = {
                    id: source.id ?? (raw as any).id,
                    name: source.name,
                    slug: source.slug,
                    logoUrl: source.logoUrl,
                    description: source.description,
                    country: source.country,
                    website: source.website,
                  };
                  if (!studio.name) return null;
                  return <StudioChip key={studio.id ?? studio.name} studio={studio} />;
                })}
              </Stack>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4.6} sx={{ display: "flex", flexDirection: "column" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 1.5,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.background.paper, 0.78)})`,
            }}
          >
            <SectionTitle eyebrow="Cast & Crew" title="Người tạo nên nhịp phim" />
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                maxHeight: { xs: 320, md: 380 },
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 2,
                },
              }}
            >
              <Stack spacing={0.5}>
                {movie.persons?.length ? (
                  (() => {
                    const grouped = new Map<number, GroupedPerson>();
                    (movie.persons as any[]).forEach((mp) => {
                      const p = mp.person ?? mp;
                      const pid = p.id ?? mp.personId ?? mp.id;
                      const name = p.fullName || p.stageName || p.name || "";
                      if (!name || !pid) return;
                      if (!grouped.has(pid)) {
                        grouped.set(pid, {
                          personId: pid,
                          displayName: name,
                          avatarUrl: p.avatarUrl || p.profileImageUrl,
                          biography: p.biography,
                          birthDate: p.birthDate,
                          nationality: p.nationality,
                          roles: [],
                        });
                      }
                      const role = mp.role;
                      const characterName = mp.characterName || mp.character || mp.character_name;
                      const roleExists = grouped
                        .get(pid)!
                        .roles.some(
                          (item) => item.role === role && item.characterName === characterName
                        );
                      if (role && !roleExists) {
                        grouped.get(pid)!.roles.push({ role, characterName });
                      }
                    });
                    return Array.from(grouped.values()).map((gp) => (
                      <PersonCard key={gp.personId} person={gp} />
                    ));
                  })()
                ) : (
                  <Typography color="text.secondary">Đang cập nhật nhân sự.</Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

const EPISODES_PER_PAGE = 24;

function EpisodeSection({ episodes, movie }: { episodes: Episode[]; movie: MovieDetail }) {
  const theme = useTheme();
  const { navigateToWatch } = usePlayNavigation();
  const [showAll, setShowAll] = useState(false);
  const [jumpInput, setJumpInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const didDrag = useRef(false);

  const visibleEpisodes = showAll ? episodes : episodes.slice(0, EPISODES_PER_PAGE);
  const hasMore = episodes.length > EPISODES_PER_PAGE;
  const isUpcoming = movie.movieStatus === "UPCOMING";

  const handleJump = () => {
    const num = parseInt(jumpInput, 10);
    if (isNaN(num) || num < 1) return;
    const ep = episodes.find((e) => e.episodeNumber === num);
    if (!ep) return;
    navigateToWatch({
      movieSlug: movie.slug,
      movieId: movie.id,
      isPremiumOnly: movie.isPremiumOnly,
      episodeId: ep.id,
      isFreePreview: ep.isFreePreview,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 4) didDrag.current = true;
    scrollRef.current.scrollLeft = dragScrollLeft.current - dx;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    if (!scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="baseline" spacing={1.5}>
          <SectionTitle eyebrow="Xem thôi nào" title="Tập phim" />
          <Chip
            label={`${episodes.length} tập`}
            variant="outlined"
            color="primary"
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="stretch" flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            placeholder="Tới tập số..."
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && !isUpcoming && handleJump()}
            inputProps={{ inputMode: "numeric" }}
            disabled={isUpcoming}
            sx={{ width: 130, "& .MuiInputBase-root": { borderRadius: 1.5, height: 32 } }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleJump}
            disabled={!jumpInput || isUpcoming}
            sx={{ borderRadius: 1.5, minWidth: 72, height: 32, fontSize: "0.8rem" }}
          >
            Xem ngayyy
          </Button>
          <Button
            variant={showPicker ? "contained" : "outlined"}
            size="small"
            onClick={() => setShowPicker((v) => !v)}
            disabled={isUpcoming}
            sx={{ borderRadius: 1.5, height: 32, fontSize: "0.8rem" }}
          >
            {showPicker ? "Ẩn" : "Chọn tập"}
          </Button>
        </Stack>
      </Stack>

      {showPicker && (
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 1.5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: "blur(12px)",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
            Chọn nhanh tập
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {episodes.map((ep) => (
              <ButtonBase
                key={ep.id}
                onClick={() =>
                  navigateToWatch({
                    movieSlug: movie.slug,
                    movieId: movie.id,
                    isPremiumOnly: movie.isPremiumOnly,
                    episodeId: ep.id,
                    isFreePreview: ep.isFreePreview,
                  })
                }
                sx={{
                  width: 40,
                  height: 36,
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  color: "text.primary",
                  background: alpha(theme.palette.primary.main, 0.06),
                  transition: "all .18s",
                  "&:hover": {
                    background: theme.palette.primary.main,
                    color: "#fff",
                    borderColor: theme.palette.primary.main,
                    transform: "scale(1.08)",
                  },
                }}
              >
                {ep.episodeNumber ?? "?"}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      )}

      <Box
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "visible",
          py: 1,
          pb: 1.5,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            "&:hover": { background: "rgba(255,255,255,0.4)" },
          },
        }}
      >
        {visibleEpisodes.map((episode) => (
          <Box
            key={episode.id}
            ref={(el) => {
              if (el) cardRefs.current.set(episode.id, el as HTMLDivElement);
              else cardRefs.current.delete(episode.id);
            }}
            sx={{
              flexShrink: 0,
              width: { xs: "80vw", sm: "45vw", md: 320, lg: 300 },
              scrollSnapAlign: "start",
            }}
          >
            <Paper
              elevation={0}
              onClick={() => {
                if (isUpcoming) return;
                navigateToWatch({
                  movieSlug: movie.slug,
                  movieId: movie.id,
                  isPremiumOnly: movie.isPremiumOnly,
                  episodeId: episode.id,
                  isFreePreview: episode.isFreePreview,
                });
              }}
              sx={{
                position: "relative",
                overflow: "hidden",
                height: { xs: 180, sm: 200, md: 210 },
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
                sx={{
                  position: "relative",
                  height: "100%",
                  p: { xs: 1.8, md: 2.2 },
                  justifyContent: "flex-end",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ mb: 0.75 }}>
                  <Chip
                    size="small"
                    color="primary"
                    label={`Tập ${episode.episodeNumber ?? "?"}`}
                  />
                  {episode.isFreePreview && <Chip size="small" label="Free" variant="outlined" />}
                </Stack>
                <Typography variant="subtitle1" fontWeight={900} letterSpacing="-0.02em" noWrap>
                  {episode.title || "Chưa có tiêu đề"}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 0.5 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatRuntime(episode.durationSeconds)}
                  </Typography>
                  {!isUpcoming && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <OfflineDownloadButton
                        episodeId={episode.id}
                        availableQualities={episode.availableQualities}
                        durationSeconds={episode.durationSeconds}
                        variant="pill"
                        size="small"
                      />
                    </Box>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Box>
        ))}
      </Box>
      {hasMore && (
        <Box sx={{ mt: 2.5, textAlign: "center" }}>
          <Button variant="outlined" onClick={() => setShowAll((v) => !v)} sx={{ minWidth: 180 }}>
            {showAll ? "Thu gọn" : `Xem tất cả ${episodes.length} tập`}
          </Button>
        </Box>
      )}
    </Container>
  );
}
function ReviewSection({
  movie,
  reviews,
  slug,
}: {
  movie: MovieDetail;
  reviews: MovieReview[];
  slug: string;
}) {
  const theme = useTheme();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<MovieReview | null>(null);
  const [reportReview, setReportReview] = useState<MovieReview | null>(null);
  const [allReviewsOpen, setAllReviewsOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const createReview = useCreateMovieReview(movie.id, slug);
  const toggleLike = useToggleReviewLike(slug);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [likedReviewIds, setLikedReviewIds] = useState<Set<number>>(
    () => new Set(reviews.filter((review) => review.likedByCurrentUser).map((review) => review.id))
  );
  const { data: watchHistories = [] } = useMyWatchHistories(true);
  const eligibleHistory = watchHistories.find(
    (history) =>
      history.movieId === movie.id &&
      (history.isCompleted || Number(history.progressPercent || 0) >= reviewEligibilityPercent)
  );
  const reviewsLocked = Boolean(movie.reviewsLocked);
  const hasWatchedEnoughToReview = Boolean(eligibleHistory);
  const canReview = hasWatchedEnoughToReview && !reviewsLocked;
  const isSeries = movie.movieType === "SERIES";
  const track = reviews.length ? [...reviews, ...reviews] : [];

  useEffect(() => {
    setLikedReviewIds(
      new Set(reviews.filter((review) => review.likedByCurrentUser).map((review) => review.id))
    );
  }, [reviews]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    router.push(`/auth/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    return false;
  };

  const handleLike = (review: MovieReview) => {
    if (!requireAuth()) return;
    if (toggleLike.isPending) return;
    const wasLiked = likedReviewIds.has(review.id);
    setLikedReviewIds((current) => {
      const next = new Set(current);
      if (next.has(review.id)) {
        next.delete(review.id);
      } else {
        next.add(review.id);
      }
      return next;
    });
    toggleLike.mutate(
      { reviewId: review.id, liked: wasLiked },
      {
        onError: () => {
          setLikedReviewIds((current) => {
            const next = new Set(current);
            if (wasLiked) {
              next.add(review.id);
            } else {
              next.delete(review.id);
            }
            return next;
          });
        },
      }
    );
  };

  const handleOpenReport = (review: MovieReview) => {
    if (!requireAuth()) return;
    setReportReview(review);
  };

  const handleSubmit = async () => {
    if (!requireAuth()) return;
    if (reviewsLocked) {
      setMessage("Phim này hiện không cho phép đánh giá.");
      return;
    }
    if (!canReview) {
      setMessage("Bạn cần xem ít nhất 80% nội dung trước khi gửi đánh giá.");
      return;
    }
    setMessage(null);
    try {
      await createReview.mutateAsync({ movieId: movie.id, rating, content: content.trim() });
      setContent("");
      setMessage("Đã gửi đánh giá của bạn.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể gửi đánh giá lúc này.");
    }
  };

  return (
    <Box component="section" sx={{ py: { xs: 4, md: 7 }, overflow: "hidden" }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 3 }}
        >
          <SectionTitle eyebrow="Đánh giá" title="Đánh giá của khán giả" />
          {reviews.length > 4 && (
            <Button
              id="movie-review-view-all"
              variant="outlined"
              onClick={() => setAllReviewsOpen(true)}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Xem tất cả review
            </Button>
          )}
        </Stack>
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            p: { xs: 2, md: 2.5 },
            borderRadius: 1.5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.background.paper, 0.76)})`,
            backdropFilter: "blur(18px)",
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {[1, 2, 3, 4, 5].map((value) => (
                <ButtonBase
                  key={value}
                  id={`movie-review-rating-${value}`}
                  onClick={() => setRating(value)}
                  disabled={!canReview || reviewsLocked}
                  sx={{
                    color:
                      value <= rating ? theme.palette.primary.main : theme.palette.text.disabled,
                    opacity: canReview && !reviewsLocked ? 1 : 0.45,
                  }}
                  aria-label={`Chọn ${value} sao`}
                >
                  <StarRoundedIcon />
                </ButtonBase>
              ))}
            </Stack>
            <TextField
              id="movie-review-content"
              multiline
              minRows={3}
              value={content}
              disabled={!canReview || createReview.isPending}
              inputProps={{ maxLength: reviewMaxLength }}
              onChange={(event) => setContent(event.target.value.slice(0, reviewMaxLength))}
              placeholder={
                reviewsLocked
                  ? "Phim này hiện không cho phép đánh giá"
                  : canReview
                    ? "Enter để gửi · Shift + Enter để xuống dòng"
                    : "Bạn cần xem ít nhất 80% để có thể đánh giá"
              }
              fullWidth
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                {!canReview && <LockRoundedIcon fontSize="small" color="warning" />}
                <Typography
                  variant="caption"
                  color={
                    reviewsLocked ? "warning.light" : canReview ? "text.secondary" : "warning.light"
                  }
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {reviewsLocked
                    ? "Đánh giá đang tạm khóa. Bạn vẫn có thể xem các đánh giá cũ."
                    : canReview
                      ? `Đánh giá áp dụng cho toàn phim. ${content.length}/${reviewMaxLength} ký tự.`
                      : `Bạn cần xem ít nhất 80% ${isSeries ? "một tập" : "phim"} để có thể đánh giá.`}
                </Typography>
              </Stack>
              <Button
                id="movie-review-submit"
                type="button"
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  createReview.isPending ||
                  reviewsLocked ||
                  !canReview ||
                  content.trim().length < reviewMinLength
                }
              >
                <SendRoundedIcon />
              </Button>
            </Stack>
            {message && (
              <Typography variant="body2" color={message.includes("Đã") ? "primary" : "error"}>
                {message}
              </Typography>
            )}
          </Stack>
        </Paper>
        {track.length ? (
          <Box
            sx={{
              overflow: "hidden",
              borderRadius: 1.5,
              maskImage: {
                md: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
              },
              "&:hover .review-track": { animationPlayState: "paused" },
            }}
          >
            <Box
              className="review-track"
              sx={{
                display: "flex",
                gap: 2,
                width: "max-content",
                willChange: "transform",
                animation: { xs: "none", md: "reviewFloat 60s linear infinite" },
                "@keyframes reviewFloat": {
                  from: { transform: "translate3d(0,0,0)" },
                  to: { transform: "translate3d(calc(-50% - 8px),0,0)" },
                },
              }}
            >
              {track.map((review, index) => (
                <Paper
                  key={`${review.id}-${index < reviews.length ? "a" : "b"}`}
                  elevation={0}
                  onClick={() => setSelectedReview(review)}
                  sx={{
                    width: { xs: "calc(100vw - 32px)", sm: 340, md: 420 },
                    flex: "0 0 auto",
                    p: 2.5,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    pointerEvents: index >= reviews.length ? "none" : "auto",
                    opacity: index >= reviews.length ? 0.82 : 1,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                    background: `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.background.paper, 0.84)})`,
                    backdropFilter: "blur(18px)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography color="primary" fontWeight={950}>
                      {"★".repeat(Math.max(1, Math.min(5, review.rating || 0)))}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <ButtonBase
                        id={`movie-review-like-${review.id}-${index}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleLike(review);
                        }}
                        sx={{
                          minWidth: 46,
                          height: 38,
                          px: 1,
                          borderRadius: 999,
                          color: likedReviewIds.has(review.id)
                            ? theme.palette.error.main
                            : theme.palette.text.secondary,
                          backgroundColor: alpha(theme.palette.common.white, 0.06),
                          gap: 0.5,
                        }}
                        aria-label="Thích đánh giá"
                      >
                        {likedReviewIds.has(review.id) ? (
                          <FavoriteRoundedIcon fontSize="small" />
                        ) : (
                          <FavoriteBorderRoundedIcon fontSize="small" />
                        )}
                        <Typography variant="caption" fontWeight={900}>
                          {review.likeCount || 0}
                        </Typography>
                      </ButtonBase>
                      <ReviewReportMenu
                        reviewId={review.id}
                        suffix={`card-${index}`}
                        onReport={() => handleOpenReport(review)}
                      />
                    </Stack>
                  </Stack>
                  <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em">
                    {review.authorFullName ||
                      review.authorUsername ||
                      review.title ||
                      "Khán giả ẩn danh"}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      lineHeight: 1.7,
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {review.content || "Người dùng chưa để lại nội dung review."}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ mt: 2, display: "block", fontWeight: 800 }}
                  >
                    Bấm để xem đầy đủ {review.isEdited ? "· đã chỉnh sửa" : ""}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
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
            <Typography color="text.secondary">
              {reviewsLocked
                ? "Đánh giá đang tạm khóa. Chưa có đánh giá nào để hiển thị."
                : "Chưa có đánh giá nào. Hãy xem ít nhất 80% phim rồi để lại cảm nhận đầu tiên."}
            </Typography>
          </Paper>
        )}
      </Container>
      <Dialog
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0, backgroundColor: "background.paper" }}>
          {selectedReview && (
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.16)}, transparent)`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar src={getAbsoluteAvatarUrl(selectedReview.authorAvatarUrl) || undefined}>
                  {(selectedReview.authorFullName || selectedReview.authorUsername || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={950}>
                    {selectedReview.authorFullName ||
                      selectedReview.authorUsername ||
                      "Khán giả ẩn danh"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {movie.title} {isSeries ? "· review cấp phim/series" : "· review phim"}
                  </Typography>
                </Box>
                <ReviewReportMenu
                  reviewId={selectedReview.id}
                  suffix="detail"
                  onReport={() => handleOpenReport(selectedReview)}
                />
              </Stack>
              <Typography color="primary" fontWeight={950} sx={{ mb: 1 }}>
                {"★".repeat(Math.max(1, Math.min(5, selectedReview.rating || 0)))}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.85 }}>
                {selectedReview.content || "Người dùng chưa để lại nội dung review."}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                {selectedReview.likeCount || 0} lượt thích{" "}
                {selectedReview.isEdited ? "· đã chỉnh sửa" : ""}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <ReviewListDialog
        open={allReviewsOpen}
        movie={movie}
        page={reviewPage}
        onPageChange={setReviewPage}
        onClose={() => setAllReviewsOpen(false)}
        onSelectReview={setSelectedReview}
        onLike={handleLike}
        likedReviewIds={likedReviewIds}
        onReport={handleOpenReport}
      />
      <ReportContentDialog
        open={Boolean(reportReview)}
        targetType="review"
        targetId={reportReview?.id ?? null}
        targetLabel={reportReview?.content?.slice(0, 120) || "Review"}
        onClose={() => setReportReview(null)}
      />
    </Box>
  );
}

function ReviewReportMenu({
  reviewId,
  suffix,
  onReport,
}: {
  reviewId: number;
  suffix: string;
  onReport: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton
        id={`movie-review-more-${reviewId}-${suffix}`}
        size="small"
        aria-label="Mở menu review"
        aria-controls={menuAnchor ? `movie-review-menu-${reviewId}-${suffix}` : undefined}
        aria-haspopup="true"
        onClick={(event) => {
          event.stopPropagation();
          setMenuAnchor(event.currentTarget);
        }}
      >
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>
      <Menu
        id={`movie-review-menu-${reviewId}-${suffix}`}
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          id={`movie-review-report-${reviewId}-${suffix}`}
          onClick={(event) => {
            event.stopPropagation();
            setMenuAnchor(null);
            onReport();
          }}
        >
          Báo cáo review
        </MenuItem>
      </Menu>
    </>
  );
}

function ReviewListDialog({
  open,
  movie,
  page,
  onPageChange,
  onClose,
  onSelectReview,
  onLike,
  likedReviewIds,
  onReport,
}: {
  open: boolean;
  movie: MovieDetail;
  page: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
  onSelectReview: (review: MovieReview) => void;
  onLike: (review: MovieReview) => void;
  likedReviewIds: Set<number>;
  onReport: (review: MovieReview) => void;
}) {
  const theme = useTheme();
  const pageSize = 10;
  const { data, isFetching } = useMovieReviewsPage(movie.id, page, pageSize);
  const reviews = data?.content ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={950} letterSpacing="-0.03em">
          Tất cả review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {movie.title} · {data?.totalElements ?? movie.totalReviews ?? 0} đánh giá
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {isFetching && <LinearProgress sx={{ mb: 2 }} />}
        <Stack spacing={1.5}>
          {reviews.map((review) => (
            <Paper
              key={review.id}
              elevation={0}
              onClick={() => onSelectReview(review)}
              sx={{
                p: 2,
                borderRadius: 1.5,
                cursor: "pointer",
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.94)}, ${alpha(theme.palette.primary.main, 0.07)})`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar src={getAbsoluteAvatarUrl(review.authorAvatarUrl) || undefined}>
                  {(review.authorFullName || review.authorUsername || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={950} noWrap>
                        {review.authorFullName || review.authorUsername || "Khán giả ẩn danh"}
                      </Typography>
                      <Typography variant="caption" color="primary" fontWeight={900}>
                        {"★".repeat(Math.max(1, Math.min(5, review.rating || 0)))}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <ButtonBase
                        id={`movie-review-page-like-${review.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onLike(review);
                        }}
                        sx={{
                          minWidth: 54,
                          height: 38,
                          px: 1,
                          borderRadius: 999,
                          gap: 0.5,
                          color: likedReviewIds.has(review.id)
                            ? theme.palette.error.main
                            : theme.palette.text.secondary,
                          backgroundColor: alpha(theme.palette.common.white, 0.06),
                        }}
                        aria-label="Thích đánh giá"
                      >
                        {likedReviewIds.has(review.id) ? (
                          <FavoriteRoundedIcon fontSize="small" />
                        ) : (
                          <FavoriteBorderRoundedIcon fontSize="small" />
                        )}
                        <Typography variant="caption" fontWeight={900}>
                          {review.likeCount || 0}
                        </Typography>
                      </ButtonBase>
                      <ReviewReportMenu
                        reviewId={review.id}
                        suffix="page"
                        onReport={() => onReport(review)}
                      />
                    </Stack>
                  </Stack>
                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      lineHeight: 1.7,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {review.content || "Người dùng chưa để lại nội dung review."}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
        {(data?.totalPages ?? 0) > 1 && (
          <Stack alignItems="center" sx={{ mt: 2.5 }}>
            <Pagination
              count={data?.totalPages ?? 1}
              page={page + 1}
              onChange={(_, value) => onPageChange(value - 1)}
              color="primary"
            />
          </Stack>
        )}
      </DialogContent>
    </Dialog>
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
      <ReviewSection movie={data.movie} reviews={reviews} slug={slug} />
      <MovieCommentsSection
        movieId={data.movie.id}
        slug={slug}
        initialComments={comments}
        episodes={data.movie.episodes || []}
        commentsLocked={Boolean(data.movie.commentsLocked)}
      />
    </Box>
  );
}
