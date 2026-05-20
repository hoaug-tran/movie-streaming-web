"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  ArrowBack,
  PictureInPicture,
  SlowMotionVideo,
  ListAlt,
  Lock,
  Hd,
  ChatBubbleOutlineRounded,
  FileDownloadOutlined,
  FileDownloadDone,
  DownloadingOutlined,
  MoreVert,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";
import { Episode, MovieDetail } from "@/modules/movie/types/movie";
import { VideoQuality } from "@/hooks/use-subscription";
import EpisodeList from "./EpisodeList";
import { useOfflineDownload } from "@/hooks/use-offline-download";
import IOSInstallInstructions from "@/components/PWA/IOSInstallInstructions";
import { isIOSDevice } from "@/lib/platform";

interface PlayerControlsProps {
  show: boolean;
  movie: MovieDetail;
  episode: Episode;
  episodes: Episode[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  availableQualities: string[];
  currentQuality: VideoQuality;
  maxQuality: VideoQuality;
  onPlay: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  onBack: () => void;
  onEpisodeSelect: (ep: Episode) => void;
  onQualityChange: (q: VideoQuality) => void;
  commentOpen?: boolean;
  onCommentToggle?: () => void;
  fullscreenContainer?: HTMLElement | null;
}

export function formatTime(sec: number): string {
  if (typeof sec !== "number" || !Number.isFinite(sec) || sec <= 0) return "0:00";
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const ALL_QUALITIES: VideoQuality[] = ["4K", "1080p", "720p"];
const QUALITY_ORDER: VideoQuality[] = ["720p", "1080p", "4K"];

const menuBoxSx = {
  position: "absolute" as const,
  bottom: "100%",
  right: 0,
  mb: 1,
  bgcolor: "rgba(20,20,20,0.95)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 2,
  overflow: "hidden",
  minWidth: 100,
  zIndex: 20,
};

export default function PlayerControls({
  show,
  movie,
  episode,
  episodes,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  availableQualities,
  currentQuality,
  maxQuality,
  onPlay,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreen,
  onBack,
  onEpisodeSelect,
  onQualityChange,
  commentOpen,
  onCommentToggle,
  fullscreenContainer,
}: PlayerControlsProps) {
  const router = useRouter();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [overflowAnchor, setOverflowAnchor] = useState<HTMLElement | null>(null);
  const [volumeAnchor, setVolumeAnchor] = useState<HTMLElement | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  const muteButtonRef = useRef<HTMLButtonElement | null>(null);

  const download = useOfflineDownload(episode.id);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isSeries = movie.movieType === "SERIES" && episodes.length > 1;
  const showIOSGuide = download.needsManualInstall && download.isSafari;
  const isUnsupportedIOSBrowser = download.isIOS && !download.isSafari;

  const maxQualityIdx = QUALITY_ORDER.indexOf(maxQuality);

  const currentEpisodeIndex = episodes.findIndex((e) => e.id === episode.id);
  const previousEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  useEffect(() => {
    setIsIOS(isIOSDevice());
  }, []);

  useEffect(() => {
    if (!isCompact && volumeAnchor) setVolumeAnchor(null);
  }, [isCompact, volumeAnchor]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const videoEl = document.querySelector("video");
    if (videoEl) videoEl.playbackRate = speed;
    setShowSpeedMenu(false);
    setOverflowAnchor(null);
  };

  const handlePiP = async () => {
    const videoEl = document.querySelector("video");
    if (!videoEl) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoEl.requestPictureInPicture();
      }
    } catch {
      // PiP not supported on this device or permission denied
    }
    setOverflowAnchor(null);
  };

  const handleQualityClick = (q: VideoQuality) => {
    const idx = QUALITY_ORDER.indexOf(q);
    if (idx > maxQualityIdx) {
      router.push("/pricing");
      return;
    }
    if (availableQualities.includes(q)) {
      onQualityChange(q);
    }
    setShowQualityMenu(false);
  };

  const qualityLabel = (q: VideoQuality) => {
    if (q === "4K") return "4K Ultra HD";
    if (q === "1080p") return "Full HD 1080p";
    return "HD 720p";
  };

  const handleVolumeButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isCompact) {
      setVolumeAnchor((prev) => (prev ? null : (e.currentTarget as HTMLElement)));
      return;
    }
    onMuteToggle();
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!download.isPWA || !download.canDownloadOffline) {
      setShowDownloadDialog(true);
      return;
    }
    if (download.status === "idle" || download.status === "error") {
      download.startDownload("720p");
    } else if (download.status === "downloading") {
      download.cancelDownload();
    } else if (download.status === "downloaded") {
      download.deleteDownload();
    }
    setOverflowAnchor(null);
  };

  const handleInstallFromDialog = async () => {
    if (!download.canInstall) return;
    setInstalling(true);
    await download.promptInstall();
    setInstalling(false);
    setShowDownloadDialog(false);
  };

  const downloadIcon =
    download.status === "downloaded" ? (
      <FileDownloadDone sx={{ fontSize: 22 }} />
    ) : download.status === "downloading" ? (
      <DownloadingOutlined sx={{ fontSize: 22 }} />
    ) : (
      <FileDownloadOutlined sx={{ fontSize: 22 }} />
    );

  const downloadColor =
    download.status === "downloaded"
      ? "#22c55e"
      : download.status === "downloading"
        ? "#C8102E"
        : "#fff";

  const downloadTooltip = !download.isPWA
    ? "Tải phim — Cần cài ứng dụng"
    : download.status === "downloading"
      ? `Đang tải ${download.progress?.percent ?? 0}%`
      : download.status === "downloaded"
        ? "Đã Tải phim"
        : "Tải phim";

  return (
    <>
      <Fade in={show} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 70%, rgba(0,0,0,0.9) 100%)",
            pointerEvents: "none",
          }}
        />
      </Fade>

      <Fade in={show} timeout={300}>
        <Box
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 1.5, md: 4 },
            py: { xs: 1.5, md: 2.5 },
            pointerEvents: show ? "auto" : "none",
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            sx={{ color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: { xs: "0.9rem", md: "1.1rem" },
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {movie.title}
            </Typography>
            {isSeries && episode.title && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.78rem",
                  mt: 0.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Tập {episode.episodeNumber} · {episode.title}
              </Typography>
            )}
          </Box>

          {onCommentToggle && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onCommentToggle();
              }}
              sx={{
                color: commentOpen ? "#C8102E" : "rgba(255,255,255,0.8)",
                display: { xs: "flex", md: "none" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
              aria-label="Bình luận"
            >
              <ChatBubbleOutlineRounded sx={{ fontSize: 22 }} />
            </IconButton>
          )}
        </Box>
      </Fade>

      <Fade in={show} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            px: { xs: 1.5, md: 4 },
            pb: { xs: 1.5, md: 2 },
            pointerEvents: show ? "auto" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Box sx={{ mb: { xs: 0.25, md: 1 } }}>
            <Slider
              value={currentTime}
              min={0}
              max={duration || 100}
              step={1}
              onChange={(_, val) => onSeek(val as number)}
              sx={{
                color: "#C8102E",
                height: 4,
                padding: "10px 0",
                "& .MuiSlider-thumb": {
                  width: 14,
                  height: 14,
                  opacity: 0,
                  transition: "opacity 0.2s",
                  "&:hover, &.Mui-focusVisible": { opacity: 1 },
                },
                "& .MuiSlider-thumb:hover": { opacity: 1 },
                "&:hover .MuiSlider-thumb": { opacity: 1 },
                "& .MuiSlider-track": { border: "none" },
                "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.25, md: 0.5 } }}>
            {isSeries && (
              <Tooltip
                title={
                  previousEpisode ? `Tập trước: ${previousEpisode.title}` : "Không có tập trước"
                }
              >
                <span>
                  <IconButton
                    onClick={() => previousEpisode && onEpisodeSelect(previousEpisode)}
                    disabled={!previousEpisode}
                    sx={{
                      color: "#fff",
                      "&.Mui-disabled": { color: "rgba(255,255,255,0.3)" },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    aria-label="Tập trước"
                  >
                    <SkipPrevious />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}>
              <IconButton
                onClick={onPlay}
                sx={{ color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Tooltip>

            {isSeries && (
              <Tooltip
                title={
                  nextEpisode ? `Tập tiếp theo: ${nextEpisode.title}` : "Không có tập tiếp theo"
                }
              >
                <span>
                  <IconButton
                    onClick={() => nextEpisode && onEpisodeSelect(nextEpisode)}
                    disabled={!nextEpisode}
                    sx={{
                      color: "#fff",
                      "&.Mui-disabled": { color: "rgba(255,255,255,0.3)" },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    aria-label="Tập tiếp theo"
                  >
                    <SkipNext />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {!isIOS && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: { xs: "auto", md: 120 },
                }}
              >
                <Tooltip title={isMuted ? "Bật âm (M)" : "Tắt âm (M)"}>
                  <IconButton
                    ref={muteButtonRef}
                    onClick={handleVolumeButtonClick}
                    sx={{ color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                    aria-label={isMuted ? "Bật âm" : "Tắt âm"}
                  >
                    {isMuted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                </Tooltip>
                <Slider
                  value={isMuted ? 0 : volume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(_, val) => onVolumeChange(val as number)}
                  sx={{
                    color: "#fff",
                    width: 72,
                    display: { xs: "none", md: "block" },
                    "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.3)" },
                    "& .MuiSlider-thumb": { width: 12, height: 12 },
                  }}
                />
              </Box>
            )}

            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.72rem", md: "0.82rem" },
                ml: { xs: 0.5, md: 1 },
                whiteSpace: "nowrap",
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ position: "relative", display: { xs: "none", md: "block" } }}>
              <Tooltip title="Tốc độ phát">
                <IconButton
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowQualityMenu(false);
                  }}
                  sx={{
                    color: "#fff",
                    fontSize: "0.75rem",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <SlowMotionVideo sx={{ fontSize: 18 }} />
                  <Typography sx={{ ml: 0.3, fontSize: "0.7rem", color: "#fff" }}>
                    {playbackSpeed}x
                  </Typography>
                </IconButton>
              </Tooltip>
              {showSpeedMenu && (
                <Box sx={menuBoxSx}>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <Box
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      sx={{
                        px: 2.5,
                        py: 1,
                        color: speed === playbackSpeed ? "#C8102E" : "#fff",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontWeight: speed === playbackSpeed ? 700 : 400,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      {speed}x
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ position: "relative", display: { xs: "none", md: "block" } }}>
              <Tooltip title="Chất lượng video">
                <IconButton
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                  }}
                  sx={{
                    color: currentQuality !== "720p" ? "#C8102E" : "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Hd sx={{ fontSize: 20 }} />
                  <Typography sx={{ ml: 0.3, fontSize: "0.65rem", color: "inherit" }}>
                    {currentQuality}
                  </Typography>
                </IconButton>
              </Tooltip>
              {showQualityMenu && (
                <Box sx={{ ...menuBoxSx, minWidth: 160 }}>
                  {ALL_QUALITIES.map((q) => {
                    const qIdx = QUALITY_ORDER.indexOf(q);
                    const isLocked = qIdx > maxQualityIdx;
                    const isAvailable =
                      availableQualities.length === 0 || availableQualities.includes(q);
                    const isActive = q === currentQuality;
                    return (
                      <Box
                        key={q}
                        onClick={() => handleQualityClick(q)}
                        sx={{
                          px: 2,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          color: isLocked
                            ? "rgba(255,255,255,0.35)"
                            : isActive
                              ? "#C8102E"
                              : isAvailable
                                ? "#fff"
                                : "rgba(255,255,255,0.35)",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.85rem",
                          cursor: isAvailable || isLocked ? "pointer" : "default",
                          fontWeight: isActive ? 700 : 400,
                          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                        }}
                      >
                        <span>{qualityLabel(q)}</span>
                        {isLocked && <Lock sx={{ fontSize: 13, opacity: 0.6 }} />}
                        {!isLocked && isActive && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "#C8102E",
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {isSeries && (
              <Tooltip title="Danh sách tập">
                <IconButton
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  sx={{
                    color: showEpisodes ? "#C8102E" : "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <ListAlt />
                </IconButton>
              </Tooltip>
            )}

            {onCommentToggle && (
              <Tooltip title="Bình luận">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onCommentToggle();
                  }}
                  sx={{
                    color: commentOpen ? "#C8102E" : "#fff",
                    display: { xs: "none", md: "flex" },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <ChatBubbleOutlineRounded sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            )}

            {download.mounted && (
              <Tooltip title={downloadTooltip}>
                <IconButton
                  onClick={handleDownloadClick}
                  sx={{
                    color: downloadColor,
                    display: { xs: "none", md: "inline-flex" },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                  aria-label="Tải phim"
                >
                  {downloadIcon}
                </IconButton>
              </Tooltip>
            )}

            {!isIOS && (
              <Tooltip title="Picture in Picture">
                <IconButton
                  onClick={handlePiP}
                  sx={{
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    display: { xs: "none", md: "flex" },
                  }}
                >
                  <PictureInPicture sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Tuỳ chọn khác">
              <IconButton
                onClick={(e) => setOverflowAnchor(e.currentTarget)}
                sx={{
                  color: "#fff",
                  display: { xs: "inline-flex", md: "none" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
                aria-label="Tuỳ chọn khác"
              >
                <MoreVert />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}>
              <IconButton
                onClick={onFullscreen}
                sx={{ color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      <Popover
        open={Boolean(volumeAnchor)}
        anchorEl={volumeAnchor}
        onClose={() => setVolumeAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            onClick: (e) => e.stopPropagation(),
            onPointerDown: (e) => e.stopPropagation(),
            sx: {
              bgcolor: "rgba(20,20,20,0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              px: 1,
              py: 1.5,
              mb: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              height: 140,
              backgroundImage: "none",
            },
          },
        }}
        sx={{ zIndex: 2147483647 }}
        container={fullscreenContainer ?? undefined}
        disableScrollLock
      >
        <Slider
          orientation="vertical"
          value={isMuted ? 0 : volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(_, val) => onVolumeChange(val as number)}
          sx={{
            color: "#C8102E",
            height: 96,
            "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.3)" },
            "& .MuiSlider-thumb": { width: 18, height: 18 },
          }}
        />
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          size="small"
          sx={{ color: "#fff" }}
          aria-label={isMuted ? "Bật âm" : "Tắt âm"}
        >
          {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
        </IconButton>
      </Popover>

      <Menu
        anchorEl={overflowAnchor}
        open={Boolean(overflowAnchor)}
        onClose={() => setOverflowAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        PaperProps={{
          sx: {
            bgcolor: "rgba(20,20,20,0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 2,
            color: "#fff",
            minWidth: 220,
            backgroundImage: "none",
          },
        }}
        sx={{ zIndex: 2147483647 }}
        container={fullscreenContainer ?? undefined}
        disableScrollLock
      >
        <MenuItem
          onClick={() => {
            setOverflowAnchor(null);
            setShowQualityMenu(true);
          }}
          sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
        >
          <ListItemIcon>
            <Hd sx={{ color: currentQuality !== "720p" ? "#C8102E" : "#fff" }} />
          </ListItemIcon>
          <ListItemText
            primary="Chất lượng"
            secondary={qualityLabel(currentQuality)}
            primaryTypographyProps={{ fontSize: "0.88rem" }}
            secondaryTypographyProps={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOverflowAnchor(null);
            setShowSpeedMenu(true);
          }}
          sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
        >
          <ListItemIcon>
            <SlowMotionVideo sx={{ color: "#fff" }} />
          </ListItemIcon>
          <ListItemText
            primary="Tốc độ phát"
            secondary={`${playbackSpeed}x`}
            primaryTypographyProps={{ fontSize: "0.88rem" }}
            secondaryTypographyProps={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}
          />
        </MenuItem>
        {download.mounted && (
          <MenuItem
            onClick={handleDownloadClick}
            sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
          >
            <ListItemIcon sx={{ color: downloadColor }}>{downloadIcon}</ListItemIcon>
            <ListItemText
              primary="Tải phim"
              secondary={
                download.status === "downloading"
                  ? `${download.progress?.percent ?? 0}%`
                  : download.status === "downloaded"
                    ? "Đã tải"
                    : !download.isPWA
                      ? "Cần cài ứng dụng"
                      : undefined
              }
              primaryTypographyProps={{ fontSize: "0.88rem" }}
              secondaryTypographyProps={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}
            />
          </MenuItem>
        )}
        {!isIOS && (
          <MenuItem onClick={handlePiP} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
            <ListItemIcon>
              <PictureInPicture sx={{ color: "#fff" }} />
            </ListItemIcon>
            <ListItemText
              primary="Picture in Picture"
              primaryTypographyProps={{ fontSize: "0.88rem" }}
            />
          </MenuItem>
        )}
      </Menu>

      {showSpeedMenu && isCompact && (
        <Dialog
          open
          onClose={() => setShowSpeedMenu(false)}
          container={fullscreenContainer ?? undefined}
          sx={{ zIndex: 2147483647 }}
          PaperProps={{
            sx: {
              bgcolor: "rgba(20,20,20,0.97)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "#fff",
              minWidth: 220,
            },
          }}
        >
          <DialogTitle sx={{ fontSize: "0.95rem", fontWeight: 700, pb: 1 }}>
            Tốc độ phát
          </DialogTitle>
          <DialogContent sx={{ p: 0, "&:first-of-type": { pt: 0 } }}>
            {PLAYBACK_SPEEDS.map((speed) => (
              <Box
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                sx={{
                  px: 3,
                  py: 1.25,
                  color: speed === playbackSpeed ? "#C8102E" : "#fff",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: speed === playbackSpeed ? 700 : 400,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                {speed}x
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      )}

      {showQualityMenu && isCompact && (
        <Dialog
          open
          onClose={() => setShowQualityMenu(false)}
          container={fullscreenContainer ?? undefined}
          sx={{ zIndex: 2147483647 }}
          PaperProps={{
            sx: {
              bgcolor: "rgba(20,20,20,0.97)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "#fff",
              minWidth: 240,
            },
          }}
        >
          <DialogTitle sx={{ fontSize: "0.95rem", fontWeight: 700, pb: 1 }}>
            Chất lượng video
          </DialogTitle>
          <DialogContent sx={{ p: 0, "&:first-of-type": { pt: 0 } }}>
            {ALL_QUALITIES.map((q) => {
              const qIdx = QUALITY_ORDER.indexOf(q);
              const isLocked = qIdx > maxQualityIdx;
              const isAvailable = availableQualities.length === 0 || availableQualities.includes(q);
              const isActive = q === currentQuality;
              return (
                <Box
                  key={q}
                  onClick={() => {
                    handleQualityClick(q);
                    setShowQualityMenu(false);
                  }}
                  sx={{
                    px: 3,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    color: isLocked
                      ? "rgba(255,255,255,0.35)"
                      : isActive
                        ? "#C8102E"
                        : isAvailable
                          ? "#fff"
                          : "rgba(255,255,255,0.35)",
                    fontSize: "0.9rem",
                    cursor: isAvailable || isLocked ? "pointer" : "default",
                    fontWeight: isActive ? 700 : 400,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                  }}
                >
                  <span>{qualityLabel(q)}</span>
                  {isLocked && <Lock sx={{ fontSize: 14, opacity: 0.6 }} />}
                  {!isLocked && isActive && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "#C8102E",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </DialogContent>
        </Dialog>
      )}

      {showEpisodes && isSeries && (
        <EpisodeList
          episodes={episodes}
          currentEpisode={episode}
          onSelect={(ep) => {
            onEpisodeSelect(ep);
            setShowEpisodes(false);
          }}
          onClose={() => setShowEpisodes(false)}
          container={fullscreenContainer ?? undefined}
        />
      )}

      <Dialog
        open={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
        onClick={(e) => e.stopPropagation()}
        container={fullscreenContainer ?? undefined}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 2147483647 }}
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
                {download.isInstalled && !download.canDownloadOffline
                  ? "Yêu cầu gói Premium Plus"
                  : download.isInstalled
                    ? "Mở trong ứng dụng"
                    : "Cài Gió Phim để Tải phim"}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", mt: 0.3 }}>
                {download.isInstalled && !download.canDownloadOffline
                  ? "Tính năng tải phim chỉ dành cho gói Premium Plus"
                  : download.isInstalled
                    ? "Bạn đã cài Gió Phim — mở app để tải phim"
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

          {download.isInstalled && download.canDownloadOffline && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(200,16,46,0.06)",
                border: "1px solid rgba(200,16,46,0.15)",
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", color: "#C0C0C0", lineHeight: 1.6 }}>
                Ứng dụng Gió Phim đã được cài. Mở ứng dụng và truy cập trang phim để tải về.
              </Typography>
            </Box>
          )}
          {download.isInstalled && !download.canDownloadOffline && (
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
          {!download.isInstalled && showIOSGuide && <IOSInstallInstructions />}
          {!download.isInstalled && isUnsupportedIOSBrowser && (
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
          {!download.isInstalled &&
            !download.canInstall &&
            !showIOSGuide &&
            !isUnsupportedIOSBrowser && (
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
            onClick={() => setShowDownloadDialog(false)}
            sx={{ color: "#8A8A8A", textTransform: "none", fontWeight: 600, flex: 1 }}
          >
            Để sau
          </Button>
          {download.isInstalled && !download.canDownloadOffline ? (
            <Button
              variant="contained"
              onClick={() => {
                router.push("/pricing");
                setShowDownloadDialog(false);
              }}
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
          ) : download.isInstalled ? (
            <Button
              variant="contained"
              onClick={() => {
                window.open(window.location.href, "_blank");
                setShowDownloadDialog(false);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                bgcolor: "#C8102E",
                "&:hover": { bgcolor: "#a50d26" },
                flex: 2,
              }}
            >
              Mở ứng dụng
            </Button>
          ) : download.canInstall ? (
            <Button
              variant="contained"
              onClick={handleInstallFromDialog}
              disabled={installing}
              startIcon={<FileDownloadOutlined />}
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
              onClick={() => setShowDownloadDialog(false)}
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
