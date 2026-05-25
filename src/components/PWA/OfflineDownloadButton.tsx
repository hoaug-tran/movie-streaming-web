"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from "@mui/material";
import { Download, CheckCircle, X, WifiOff, Crown, Check, Lock } from "lucide-react";
import { useOfflineDownload } from "@/hooks/use-offline-download";
import { formatBytes } from "@/lib/offline-downloader";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useNotification } from "@/context/notification-context";
import { useSubscription, VideoQuality } from "@/hooks/use-subscription";

interface OfflineDownloadButtonProps {
  episodeId: number;
  quality?: string;
  availableQualities?: string[];
  durationSeconds?: number;
  size?: "small" | "medium";
  showLabel?: boolean;
  variant?: "icon" | "pill";
}

const QUALITY_BITRATE_KBPS: Record<VideoQuality, number> = {
  "720p": 3000,
  "1080p": 5000,
  "4K": 15000,
};

const QUALITY_RANK: Record<VideoQuality, number> = { "720p": 1, "1080p": 2, "4K": 3 };
const ALL_QUALITIES: VideoQuality[] = ["720p", "1080p", "4K"];

function estimateBytes(quality: VideoQuality, durationSeconds?: number): number | null {
  if (!durationSeconds || durationSeconds <= 0) return null;
  const kbps = QUALITY_BITRATE_KBPS[quality];
  return Math.round((kbps * 1000 * durationSeconds) / 8);
}

export default function OfflineDownloadButton({
  episodeId,
  quality,
  availableQualities,
  durationSeconds,
  size = "medium",
  showLabel = false,
  variant = "icon",
}: OfflineDownloadButtonProps) {
  const { maxQuality } = useSubscription();
  const {
    status,
    progress,
    record,
    isPWA,
    isInstalled,
    canDownloadOffline,
    mounted,
    canInstall,
    startDownload,
    cancelDownload,
    deleteDownload,
    promptInstall,
  } = useOfflineDownload(episodeId);

  const router = useRouter();
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);
  const [pickedQuality, setPickedQuality] = useState<VideoQuality>(maxQuality);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { notify } = useNotification();
  const needsUpgrade = isInstalled && !canDownloadOffline;

  const maxRank = QUALITY_RANK[maxQuality];
  const supportedSet = useMemo(() => {
    if (!availableQualities || availableQualities.length === 0) return null;
    return new Set(availableQualities.map((q) => q.toUpperCase()));
  }, [availableQualities]);

  const isSupported = useCallback(
    (q: VideoQuality) => {
      if (!supportedSet) return true;
      return supportedSet.has(q.toUpperCase()) || (q === "4K" && supportedSet.has("2160P"));
    },
    [supportedSet]
  );

  const openPicker = useCallback(() => {
    const best =
      [...ALL_QUALITIES].reverse().find((q) => QUALITY_RANK[q] <= maxRank && isSupported(q)) ??
      maxQuality;
    setPickedQuality(best);
    setQualityPickerOpen(true);
  }, [isSupported, maxRank, maxQuality]);

  const handleClick = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      notify({
        severity: "warning",
        message: "Bạn cần đăng nhập để tải phim về thiết bị.",
      });
      return;
    }
    if (!isPWA || !canDownloadOffline) {
      setInstallDialogOpen(true);
      return;
    }
    if (status === "idle" || status === "error") {
      if (quality) {
        notify({ severity: "info", message: `Bắt đầu tải phim ${quality}...` });
        await startDownload(quality);
      } else {
        openPicker();
      }
    } else if (status === "downloading") {
      cancelDownload();
      notify({ severity: "info", message: "Đã huỷ tải phim." });
    } else if (status === "downloaded") {
      await deleteDownload();
      notify({ severity: "success", message: "Đã xoá phim khỏi thiết bị." });
    }
  }, [
    authLoading,
    isAuthenticated,
    isPWA,
    canDownloadOffline,
    status,
    quality,
    startDownload,
    cancelDownload,
    deleteDownload,
    notify,
    openPicker,
  ]);

  const handleConfirmDownload = useCallback(async () => {
    setQualityPickerOpen(false);
    notify({ severity: "info", message: `Bắt đầu tải phim ${pickedQuality}...` });
    await startDownload(pickedQuality);
  }, [pickedQuality, startDownload, notify]);

  const handleInstall = useCallback(async () => {
    if (!canInstall) {
      setInstallDialogOpen(false);
      return;
    }
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
    setInstallDialogOpen(false);
  }, [canInstall, promptInstall]);

  if (!mounted) {
    if (variant === "pill") {
      return (
        <Box
          sx={{
            height: size === "small" ? 30 : 36,
            width: size === "small" ? 90 : 110,
            borderRadius: 1.5,
            bgcolor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      );
    }
    const btnSize = size === "small" ? 32 : 40;
    return (
      <Box
        sx={{
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.04)",
        }}
      />
    );
  }

  const iconSize = size === "small" ? 16 : 20;
  const btnSize = size === "small" ? 32 : 40;

  const tooltipTitle = authLoading
    ? "Đang kiểm tra đăng nhập..."
    : !isAuthenticated
      ? "Tải phim — Cần đăng nhập"
      : !isPWA
        ? "Tải phim — Cần cài ứng dụng"
        : !canDownloadOffline
          ? "Tải phim — Yêu cầu Premium Plus"
          : status === "idle"
            ? `Tải phim (chọn chất lượng)`
            : status === "downloading"
              ? `Đang tải ${progress?.percent ?? 0}% — Nhấn để huỷ`
              : status === "downloaded"
                ? `Đã tải (${formatBytes(record?.sizeBytes ?? 0)}) — Nhấn để xoá`
                : "Lỗi tải — Thử lại";

  const qualityPickerDialog = (
    <Dialog
      open={qualityPickerOpen}
      onClose={() => setQualityPickerOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#161616",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F0F0", lineHeight: 1.2 }}>
          Chọn chất lượng tải
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#8A8A8A", mt: 0.5 }}>
          Chất lượng cao = file lớn hơn, tốn nhiều dung lượng thiết bị.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 2, pt: "8px !important", pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {ALL_QUALITIES.map((q) => {
            const allowedByPlan = QUALITY_RANK[q] <= maxRank;
            const supported = isSupported(q);
            const disabled = !allowedByPlan || !supported;
            const selected = pickedQuality === q;
            const bytes = estimateBytes(q, durationSeconds);
            const lockReason = !supported
              ? "Tập phim không có chất lượng này"
              : !allowedByPlan
                ? "Cần nâng gói để tải chất lượng này"
                : null;

            return (
              <Box
                key={q}
                onClick={() => !disabled && setPickedQuality(q)}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !disabled) {
                    e.preventDefault();
                    setPickedQuality(q);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  cursor: disabled ? "not-allowed" : "pointer",
                  bgcolor: selected
                    ? "rgba(200,16,46,0.12)"
                    : disabled
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.04)",
                  border: selected
                    ? "1px solid rgba(200,16,46,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  opacity: disabled ? 0.5 : 1,
                  transition: "all 0.15s",
                  "&:hover": disabled
                    ? {}
                    : {
                        bgcolor: selected ? "rgba(200,16,46,0.16)" : "rgba(255,255,255,0.07)",
                        borderColor: selected ? "rgba(200,16,46,0.6)" : "rgba(255,255,255,0.18)",
                      },
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: selected ? "2px solid #C8102E" : "2px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: selected ? "#C8102E" : "transparent",
                  }}
                >
                  {selected && <Check size={12} color="#fff" strokeWidth={3} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#F0F0F0" }}>
                      {q}
                    </Typography>
                    {q === "4K" && (
                      <Box
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          color: "#F4B400",
                          bgcolor: "rgba(244,180,0,0.12)",
                          border: "1px solid rgba(244,180,0,0.3)",
                          px: 0.6,
                          py: 0.1,
                          borderRadius: 0.5,
                          letterSpacing: 0.5,
                        }}
                      >
                        UHD
                      </Box>
                    )}
                    {q === "1080p" && (
                      <Box
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          color: "#22c55e",
                          bgcolor: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          px: 0.6,
                          py: 0.1,
                          borderRadius: 0.5,
                          letterSpacing: 0.5,
                        }}
                      >
                        FHD
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#8A8A8A", mt: 0.25 }}>
                    {lockReason
                      ? lockReason
                      : bytes
                        ? `Ước tính ~${formatBytes(bytes)}`
                        : q === "4K"
                          ? "Tốn nhiều dung lượng nhất"
                          : q === "1080p"
                            ? "Cân bằng giữa chất lượng và dung lượng"
                            : "Tiết kiệm dung lượng nhất"}
                  </Typography>
                </Box>
                {disabled && <Lock size={16} color="rgba(255,255,255,0.4)" />}
              </Box>
            );
          })}
        </Box>
        {maxRank < QUALITY_RANK["4K"] && (
          <Box
            sx={{
              mt: 2,
              p: 1.25,
              borderRadius: 1.25,
              bgcolor: "rgba(244,180,0,0.06)",
              border: "1px solid rgba(244,180,0,0.18)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Crown size={14} color="#F4B400" />
            <Typography sx={{ fontSize: "0.76rem", color: "#F4B400", lineHeight: 1.5 }}>
              Gói của bạn cho phép tối đa <strong>{maxQuality}</strong>. Nâng cấp Premium Plus để
              tải 4K.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={() => setQualityPickerOpen(false)}
          sx={{ color: "#8A8A8A", textTransform: "none", fontWeight: 600 }}
        >
          Huỷ
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmDownload}
          startIcon={<Download size={16} />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1.5,
            bgcolor: "#C8102E",
            "&:hover": { bgcolor: "#a50d26" },
          }}
        >
          Tải {pickedQuality}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const installDialog = (
    <Dialog
      open={installDialogOpen}
      onClose={() => setInstallDialogOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#161616",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2,
          backgroundImage: "none",
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
      <DialogContent sx={{ px: 3, pt: "8px !important", pb: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(200,16,46,0.06)",
            border: "1px solid rgba(200,16,46,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            mb: canInstall ? 0 : 2,
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
        {needsUpgrade ? (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: "rgba(244,180,0,0.08)",
              border: "1px solid rgba(244,180,0,0.25)",
            }}
          >
            <Typography sx={{ fontSize: "0.82rem", color: "#F4B400", lineHeight: 1.6 }}>
              Tính năng tải phim chỉ dành cho gói <strong>Premium Plus</strong>. Hãy nâng cấp để tải
              phim và xem khi không có mạng.
            </Typography>
          </Box>
        ) : (
          !canInstall && (
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
          )
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={() => setInstallDialogOpen(false)}
          sx={{ color: "#8A8A8A", textTransform: "none", fontWeight: 600 }}
        >
          Để sau
        </Button>
        {needsUpgrade ? (
          <Button
            variant="contained"
            onClick={() => {
              router.push("/pricing");
              setInstallDialogOpen(false);
            }}
            startIcon={<Crown size={16} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: "#F4B400",
              color: "#111",
              "&:hover": { bgcolor: "#d4a000" },
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
              installing ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: "#C8102E",
              "&:hover": { bgcolor: "#a50d26" },
            }}
          >
            {installing ? "Đang cài..." : "Cài đặt ngay"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => setInstallDialogOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              borderColor: "rgba(255,255,255,0.2)",
              color: "#F0F0F0",
            }}
          >
            Đã hiểu
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  if (variant === "pill") {
    const isDownloaded = status === "downloaded";
    const isDownloading = status === "downloading";
    const isError = status === "error";

    return (
      <>
        <Tooltip title={tooltipTitle} placement="top">
          <Button
            onClick={handleClick}
            size={size === "small" ? "small" : "medium"}
            variant="outlined"
            startIcon={
              isDownloading ? (
                <CircularProgress size={14} sx={{ color: "#C8102E" }} />
              ) : isDownloaded ? (
                <CheckCircle size={15} color="#22c55e" />
              ) : !isPWA ? (
                <WifiOff size={15} />
              ) : (
                <Download size={15} />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              fontSize: size === "small" ? "0.78rem" : "0.875rem",
              borderColor: isDownloaded
                ? "rgba(34,197,94,0.4)"
                : isError
                  ? "rgba(200,16,46,0.4)"
                  : "rgba(255,255,255,0.18)",
              color: isDownloaded ? "#22c55e" : isError ? "#C8102E" : "#F0F0F0",
              bgcolor: isDownloaded ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.04)",
              "&:hover": {
                borderColor: isDownloaded ? "rgba(200,16,46,0.5)" : "rgba(255,255,255,0.35)",
                bgcolor: isDownloaded ? "rgba(200,16,46,0.08)" : "rgba(255,255,255,0.08)",
              },
              transition: "all 0.2s",
            }}
          >
            {isDownloading
              ? `${progress?.percent ?? 0}%`
              : isDownloaded
                ? `Đã tải · ${record?.quality ?? ""} · ${formatBytes(record?.sizeBytes ?? 0)}`
                : isError
                  ? "Thử lại"
                  : !isPWA
                    ? "Tải phim"
                    : "Tải phim"}
          </Button>
        </Tooltip>
        {installDialog}
        {qualityPickerDialog}
      </>
    );
  }

  return (
    <>
      <Tooltip title={tooltipTitle} placement="top">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            cursor: "pointer",
            opacity: !isPWA ? 0.6 : 1,
          }}
          onClick={handleClick}
          role="button"
          aria-label={tooltipTitle}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          <Box
            sx={{
              width: btnSize,
              height: btnSize,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              bgcolor:
                status === "downloaded"
                  ? "rgba(34,197,94,0.12)"
                  : status === "error"
                    ? "rgba(200,16,46,0.12)"
                    : "rgba(255,255,255,0.08)",
              border:
                status === "downloaded"
                  ? "1px solid rgba(34,197,94,0.3)"
                  : status === "error"
                    ? "1px solid rgba(200,16,46,0.3)"
                    : "1px solid rgba(255,255,255,0.12)",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor:
                  status === "downloaded" ? "rgba(200,16,46,0.15)" : "rgba(255,255,255,0.14)",
              },
            }}
          >
            {status === "downloading" ? (
              <>
                <CircularProgress
                  variant="determinate"
                  value={progress?.percent ?? 0}
                  size={btnSize - 4}
                  thickness={3}
                  sx={{ position: "absolute", color: "#C8102E" }}
                />
                <X size={iconSize - 2} color="rgba(255,255,255,0.7)" />
              </>
            ) : status === "downloaded" ? (
              <CheckCircle size={iconSize} color="#22c55e" />
            ) : status === "error" ? (
              <Download size={iconSize} color="#C8102E" />
            ) : !isPWA ? (
              <Download size={iconSize} color="rgba(255,255,255,0.45)" />
            ) : (
              <Download size={iconSize} color="rgba(255,255,255,0.8)" />
            )}
          </Box>

          {showLabel && (
            <Typography
              sx={{
                fontSize: "0.78rem",
                color:
                  status === "downloaded"
                    ? "#22c55e"
                    : status === "error"
                      ? "#C8102E"
                      : "rgba(255,255,255,0.7)",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {status === "idle"
                ? "Tải phim"
                : status === "downloading"
                  ? `${progress?.percent ?? 0}%`
                  : status === "downloaded"
                    ? "Đã tải"
                    : "Thử lại"}
            </Typography>
          )}
        </Box>
      </Tooltip>
      {installDialog}
      {qualityPickerDialog}
    </>
  );
}
