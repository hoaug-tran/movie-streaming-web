"use client";

import { MouseEvent, useMemo } from "react";
import { alpha, CircularProgress, IconButton, Tooltip, useTheme } from "@mui/material";
import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  useAddFavorite,
  useCheckFavorite,
  useRemoveFavorite,
} from "@/modules/favorite/hooks/useFavorite";

type FavoriteToggleButtonProps = {
  movieId: number;
  movieTitle?: string;
  size?: "small" | "medium" | "large";
};

export function FavoriteToggleButton({
  movieId,
  movieTitle,
  size = "medium",
}: FavoriteToggleButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const canQuery = isAuthenticated && Number.isFinite(movieId);
  const { data, isLoading: isChecking } = useCheckFavorite(movieId, canQuery);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = Boolean(data?.inFavorite);
  const isMutating = addFavorite.isPending || removeFavorite.isPending;
  const disabled = loading || isChecking || isMutating;

  const label = useMemo(() => {
    if (!isAuthenticated) return "Đăng nhập để thêm vào yêu thích";
    return isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích";
  }, [isAuthenticated, isFavorite]);

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      const returnTo = pathname || "/";
      router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (disabled) return;

    if (isFavorite) {
      removeFavorite.mutate(movieId);
      return;
    }

    addFavorite.mutate(movieId);
  };

  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          id={`favorite-toggle-${movieId}`}
          aria-label={`${label}${movieTitle ? `: ${movieTitle}` : ""}`}
          aria-pressed={isFavorite}
          onClick={handleToggle}
          disabled={disabled}
          size={size}
          sx={{
            width: size === "large" ? 58 : size === "small" ? 36 : 46,
            height: size === "large" ? 58 : size === "small" ? 36 : 46,
            p: 0,
            borderRadius: "50%",
            color: isFavorite ? theme.palette.error.light : theme.palette.common.white,
            background: "transparent",
            border: "none",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55))",
            transition: "transform .2s ease, color .2s ease, filter .2s ease",
            "&:hover": {
              transform: "translateY(-2px) scale(1.12)",
              backgroundColor: "transparent",
              color: isFavorite ? theme.palette.error.main : theme.palette.error.light,
              filter: `drop-shadow(0 6px 18px ${alpha(theme.palette.error.main, 0.42)})`,
            },
            "&.Mui-disabled": {
              color: alpha(theme.palette.common.white, 0.55),
              backgroundColor: "transparent",
            },
          }}
        >
          {isMutating || (isAuthenticated && isChecking) ? (
            <CircularProgress
              size={size === "large" ? 30 : size === "small" ? 24 : 26}
              color="inherit"
            />
          ) : (
            <Heart
              size={size === "large" ? 40 : size === "small" ? 32 : 36}
              strokeWidth={2.7}
              fill={isFavorite ? "currentColor" : "none"}
              absoluteStrokeWidth
              style={{ display: "block" }}
            />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
