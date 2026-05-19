"use client";

import { useEffect, useRef, useState, RefObject } from "react";
import Hls from "hls.js";
import { Box, Typography } from "@mui/material";

interface HlsPlayerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  offlineSrc?: string;
  startTime?: number;
  shouldPlay?: boolean;
  defaultMuted?: boolean;
  nativeControls?: boolean;
  onTimeUpdate?: () => void;
  onDurationChange?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onLoaded?: () => void;
  onMutedChange?: (muted: boolean) => void;
}

const detectNativeHls = () => {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("video");
  return probe.canPlayType("application/vnd.apple.mpegurl") !== "";
};

const isOurBackend = (url: string) => {
  try {
    const u = new URL(url, window.location.href);
    return u.hostname.endsWith("libsys.me") || u.hostname === window.location.hostname;
  } catch {
    return false;
  }
};

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

export default function HlsPlayer({
  videoRef,
  src,
  offlineSrc,
  startTime = 0,
  shouldPlay = true,
  defaultMuted = false,
  nativeControls = false,
  onTimeUpdate,
  onDurationChange,
  onPlay,
  onPause,
  onEnded,
  onLoaded,
  onMutedChange,
}: HlsPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);
  const hasAppliedStartTimeRef = useRef(false);
  const startTimeRef = useRef(startTime);
  const shouldPlayRef = useRef(shouldPlay);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useNativeHls] = useState<boolean>(detectNativeHls);

  const actualSrc = offlineSrc || src;

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    shouldPlayRef.current = shouldPlay;
  }, [shouldPlay]);

  useEffect(() => {
    hasAppliedStartTimeRef.current = false;
    setErrorMsg(null);
  }, [src, offlineSrc]);

  const tryPlayWithMutedFallback = async (video: HTMLVideoElement) => {
    const wasMuted = video.muted;
    if (wasMuted) {
      video.muted = false;
    }
    try {
      await video.play();
      onMutedChange?.(false);
      return;
    } catch {
      video.muted = true;
      onMutedChange?.(true);
      try {
        await video.play();
      } catch {
        // playback still blocked. user must tap.
      }
    }
  };

  useEffect(() => {
    if (useNativeHls) return;
    const video = videoRef.current;
    if (!video) return;
    if (!actualSrc) return;

    const applyStartTime = () => {
      const target = startTimeRef.current;
      if (hasAppliedStartTimeRef.current || target <= 5) return;
      if (Number.isFinite(video.duration) && target >= video.duration) return;
      video.currentTime = target;
      hasAppliedStartTimeRef.current = true;
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeMaxRetry: 10,
        nudgeOffset: 0.2,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingMaxRetry: 6,
        startFragPrefetch: true,
        progressive: true,
        abrEwmaDefaultEstimate: 5_000_000,
        abrBandWidthFactor: 0.9,
        abrBandWidthUpFactor: 0.7,
        startLevel: -1,
        xhrSetup: (xhr, url) => {
          if (url.startsWith("blob:")) return;
          if (isOurBackend(url)) {
            xhr.withCredentials = true;
            const token = getAccessToken();
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          }
        },
      });
      hlsRef.current = hls;
      hls.loadSource(actualSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        applyStartTime();
        if (shouldPlayRef.current) void tryPlayWithMutedFallback(video);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            try {
              hls.startLoad();
            } catch {
              setErrorMsg(`HLS ${data.type}: ${data.details}`);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            try {
              hls.recoverMediaError();
            } catch {
              try {
                hls.swapAudioCodec();
                hls.recoverMediaError();
              } catch {
                setErrorMsg(`HLS ${data.type}: ${data.details}`);
              }
            }
            break;
          default:
            try {
              hls.destroy();
            } catch {
              // ignore
            }
            setErrorMsg(`HLS ${data.type}: ${data.details}`);
            break;
        }
      });
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [actualSrc, videoRef, useNativeHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!useNativeHls) return;
    if (!actualSrc) return;

    const onLoadedMeta = () => {
      const target = startTimeRef.current;
      if (
        !hasAppliedStartTimeRef.current &&
        target > 5 &&
        (!Number.isFinite(video.duration) || target < video.duration)
      ) {
        video.currentTime = target;
        hasAppliedStartTimeRef.current = true;
      }
      if (shouldPlayRef.current) void tryPlayWithMutedFallback(video);
    };
    video.addEventListener("loadedmetadata", onLoadedMeta, { once: true });
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMeta);
    };
  }, [actualSrc, videoRef, useNativeHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay) {
      void tryPlayWithMutedFallback(video);
      return;
    }

    video.pause();
  }, [shouldPlay, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => onTimeUpdate?.();
    const emitDurationIfReady = () => {
      const d = video.duration;
      if (typeof d === "number" && Number.isFinite(d) && d > 0) {
        onDurationChange?.(d);
      }
    };
    const handleDuration = () => emitDurationIfReady();
    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();
    const handleEnded = () => onEnded?.();
    const handleVolumeChange = () => onMutedChange?.(video.muted);
    const handleLoaded = () => {
      const target = startTimeRef.current;
      if (
        !hasAppliedStartTimeRef.current &&
        target > 5 &&
        (!Number.isFinite(video.duration) || target < video.duration)
      ) {
        video.currentTime = target;
        hasAppliedStartTimeRef.current = true;
      }
      emitDurationIfReady();
      onLoaded?.();
    };
    const handleError = () => {
      const err = video.error;
      if (!err) return;
      const codes: Record<number, string> = {
        1: "MEDIA_ERR_ABORTED",
        2: "MEDIA_ERR_NETWORK",
        3: "MEDIA_ERR_DECODE",
        4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
      };
      setErrorMsg(`${codes[err.code] || "ERR"} ${err.message || ""}`.trim());
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDuration);
    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("canplay", handleLoaded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("error", handleError);

    if (Number.isFinite(video.duration) && video.duration > 0) {
      onDurationChange?.(video.duration);
    }
    if (video.readyState >= 1) {
      onTimeUpdate?.();
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDuration);
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("error", handleError);
    };
  }, [onTimeUpdate, onDurationChange, onPlay, onPause, onEnded, onLoaded, onMutedChange, videoRef]);

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
        src={useNativeHls ? actualSrc : undefined}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
        playsInline
        muted={defaultMuted}
        autoPlay={shouldPlay}
        preload="auto"
        controls={nativeControls}
        x-webkit-airplay="allow"
        webkit-playsinline="true"
        crossOrigin={
          useNativeHls && actualSrc && isOurBackend(actualSrc) ? "use-credentials" : undefined
        }
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload noremoteplayback"
      />
      {errorMsg && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            bgcolor: "rgba(200,16,46,0.92)",
            color: "#fff",
            borderRadius: 1.5,
            px: 2,
            py: 1.25,
            fontFamily: "Inter, sans-serif",
            fontSize: "0.78rem",
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
            Lỗi phát video
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
            {errorMsg}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
