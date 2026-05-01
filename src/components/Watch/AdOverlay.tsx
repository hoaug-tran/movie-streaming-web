"use client";

import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Box, Button, LinearProgress } from "@mui/material";
import { SkipNext } from "@mui/icons-material";
import { Advertisement } from "@/modules/advertisement/types/advertisement";

interface AdOverlayProps {
  ad: Advertisement;
  onSkip: () => void;
  onEnded: () => void;
}

export default function AdOverlay({ ad, onSkip, onEnded }: AdOverlayProps) {
  const SKIP_DELAY = 10;
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [adDuration, setAdDuration] = useState(0);
  const canSkip = secondsWatched >= SKIP_DELAY;

  useEffect(() => {
    setSecondsWatched(0);
    const video = videoRef.current;
    if (!video || !ad.videoUrl) return;

    if (Hls.isSupported() && ad.videoUrl.includes(".m3u8")) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(ad.videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else {
      video.src = ad.videoUrl;
      video.play().catch(() => {});
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [ad.videoUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsWatched((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnded = () => {
    onEnded();
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
        onDurationChange={() => {
          if (videoRef.current) setAdDuration(videoRef.current.duration);
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        playsInline
      />

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
          Tìm hiểu thêm →
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
        {!canSkip ? (
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
              {SKIP_DELAY - secondsWatched}
            </Box>
            Có thể bỏ qua sau
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

      {adDuration > 0 && (
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <LinearProgress
            variant="determinate"
            value={(secondsWatched / adDuration) * 100}
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
