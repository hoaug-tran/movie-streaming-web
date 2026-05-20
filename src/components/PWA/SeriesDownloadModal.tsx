"use client";

import React from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  alpha,
  useTheme,
  Button,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Episode } from "@/modules/movie/types/movie";
import OfflineDownloadButton from "./OfflineDownloadButton";

interface SeriesDownloadModalProps {
  open: boolean;
  onClose: () => void;
  episodes: Episode[];
}

export default function SeriesDownloadModal({ open, onClose, episodes }: SeriesDownloadModalProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#161616",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          borderRadius: 3,
          backgroundImage: "none",
          m: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
            <Box
              component="img"
              src="/icons/logo.webp"
              alt="Gió Phim"
              sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F0F0", lineHeight: 1.2 }}
              >
                Tải ngoại tuyến
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", mt: 0.3 }}>
                Chọn tập phim để tải xuống thiết bị
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)", p: 0.5 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 2, pt: "8px !important" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            maxHeight: "50vh",
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 3,
            },
          }}
        >
          {episodes.map((ep) => (
            <Box
              key={ep.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                {ep.thumbnailUrl ? (
                  <Box
                    component="img"
                    src={ep.thumbnailUrl}
                    alt={ep.title}
                    sx={{
                      width: 80,
                      height: 45,
                      objectFit: "cover",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 80,
                      height: 45,
                      borderRadius: 1,
                      bgcolor: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    Tập {ep.episodeNumber ?? "?"}
                  </Box>
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 600,
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
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.75rem",
                        mt: 0.2,
                      }}
                    >
                      {Math.floor(ep.durationSeconds / 60)}:
                      {String(Math.floor(ep.durationSeconds % 60)).padStart(2, "0")}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
                <OfflineDownloadButton
                  episodeId={ep.id}
                  availableQualities={ep.availableQualities}
                  durationSeconds={ep.durationSeconds}
                  variant="pill"
                  size="small"
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: "#C8102E",
              "&:hover": { bgcolor: "#a50d26" },
            }}
          >
            Đóng
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
