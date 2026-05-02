"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  LinearProgress,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMyWatchHistories } from "@/modules/watch-history/hooks/useWatchHistory";
import { WatchHistory } from "@/modules/watch-history/types/watch-history";

type HistoryFilter = "all" | "watching" | "completed";

function formatDuration(totalSeconds?: number | null) {
  const seconds = Math.max(0, Number(totalSeconds ?? 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ`;
  if (minutes > 0) return `${minutes} phút`;
  return "Dưới 1 phút";
}

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa rõ";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getProgress(item: WatchHistory) {
  if (item.isCompleted) return 100;
  if (typeof item.progressPercent === "number") {
    return Math.max(0, Math.min(100, item.progressPercent));
  }
  if (item.episodeDurationSeconds && item.episodeDurationSeconds > 0) {
    return Math.max(0, Math.min(100, (item.stoppedAtSecond / item.episodeDurationSeconds) * 100));
  }
  return null;
}

function getTitle(item: WatchHistory) {
  return item.movie?.title?.trim() || "Phim chưa có thông tin";
}

function getEpisodeText(item: WatchHistory) {
  if (item.episodeTitle?.trim()) return item.episodeTitle.trim();
  if (item.episodeNumber) return `Tập ${item.episodeNumber}`;
  return "Tập phim chưa có thông tin";
}

function buildWatchUrl(item: WatchHistory) {
  if (!item.movie?.slug) return null;
  const params = new URLSearchParams({ episode: String(item.episodeId) });
  const resumeSecond = item.resumeSecond ?? item.stoppedAtSecond;
  if (resumeSecond > 0 && !item.isCompleted) params.set("t", String(resumeSecond));
  return `/watch/${item.movie.slug}?${params.toString()}`;
}

function HistorySkeleton() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={128} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  );
}

export default function HistoryClient() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    data: histories = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyWatchHistories(isAuthenticated);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const sortedHistories = useMemo(
    () =>
      [...histories].sort(
        (a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
      ),
    [histories]
  );

  const visibleHistories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sortedHistories.filter((item) => {
      const matchesFilter =
        filter === "all" || (filter === "completed" ? item.isCompleted : !item.isCompleted);
      const haystack = `${getTitle(item)} ${getEpisodeText(item)}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [filter, query, sortedHistories]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirect=/history");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ minHeight: "100vh", background: theme.palette.background.default }}>
      <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 0.75, md: 1 } }}>
        <Container maxWidth="xl">
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 3,
              fontSize: "0.8rem",
              "& .MuiBreadcrumbs-separator": { color: "text.secondary" },
            }}
          >
            <MuiLink
              component={Link}
              href="/"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.8rem",
                transition: "color 0.2s",
                "&:hover": { color: "text.primary" },
              }}
            >
              Trang chủ
            </MuiLink>
            <Typography color="text.primary" fontWeight={500} fontSize="0.8rem">
              Lịch sử xem
            </Typography>
          </Breadcrumbs>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "flex-end" }}
            spacing={{ xs: 1.5, md: 3 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="h1"
                variant="h2"
                mb={0.5}
                fontWeight={800}
                letterSpacing="-0.03em"
                sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" }, lineHeight: 1.08 }}
              >
                Lịch sử xem
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.9rem", fontWeight: 400 }}
              >
                Tiếp tục từ nơi bạn đã dừng lại.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                width: { xs: "100%", md: 620 },
                p: 0.75,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} alignItems="stretch">
                <TextField
                  id="history-search-input"
                  fullWidth
                  size="small"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm phim, tập phim"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 1,
                    },
                  }}
                />
                <Select
                  id="history-filter-select"
                  size="small"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as HistoryFilter)}
                  sx={{
                    height: 36,
                    minWidth: { xs: "100%", sm: 132 },
                    borderRadius: 1,
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="watching">Đang xem</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                </Select>
                <Button
                  id="history-refresh-button"
                  variant="outlined"
                  startIcon={<ReplayRoundedIcon />}
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{
                    height: 36,
                    minWidth: { xs: "100%", sm: 104 },
                    borderRadius: 1,
                    px: 1.5,
                  }}
                >
                  Làm mới
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pt: { xs: 2.75, md: 4 }, pb: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 2.25, md: 2.75 }}>
          {isError && (
            <Alert
              severity="error"
              sx={{ borderRadius: 1 }}
              action={<Button onClick={() => refetch()}>Thử lại</Button>}
            >
              Không thể tải lịch sử xem. Vui lòng thử lại sau.
            </Alert>
          )}

          {isLoading ? (
            <HistorySkeleton />
          ) : visibleHistories.length === 0 ? (
            <Box
              sx={{
                minHeight: { xs: "42vh", md: "46vh" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {histories.length === 0 ? "Bạn chưa có lịch sử xem" : "Không tìm thấy kết quả"}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                {histories.length === 0
                  ? "Bắt đầu xem một phim để lưu tiến độ tại đây."
                  : "Thử đổi từ khóa hoặc bộ lọc."}
              </Typography>
              <Button variant="contained" onClick={() => router.push("/")} sx={{ borderRadius: 1 }}>
                Khám phá phim
              </Button>
            </Box>
          ) : (
            <Stack spacing={1}>
              {visibleHistories.map((item) => {
                const progress = getProgress(item);
                const watchUrl = buildWatchUrl(item);
                const posterUrl = item.movie?.posterUrl || item.movie?.bannerUrl;

                return (
                  <Paper
                    key={`${item.movieId}-${item.episodeId}-${item.id}`}
                    elevation={0}
                    sx={{
                      p: { xs: 1, sm: 1.25 },
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.paper,
                      transition: "border-color 160ms ease, background-color 160ms ease",
                      "&:hover": {
                        borderColor: alpha(theme.palette.text.primary, 0.22),
                        backgroundColor: alpha(theme.palette.text.primary, 0.018),
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 1.25, sm: 1.5 }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      <Box
                        sx={{
                          width: { xs: "100%", sm: 104, md: 120 },
                          height: { xs: 164, sm: 138, md: 158 },
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: "hidden",
                          border: `1px solid ${theme.palette.divider}`,
                          backgroundColor: alpha(theme.palette.text.primary, 0.06),
                          backgroundImage: posterUrl ? `url(${posterUrl})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {!posterUrl && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            textAlign="center"
                            px={1}
                          >
                            Chưa có ảnh
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          spacing={0.75}
                          alignItems={{ xs: "flex-start", md: "center" }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              noWrap
                              title={getTitle(item)}
                              sx={{ maxWidth: { xs: "100%", md: 560 }, lineHeight: 1.25 }}
                            >
                              {getTitle(item)}
                            </Typography>
                            <Typography
                              color="text.secondary"
                              fontSize={14}
                              noWrap
                              title={getEpisodeText(item)}
                            >
                              {getEpisodeText(item)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                          >
                            {item.isCompleted ? "Hoàn thành" : "Đang xem"}
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.25 }} />

                        <Stack spacing={1.1}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={0.5}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Xem lần cuối: {formatDateTime(item.lastWatchedAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Vị trí dừng: {formatDuration(item.stoppedAtSecond)}
                            </Typography>
                          </Stack>

                          {progress !== null && (
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: 1,
                                  backgroundColor: alpha(theme.palette.text.primary, 0.1),
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 1,
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                                sx={{ minWidth: 38 }}
                              >
                                {Math.round(progress)}%
                              </Typography>
                            </Stack>
                          )}

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="flex-end"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            spacing={1}
                          >
                            <Button
                              id={`history-continue-${item.id}`}
                              variant="contained"
                              size="small"
                              startIcon={<PlayArrowRoundedIcon />}
                              disabled={!watchUrl}
                              onClick={() => watchUrl && router.push(watchUrl)}
                              sx={{ minWidth: { xs: "100%", sm: 104 }, borderRadius: 1 }}
                            >
                              {item.isCompleted ? "Xem lại" : "Xem tiếp"}
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
