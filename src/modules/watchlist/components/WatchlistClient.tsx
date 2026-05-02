"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMyWatchlist, useRemoveFromWatchlist } from "@/modules/watchlist/hooks/useWatchlist";
import { Watchlist } from "@/modules/watchlist/types/watchlist";

function formatDate(value?: string | null) {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getTitle(item: Watchlist) {
  return item.movie?.title?.trim() || "Phim chưa có thông tin";
}

function getMetaText(item: Watchlist) {
  const parts = [item.movie?.releaseYear, item.movie?.movieType].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "Đã thêm vào danh sách";
}

function buildMovieUrl(item: Watchlist) {
  return item.movie?.slug ? `/movies/${item.movie.slug}` : null;
}

function WatchlistSkeleton() {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={132} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  );
}

export default function WatchlistClient() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    data: watchlist = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyWatchlist(isAuthenticated);
  const removeFromWatchlist = useRemoveFromWatchlist();
  const [query, setQuery] = useState("");
  const [removingMovieId, setRemovingMovieId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleWatchlist = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...watchlist]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .filter((item) => {
        const haystack = `${getTitle(item)} ${item.movie?.originalTitle ?? ""}`.toLowerCase();
        return !normalizedQuery || haystack.includes(normalizedQuery);
      });
  }, [query, watchlist]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirect=/watchlist");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleRemove = async (movieId: number) => {
    setRemovingMovieId(movieId);
    try {
      await removeFromWatchlist.mutateAsync(movieId);
      setMessage("Đã xoá phim khỏi danh sách xem sau.");
    } finally {
      setRemovingMovieId(null);
    }
  };

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
              Danh sách xem sau
            </Typography>
          </Breadcrumbs>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "flex-end" }}
            spacing={{ xs: 1.5, md: 3 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Typography
                  component="h1"
                  variant="h2"
                  fontWeight={800}
                  letterSpacing="-0.03em"
                  sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" }, lineHeight: 1.08 }}
                >
                  Danh sách xem sau
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                Gió giữ lại những bộ phim bạn muốn xem, để bạn quay lại bất cứ lúc nào.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                width: { xs: "100%", md: 560 },
                p: 0.75,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} alignItems="stretch">
                <TextField
                  id="watchlist-search-input"
                  fullWidth
                  size="small"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm phim trong danh sách"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { height: 36, borderRadius: 1 } }}
                />
                <Button
                  id="watchlist-refresh-button"
                  variant="outlined"
                  startIcon={<ReplayRoundedIcon />}
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{ height: 36, minWidth: { xs: "100%", sm: 104 }, borderRadius: 1, px: 1.5 }}
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
              Không thể tải danh sách xem sau. Vui lòng thử lại sau.
            </Alert>
          )}

          {isLoading ? (
            <WatchlistSkeleton />
          ) : visibleWatchlist.length === 0 ? (
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
                {watchlist.length === 0 ? "Danh sách xem sau đang trống" : "Không tìm thấy kết quả"}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                {watchlist.length === 0
                  ? "Bấm nút + trên thẻ phim hoặc trang chi tiết để lưu phim xem sau."
                  : "Thử đổi từ khóa tìm kiếm."}
              </Typography>
              <Button variant="contained" onClick={() => router.push("/")} sx={{ borderRadius: 1 }}>
                Khám phá phim
              </Button>
            </Box>
          ) : (
            <Stack spacing={1}>
              {visibleWatchlist.map((item) => {
                const posterUrl = item.movie?.posterUrl || item.movie?.bannerUrl;
                const movieUrl = buildMovieUrl(item);
                const isRemoving = removingMovieId === item.movieId;

                return (
                  <Paper
                    key={`${item.movieId}-${item.id}`}
                    elevation={0}
                    sx={{
                      p: { xs: 1, sm: 1.25 },
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.paper,
                      transition: "border-color 160ms ease, background-color 160ms ease",
                      "&:hover": {
                        borderColor: alpha(theme.palette.primary.main, 0.45),
                        backgroundColor: alpha(theme.palette.primary.main, 0.035),
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
                        {!posterUrl && <MovieRoundedIcon color="disabled" />}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              noWrap
                              title={getTitle(item)}
                              sx={{ maxWidth: { xs: "100%", md: 640 }, lineHeight: 1.25 }}
                            >
                              {getTitle(item)}
                            </Typography>
                            <Typography
                              color="text.secondary"
                              fontSize={14}
                              noWrap
                              title={getMetaText(item)}
                            >
                              {getMetaText(item)}
                            </Typography>
                          </Box>
                          <Tooltip title="Xoá khỏi danh sách xem sau">
                            <span>
                              <IconButton
                                id={`watchlist-remove-${item.movieId}`}
                                color="error"
                                size="small"
                                disabled={isRemoving}
                                onClick={() => handleRemove(item.movieId)}
                                sx={{
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
                                  borderRadius: 1,
                                }}
                              >
                                {isRemoving ? (
                                  <CircularProgress size={18} color="inherit" />
                                ) : (
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>

                        <Divider sx={{ my: 1.25 }} />

                        <Stack spacing={1.1}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={0.5}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Đã lưu: {formatDate(item.addedAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Đánh giá:{" "}
                              {typeof item.movie?.averageRating === "number"
                                ? `${item.movie.averageRating.toFixed(1)}/10`
                                : "Chưa có"}
                            </Typography>
                          </Stack>

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="flex-end"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            spacing={1}
                          >
                            <Button
                              id={`watchlist-watch-${item.movieId}`}
                              variant="contained"
                              size="small"
                              startIcon={<PlayArrowRoundedIcon />}
                              disabled={!movieUrl}
                              onClick={() => movieUrl && router.push(movieUrl)}
                              sx={{ minWidth: { xs: "100%", sm: 104 }, borderRadius: 1 }}
                            >
                              Xem phim
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

      <Snackbar
        open={!!message}
        autoHideDuration={2600}
        onClose={() => setMessage(null)}
        message={message}
      />
    </Box>
  );
}
