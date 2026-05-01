"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { Episode, MovieDetail } from "@/modules/movie/types/movie";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import HlsPlayer from "./HlsPlayer";
import PlayerControls from "./PlayerControls";
import AdOverlay from "./AdOverlay";
import { Advertisement } from "@/modules/advertisement/types/advertisement";
import advertisementService from "@/modules/advertisement/api/advertisement-service";
import watchHistoryService from "@/modules/watch-history/api/watch-history-service";

interface WatchPlayerProps {
  movie: MovieDetail;
  episodes: Episode[];
  currentEpisode: Episode;
  initialResumeSecond?: number;
}

export default function WatchPlayer({
  movie,
  episodes,
  currentEpisode,
  initialResumeSecond,
}: WatchPlayerProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { hasAdsFree } = useSubscription();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resumeStartTime, setResumeStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(currentEpisode);

  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [adPhase, setAdPhase] = useState<"PRE_ROLL" | "MID_ROLL" | "POST_ROLL" | null>(null);
  const [adsForEpisode, setAdsForEpisode] = useState<{
    preRoll: Advertisement[];
    midRoll: Advertisement[];
    postRoll: Advertisement[];
  }>({ preRoll: [], midRoll: [], postRoll: [] });
  const [midRollFired, setMidRollFired] = useState(false);
  const [postRollFired, setPostRollFired] = useState(false);
  const [midRollTimestamp, setMidRollTimestamp] = useState<number>(0);

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedProgress = useRef<number>(0);
  const pendingResumeSecondRef = useRef<number | null>(null);
  const selectedEpisodeRef = useRef(currentEpisode);
  const currentAdRef = useRef<Advertisement | null>(null);
  const isLeavingRef = useRef(false);

  const pickRandom = <T,>(arr: T[]): T | null =>
    arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  useEffect(() => {
    if (hasAdsFree || !isAuthenticated) return;

    const loadAds = async () => {
      const [pre, mid, post] = await Promise.all([
        advertisementService.getAdsByType("PRE_ROLL"),
        advertisementService.getAdsByType("MID_ROLL"),
        advertisementService.getAdsByType("POST_ROLL"),
      ]);
      setAdsForEpisode({ preRoll: pre, midRoll: mid, postRoll: post });
      const preAd = pickRandom(pre);
      if (preAd) {
        setCurrentAd(preAd);
        setAdPhase("PRE_ROLL");
        if (preAd.id) {
          advertisementService.trackView({
            advertisementId: preAd.id,
            movieId: movie.id,
            episodeId: selectedEpisode.id,
          });
        }
      }
    };

    loadAds();
  }, [selectedEpisode.id, hasAdsFree, isAuthenticated, movie.id]);

  useEffect(() => {
    selectedEpisodeRef.current = selectedEpisode;
  }, [selectedEpisode]);

  useEffect(() => {
    currentAdRef.current = currentAd;
  }, [currentAd]);

  const saveProgress = useCallback(
    async (force = false) => {
      if (!isAuthenticated || currentAdRef.current || !videoRef.current) return false;
      const t = Math.floor(videoRef.current.currentTime);
      const d =
        Math.floor(videoRef.current.duration) || selectedEpisodeRef.current.durationSeconds || 0;
      if (t <= 0 && !force) return false;
      if (!force && Math.abs(t - lastSavedProgress.current) < 3) return false;
      lastSavedProgress.current = t;

      try {
        await watchHistoryService.upsert({
          movieId: movie.id,
          episodeId: selectedEpisodeRef.current.id,
          watchedDurationSeconds: d > 0 ? Math.min(t, d) : t,
          stoppedAtSecond: d > 0 ? Math.min(t, d) : t,
          isCompleted: d > 0 && (t >= d - 10 || t >= Math.floor(d * 0.95)),
        });
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated, movie.id]
  );

  const applyResumeSecond = useCallback((second: number) => {
    if (second <= 5) return;
    pendingResumeSecondRef.current = second;
    setResumeStartTime(second);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = second;
    setCurrentTime(second);
    lastSavedProgress.current = second;
  }, []);

  const handleVideoLoaded = useCallback(() => {
    const pendingSecond = pendingResumeSecondRef.current;
    if (pendingSecond && pendingSecond > 5) {
      applyResumeSecond(pendingSecond);
    }
  }, [applyResumeSecond]);

  useEffect(() => {
    setMidRollFired(false);
    setPostRollFired(false);
    setMidRollTimestamp(0);
    setCurrentAd(null);
    setAdPhase(null);
    setCurrentTime(0);
    setResumeStartTime(0);
    lastSavedProgress.current = 0;
    pendingResumeSecondRef.current = null;

    if (
      selectedEpisode.id === currentEpisode.id &&
      initialResumeSecond &&
      initialResumeSecond > 5
    ) {
      applyResumeSecond(initialResumeSecond);
      return;
    }

    if (isAuthenticated && movie.id && selectedEpisode.id) {
      watchHistoryService
        .getEpisodeProgress(movie.id, selectedEpisode.id)
        .then((h) => {
          if (h && h.stoppedAtSecond > 5 && !h.isCompleted) {
            applyResumeSecond(h.stoppedAtSecond);
          }
        })
        .catch(() => {});
    }
  }, [
    selectedEpisode.id,
    currentEpisode.id,
    initialResumeSecond,
    isAuthenticated,
    movie.id,
    applyResumeSecond,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    progressSaveRef.current = setInterval(() => {
      if (!videoRef.current || !isPlaying) return;
      void saveProgress(false);
    }, 5000);

    return () => {
      if (progressSaveRef.current) clearInterval(progressSaveRef.current);
      void saveProgress(true);
    };
  }, [isPlaying, isAuthenticated, saveProgress]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    const d = videoRef.current.duration;
    const pendingSecond = pendingResumeSecondRef.current;
    if (pendingSecond && Math.abs(t - pendingSecond) < 2) {
      pendingResumeSecondRef.current = null;
    }
    setCurrentTime(t);

    if (hasAdsFree) return;

    // MID_ROLL: Hard checkpoint at 50%, trigger once
    if (!midRollFired && d > 60 && t >= d * 0.5) {
      const midAd = pickRandom(adsForEpisode.midRoll);
      if (midAd) {
        setMidRollFired(true);
        setMidRollTimestamp(t);
        videoRef.current.pause();
        setIsPlaying(false);
        setCurrentAd(midAd);
        setAdPhase("MID_ROLL");
        advertisementService.trackView({
          advertisementId: midAd.id,
          movieId: movie.id,
          episodeId: selectedEpisode.id,
        });
      }
    }

    // POST_ROLL: Between (mid-roll + 10min) and (end - 10min)
    // Only if video is long enough and mid-roll already fired
    if (!postRollFired && midRollFired && d > 1200) {
      const postRollStart = midRollTimestamp + 600; // 10 minutes after mid-roll
      const postRollEnd = d - 600; // 10 minutes before end

      if (t >= postRollStart && t <= postRollEnd) {
        const postAd = pickRandom(adsForEpisode.postRoll);
        if (postAd) {
          setPostRollFired(true);
          videoRef.current.pause();
          setIsPlaying(false);
          setCurrentAd(postAd);
          setAdPhase("POST_ROLL");
          advertisementService.trackView({
            advertisementId: postAd.id,
            movieId: movie.id,
            episodeId: selectedEpisode.id,
          });
        }
      }
    }
  }, [
    hasAdsFree,
    midRollFired,
    postRollFired,
    midRollTimestamp,
    adsForEpisode,
    selectedEpisode.id,
    movie.id,
  ]);

  const handleVideoEnded = useCallback(() => {
    if (isAuthenticated && movie.id) {
      watchHistoryService
        .upsert({
          movieId: movie.id,
          episodeId: selectedEpisode.id,
          watchedDurationSeconds: Math.floor(duration),
          stoppedAtSecond: Math.floor(duration),
          isCompleted: true,
        })
        .catch(() => {});
    }

    // Auto-play next episode if available
    const currentIdx = episodes.findIndex((e) => e.id === selectedEpisode.id);
    if (currentIdx >= 0 && currentIdx < episodes.length - 1) {
      setSelectedEpisode(episodes[currentIdx + 1]);
    }
  }, [episodes, selectedEpisode, duration, isAuthenticated, movie.id]);

  const handleAdSkipped = useCallback(() => {
    setCurrentAd(null);
    if (adPhase === "MID_ROLL" || adPhase === "PRE_ROLL") {
      videoRef.current?.play();
      setIsPlaying(true);
    }
    setAdPhase(null);
  }, [adPhase]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback(
    (value: number) => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = value;
      setCurrentTime(value);
      void saveProgress(true);
    },
    [saveProgress]
  );

  const handleVolumeChange = useCallback((value: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void saveProgress(true);
      }
    };
    const handleBeforeUnload = () => void saveProgress(true);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveProgress]);

  const handleBack = useCallback(async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    await saveProgress(true);
    router.back();
  }, [router, saveProgress]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          handleFullscreen();
          break;
        case "m":
          handleMuteToggle();
          break;
        case "ArrowLeft":
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case "ArrowRight":
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + 10
          );
          break;
        case "ArrowUp":
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, handleFullscreen, handleMuteToggle, handleVolumeChange, volume]);

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (!currentAd) togglePlay();
      }}
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#000",
        cursor: showControls || currentAd ? "default" : "none",
        userSelect: "none",
      }}
    >
      {!currentAd && (
        <HlsPlayer
          videoRef={videoRef}
          src={selectedEpisode.videoUrl ?? ""}
          startTime={resumeStartTime}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={(d) => setDuration(d)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false);
            saveProgress(true);
          }}
          onEnded={handleVideoEnded}
          onLoaded={handleVideoLoaded}
        />
      )}

      {currentAd && <AdOverlay ad={currentAd} onSkip={handleAdSkipped} onEnded={handleAdSkipped} />}

      {!currentAd && (
        <PlayerControls
          show={showControls}
          movie={movie}
          episode={selectedEpisode}
          episodes={episodes}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onPlay={togglePlay}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onFullscreen={handleFullscreen}
          onBack={handleBack}
          onEpisodeSelect={(ep) => setSelectedEpisode(ep)}
        />
      )}
    </Box>
  );
}
