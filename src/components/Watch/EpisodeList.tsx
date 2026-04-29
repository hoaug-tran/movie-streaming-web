"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { Close, PlayArrow } from "@mui/icons-material";
import { Episode } from "@/modules/movie/types/movie";

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisode: Episode;
  onSelect: (ep: Episode) => void;
  onClose: () => void;
}

export default function EpisodeList({
  episodes,
  currentEpisode,
  onSelect,
  onClose,
}: EpisodeListProps) {
  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: { xs: "100%", sm: 320 },
        bgcolor: "rgba(10,10,10,0.97)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Danh sách tập ({episodes.length})
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {episodes.map((ep) => {
          const isCurrent = ep.id === currentEpisode.id;
          return (
            <Box
              key={ep.id}
              onClick={() => onSelect(ep)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                py: 1.5,
                cursor: "pointer",
                bgcolor: isCurrent ? "rgba(200,16,46,0.12)" : "transparent",
                borderLeft: isCurrent
                  ? "3px solid #C8102E"
                  : "3px solid transparent",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: isCurrent
                    ? "rgba(200,16,46,0.18)"
                    : "rgba(255,255,255,0.06)",
                },
              }}
            >
              {ep.thumbnailUrl ? (
                <Box
                  component="img"
                  src={ep.thumbnailUrl}
                  alt={ep.title}
                  sx={{
                    width: 72,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 72,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: isCurrent ? "#C8102E" : "rgba(255,255,255,0.3)",
                    fontSize: "0.85rem",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {ep.episodeNumber ?? "?"}
                </Box>
              )}

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: isCurrent ? "#fff" : "rgba(255,255,255,0.75)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: isCurrent ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ep.title ?? `Tập ${ep.episodeNumber}`}
                </Typography>
                {ep.durationSeconds && (
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.72rem",
                      mt: 0.2,
                    }}
                  >
                    {Math.floor(ep.durationSeconds / 60)} phút
                  </Typography>
                )}
              </Box>

              {isCurrent ? (
                <PlayArrow sx={{ color: "#C8102E", fontSize: 18 }} />
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
