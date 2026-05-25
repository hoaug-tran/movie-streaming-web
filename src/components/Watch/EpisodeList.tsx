"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonBase,
} from "@mui/material";
import { Close, Lock, PlayArrow } from "@mui/icons-material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import DownloadingOutlinedIcon from "@mui/icons-material/DownloadingOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Episode } from "@/modules/movie/types/movie";
import { useOfflineDownload } from "@/hooks/use-offline-download";
import { useOfflinePoster } from "@/hooks/use-offline-poster";
import IOSInstallInstructions from "@/components/PWA/IOSInstallInstructions";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSubscription, VideoQuality } from "@/hooks/use-subscription";

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisode: Episode;
  onSelect: (ep: Episode) => void;
  onClose: () => void;
  container?: HTMLElement | null;
}

const ALL_QUALITIES: VideoQuality[] = ["4K", "1080p", "720p"];
const QUALITY_ORDER: VideoQuality[] = ["720p", "1080p", "4K"];

const qualityLabel = (q: VideoQuality) => {
  if (q === "4K") return "4K Ultra HD";
  if (q === "1080p") return "Full HD 1080p";
  return "HD 720p";
};

function EpisodeThumbnail({ episode }: { episode: Episode }) {
  const src = useOfflinePoster({
    episodeId: episode.id,
    fallbackUrl: episode.thumbnailUrl ?? undefined,
  });

  if (!src) {
    return (
      <Box
        sx={{
          width: 72,
          height: 40,
          borderRadius: 1,
          bgcolor: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.85rem",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
        }}
      >
        {episode.episodeNumber ?? "?"}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={episode.title ?? `Tập ${episode.episodeNumber}`}
      sx={{ width: 72, height: 40, objectFit: "cover", borderRadius: 1, flexShrink: 0 }}
    />
  );
}

function EpisodeDownloadButton({
  episode,
  container,
}: {
  episode: Episode;
  container?: HTMLElement | null;
}) {
  const episodeId = episode.id;
  const availableQualities = episode.availableQualities ?? [];

  const {
    status,
    progress,
    isPWA,
    isInstalled,
    canDownloadOffline,
    mounted,
    canInstall,
    isIOS,
    isSafari,
    needsManualInstall,
    startDownload,
    cancelDownload,
    deleteDownload,
    promptInstall,
  } = useOfflineDownload(episodeId);

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { maxQuality } = useSubscription();

  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const needsUpgrade = isInstalled && !canDownloadOffline;
  const maxQualityIdx = QUALITY_ORDER.indexOf(maxQuality);

  if (!mounted) return null;

  const showIOSGuide = needsManualInstall && isSafari;
  const isUnsupportedBrowser = isIOS && !isSafari;

  const getQualityAvailable = (q: VideoQuality) => {
    if (!availableQualities || availableQualities.length === 0) return true;

    const supportedSet = new Set(availableQualities.map((item) => item.toUpperCase()));

    return supportedSet.has(q.toUpperCase()) || (q === "4K" && supportedSet.has("2160P"));
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (authLoading) return;

    if (!isAuthenticated) {
      router.push(`/auth/login?returnTo=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (!isPWA || !canDownloadOffline) {
      setInstallDialogOpen(true);
      return;
    }

    if (status === "idle" || status === "error") {
      setQualityDialogOpen(true);
    } else if (status === "downloading") {
      cancelDownload();
    } else if (status === "downloaded") {
      void deleteDownload();
    }
  };

  const handleDownloadQualitySelect = (q: VideoQuality) => {
    const qIdx = QUALITY_ORDER.indexOf(q);

    if (qIdx > maxQualityIdx) {
      setQualityDialogOpen(false);
      router.push("/pricing");
      return;
    }

    if (!getQualityAvailable(q)) return;

    void startDownload(q);
    setQualityDialogOpen(false);
  };

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canInstall) {
      setInstallDialogOpen(false);
      return;
    }
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
    setInstallDialogOpen(false);
  };

  const tooltipTitle = authLoading
    ? "Đang kiểm tra đăng nhập..."
    : !isAuthenticated
      ? "Tải phim — Cần đăng nhập"
      : status === "downloading"
        ? `Đang tải ${progress?.percent ?? 0}%`
        : status === "downloaded"
          ? "Đã tải — Nhấn để xoá"
          : status === "error"
            ? "Lỗi — Thử lại"
            : !isPWA
              ? "Tải phim — Cần cài ứng dụng"
              : !canDownloadOffline
                ? "Tải phim — Yêu cầu Premium Plus"
                : "Tải phim";

  return (
    <>
      <Tooltip title={tooltipTitle} placement="left">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            color:
              status === "downloaded"
                ? "#22c55e"
                : status === "downloading"
                  ? "#C8102E"
                  : "rgba(255,255,255,0.45)",
            flexShrink: 0,
            p: 0.5,
            "&:hover": {
              color: status === "downloaded" ? "#ef4444" : "rgba(255,255,255,0.9)",
              bgcolor: "rgba(255,255,255,0.06)",
            },
          }}
        >
          {status === "downloading" ? (
            <Box
              sx={{
                position: "relative",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                variant="determinate"
                value={progress?.percent ?? 0}
                size={18}
                thickness={4}
                sx={{ color: "#C8102E", position: "absolute" }}
              />
              <DownloadingOutlinedIcon sx={{ fontSize: 12, color: "#C8102E" }} />
            </Box>
          ) : status === "downloaded" ? (
            <FileDownloadDoneIcon sx={{ fontSize: 20 }} />
          ) : (
            <FileDownloadOutlinedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Tooltip>

      <Dialog
        open={qualityDialogOpen}
        container={container ?? undefined}
        sx={{ zIndex: 2147483647 }}
        onClose={(e) => {
          (e as React.MouseEvent).stopPropagation?.();
          setQualityDialogOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid rgba(200,16,46,0.25)",
            borderRadius: 3,
            backgroundImage: "none",
            mx: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
            <Box
              component="img"
              src="/icons/logo.webp"
              alt="Gió Phim"
              sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#F0F0F0",
                  lineHeight: 1.2,
                }}
              >
                Chọn chất lượng tải phim
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.78rem",
                  color: "#8A8A8A",
                  mt: 0.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {episode.title ?? `Tập ${episode.episodeNumber ?? "?"}`}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pt: "8px !important",
            pb: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {ALL_QUALITIES.map((q) => {
            const qIdx = QUALITY_ORDER.indexOf(q);
            const isLocked = qIdx > maxQualityIdx;
            const isAvailable = getQualityAvailable(q);

            return (
              <ButtonBase
                key={q}
                onClick={() => handleDownloadQualitySelect(q)}
                disabled={!isLocked && !isAvailable}
                sx={{
                  width: "100%",
                  minHeight: 52,
                  px: 2,
                  py: 1.25,
                  borderRadius: 1.5,
                  border: "1px solid rgba(255,255,255,0.1)",
                  bgcolor: "rgba(255,255,255,0.04)",
                  color: isLocked
                    ? "rgba(255,255,255,0.42)"
                    : isAvailable
                      ? "#F0F0F0"
                      : "rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  textAlign: "left",
                  cursor: isLocked || isAvailable ? "pointer" : "default",
                  "&:hover": {
                    bgcolor:
                      isLocked || isAvailable ? "rgba(200,16,46,0.14)" : "rgba(255,255,255,0.04)",
                    borderColor:
                      isLocked || isAvailable ? "rgba(200,16,46,0.35)" : "rgba(255,255,255,0.1)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(255,255,255,0.28)",
                    opacity: 1,
                  },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.92rem" }}>
                    {qualityLabel(q)}
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.48)",
                      fontSize: "0.74rem",
                      mt: 0.2,
                    }}
                  >
                    {isLocked
                      ? "Cần nâng cấp gói"
                      : isAvailable
                        ? "Sẵn sàng tải về thiết bị"
                        : "Chưa có chất lượng này"}
                  </Typography>
                </Box>

                {isLocked ? (
                  <Lock sx={{ fontSize: 18, opacity: 0.72 }} />
                ) : (
                  <FileDownloadOutlinedIcon
                    sx={{ fontSize: 20, opacity: isAvailable ? 1 : 0.35 }}
                  />
                )}
              </ButtonBase>
            );
          })}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setQualityDialogOpen(false);
            }}
            sx={{
              color: "#8A8A8A",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Để sau
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={installDialogOpen}
        container={container ?? undefined}
        sx={{ zIndex: 2147483647 }}
        onClose={(e) => {
          (e as React.MouseEvent).stopPropagation?.();
          setInstallDialogOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid rgba(200,16,46,0.25)",
            borderRadius: 3,
            backgroundImage: "none",
            mx: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
            <Box
              component="img"
              src="/icons/logo.webp"
              alt="Gió Phim"
              sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F0F0", lineHeight: 1.2 }}
              >
                {needsUpgrade ? "Yêu cầu gói Premium Plus" : "Cài Gió Phim để Tải phim"}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", mt: 0.3 }}>
                {needsUpgrade
                  ? "Tính năng tải phim chỉ dành cho gói Premium Plus"
                  : "Tải phim và xem khi không có mạng"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            px: 3,
            pt: "8px !important",
            pb: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(200,16,46,0.06)",
              border: "1px solid rgba(200,16,46,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            {[
              "Xem phim không cần mạng",
              "Lưu trữ an toàn trên thiết bị",
              "Tự động xoá sau 48 giờ",
            ].map((item) => (
              <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#C8102E",
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: "0.85rem", color: "#C0C0C0" }}>{item}</Typography>
              </Box>
            ))}
          </Box>

          {needsUpgrade && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(244,180,0,0.08)",
                border: "1px solid rgba(244,180,0,0.25)",
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", color: "#F4B400", lineHeight: 1.6 }}>
                Tính năng tải phim chỉ dành cho gói <strong>Premium Plus</strong>. Hãy nâng cấp để
                tải phim và xem khi không có mạng.
              </Typography>
            </Box>
          )}

          {!needsUpgrade && showIOSGuide && <IOSInstallInstructions />}

          {!needsUpgrade && isUnsupportedBrowser && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(255,193,7,0.08)",
                border: "1px solid rgba(255,193,7,0.25)",
              }}
            >
              <Typography sx={{ fontSize: "0.8rem", color: "#FFC107", lineHeight: 1.6 }}>
                Trên iPhone/iPad, vui lòng mở trong <strong>Safari</strong> để cài đặt.
              </Typography>
            </Box>
          )}

          {!needsUpgrade && !canInstall && !showIOSGuide && !isUnsupportedBrowser && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography sx={{ fontSize: "0.8rem", color: "#8A8A8A", lineHeight: 1.6 }}>
                Để cài: nhấn biểu tượng <strong style={{ color: "#C0C0C0" }}>⋮</strong> hoặc{" "}
                <strong style={{ color: "#C0C0C0" }}>Chia sẻ</strong> trên trình duyệt → chọn{" "}
                <strong style={{ color: "#C0C0C0" }}>Thêm vào màn hình chính</strong>.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setInstallDialogOpen(false);
            }}
            sx={{ color: "#8A8A8A", textTransform: "none", fontWeight: 600, flex: 1 }}
          >
            Để sau
          </Button>
          {needsUpgrade ? (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/pricing");
                setInstallDialogOpen(false);
              }}
              startIcon={<WorkspacePremiumIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                bgcolor: "#F4B400",
                color: "#111",
                "&:hover": { bgcolor: "#d4a000" },
                flex: 2,
              }}
            >
              Nâng cấp Premium Plus
            </Button>
          ) : canInstall ? (
            <Button
              variant="contained"
              onClick={handleInstall}
              disabled={installing}
              startIcon={
                installing ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FileDownloadOutlinedIcon />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                bgcolor: "#C8102E",
                "&:hover": { bgcolor: "#a50d26" },
                flex: 2,
              }}
            >
              {installing ? "Đang cài..." : "Cài đặt ngay"}
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                setInstallDialogOpen(false);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                borderColor: "rgba(255,255,255,0.2)",
                color: "#F0F0F0",
                flex: 2,
              }}
            >
              Đã hiểu
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function EpisodeList({
  episodes,
  currentEpisode,
  onSelect,
  onClose,
  container,
}: EpisodeListProps) {
  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: { xs: "min(85vw, 320px)", sm: 320 },
        bgcolor: "rgba(10,10,10,0.97)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 30,
        overflow: "hidden",
        
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          sx={{ color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "1rem" }}
        >
          Danh sách tập ({episodes.length})
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {episodes.map((ep) => {
          const isCurrent = ep.id === currentEpisode.id;
          return (
            <Box
              key={ep.id}
              onClick={() => onSelect(ep)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2,
                py: 1.5,
                cursor: "pointer",
                bgcolor: isCurrent ? "rgba(200,16,46,0.12)" : "transparent",
                borderLeft: isCurrent ? "3px solid #C8102E" : "3px solid transparent",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: isCurrent ? "rgba(200,16,46,0.18)" : "rgba(255,255,255,0.06)",
                },
              }}
            >
              <EpisodeThumbnail episode={ep} />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: isCurrent ? "#fff" : "rgba(255,255,255,0.75)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: isCurrent ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ep.title ?? `Tập ${ep.episodeNumber}`}
                </Typography>
                {ep.durationSeconds && (
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.72rem",
                      mt: 0.2,
                    }}
                  >
                    {Math.floor(ep.durationSeconds / 60)}:
                    {String(Math.floor(ep.durationSeconds % 60)).padStart(2, "0")}
                  </Typography>
                )}
              </Box>

              {isCurrent ? (
                <PlayArrow sx={{ color: "#C8102E", fontSize: 18, flexShrink: 0 }} />
              ) : null}
              <EpisodeDownloadButton episode={ep} container={container} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
