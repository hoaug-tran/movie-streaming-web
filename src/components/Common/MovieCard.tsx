import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import movieService from "@/modules/movie/api/movie-service";
import {
  Card,
  Box,
  Typography,
  Skeleton,
  IconButton,
  Portal,
  Stack,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { usePlayNavigation } from "@/hooks/use-play-navigation";
import { FavoriteToggleButton } from "@/modules/favorite/components/FavoriteToggleButton";
import { WatchlistToggleButton } from "@/modules/watchlist/components/WatchlistToggleButton";

export interface MovieCardProps {
  id: number;
  title: string;
  slug?: string;
  posterUrl?: string;
  bannerUrl?: string;
  rating?: number;
  variant?: "default" | "ranked" | "preview";
  ranking?: number;
  releaseDate?: string;
  ageRating?: string;
  movieType?: string;
  onPlay?: (id: number) => void;
  onAddToList?: (id: number) => void;
  progress?: number;
  showProgress?: boolean;
  description?: string;
  country?: string;
  language?: string;
  viewCount?: number;
  favoriteCount?: number;
  movieStatus?: string;
  isPremiumOnly?: boolean;
  originalTitle?: string;
  totalRatings?: number;
  totalReviews?: number;
  publishedAt?: string;
  trailerUrl?: string | null;
  categories?: Array<string | { name?: string; slug?: string }> | null;
  matchScore?: number;
  resolution?: string;
  sx?: object;
}

export function MovieCard({
  id,
  title,
  slug,
  posterUrl,
  bannerUrl,
  rating,
  variant = "default",
  ranking,
  releaseDate,
  ageRating,
  movieType,
  onPlay,
  progress = 0,
  showProgress = false,
  description,
  country,
  language,
  viewCount,
  favoriteCount,
  movieStatus,
  isPremiumOnly,
  originalTitle,
  totalRatings,
  totalReviews,
  publishedAt,
  trailerUrl,
  categories = [],
  matchScore,
  resolution = "4K",
  sx: sxOverride,
}: MovieCardProps) {
  const theme = useTheme();
  const { navigateToWatch } = usePlayNavigation();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const leaveTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(id);
      return;
    }

    if (!slug) {
      console.warn("Cannot play movie without slug:", title);
      return;
    }

    navigateToWatch({
      movieSlug: slug,
      movieId: id,
      isPremiumOnly: isPremiumOnly,
    });
  };

  const handleMouseEnter = () => {
    if (posterRef.current) {
      setRect(posterRef.current.getBoundingClientRect());
    }
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setHasMounted(true);
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    leaveTimeout.current = setTimeout(() => setIsHovered(false), 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isHovered) {
        setIsHovered(false);
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isHovered]);

  const handlePortalMouseEnter = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
  };

  const HOVER_WIDTH = 420;
  const APPROX_METADATA_HEIGHT = 188;
  const HOVER_HEIGHT = HOVER_WIDTH * (9 / 16) + APPROX_METADATA_HEIGHT;

  let portalLeft = 0;
  let portalTop = 0;

  if (rect && typeof window !== "undefined") {
    portalLeft = rect.left - (HOVER_WIDTH - rect.width) / 2;
    if (portalLeft < 24) portalLeft = 24;
    else if (portalLeft + HOVER_WIDTH > document.documentElement.clientWidth - 24) {
      portalLeft = document.documentElement.clientWidth - HOVER_WIDTH - 24;
    }
    portalTop = rect.top - (HOVER_HEIGHT - rect.height) / 2;
    if (portalTop < 24) portalTop = 24;
    else if (portalTop + HOVER_HEIGHT > document.documentElement.clientHeight - 24) {
      portalTop = Math.max(24, document.documentElement.clientHeight - HOVER_HEIGHT - 24);
    }
  }

  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
  const publishedYear = publishedAt ? new Date(publishedAt).getFullYear() : undefined;
  const safeReleaseYear = Number.isFinite(releaseYear) ? releaseYear : releaseDate;
  const safePublishedYear = Number.isFinite(publishedYear) ? publishedYear : undefined;
  const normalizedMovieType = movieType?.toUpperCase();
  const typeLabel =
    normalizedMovieType === "SERIES" || normalizedMovieType === "TV"
      ? "Phim bộ"
      : normalizedMovieType === "SINGLE" || normalizedMovieType === "MOVIE"
        ? "Phim lẻ"
        : undefined;
  const compactFormatter = new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const personalizedMatchScore =
    typeof matchScore === "number" ? Math.min(99, Math.max(0, Math.round(matchScore))) : undefined;
  const releaseLabel = safeReleaseYear
    ? `${safeReleaseYear}`
    : safePublishedYear
      ? `${safePublishedYear}`
      : undefined;
  const accessLabel = isPremiumOnly ? "Premium" : "Xem miễn phí";
  const { data: detailData } = useQuery({
    queryKey: ["movie-preview", slug || id],
    queryFn: () => (slug ? movieService.getMovieDetailBySlug(slug) : Promise.reject()),
    enabled: isHovered && !!slug,
    staleTime: 1000 * 60 * 5,
  });

  const displayDescription = description || detailData?.movie?.description;
  const rawCategories = categories?.length ? categories : detailData?.movie?.categories;
  const safeCategories = Array.isArray(rawCategories) ? rawCategories : [];
  const displayTrailerUrl = trailerUrl || detailData?.movie?.trailerUrl;
  const displayBannerUrl = bannerUrl || detailData?.movie?.bannerUrl;
  const displayMovieType = movieType || detailData?.movie?.movieType;
  const displayViewCount = viewCount || detailData?.movie?.viewCount;
  const displayTotalRatings = totalRatings || detailData?.movie?.totalRatings;
  const displayRating = rating || detailData?.movie?.averageRating;
  const displayMatchScore =
    matchScore || (detailData?.movie as any)?.matchScore || personalizedMatchScore;
  const displayTotalReviews = totalReviews || detailData?.movie?.totalReviews;
  const displayFavoriteCount = favoriteCount || detailData?.movie?.favoriteCount;
  const displayLanguage = language || detailData?.movie?.language;
  const displayCountry = country || detailData?.movie?.country;
  const displayAgeRating = ageRating || detailData?.movie?.ageRating;

  const categoryLabels = safeCategories.length
    ? safeCategories
        .map((category) =>
          typeof category === "string" ? category : category.name || category.slug
        )
        .filter(Boolean)
        .slice(0, 4)
    : ([displayCountry, displayLanguage].filter(Boolean).slice(0, 4) as string[]);

  const quickFacts = [
    typeof displayMatchScore === "number"
      ? { label: "Phù hợp", value: `${displayMatchScore}%` }
      : undefined,
    typeof displayRating === "number"
      ? { label: "Điểm", value: displayRating.toFixed(1) }
      : undefined,
    typeof displayViewCount === "number"
      ? { label: "Lượt xem", value: compactFormatter.format(displayViewCount) }
      : undefined,
    typeof displayTotalRatings === "number"
      ? { label: "Đánh giá", value: compactFormatter.format(displayTotalRatings) }
      : undefined,
  ].filter(Boolean) as { label: string; value: string }[];

  const infoFacts = [
    releaseLabel,
    displayAgeRating,
    displayMovieType === "SERIES" || displayMovieType === "TV"
      ? "Phim bộ"
      : displayMovieType === "SINGLE" || displayMovieType === "MOVIE"
        ? "Phim lẻ"
        : typeLabel,
    displayCountry,
    displayLanguage,
  ].filter(Boolean) as string[];

  const sideFacts = [
    displayFavoriteCount
      ? { label: "Yêu thích", value: compactFormatter.format(displayFavoriteCount) }
      : undefined,
    displayTotalReviews
      ? { label: "Thảo luận", value: compactFormatter.format(displayTotalReviews) }
      : undefined,
    movieStatus
      ? { label: "Trạng thái", value: movieStatus === "PUBLISHED" ? "Đã xuất bản" : movieStatus }
      : undefined,
  ].filter(Boolean) as { label: string; value: string }[];

  const hasTrailerPreview = Boolean(displayTrailerUrl);

  const portalCardBg =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.98)
      : alpha(theme.palette.background.paper, 0.99);

  const renderBaseCard = () => {
    if (variant === "ranked") {
      return (
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          {ranking && (
            <Typography
              sx={{
                position: "absolute",
                left: 4,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                fontSize: "200px",
                fontWeight: 900,
                lineHeight: 1,
                color: "background.default",
                WebkitTextStroke: "4px #555555",
                fontFamily: "Impact, 'Arial Black', sans-serif",
                letterSpacing: "-0.08em",
                zIndex: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {ranking}
            </Typography>
          )}

          <Card
            ref={posterRef}
            sx={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "55%",
              height: "100%",
              borderRadius: 1,
              overflow: "hidden",
              zIndex: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "-8px 0px 20px rgba(0,0,0,0.6)",
            }}
          >
            {!posterUrl || imageError ? (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            ) : (
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
                onError={() => setImageError(true)}
                priority={false}
              />
            )}

            {rating && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  color: "#FFD700",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  zIndex: 2,
                  backdropFilter: "blur(4px)",
                }}
              >
                ★ {rating.toFixed(1)}
              </Box>
            )}
          </Card>
        </Box>
      );
    }

    return (
      <Card
        ref={posterRef}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": {
            borderColor: "rgba(255,255,255,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
          },
        }}
      >
        {!(displayBannerUrl || posterUrl) || imageError ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : (
          <Image
            src={displayBannerUrl || posterUrl!}
            alt={title}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
            onError={() => setImageError(true)}
            priority={false}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
            p: 1.5,
            pt: 4,
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#ffffff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
        </Box>
        {releaseDate && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.75)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {new Date(releaseDate).getFullYear()}
          </Box>
        )}
        {rating && (
          <Box
            sx={{
              position: "absolute",
              bottom: showProgress ? 16 : 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#FFD700",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <StarRoundedIcon sx={{ fontSize: 16 }} />
            {rating.toFixed(1)}
          </Box>
        )}
        {showProgress && progress > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Box sx={{ height: "100%", width: `${progress}%`, backgroundColor: "primary.main" }} />
          </Box>
        )}
      </Card>
    );
  };

  return (
    <>
      <Box
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: "relative",
          width: "100%",
          height: variant === "ranked" ? 220 : "auto",
          aspectRatio: variant === "ranked" ? "auto" : "16 / 9",
          cursor: "pointer",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": { transform: "translateY(-4px)" },
          ...sxOverride,
        }}
      >
        {renderBaseCard()}
      </Box>

      {hasMounted && rect && typeof window !== "undefined" && (
        <Portal>
          <Box
            onMouseEnter={handlePortalMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              position: "fixed",
              top: portalTop,
              left: portalLeft,
              width: HOVER_WIDTH,
              zIndex: isHovered ? 99999 : -1,
              pointerEvents: isHovered ? "auto" : "none",
              opacity: isHovered ? 1 : 0,
              transition: isHovered
                ? "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                : "opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Card
              sx={{
                width: "100%",
                borderRadius: 1,
                overflow: "hidden",
                transition: isHovered
                  ? "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: isHovered ? "scale(1.02) translateY(0)" : "scale(0.8) translateY(24px)",
                transformOrigin: "center center",
                boxShadow: isHovered ? "0 10px 40px rgba(0,0,0,0.9)" : "none",
                bgcolor: "#141414",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  bgcolor: "#000",
                }}
              >
                {hasTrailerPreview ? (
                  <Box
                    component="video"
                    src={displayTrailerUrl || undefined}
                    poster={displayBannerUrl || posterUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : !(bannerUrl || posterUrl) || imageError ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : (
                  <Image
                    src={displayBannerUrl || posterUrl!}
                    alt={title}
                    fill
                    sizes="420px"
                    style={{ objectFit: "cover" }}
                    onError={() => setImageError(true)}
                  />
                )}

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(180deg, ${alpha("#000", 0)} 35%, ${alpha("#000", 0.86)} 100%)`,
                  }}
                />

                <Box sx={{ position: "absolute", left: 16, right: 16, bottom: 14 }}>
                  <Typography
                    sx={{
                      color: "common.white",
                      fontSize: "1.18rem",
                      fontWeight: 950,
                      lineHeight: 1.05,
                      letterSpacing: "-0.04em",
                      textShadow: "0 4px 18px rgba(0,0,0,0.65)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {title}
                  </Typography>
                  {originalTitle && originalTitle !== title && (
                    <Typography
                      sx={{
                        mt: 0.5,
                        color: alpha("#fff", 0.76),
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {originalTitle}
                    </Typography>
                  )}
                </Box>

                {showProgress && progress > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: alpha("#fff", 0.2),
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${progress}%`,
                        backgroundColor: "primary.main",
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  px: 2,
                  pt: 1.75,
                  pb: 2,
                  height: isHovered ? "auto" : 0,
                  overflow: "hidden",
                  bgcolor: portalCardBg,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.25}
                  sx={{ mb: 1.2 }}
                >
                  <Stack direction="row" spacing={0.9} alignItems="center">
                    <IconButton
                      aria-label={`Phát ${title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay();
                      }}
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        width: 36,
                        height: 36,
                        boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.32)}`,
                        "&:hover": { bgcolor: "primary.dark", transform: "scale(1.04)" },
                      }}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <WatchlistToggleButton movieId={id} movieTitle={title} size="small" />
                    <FavoriteToggleButton movieId={id} movieTitle={title} size="small" />
                  </Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box
                      sx={{
                        px: 0.8,
                        height: 25,
                        minWidth: 34,
                        borderRadius: 0.45,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.text.primary, 0.28),
                        color: "text.primary",
                        fontSize: "0.7rem",
                        fontWeight: 950,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {resolution}
                    </Box>
                    <Chip
                      label={accessLabel}
                      size="small"
                      sx={{
                        height: 25,
                        borderRadius: 0.75,
                        bgcolor: isPremiumOnly
                          ? alpha(theme.palette.warning.main, 0.16)
                          : alpha(theme.palette.success.main, 0.16),
                        color: isPremiumOnly ? "warning.main" : "success.main",
                        border: "1px solid",
                        borderColor: isPremiumOnly
                          ? alpha(theme.palette.warning.main, 0.32)
                          : alpha(theme.palette.success.main, 0.32),
                        fontSize: "0.67rem",
                        fontWeight: 950,
                      }}
                    />
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 0.75,
                    mb: 1.1,
                  }}
                >
                  {detailData || (rating && viewCount) ? (
                    quickFacts.map((item, index) => (
                      <Box
                        key={item.label}
                        sx={{
                          minWidth: 0,
                          py: 0.75,
                          px: 0.8,
                          borderRadius: 1,
                          bgcolor:
                            index === 0
                              ? alpha(theme.palette.primary.main, 0.13)
                              : alpha(theme.palette.text.primary, 0.045),
                          border: "1px solid",
                          borderColor:
                            index === 0 ? alpha(theme.palette.primary.main, 0.28) : "divider",
                        }}
                      >
                        <Typography
                          sx={{
                            color: index === 0 ? "primary.main" : "text.primary",
                            fontSize: "0.84rem",
                            fontWeight: 950,
                            lineHeight: 1,
                          }}
                        >
                          {item.value}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.3,
                            color: "text.secondary",
                            fontSize: "0.58rem",
                            fontWeight: 850,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <>
                      <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
                    </>
                  )}
                </Box>

                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1 }}
                >
                  {infoFacts.map((fact, index) => (
                    <React.Fragment key={`${fact}-${index}`}>
                      <Typography
                        sx={{ color: "text.primary", fontSize: "0.72rem", fontWeight: 850 }}
                      >
                        {fact}
                      </Typography>
                      {index < infoFacts.length - 1 && (
                        <Box
                          sx={{
                            width: 3.5,
                            height: 3.5,
                            borderRadius: "50%",
                            bgcolor: "text.disabled",
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Stack>

                {categories?.length || (detailData && safeCategories.length > 0) ? (
                  <Stack
                    direction="row"
                    spacing={0.6}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 1.15 }}
                  >
                    {categoryLabels.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        sx={{
                          height: 23,
                          borderRadius: 0.85,
                          bgcolor: alpha(theme.palette.text.primary, 0.06),
                          color: "text.primary",
                          border: "1px solid",
                          borderColor: "divider",
                          fontSize: "0.65rem",
                          fontWeight: 850,
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  !detailData &&
                  !categories?.length && (
                    <Stack direction="row" spacing={0.6} sx={{ mb: 1.15 }}>
                      <Skeleton width={60} height={23} sx={{ borderRadius: 0.85 }} />
                      <Skeleton width={70} height={23} sx={{ borderRadius: 0.85 }} />
                    </Stack>
                  )
                )}

                {displayDescription ? (
                  <Typography
                    sx={{
                      mb: 1.15,
                      color: "text.secondary",
                      fontSize: "0.76rem",
                      lineHeight: 1.45,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {displayDescription}
                  </Typography>
                ) : (
                  <Box sx={{ mb: 1.15 }}>
                    <Skeleton height={15} width="100%" sx={{ mb: 0.5 }} />
                    <Skeleton height={15} width="70%" />
                  </Box>
                )}

                {sideFacts.length > 0 && (
                  <Stack direction="row" spacing={1.1} flexWrap="wrap" useFlexGap>
                    {sideFacts.map((item) => (
                      <Typography
                        key={item.label}
                        sx={{ color: "text.secondary", fontSize: "0.68rem", fontWeight: 800 }}
                      >
                        {item.label}{" "}
                        <Box component="span" sx={{ color: "text.primary", fontWeight: 950 }}>
                          {item.value}
                        </Box>
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          </Box>
        </Portal>
      )}
    </>
  );
}

export function MovieCardSkeleton() {
  return (
    <Card sx={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 1 }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Card>
  );
}
