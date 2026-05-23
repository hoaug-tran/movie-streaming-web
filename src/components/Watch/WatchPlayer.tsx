"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Slider,
} from "@mui/material";
import { Episode, MovieDetail } from "@/modules/movie/types/movie";
import { useSubscription, VideoQuality } from "@/hooks/use-subscription";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import HlsPlayer from "./HlsPlayer";
import PlayerControls, { formatTime } from "./PlayerControls";
import AdOverlay from "./AdOverlay";
import PlayerCommentDrawer from "./PlayerCommentDrawer";
import { Advertisement } from "@/modules/advertisement/types/advertisement";
import advertisementService from "@/modules/advertisement/api/advertisement-service";
import watchHistoryService from "@/modules/watch-history/api/watch-history-service";
import { ContinueWatchingItem } from "@/modules/watch-history/types/watch-history";
import streamingService from "@/modules/streaming/api/streaming-service";
import movieService from "@/modules/movie/api/movie-service";
import { offlineStorage } from "@/lib/offline-storage";
import { usePwa } from "@/hooks/use-pwa";
import OfflineBadge from "@/components/PWA/OfflineBadge";
import { isIPhoneDevice } from "@/lib/platform";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ListAltIcon from "@mui/icons-material/ListAlt";
import HdIcon from "@mui/icons-material/Hd";
import LockIcon from "@mui/icons-material/Lock";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ForumIcon from "@mui/icons-material/Forum";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import EpisodeList from "./EpisodeList";

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
  const { hasAdsFree, maxQuality, canWatchPremium } = useSubscription();
  const { isOnline } = usePwa();
  const [offlineSrc, setOfflineSrc] = useState<string | undefined>(undefined);
  const PREVIEW_LIMIT_SECONDS = 30;

  const QUALITY_ORDER: VideoQuality[] = ["720p", "1080p", "4K"];

  const normalizeQuality = (quality?: string): VideoQuality => {
    const q = String(quality || "720p")
      .trim()
      .toUpperCase();

    if (q === "4K" || q === "2160P" || q === "UHD") return "4K";
    if (q === "1080P" || q === "FHD" || q === "FULL_HD") return "1080p";

    return "720p";
  };

  const getQualityUrl = (videoUrl: string, quality: VideoQuality): string => {
    const match = videoUrl.match(
      /^(.*\/stream\/series\/episodes\/\d+\/)([^/]+)(\/master\.m3u8.*)$/
    );
    if (match) return `${match[1]}${quality}${match[3]}`;
    return videoUrl;
  };

  const selectBestQuality = (available: string[], max: VideoQuality): VideoQuality => {
    const maxIdx = QUALITY_ORDER.indexOf(max);
    if (maxIdx < 0) return "720p";

    const normalizedAvailable = available.map((q) => normalizeQuality(q));
    const availableSet = new Set(normalizedAvailable);

    const allowedSorted = QUALITY_ORDER.filter((q, idx) => idx <= maxIdx && availableSet.has(q));
    return allowedSorted[allowedSorted.length - 1] || "720p";
  };

  const pickSafeInitialQuality = (available: string[]): VideoQuality => {
    const normalizedAvailable = available.map((q) => normalizeQuality(q));

    if (normalizedAvailable.length === 0) return "720p";
    if (normalizedAvailable.includes("720p")) return "720p";

    return QUALITY_ORDER.find((q) => normalizedAvailable.includes(q)) || "720p";
  };

  const buildInitialUrl = (episode: Episode): string => {
    const available = episode.availableQualities ?? [];
    const baseUrl = episode.videoUrl ?? "";
    if (available.length === 0) return baseUrl;

    const safeQuality = pickSafeInitialQuality(available);
    return getQualityUrl(baseUrl, safeQuality);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobileDevice =
    typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);

  const [isIPhone, setIsIPhone] = useState(false);
  useEffect(() => {
    setIsIPhone(isIPhoneDevice());
  }, []);

  const [iPhoneShowEpisodes, setIPhoneShowEpisodes] = useState(false);
  const [iPhoneShowQuality, setIPhoneShowQuality] = useState(false);
  const [iPhoneShowSpeed, setIPhoneShowSpeed] = useState(false);
  const [iPhoneShowVolume, setIPhoneShowVolume] = useState(false);
  const [iPhonePlaybackSpeed, setIPhonePlaybackSpeed] = useState(1);
  const [iPhoneOverlayVisible, setIPhoneOverlayVisible] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resumeStartTime, setResumeStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(isMobileDevice);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(currentEpisode);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(() =>
    pickSafeInitialQuality(currentEpisode.availableQualities ?? [])
  );
  const [currentVideoUrl, setCurrentVideoUrl] = useState(() => buildInitialUrl(currentEpisode));
  const [isKicked, setIsKicked] = useState(false);
  const [showPreviewWall, setShowPreviewWall] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const previewWallFiredRef = useRef(false);
  const streamSessionIdRef = useRef<number | null>(null);
  const viewFiredRef = useRef<number | null>(null);

  useEffect(() => {
    if (viewFiredRef.current === currentEpisode.id) return;
    viewFiredRef.current = currentEpisode.id;
    movieService.incrementView(movie.id);
  }, [currentEpisode.id, movie.id]);

  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [adPhase, setAdPhase] = useState<"PRE_ROLL" | "MID_ROLL" | "POST_ROLL" | null>(null);
  const [adsForEpisode, setAdsForEpisode] = useState<{
    preRoll: Advertisement[];
    midRoll: Advertisement[];
    postRoll: Advertisement[];
  }>({ preRoll: [], midRoll: [], postRoll: [] });
  const [midRollFired, setMidRollFired] = useState(false);
  const [postRollFired, setPostRollFired] = useState(false);
  const [preRollPending, setPreRollPending] = useState(false);

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
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const COMPLETION_PERCENT = 0.95;
  const COMPLETION_GRACE_SECONDS = 10;

  const pickAd = (ads: Advertisement[]): Advertisement | null => {
    if (!ads || ads.length === 0) return null;
    return ads[0];
  };

  const getFiniteDuration = useCallback(() => {
    const videoDuration = videoRef.current?.duration;
    if (typeof videoDuration === "number" && Number.isFinite(videoDuration) && videoDuration > 0) {
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
      const video = videoRef.current;
      const liveSecond = video ? Math.floor(video.currentTime || 0) : 0;
      const capturedSecond = resumeSecond ?? liveSecond;
      const safeSecond = Math.max(0, Math.floor(capturedSecond));
      setResumeStartTime(safeSecond);
      resumeAfterAdRef.current = safeSecond;

      if (video) {
        try {
          video.pause();
        } catch {
          // ignore
        }
      }
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

      if (resumeSecond !== null && resumeSecond >= 0) {
        try {
          video.currentTime = resumeSecond;
        } catch {
          // iOS stupid
        }
        lastPlaybackSecondRef.current = Math.floor(resumeSecond);
        setCurrentTime(resumeSecond);
      }

      const attemptPlay = async () => {
        try {
          await video.play();
          setIsPlaying(true);
          resumeAfterAdRef.current = null;
        } catch {
          if (!video.muted) {
            video.muted = true;
            setIsMuted(true);
            try {
              await video.play();
              setIsPlaying(true);
              resumeAfterAdRef.current = null;
            } catch {
              setIsPlaying(false);
            }
          } else {
            setIsPlaying(false);
          }
        }
      };

      void attemptPlay();
    },
    []
  );

  useEffect(() => {
    if (!currentAd) return;
    const target = resumeAfterAdRef.current;
    if (target === null) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    const watchdog = window.setInterval(() => {
      if (cancelled) return;
      const v = videoRef.current;
      if (!v) return;
      if (!v.paused) {
        try {
          v.pause();
        } catch {
          // ignore
        }
      }
      const drift = Math.abs((v.currentTime || 0) - target);
      if (drift > 0.6) {
        try {
          v.currentTime = target;
        } catch {
          // ignore
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearInterval(watchdog);
    };
  }, [currentAd]);

  useEffect(() => {
    if (hasAdsFree || offlineSrc) {
      setAdsForEpisode({ preRoll: [], midRoll: [], postRoll: [] });
      setPreRollPending(false);
      return;
    }

    let cancelled = false;
    setPreRollPending(true);

    const loadAds = async () => {
      try {
        const [pre, mid, post] = await Promise.all([
          advertisementService.getAdsByType("PRE_ROLL"),
          advertisementService.getAdsByType("MID_ROLL"),
          advertisementService.getAdsByType("POST_ROLL"),
        ]);

        if (cancelled) return;

        setAdsForEpisode({ preRoll: pre, midRoll: mid, postRoll: post });
        const preAd = pickAd(pre);
        if (preAd) {
          preRollEpisodeIdRef.current = selectedEpisode.id;
          showAd(preAd, "PRE_ROLL");
        }
      } finally {
        if (!cancelled) setPreRollPending(false);
      }
    };

    loadAds();

    return () => {
      cancelled = true;
    };
  }, [selectedEpisode.id, hasAdsFree, offlineSrc, showAd]);

  useEffect(() => {
    const available = selectedEpisode.availableQualities ?? [];
    if (available.length === 0) {
      setCurrentVideoUrl(selectedEpisode.videoUrl ?? "");
      return;
    }

    const normalizedAvailable = available.map((q) => normalizeQuality(q));
    const allowedMaxIdx = QUALITY_ORDER.indexOf(maxQuality);
    const currentIdx = QUALITY_ORDER.indexOf(selectedQuality);

    const userPickedHigherThanAllowed = currentIdx > allowedMaxIdx;
    const currentNotAvailable = !normalizedAvailable.includes(selectedQuality);

    if (userPickedHigherThanAllowed || currentNotAvailable) {
      const best = selectBestQuality(available, maxQuality);
      setSelectedQuality(best);
      setCurrentVideoUrl(getQualityUrl(selectedEpisode.videoUrl ?? "", best));
      return;
    }

    if (currentIdx < allowedMaxIdx) {
      const best = selectBestQuality(available, maxQuality);
      if (QUALITY_ORDER.indexOf(best) > currentIdx) {
        setSelectedQuality(best);
        setCurrentVideoUrl(getQualityUrl(selectedEpisode.videoUrl ?? "", best));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEpisode.id,
    selectedEpisode.videoUrl,
    selectedEpisode.availableQualities,
    maxQuality,
    selectedQuality,
  ]);

  useEffect(() => {
    let cancelled = false;
    const blobUrls: string[] = [];

    offlineStorage.isDownloaded(selectedEpisode.id).then(async (downloaded) => {
      if (cancelled) return;

      if (!downloaded) {
        setOfflineSrc(undefined);
        return;
      }

      const record = await offlineStorage.getMovie(selectedEpisode.id);
      if (cancelled) return;
      if (!record) {
        setOfflineSrc(undefined);
        return;
      }

      const sortedUrls = [...record.segmentUrls].sort((a, b) => {
        const matchA = a.match(/(\d+)(?:\.\w+)?(?:$|\?)/);
        const matchB = b.match(/(\d+)(?:\.\w+)?(?:$|\?)/);
        if (matchA && matchB) {
          return parseInt(matchA[1]) - parseInt(matchB[1]);
        }
        return 0;
      });

      const firstSegmentData = await offlineStorage.getSegment(sortedUrls[0]);
      if (!firstSegmentData) {
        setOfflineSrc(undefined);
        return;
      }

      const isReordered = sortedUrls.some((u, i) => u !== record.segmentUrls[i]);
      if (isReordered) {
        await offlineStorage.saveMovie({
          ...record,
          segmentUrls: sortedUrls,
        });
      }

      const eid = selectedEpisode.id;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const segPaths = sortedUrls.map((_, idx) => `${origin}/__offline__/seg/${eid}/${idx}.ts`);

      let keyLine = "";

      const offlineQuality = normalizeQuality(
        record.quality || selectedEpisode.availableQualities?.[0]
      );
      const keyRecord = await offlineStorage.getKey(eid, offlineQuality);

      if (cancelled) return;

      if (keyRecord?.keyData) {
        keyLine = `#EXT-X-KEY:METHOD=AES-128,URI="${origin}/__offline__/key/${eid}/${encodeURIComponent(offlineQuality)}"\n`;
      }

      const duration = record.durationSeconds
        ? (record.durationSeconds / segPaths.length).toFixed(3)
        : "6.000";

      const m3u8Lines = [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        `#EXT-X-TARGETDURATION:${Math.ceil(Number(duration))}`,
        "#EXT-X-MEDIA-SEQUENCE:0",
        keyLine.trim(),
        ...segPaths.flatMap((p) => [`#EXTINF:${duration},`, p]),
        "#EXT-X-ENDLIST",
      ].filter(Boolean);

      const m3u8Blob = new Blob([m3u8Lines.join("\n")], { type: "application/vnd.apple.mpegurl" });
      const playlistUrl = URL.createObjectURL(m3u8Blob);
      blobUrls.push(playlistUrl);

      if (!cancelled) {
        setOfflineSrc(playlistUrl);
      }
    });

    return () => {
      cancelled = true;
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
      setOfflineSrc(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEpisode.id, isOnline]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let sessionId: number | null = null;

    streamingService
      .startSession("Web Browser", "WEB")
      .then((res) => {
        sessionId = res.sessionId;
        streamSessionIdRef.current = sessionId;
      })
      .catch(() => {});

    return () => {
      if (sessionId) {
        streamingService.stopSession(sessionId).catch(() => {});
        streamSessionIdRef.current = null;
      }
    };
  }, [selectedEpisode.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      const sid = streamSessionIdRef.current;
      if (!sid) return;
      try {
        await streamingService.heartbeat(sid);
      } catch (err: any) {
        if (err?.status === 403) {
          setIsKicked(true);
          streamSessionIdRef.current = null;
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
    setDuration(selectedEpisode.durationSeconds ?? 0);
    pendingResumeSecondRef.current = null;
    previewWallFiredRef.current = false;
    setShowPreviewWall(false);

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
    selectedEpisode.durationSeconds,
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
      setDuration((prev) => (prev !== safeDuration ? safeDuration : prev));
    }
    const pendingSecond = pendingResumeSecondRef.current;
    if (pendingSecond && Math.abs(t - pendingSecond) < 2) {
      pendingResumeSecondRef.current = null;
    }
    setCurrentTime(t);

    if (
      movie.isPremiumOnly &&
      !canWatchPremium &&
      !previewWallFiredRef.current &&
      t >= PREVIEW_LIMIT_SECONDS
    ) {
      previewWallFiredRef.current = true;
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPreviewWall(true);
      return;
    }

    if (hasAdsFree || offlineSrc) return;

    if (!midRollFired && d > 60 && t >= d * 0.5) {
      const midAd = pickAd(adsForEpisode.midRoll);
      if (midAd) {
        setMidRollFired(true);
        void saveProgress(true);
        showAd(midAd, "MID_ROLL", t);
      }
    }

    if (!postRollFired && d > 60 && t >= d * 0.8) {
      const postAd = pickAd(adsForEpisode.postRoll);
      if (postAd) {
        setPostRollFired(true);
        void saveProgress(true);
        showAd(postAd, "POST_ROLL", t);
      }
    }
  }, [
    hasAdsFree,
    offlineSrc,
    canWatchPremium,
    movie.isPremiumOnly,
    PREVIEW_LIMIT_SECONDS,
    midRollFired,
    postRollFired,
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

    if (!hasAdsFree && !offlineSrc && !postRollFired) {
      const postAd = pickAd(adsForEpisode.postRoll);
      if (postAd) {
        setPostRollFired(true);
        showAd(postAd, "POST_ROLL", Math.floor(duration));
        return;
      }
    }

    const currentIdx = episodes.findIndex((e) => e.id === selectedEpisode.id);
    if (currentIdx >= 0 && currentIdx < episodes.length - 1) {
      setSelectedEpisode(episodes[currentIdx + 1]);
    }
  }, [
    adsForEpisode.postRoll,
    duration,
    episodes,
    hasAdsFree,
    isAuthenticated,
    movie.id,
    offlineSrc,
    postRollFired,
    selectedEpisode.id,
    showAd,
  ]);

  const handleAdSkipped = useCallback(() => {
    const shouldResume =
      adPhase === "PRE_ROLL" || adPhase === "MID_ROLL" || adPhase === "POST_ROLL";
    const resumeSecond = resumeAfterAdRef.current;

    setCurrentAd(null);
    setAdPhase(null);

    window.setTimeout(() => resumeMainVideoAfterAd(resumeSecond, shouldResume), 0);
  }, [adPhase, resumeMainVideoAfterAd]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlayingRef.current) setShowControls(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  useEffect(() => {
    if (!isIPhone) return;
    if (!isPlaying) {
      setIPhoneOverlayVisible(true);
      return;
    }
    const t = setTimeout(() => setIPhoneOverlayVisible(false), 3000);
    return () => clearTimeout(t);
  }, [isIPhone, isPlaying]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (currentAd || preRollPending || showPreviewWall) return;

    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      const error = err as DOMException;

      if (error.name !== "AbortError") {
        console.warn("Video play failed:", error);
      }

      setIsPlaying(false);
    }
  }, [currentAd, preRollPending, showPreviewWall]);

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
    const clamped = Math.max(0, Math.min(1, value));
    if (videoRef.current) {
      try {
        videoRef.current.volume = clamped;
        if (clamped > 0 && videoRef.current.muted) {
          videoRef.current.muted = false;
        } else if (clamped === 0 && !videoRef.current.muted) {
          videoRef.current.muted = true;
        }
      } catch {
        // iOS Safari stupid
      }
    }
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    if (videoRef.current) {
      try {
        videoRef.current.muted = newMuted;
      } catch {
        // iOS quirk: ignore failures, UI state still flips
      }
    }
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    type WebkitVideo = HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };
    type WebkitDocument = Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void>;
    };
    type WebkitElement = HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };

    const doc = document as WebkitDocument;
    const fsContainer = container as WebkitElement;
    const fsVideo = video as WebkitVideo | null;

    const isFs = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);

    if (!isFs) {
      if (typeof fsContainer.requestFullscreen === "function") {
        void fsContainer.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
        return;
      }
      if (typeof fsContainer.webkitRequestFullscreen === "function") {
        void fsContainer.webkitRequestFullscreen();
        setIsFullscreen(true);
        return;
      }
      if (fsVideo && typeof fsVideo.webkitEnterFullscreen === "function") {
        try {
          fsVideo.webkitEnterFullscreen();
          setIsFullscreen(true);
        } catch {
          // iOS Safari đôi lúc throw khi video chưa sẵn sàng metadata; bỏ qua an toàn.
        }
      }
      return;
    }

    if (typeof document.exitFullscreen === "function") {
      void document.exitFullscreen().catch(() => {});
    } else if (typeof doc.webkitExitFullscreen === "function") {
      void doc.webkitExitFullscreen();
    } else if (fsVideo && typeof fsVideo.webkitExitFullscreen === "function") {
      fsVideo.webkitExitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    type WebkitDocument = Document & { webkitFullscreenElement?: Element | null };
    const doc = document as WebkitDocument;
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    type WebkitVideo = HTMLVideoElement & {
      webkitDisplayingFullscreen?: boolean;
    };
    const video = videoRef.current as WebkitVideo | null;
    const onWebkitBegin = () => setIsFullscreen(true);
    const onWebkitEnd = () => setIsFullscreen(false);
    if (video) {
      video.addEventListener("webkitbeginfullscreen", onWebkitBegin);
      video.addEventListener("webkitendfullscreen", onWebkitEnd);
    }

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      if (video) {
        video.removeEventListener("webkitbeginfullscreen", onWebkitBegin);
        video.removeEventListener("webkitendfullscreen", onWebkitEnd);
      }
    };
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
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router, saveProgress, syncContinueWatchingCache, updatePlaybackSnapshot]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      if (showComments) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable)
        return;
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
  }, [togglePlay, handleFullscreen, handleMuteToggle, handleVolumeChange, volume, showComments]);

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        if (currentAd) return;

        const target = e.target as HTMLElement;
        if (target.closest('[data-player-control="true"]')) return;

        if (isIPhone) {
          if (!target.closest('[data-iphone-player-control="true"]')) {
            setIPhoneOverlayVisible((v) => !v);
          }
          return;
        }

        void togglePlay();
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
        src={currentVideoUrl}
        offlineSrc={offlineSrc}
        startTime={resumeStartTime}
        shouldPlay={!currentAd && !preRollPending}
        defaultMuted={isMobileDevice && !isIPhone}
        nativeControls={false}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={(d) => setDuration(d)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          void saveProgress(true);
        }}
        onEnded={handleVideoEnded}
        onLoaded={handleVideoLoaded}
        onMutedChange={(muted) => setIsMuted(muted)}
      />

      {offlineSrc && <OfflineBadge sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }} />}

      {currentAd && (
        <AdOverlay
          ad={currentAd}
          onSkip={handleAdSkipped}
          onEnded={handleAdSkipped}
          preserveAudioOnAutoplay={isIPhone}
        />
      )}

      {!currentAd && !isIPhone && (
        <Box data-player-control="true" onClick={(e) => e.stopPropagation()}>
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
            availableQualities={selectedEpisode.availableQualities ?? []}
            currentQuality={selectedQuality}
            maxQuality={maxQuality}
            onPlay={togglePlay}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
            onFullscreen={handleFullscreen}
            onBack={handleBack}
            onEpisodeSelect={(ep) => setSelectedEpisode(ep)}
            onQualityChange={(q) => {
              const qIdx = QUALITY_ORDER.indexOf(q);
              const maxIdx = QUALITY_ORDER.indexOf(maxQuality);

              if (qIdx > maxIdx) {
                router.push("/pricing");
                return;
              }

              const available = selectedEpisode.availableQualities ?? [];
              const normalizedAvailable = available.map((item) => normalizeQuality(item));

              if (normalizedAvailable.length > 0 && !normalizedAvailable.includes(q)) return;

              setSelectedQuality(q);
              setCurrentVideoUrl(getQualityUrl(selectedEpisode.videoUrl ?? "", q));
            }}
            commentOpen={showComments}
            onCommentToggle={() => setShowComments((prev) => !prev)}
            fullscreenContainer={isFullscreen ? containerRef.current : null}
          />
        </Box>
      )}

      {!currentAd && isIPhone && iPhoneOverlayVisible && (
        <>
          <Box
            data-iphone-player-control="true"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 64%, rgba(0,0,0,0) 100%)",
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
              paddingBottom: "14px",
              paddingLeft: "calc(env(safe-area-inset-left, 0px) + 16px)",
              paddingRight: "calc(env(safe-area-inset-right, 0px) + 16px)",
              zIndex: 20,
              pointerEvents: "auto",
            }}
          >
            <IconButton
              onClick={handleBack}
              sx={{
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.28)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.45)" },
              }}
              aria-label="Quay lại"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  lineHeight: 1.12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textShadow: "0 2px 12px rgba(0,0,0,0.65)",
                }}
              >
                {movie.title}
              </Typography>
              {movie.movieType === "SERIES" && selectedEpisode.title && (
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.76)",
                    fontSize: "0.72rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textShadow: "0 2px 12px rgba(0,0,0,0.65)",
                  }}
                >
                  Tập {selectedEpisode.episodeNumber} · {selectedEpisode.title}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            data-iphone-player-control="true"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 20,
              pointerEvents: "auto",
              paddingLeft: "calc(env(safe-area-inset-left, 0px) + 16px)",
              paddingRight: "calc(env(safe-area-inset-right, 0px) + 16px)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
              pt: 5,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.48) 58%, rgba(0,0,0,0) 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
              <Typography
                sx={{ color: "rgba(255,255,255,0.82)", fontSize: "0.72rem", minWidth: 36 }}
              >
                {formatTime(currentTime)}
              </Typography>
              <Slider
                value={duration > 0 ? Math.min(currentTime, duration) : 0}
                min={0}
                max={Math.max(duration, 1)}
                step={1}
                onChange={(_, value) => handleSeek(Array.isArray(value) ? value[0] : value)}
                sx={{
                  color: "#C8102E",
                  height: 4,
                  "& .MuiSlider-thumb": { width: 12, height: 12 },
                  "& .MuiSlider-rail": { opacity: 0.32, bgcolor: "rgba(255,255,255,0.5)" },
                }}
                aria-label="Tua phim"
              />
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "0.72rem",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {formatTime(duration)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  onClick={() => void togglePlay()}
                  sx={{ color: "#fff" }}
                  aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                {movie.movieType === "SERIES" &&
                  episodes.length > 1 &&
                  (() => {
                    const idx = episodes.findIndex((e) => e.id === selectedEpisode.id);
                    const prev = idx > 0 ? episodes[idx - 1] : null;
                    const next = idx >= 0 && idx < episodes.length - 1 ? episodes[idx + 1] : null;
                    return (
                      <>
                        <IconButton
                          onClick={() => prev && setSelectedEpisode(prev)}
                          disabled={!prev}
                          sx={{
                            color: "#fff",
                            "&.Mui-disabled": { color: "rgba(255,255,255,0.28)" },
                          }}
                          aria-label="Tập trước"
                        >
                          <SkipPreviousIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => next && setSelectedEpisode(next)}
                          disabled={!next}
                          sx={{
                            color: "#fff",
                            "&.Mui-disabled": { color: "rgba(255,255,255,0.28)" },
                          }}
                          aria-label="Tập tiếp theo"
                        >
                          <SkipNextIcon />
                        </IconButton>
                      </>
                    );
                  })()}
                <IconButton
                  onClick={() => {
                    setIPhoneShowVolume((v) => !v);
                    setIPhoneShowQuality(false);
                    setIPhoneShowSpeed(false);
                  }}
                  sx={{ color: iPhoneShowVolume ? "#ff4963" : "#fff" }}
                  aria-label={isMuted ? "Bật âm" : "Tắt âm"}
                >
                  {isMuted ? (
                    <VolumeOffIcon sx={{ fontSize: 22 }} />
                  ) : (
                    <VolumeUpIcon sx={{ fontSize: 22 }} />
                  )}
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  onClick={() => {
                    setIPhoneShowSpeed((v) => !v);
                    setIPhoneShowQuality(false);
                    setIPhoneShowVolume(false);
                  }}
                  sx={{ color: iPhonePlaybackSpeed !== 1 ? "#ff4963" : "#fff" }}
                  aria-label="Tốc độ phát"
                >
                  <SlowMotionVideoIcon sx={{ fontSize: 22 }} />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setIPhoneShowQuality((v) => !v);
                    setIPhoneShowSpeed(false);
                    setIPhoneShowVolume(false);
                  }}
                  sx={{ color: selectedQuality !== "720p" ? "#ff4963" : "#fff" }}
                  aria-label="Chất lượng"
                >
                  <HdIcon sx={{ fontSize: 22 }} />
                </IconButton>
                {movie.movieType === "SERIES" && episodes.length > 1 && (
                  <IconButton
                    onClick={() => setIPhoneShowEpisodes(true)}
                    sx={{ color: "#fff" }}
                    aria-label="Danh sách tập"
                  >
                    <ListAltIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => setShowComments((prev) => !prev)}
                  sx={{ color: showComments ? "#ff4963" : "#fff" }}
                  aria-label="Bình luận"
                >
                  <ForumIcon sx={{ fontSize: 22 }} />
                </IconButton>
                <IconButton
                  onClick={handleFullscreen}
                  sx={{ color: "#fff" }}
                  aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                >
                  {isFullscreen ? (
                    <FullscreenExitIcon sx={{ fontSize: 22 }} />
                  ) : (
                    <FullscreenIcon sx={{ fontSize: 22 }} />
                  )}
                </IconButton>
              </Box>
            </Box>
          </Box>

          {iPhoneShowVolume && (
            <Box
              data-iphone-player-control="true"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              sx={{
                position: "absolute",
                left: "calc(env(safe-area-inset-left, 0px) + 16px)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 124px)",
                bgcolor: "rgba(20,20,20,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                px: 1,
                py: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                zIndex: 30,
                width: 48,
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>
                {Math.round((isMuted ? 0 : volume) * 100)}
              </Typography>
              <Slider
                orientation="vertical"
                value={isMuted ? 0 : volume}
                min={0}
                max={1}
                step={0.05}
                onChange={(_, val) => handleVolumeChange(val as number)}
                sx={{
                  color: "#C8102E",
                  height: 110,
                  py: "4px !important",
                  "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.3)" },
                  "& .MuiSlider-thumb": { width: 18, height: 18 },
                  "& .MuiSlider-track": { border: "none" },
                }}
                aria-label="Âm lượng"
              />
              <IconButton
                onClick={handleMuteToggle}
                size="small"
                sx={{ color: "#fff", p: 0.5 }}
                aria-label={isMuted ? "Bật âm" : "Tắt âm"}
              >
                {isMuted ? (
                  <VolumeOffIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VolumeUpIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Box>
          )}

          {iPhoneShowQuality && (
            <Box
              data-iphone-player-control="true"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              sx={{
                position: "absolute",
                right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 124px)",
                bgcolor: "rgba(20,20,20,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                color: "#fff",
                minWidth: 200,
                overflow: "hidden",
                zIndex: 30,
              }}
            >
              <Typography
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Chất lượng video
              </Typography>
              {QUALITY_ORDER.slice()
                .reverse()
                .map((q) => {
                  const qIdx = QUALITY_ORDER.indexOf(q);
                  const maxIdx = QUALITY_ORDER.indexOf(maxQuality);
                  const isLocked = qIdx > maxIdx;

                  const available = selectedEpisode.availableQualities ?? [];
                  const normalizedAvailable = available.map((item) => normalizeQuality(item));
                  const isAvailable =
                    normalizedAvailable.length === 0 || normalizedAvailable.includes(q);

                  const isActive = q === selectedQuality;

                  return (
                    <Box
                      key={q}
                      onClick={() => {
                        if (isLocked) {
                          router.push("/pricing");
                          return;
                        }

                        if (!isAvailable) return;

                        setSelectedQuality(q);
                        setCurrentVideoUrl(getQualityUrl(selectedEpisode.videoUrl ?? "", q));
                        setIPhoneShowQuality(false);
                      }}
                      sx={{
                        px: 2,
                        py: 1.25,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: isLocked
                          ? "rgba(255,255,255,0.35)"
                          : isActive
                            ? "#ff4963"
                            : isAvailable
                              ? "#fff"
                              : "rgba(255,255,255,0.35)",
                        fontSize: "0.88rem",
                        fontWeight: isActive ? 700 : 400,
                        cursor: isAvailable || isLocked ? "pointer" : "default",
                        "&:active": { bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        {q === "4K" ? "4K Ultra HD" : q === "1080p" ? "Full HD 1080p" : "HD 720p"}
                      </Box>
                      {isLocked && <LockIcon sx={{ fontSize: 16, opacity: 0.6 }} />}
                    </Box>
                  );
                })}
            </Box>
          )}

          {iPhoneShowSpeed && (
            <Box
              data-iphone-player-control="true"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              sx={{
                position: "absolute",
                right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 124px)",
                bgcolor: "rgba(20,20,20,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                color: "#fff",
                minWidth: 160,
                overflow: "hidden",
                zIndex: 30,
              }}
            >
              <Typography
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Tốc độ phát
              </Typography>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => {
                const isActive = speed === iPhonePlaybackSpeed;
                return (
                  <Box
                    key={speed}
                    onClick={() => {
                      setIPhonePlaybackSpeed(speed);
                      if (videoRef.current) videoRef.current.playbackRate = speed;
                      setIPhoneShowSpeed(false);
                    }}
                    sx={{
                      px: 2,
                      py: 1.25,
                      color: isActive ? "#ff4963" : "#fff",
                      fontSize: "0.88rem",
                      fontWeight: isActive ? 700 : 400,
                      cursor: "pointer",
                      "&:active": { bgcolor: "rgba(255,255,255,0.08)" },
                    }}
                  >
                    {speed}x
                  </Box>
                );
              })}
            </Box>
          )}
        </>
      )}

      {isIPhone && iPhoneShowEpisodes && (
        <EpisodeList
          episodes={episodes}
          currentEpisode={selectedEpisode}
          onSelect={(ep) => {
            setSelectedEpisode(ep);
            setIPhoneShowEpisodes(false);
          }}
          onClose={() => setIPhoneShowEpisodes(false)}
        />
      )}

      <PlayerCommentDrawer
        open={showComments}
        movieId={movie.id}
        movieSlug={movie.slug ?? ""}
        episodeId={selectedEpisode.id}
        commentsLocked={Boolean(movie.commentsLocked)}
        onClose={() => setShowComments(false)}
      />

      <Dialog
        open={showPreviewWall}
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid rgba(200,16,46,0.35)",
            borderRadius: 3,
            p: 1,
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle
          sx={{ color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 700, pb: 0.5 }}
        >
          Bạn đã xem hết phần xem thử
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
              mb: 2.5,
              lineHeight: 1.6,
            }}
          >
            Nội dung này yêu cầu gói Premium. Nâng cấp ngay để xem toàn bộ phim không giới hạn,
            không quảng cáo.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexDirection: "column" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push("/pricing")}
              sx={{
                bgcolor: "#C8102E",
                "&:hover": { bgcolor: "#A00B24" },
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                borderRadius: 2,
                py: 1.2,
              }}
            >
              Xem các gói Premium
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/")}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "Inter, sans-serif",
                borderRadius: 2,
              }}
            >
              Về trang chủ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isKicked}
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 700 }}>
          Phiên xem bị ngắt
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.72)",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.92rem",
              mb: 2.5,
              lineHeight: 1.65,
            }}
          >
            Gói hiện tại đã đạt giới hạn thiết bị xem đồng thời. Khi thiết bị khác bắt đầu xem,
            phiên này sẽ tự dừng để bảo vệ quyền truy cập của bạn.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.25, flexDirection: "column" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push("/profile?tab=devices")}
              sx={{
                bgcolor: "#C8102E",
                "&:hover": { bgcolor: "#A00B24" },
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                borderRadius: 2,
                py: 1.15,
              }}
            >
              Quản lý thiết bị
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/pricing")}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontWeight: 650,
                borderRadius: 2,
                py: 1.05,
              }}
            >
              Nâng cấp gói xem
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => router.push("/")}
              sx={{ color: "rgba(255,255,255,0.62)", fontFamily: "Inter, sans-serif" }}
            >
              Về trang chủ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
