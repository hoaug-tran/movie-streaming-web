"use client";

import { useState } from "react";
import { Box, IconButton, Slider, Tooltip, Typography, Fade } from "@mui/material";
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
} from "@mui/icons-material";
import { Episode, MovieDetail } from "@/modules/movie/types/movie";
import EpisodeList from "./EpisodeList";

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
  onPlay: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  onBack: () => void;
  onEpisodeSelect: (ep: Episode) => void;
}

function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
  onPlay,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreen,
  onBack,
  onEpisodeSelect,
}: PlayerControlsProps) {
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isSeries = movie.movieType === "SERIES" && episodes.length > 1;

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const videoEl = document.querySelector("video");
    if (videoEl) videoEl.playbackRate = speed;
    setShowSpeedMenu(false);
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
    } catch {}
  };

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
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 2, md: 4 },
            py: 2.5,
            pointerEvents: show ? "auto" : "none",
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: { xs: "0.9rem", md: "1.1rem" },
                lineHeight: 1.2,
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
                }}
              >
                Tập {episode.episodeNumber} · {episode.title}
              </Typography>
            )}
          </Box>
        </Box>
      </Fade>

      <Fade in={show} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            px: { xs: 2, md: 4 },
            pb: 2,
            pointerEvents: show ? "auto" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ mb: 1 }}>
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Tooltip title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}>
              <IconButton
                onClick={onPlay}
                sx={{
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Tooltip>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 120 }}>
              <Tooltip title={isMuted ? "Bật âm (M)" : "Tắt âm (M)"}>
                <IconButton
                  onClick={onMuteToggle}
                  sx={{
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
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
                  "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.3)" },
                  "& .MuiSlider-thumb": { width: 12, height: 12 },
                }}
              />
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.82rem",
                ml: 1,
                whiteSpace: "nowrap",
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ position: "relative" }}>
              <Tooltip title="Tốc độ phát">
                <IconButton
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
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
                <Box
                  sx={{
                    position: "absolute",
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
                  }}
                >
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

            <Tooltip title={isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}>
              <IconButton
                onClick={onFullscreen}
                sx={{
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {showEpisodes && isSeries && (
        <EpisodeList
          episodes={episodes}
          currentEpisode={episode}
          onSelect={(ep) => {
            onEpisodeSelect(ep);
            setShowEpisodes(false);
          }}
          onClose={() => setShowEpisodes(false)}
        />
      )}
    </>
  );
}
