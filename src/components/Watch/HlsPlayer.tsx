"use client";

import { useEffect, useRef, RefObject } from "react";
import Hls from "hls.js";
import { Box } from "@mui/material";

interface HlsPlayerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  onTimeUpdate?: () => void;
  onDurationChange?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onLoaded?: () => void;
}

export default function HlsPlayer({
  videoRef,
  src,
  onTimeUpdate,
  onDurationChange,
  onPlay,
  onPause,
  onEnded,
  onLoaded,
}: HlsPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => onTimeUpdate?.();
    const handleDuration = () => onDurationChange?.(video.duration);
    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();
    const handleEnded = () => onEnded?.();
    const handleLoaded = () => onLoaded?.();

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadeddata", handleLoaded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadeddata", handleLoaded);
    };
  }, [onTimeUpdate, onDurationChange, onPlay, onPause, onEnded, onLoaded]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#000",
      }}
    >
      <video
        ref={videoRef as RefObject<HTMLVideoElement>}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload nofullscreen noremoteplayback"
      />
    </Box>
  );
}
