"use client";

import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Box, Button, LinearProgress } from "@mui/material";
import { SkipNext, VolumeUp, VolumeOff, PlayArrow } from "@mui/icons-material";
import { Advertisement } from "@/modules/advertisement/types/advertisement";

interface AdOverlayProps {
  ad: Advertisement;
  onSkip: () => void;
  onEnded: () => void;
  preserveAudioOnAutoplay?: boolean;
}

const isOurBackend = (url: string) => {
  try {
    const u = new URL(url, window.location.href);
    return u.hostname.endsWith("libsys.me") || u.hostname === window.location.hostname;
  } catch {
    return false;
  }
};

export default function AdOverlay({
  ad,
  onSkip,
  onEnded,
  preserveAudioOnAutoplay = false,
}: AdOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);
  const hasEndedRef = useRef(false);
  const skipAfterSeconds = Math.max(0, ad.skipAfterSeconds ?? 0);
  const canSkip = ad.isSkippable && currentTime >= skipAfterSeconds;

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    hasEndedRef.current = false;
    const video = videoRef.current;

    if (!ad.videoUrl) {
      const t = window.setTimeout(() => {
        if (!hasEndedRef.current) {
          hasEndedRef.current = true;
          onEnded();
        }
      }, 800);
      return () => window.clearTimeout(t);
    }

    if (!video) return;

    video.setAttribute("playsinline", "");
    video.muted = false;

    let progressCheckTimer: number | null = null;
    let lastProgressTime = 0;

    const startProgressWatchdog = () => {
      lastProgressTime = Date.now();
      progressCheckTimer = window.setInterval(() => {
        if (hasEndedRef.current) return;
        if (!video) return;
        if (video.currentTime > 0.1) {
          lastProgressTime = Date.now();
          return;
        }
        if (Date.now() - lastProgressTime > 6000) {
          hasEndedRef.current = true;
          onEnded();
        }
      }, 1000);
    };

    const safetyTimer = window.setTimeout(() => {
      if (!hasEndedRef.current && video.currentTime < 0.1) {
        hasEndedRef.current = true;
        onEnded();
      }
    }, 12000);

    const handleVideoError = () => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;
      window.clearTimeout(safetyTimer);
      if (progressCheckTimer) window.clearInterval(progressCheckTimer);
      onEnded();
    };

    video.addEventListener("error", handleVideoError);

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            setNeedsUserPlay(false);
            setIsMuted(video.muted);
            startProgressWatchdog();
          })
          .catch(() => {
            if (preserveAudioOnAutoplay) {
              setNeedsUserPlay(true);
              return;
            }
            video.muted = true;
            setIsMuted(true);
            video
              .play()
              .then(() => startProgressWatchdog())
              .catch(() => handleVideoError());
          });
      } else {
        startProgressWatchdog();
      }
    };

    const canPlayNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (canPlayNativeHls) {
      video.src = ad.videoUrl;
      tryPlay();
    } else if (Hls.isSupported() && ad.videoUrl.includes(".m3u8")) {
      const hls = new Hls({
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
        fragLoadingMaxRetry: 4,
        xhrSetup: (xhr, url) => {
          if (url.startsWith("blob:")) return;
          if (isOurBackend(url)) {
            xhr.withCredentials = true;
          }
        },
      });
      hlsRef.current = hls;
      hls.loadSource(ad.videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          handleVideoError();
        }
      });
    } else {
      video.src = ad.videoUrl;
      tryPlay();
    }

    return () => {
      window.clearTimeout(safetyTimer);
      if (progressCheckTimer) window.clearInterval(progressCheckTimer);
      video.removeEventListener("error", handleVideoError);
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [ad.videoUrl, onEnded, preserveAudioOnAutoplay]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
    if (!next) {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  };

  const handleEnded = () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    onEnded();
  };

  const startWithUserGesture = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setNeedsUserPlay(false);
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => setNeedsUserPlay(true));
  };

  const adLabel =
    ad.adType === "PRE_ROLL"
      ? "Quảng cáo trước phim"
      : ad.adType === "MID_ROLL"
        ? "Quảng cáo giữa phim"
        : "Quảng cáo sau phim";

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        bgcolor: "#000",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      <video
        ref={videoRef}
        onEnded={handleEnded}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onDurationChange={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        playsInline
        autoPlay
        crossOrigin={ad.videoUrl && isOurBackend(ad.videoUrl) ? "use-credentials" : "anonymous"}
      />

      {needsUserPlay && (
        <Box
          onClick={startWithUserGesture}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.38)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.92)",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 42px rgba(0,0,0,0.35)",
            }}
          >
            <PlayArrow sx={{ fontSize: 44 }} />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          bgcolor: "rgba(0,0,0,0.6)",
          color: "#fff",
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          fontSize: "0.75rem",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        {adLabel}
      </Box>

      <Box
        onClick={toggleMute}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: "rgba(0,0,0,0.6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background-color 0.2s",
          "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
        }}
      >
        {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
      </Box>

      {ad.targetUrl && (
        <Box
          onClick={() => window.open(ad.targetUrl, "_blank")}
          sx={{
            position: "absolute",
            bottom: 72,
            left: 16,
            bgcolor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            borderRadius: 1,
            px: 2,
            py: 1,
            cursor: "pointer",
            fontSize: "0.8rem",
            fontFamily: "Inter, sans-serif",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          Tìm hiểu thêm
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        {!ad.isSkippable ? (
          <Box
            sx={{
              bgcolor: "rgba(0,0,0,0.7)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: 1.5,
              px: 2,
              py: 1,
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Không thể bỏ qua quảng cáo
          </Box>
        ) : !canSkip ? (
          <Box
            sx={{
              bgcolor: "rgba(0,0,0,0.7)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: 1.5,
              px: 2,
              py: 1,
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Có thể bỏ qua sau
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {Math.max(0, Math.ceil(skipAfterSeconds - currentTime))}
            </Box>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<SkipNext />}
            onClick={onSkip}
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              color: "#000",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              borderRadius: 1.5,
              px: 2.5,
              textTransform: "none",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            Bỏ qua quảng cáo
          </Button>
        )}
      </Box>

      {duration > 0 && (
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (currentTime / duration) * 100)}
            sx={{
              height: 3,
              bgcolor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": { bgcolor: "#C8102E" },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
