"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { ContinueWatchingItem } from "@/modules/watch-history/types/watch-history";

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
  const queryClient = useQueryClient();
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
  const resumeAfterAdRef = useRef<number | null>(null);
  const preRollEpisodeIdRef = useRef<number | null>(null);
  const lastSavedItemRef = useRef<ContinueWatchingItem | null>(null);
  const lastPlaybackSecondRef = useRef(0);
  const lastDurationRef = useRef(0);

  const COMPLETION_PERCENT = 0.95;
  const COMPLETION_GRACE_SECONDS = 10;

  const pickHighestPriority = <T,>(arr: T[]): T | null => (arr.length > 0 ? arr[0] : null);

  const getFiniteDuration = useCallback(() => {
    const videoDuration = videoRef.current?.duration;
    if (Number.isFinite(videoDuration) && videoDuration > 0) {
      return Math.floor(videoDuration);
    }
    return lastDurationRef.current || selectedEpisodeRef.current.durationSeconds || 0;
  }, []);

  const updatePlaybackSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return { second: lastPlaybackSecondRef.current, duration: getFiniteDuration() };
    }

    const second = Math.max(lastPlaybackSecondRef.current, Math.floor(video.currentTime || 0));
    const duration = getFiniteDuration();
    lastPlaybackSecondRef.current = second;
    if (duration > 0) {
      lastDurationRef.current = duration;
    }
    return { second, duration };
  }, [getFiniteDuration]);

  const isPlaybackCompleted = useCallback((second: number, totalDuration: number) => {
    if (totalDuration <= 0) return false;
    return (
      second >= totalDuration - COMPLETION_GRACE_SECONDS ||
      second >= Math.floor(totalDuration * COMPLETION_PERCENT)
    );
  }, []);

  const trackAdView = useCallback(
    (ad: Advertisement) => {
      if (!isAuthenticated || !ad.id) return;
      void advertisementService.trackView({
        advertisementId: ad.id,
        movieId: movie.id,
        episodeId: selectedEpisodeRef.current.id,
      });
    },
    [isAuthenticated, movie.id]
  );

  const showAd = useCallback(
    (ad: Advertisement, phase: "PRE_ROLL" | "MID_ROLL" | "POST_ROLL", resumeSecond?: number) => {
      if (resumeSecond !== undefined) {
        const safeSecond = Math.max(0, Math.floor(resumeSecond));
        setResumeStartTime(safeSecond);
        resumeAfterAdRef.current = safeSecond;
      }

      videoRef.current?.pause();
      setIsPlaying(false);
      setCurrentAd(ad);
      setAdPhase(phase);
      trackAdView(ad);
    },
    [trackAdView]
  );

  const resumeMainVideoAfterAd = useCallback(
    (resumeSecond: number | null, shouldResume: boolean) => {
      const video = videoRef.current;
      if (!video || !shouldResume) return;

      if (resumeSecond && resumeSecond > 5) {
        video.currentTime = resumeSecond;
        lastPlaybackSecondRef.current = Math.floor(resumeSecond);
        setCurrentTime(resumeSecond);
      }

      void video
        .play()
        .then(() => {
          setIsPlaying(true);
          resumeAfterAdRef.current = null;
        })
        .catch(() => {
          setIsPlaying(false);
        });
    },
    []
  );

  useEffect(() => {
    if (hasAdsFree) {
      setAdsForEpisode({ preRoll: [], midRoll: [], postRoll: [] });
      return;
    }

    let cancelled = false;

    const loadAds = async () => {
      const [pre, mid, post] = await Promise.all([
        advertisementService.getAdsByType("PRE_ROLL"),
        advertisementService.getAdsByType("MID_ROLL"),
        advertisementService.getAdsByType("POST_ROLL"),
      ]);

      if (cancelled) return;

      setAdsForEpisode({ preRoll: pre, midRoll: mid, postRoll: post });
      const preAd = pickHighestPriority(pre);
      if (preAd) {
        preRollEpisodeIdRef.current = selectedEpisode.id;
        showAd(preAd, "PRE_ROLL");
      }
    };

    loadAds();

    return () => {
      cancelled = true;
    };
  }, [selectedEpisode.id, hasAdsFree, showAd]);

  useEffect(() => {
    selectedEpisodeRef.current = selectedEpisode;
  }, [selectedEpisode]);

  useEffect(() => {
    currentAdRef.current = currentAd;
  }, [currentAd]);

  const saveProgress = useCallback(
    async (force = false) => {
      if (!isAuthenticated || !videoRef.current) return false;
      const adResumeSecond = currentAdRef.current ? resumeAfterAdRef.current : null;
      const videoSecond = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
      const t = Math.max(
        0,
        Math.floor(adResumeSecond ?? Math.max(videoSecond, lastPlaybackSecondRef.current))
      );
      const videoDuration =
        videoRef.current && Number.isFinite(videoRef.current.duration)
          ? Math.floor(videoRef.current.duration)
          : 0;
      const d =
        videoDuration || lastDurationRef.current || selectedEpisodeRef.current.durationSeconds || 0;
      if (t <= 0 && !force) return false;
      if (!force && Math.abs(t - lastSavedProgress.current) < 3) return false;
      lastSavedProgress.current = t;

      try {
        const savedHistory = await watchHistoryService.upsert({
          movieId: movie.id,
          episodeId: selectedEpisodeRef.current.id,
          watchedDurationSeconds: d > 0 ? Math.min(t, d) : t,
          stoppedAtSecond: d > 0 ? Math.min(t, d) : t,
          isCompleted: isPlaybackCompleted(t, d),
        });

        lastSavedItemRef.current = {
          movieId: savedHistory.movieId,
          episodeId: savedHistory.episodeId,
          episodeTitle: savedHistory.episodeTitle,
          episodeNumber: savedHistory.episodeNumber,
          episodeDurationSeconds: savedHistory.episodeDurationSeconds ?? d,
          stoppedAtSecond: savedHistory.stoppedAtSecond,
          watchedDurationSeconds: savedHistory.watchedDurationSeconds,
          resumeSecond: savedHistory.resumeSecond ?? savedHistory.stoppedAtSecond,
          progressPercent:
            savedHistory.progressPercent ??
            (d > 0 ? Math.min(100, (savedHistory.stoppedAtSecond * 100) / d) : 0),
          lastWatchedAt: savedHistory.lastWatchedAt,
          movie: savedHistory.movie ?? {
            id: movie.id,
            title: movie.title,
            slug: movie.slug,
            posterUrl: movie.posterUrl ?? undefined,
            bannerUrl: movie.bannerUrl ?? undefined,
            releaseYear: movie.releaseYear,
            movieType: movie.movieType,
            averageRating: movie.averageRating,
          },
        };
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated, isPlaybackCompleted, movie]
  );

  const applyResumeSecond = useCallback((second: number) => {
    const safeSecond = Math.max(0, Math.floor(second));
    if (safeSecond <= 5) return;
    pendingResumeSecondRef.current = safeSecond;
    lastPlaybackSecondRef.current = safeSecond;
    setResumeStartTime(safeSecond);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = safeSecond;
    setCurrentTime(safeSecond);
    lastSavedProgress.current = safeSecond;
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
    setAdsForEpisode({ preRoll: [], midRoll: [], postRoll: [] });
    if (preRollEpisodeIdRef.current !== selectedEpisode.id) {
      setCurrentAd(null);
      setAdPhase(null);
    }
    setCurrentTime(0);
    setResumeStartTime(0);
    resumeAfterAdRef.current = null;
    lastSavedProgress.current = 0;
    lastPlaybackSecondRef.current = 0;
    lastDurationRef.current = selectedEpisode.durationSeconds ?? 0;
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
    const safeSecond = Math.max(0, Math.floor(t));
    const safeDuration = Number.isFinite(d) ? Math.max(0, Math.floor(d)) : 0;
    lastPlaybackSecondRef.current = safeSecond;
    if (safeDuration > 0) {
      lastDurationRef.current = safeDuration;
    }
    const pendingSecond = pendingResumeSecondRef.current;
    if (pendingSecond && Math.abs(t - pendingSecond) < 2) {
      pendingResumeSecondRef.current = null;
    }
    setCurrentTime(t);

    if (hasAdsFree) return;

    // MID_ROLL: Hard checkpoint at 50%, trigger once
    if (!midRollFired && d > 60 && t >= d * 0.5) {
      const midAd = pickHighestPriority(adsForEpisode.midRoll);
      if (midAd) {
        setMidRollFired(true);
        setMidRollTimestamp(t);
        void saveProgress(true);
        showAd(midAd, "MID_ROLL", t);
      }
    }

    // POST_ROLL: Between (mid-roll + 10min) and (end - 10min)
    // Only if video is long enough and mid-roll already fired
    if (!postRollFired && midRollFired && d > 1200) {
      const postRollStart = midRollTimestamp + 600; // 10 minutes after mid-roll
      const postRollEnd = d - 600; // 10 minutes before end

      if (t >= postRollStart && t <= postRollEnd) {
        const postAd = pickHighestPriority(adsForEpisode.postRoll);
        if (postAd) {
          setPostRollFired(true);
          void saveProgress(true);
          showAd(postAd, "POST_ROLL", t);
        }
      }
    }
  }, [
    hasAdsFree,
    midRollFired,
    postRollFired,
    midRollTimestamp,
    adsForEpisode,
    saveProgress,
    showAd,
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
    const shouldResume = adPhase === "PRE_ROLL" || adPhase === "MID_ROLL";
    const resumeSecond = resumeAfterAdRef.current;

    setCurrentAd(null);
    setAdPhase(null);

    window.setTimeout(() => resumeMainVideoAfterAd(resumeSecond, shouldResume), 0);
  }, [adPhase, resumeMainVideoAfterAd]);

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
      const safeValue = Math.max(0, Math.floor(value));
      videoRef.current.currentTime = safeValue;
      lastPlaybackSecondRef.current = safeValue;
      setCurrentTime(safeValue);
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

  const syncContinueWatchingCache = useCallback(async () => {
    const savedItem = lastSavedItemRef.current;
    if (savedItem) {
      queryClient.setQueryData<ContinueWatchingItem[]>(
        ["watch-history", "continue-watching"],
        (items = []) => {
          const next = items.filter(
            (item) => item.movieId !== savedItem.movieId || item.episodeId !== savedItem.episodeId
          );
          return [savedItem, ...next];
        }
      );
    }

    await queryClient.invalidateQueries({ queryKey: ["watch-history", "continue-watching"] });
    await queryClient.invalidateQueries({ queryKey: ["watch-history", "me"] });
    await queryClient.refetchQueries({
      queryKey: ["watch-history", "continue-watching"],
      type: "active",
    });
  }, [queryClient]);

  const handleBack = useCallback(async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    const video = videoRef.current;
    if (video) {
      updatePlaybackSnapshot();
      video.pause();
    }
    setIsPlaying(false);
    await saveProgress(true);
    await syncContinueWatchingCache();
    router.push("/");
  }, [router, saveProgress, syncContinueWatchingCache, updatePlaybackSnapshot]);

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
      <HlsPlayer
        videoRef={videoRef}
        src={selectedEpisode.videoUrl ?? ""}
        startTime={resumeStartTime}
        shouldPlay={!currentAd}
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
