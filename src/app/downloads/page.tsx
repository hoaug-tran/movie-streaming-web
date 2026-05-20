"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  Breadcrumbs,
} from "@mui/material";
import { Trash2, Play, WifiOff, HardDrive, Clock, Download, Shield } from "lucide-react";
import { offlineStorage, OfflineMovieRecord } from "@/lib/offline-storage";
import { formatBytes } from "@/lib/offline-downloader";
import { usePwa } from "@/hooks/use-pwa";
import { useOfflinePoster } from "@/hooks/use-offline-poster";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSubscription } from "@/hooks/use-subscription";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function OfflinePosterImage({ movie }: { movie: OfflineMovieRecord }) {
  const src = useOfflinePoster({ episodeId: movie.episodeId, fallbackUrl: movie.posterUrl });
  if (!src) {
    return (
      <Box
        sx={{
          height: 160,
          bgcolor: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Play size={40} color="#8A8A8A" />
      </Box>
    );
  }
  return (
    <CardMedia
      component="img"
      height={160}
      image={src}
      alt={movie.movieTitle}
      sx={{ objectFit: "cover" }}
    />
  );
}

function GateScreen({
  icon,
  title,
  description,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: { xs: 10, md: 12 },
        pb: 8,
        px: { xs: 2, sm: 3, md: 4 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: `${accent}18`,
            border: `1px solid ${accent}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#F0F0F0", mb: 1.5, letterSpacing: "-0.02em" }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: "#8A8A8A", fontSize: "0.9rem", lineHeight: 1.7, mb: 3.5 }}>
          {description}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexDirection: "column" }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default function DownloadsPage() {
  const router = useRouter();
  const { isPWA, canInstall, promptInstall, mounted } = usePwa();
  const { isAuthenticated } = useAuth();
  const { hasActiveSubscription, currentPlan, isLoading: subLoading } = useSubscription();
  const canDownload = hasActiveSubscription && currentPlan?.code === "PREMIUM_PLUS";
  const [movies, setMovies] = useState<OfflineMovieRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!isPWA || !isAuthenticated || !canDownload) {
      setLoading(false);
      return;
    }
    offlineStorage.listMovies().then((list) => {
      setMovies(
        list.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
      );
      setLoading(false);
    });
    offlineStorage.getTotalSize().then(setTotalSize);
  }, [mounted, isPWA, isAuthenticated, canDownload]);

  const handleDelete = async (episodeId: number) => {
    setDeleting(episodeId);
    await offlineStorage.deleteMovie(episodeId);
    setMovies((prev) => prev.filter((m) => m.episodeId !== episodeId));
    const newSize = await offlineStorage.getTotalSize();
    setTotalSize(newSize);
    setDeleting(null);
  };

  const handlePlay = (movie: OfflineMovieRecord) => {
    router.push(`/watch/offline?episode=${movie.episodeId}&slug=${movie.movieSlug}`);
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const handleInstall = useCallback(async () => {
    if (!canInstall) return;
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
  }, [canInstall, promptInstall]);

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          pt: { xs: 10, md: 12 },
          pb: 8,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Skeleton
            variant="text"
            width={200}
            height={48}
            sx={{ bgcolor: "rgba(255,255,255,0.06)", mb: 1 }}
          />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)" }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  if (!isPWA) {
    return (
      <GateScreen
        icon={<Download size={40} color="#C8102E" />}
        title="Cần cài Gió Phim"
        description="Tính năng xem phim offline chỉ khả dụng trong ứng dụng Gió Phim. Cài đặt để tải phim và xem khi không có mạng."
        accent="#C8102E"
      >
        {canInstall && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleInstall}
            disabled={installing}
            startIcon={<Download size={18} />}
            sx={{
              bgcolor: "#C8102E",
              "&:hover": { bgcolor: "#A00B24" },
              fontWeight: 700,
              py: 1.4,
              borderRadius: 2,
            }}
          >
            {installing ? "Đang cài đặt..." : "Cài đặt Gió Phim"}
          </Button>
        )}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => router.push("/")}
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "#8A8A8A",
            fontWeight: 600,
            py: 1.2,
            borderRadius: 2,
            "&:hover": { borderColor: "rgba(255,255,255,0.3)", color: "#F0F0F0" },
          }}
        >
          Về trang chủ
        </Button>
      </GateScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <GateScreen
        icon={<Shield size={40} color="#8EA7E9" />}
        title="Đăng nhập để tiếp tục"
        description="Bạn cần đăng nhập vào tài khoản Gió Phim để sử dụng tính năng tải phim ngoại tuyến."
        accent="#8EA7E9"
      >
        <Button
          variant="contained"
          fullWidth
          onClick={() => router.push("/auth/login?redirect=/downloads")}
          sx={{
            bgcolor: "#8EA7E9",
            "&:hover": { bgcolor: "#6b8fd4" },
            color: "#111",
            fontWeight: 700,
            py: 1.4,
            borderRadius: 2,
          }}
        >
          Đăng nhập
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => router.push("/")}
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "#8A8A8A",
            fontWeight: 600,
            py: 1.2,
            borderRadius: 2,
          }}
        >
          Về trang chủ
        </Button>
      </GateScreen>
    );
  }

  if (!subLoading && !canDownload) {
    return (
      <GateScreen
        icon={<Shield size={40} color="#F4B400" />}
        title="Yêu cầu gói Premium Plus"
        description="Tính năng tải phim và xem ngoại tuyến chỉ dành riêng cho gói Premium Plus. Nâng cấp để tải phim và xem khi không có mạng."
        accent="#F4B400"
      >
        <Button
          variant="contained"
          fullWidth
          onClick={() => router.push("/pricing")}
          sx={{
            bgcolor: "#F4B400",
            "&:hover": { bgcolor: "#d4a000" },
            color: "#111",
            fontWeight: 700,
            py: 1.4,
            borderRadius: 2,
          }}
        >
          Xem gói Premium Plus
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => router.push("/")}
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "#8A8A8A",
            fontWeight: 600,
            py: 1.2,
            borderRadius: 2,
          }}
        >
          Về trang chủ
        </Button>
      </GateScreen>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: { xs: 10, md: 12 },
        pb: 8,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                mb: 1.5,
                "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.3)" },
                "& .MuiBreadcrumbs-li > a": {
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: "color 0.2s",
                  "&:hover": { color: "#F0F0F0" },
                },
              }}
            >
              <Box component="a" href="/" sx={{ display: "flex", alignItems: "center" }}>
                Trang chủ
              </Box>
              <Typography sx={{ color: "#F0F0F0", fontSize: "0.875rem", fontWeight: 500 }}>
                Ngoại tuyến
              </Typography>
            </Breadcrumbs>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "#F0F0F0", letterSpacing: "-0.02em" }}
            >
              Phim đã tải
            </Typography>
            <Typography sx={{ color: "#8A8A8A", fontSize: "0.875rem", mt: 0.5 }}>
              {movies.length} phim · {formatBytes(totalSize)} đã dùng
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Chip
              icon={<WifiOff size={14} />}
              label="Offline"
              size="small"
              sx={{
                bgcolor: "rgba(200,16,46,0.15)",
                color: "#C8102E",
                border: "1px solid rgba(200,16,46,0.3)",
                fontWeight: 600,
                display: "none",
                "& .MuiChip-icon": { color: "#C8102E" },
              }}
              id="offline-chip"
            />
            <Chip
              icon={<HardDrive size={14} />}
              label={formatBytes(totalSize)}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.06)",
                color: "#8A8A8A",
                border: "1px solid rgba(255,255,255,0.08)",
                "& .MuiChip-icon": { color: "#8A8A8A" },
              }}
            />
          </Box>
        </Box>

        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)" }}
                />
              </Grid>
            ))}
          </Grid>
        ) : movies.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <HardDrive size={36} color="#8A8A8A" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#F0F0F0" }}>
              Chưa có phim nào được tải
            </Typography>
            <Typography
              sx={{ color: "#8A8A8A", fontSize: "0.875rem", textAlign: "center", maxWidth: 320 }}
            >
              Nhấn nút tải xuống khi xem phim để lưu về thiết bị và xem khi không có mạng.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {movies.map((movie) => {
              const expired = isExpired(movie.expiresAt);
              return (
                <Grid item xs={12} sm={6} md={4} key={movie.episodeId}>
                  <Card
                    sx={{
                      bgcolor: "#161616",
                      border: expired
                        ? "1px solid rgba(200,16,46,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                      "&:hover": {
                        borderColor: expired ? "rgba(200,16,46,0.5)" : "rgba(255,255,255,0.14)",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <OfflinePosterImage movie={movie} />

                      <Box
                        sx={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 0.75 }}
                      >
                        <Chip
                          label={movie.quality}
                          size="small"
                          sx={{
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "#F0F0F0",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            height: 20,
                          }}
                        />
                        {expired && (
                          <Chip
                            label="Hết hạn"
                            size="small"
                            sx={{
                              bgcolor: "rgba(200,16,46,0.8)",
                              color: "#fff",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              height: 20,
                            }}
                          />
                        )}
                      </Box>

                      {!expired && (
                        <Box
                          onClick={() => handlePlay(movie)}
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(0,0,0,0)",
                            transition: "background 0.2s",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.45)" },
                            "&:hover .play-icon": { opacity: 1, transform: "scale(1)" },
                          }}
                        >
                          <Box
                            className="play-icon"
                            sx={{
                              opacity: 0,
                              transform: "scale(0.85)",
                              transition: "all 0.2s",
                              width: 52,
                              height: 52,
                              borderRadius: "50%",
                              bgcolor: "#C8102E",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Play size={24} color="#fff" fill="#fff" />
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              color: "#F0F0F0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {movie.movieTitle}
                          </Typography>
                          {movie.episodeTitle && (
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#8A8A8A",
                                mt: 0.25,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {movie.episodeNumber ? `Tập ${movie.episodeNumber}: ` : ""}
                              {movie.episodeTitle}
                            </Typography>
                          )}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#8A8A8A" }}>
                              {formatBytes(movie.sizeBytes)}
                            </Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>
                              ·
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                              <Clock size={11} color="#8A8A8A" />
                              <Typography sx={{ fontSize: "0.7rem", color: "#8A8A8A" }}>
                                {expired
                                  ? "Đã hết hạn"
                                  : `Hết hạn ${formatDistanceToNow(new Date(movie.expiresAt), { addSuffix: true, locale: vi })}`}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Tooltip title="Xoá" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(movie.episodeId)}
                            disabled={deleting === movie.episodeId}
                            aria-label={`Xoá ${movie.movieTitle}`}
                            sx={{
                              color: "#8A8A8A",
                              "&:hover": { color: "#C8102E", bgcolor: "rgba(200,16,46,0.1)" },
                              flexShrink: 0,
                            }}
                          >
                            {deleting === movie.episodeId ? (
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  border: "2px solid rgba(255,255,255,0.2)",
                                  borderTopColor: "#C8102E",
                                  borderRadius: "50%",
                                  animation: "spin 0.8s linear infinite",
                                  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                                }}
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
