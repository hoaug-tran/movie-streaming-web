"use client";

import { MouseEvent, useMemo } from "react";
import { alpha, CircularProgress, IconButton, Tooltip, useTheme } from "@mui/material";
import { Bookmark } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  useAddToWatchlist,
  useCheckWatchlist,
  useRemoveFromWatchlist,
} from "@/modules/watchlist/hooks/useWatchlist";

type WatchlistToggleButtonProps = {
  movieId: number;
  movieTitle?: string;
  size?: "small" | "medium" | "large";
};

export function WatchlistToggleButton({
  movieId,
  movieTitle,
  size = "medium",
}: WatchlistToggleButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const canQuery = isAuthenticated && Number.isFinite(movieId);
  const { data, isLoading: isChecking } = useCheckWatchlist(movieId, canQuery);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const isInWatchlist = Boolean(data?.inWatchlist);
  const isMutating = addToWatchlist.isPending || removeFromWatchlist.isPending;
  const disabled = loading || isChecking || isMutating;

  const label = useMemo(() => {
    if (!isAuthenticated) return "Đăng nhập để lưu vào danh sách xem sau";
    return isInWatchlist ? "Bỏ khỏi danh sách xem sau" : "Thêm vào danh sách xem sau";
  }, [isAuthenticated, isInWatchlist]);

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      const returnTo = pathname || "/";
      router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (disabled) return;

    if (isInWatchlist) {
      removeFromWatchlist.mutate(movieId);
      return;
    }

    addToWatchlist.mutate(movieId);
  };

  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          id={`watchlist-toggle-${movieId}`}
          aria-label={`${label}${movieTitle ? `: ${movieTitle}` : ""}`}
          aria-pressed={isInWatchlist}
          onClick={handleToggle}
          disabled={disabled}
          size={size}
          sx={{
            width: size === "large" ? 58 : size === "small" ? 36 : 46,
            height: size === "large" ? 58 : size === "small" ? 36 : 46,
            p: 0,
            borderRadius: "50%",
            color: isInWatchlist ? theme.palette.primary.light : theme.palette.common.white,
            background: "transparent",
            border: "none",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55))",
            transition: "transform .2s ease, color .2s ease, filter .2s ease",
            "&:hover": {
              transform: "translateY(-2px) scale(1.12)",
              backgroundColor: "transparent",
              color: isInWatchlist ? theme.palette.primary.main : theme.palette.primary.light,
              filter: `drop-shadow(0 6px 18px ${alpha(theme.palette.primary.main, 0.42)})`,
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
            <Bookmark
              size={size === "large" ? 40 : size === "small" ? 32 : 36}
              strokeWidth={2.7}
              fill={isInWatchlist ? "currentColor" : "none"}
              absoluteStrokeWidth
              style={{ display: "block" }}
            />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
