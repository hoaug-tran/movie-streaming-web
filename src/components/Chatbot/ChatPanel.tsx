"use client";

import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CircleIcon from "@mui/icons-material/Circle";
import { useEffect, useRef } from "react";
import ChatComposer from "./ChatComposer";
import ChatBubble from "./ChatBubble";
import { useChatStream } from "@/hooks/use-chat-stream";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Gợi ý 1 phim hành động hay",
  "Có phim mới nào tháng này?",
  "Cách tải phim xem offline?",
  "Sự khác biệt Free và Premium?",
];

export default function ChatPanel({ open, onClose }: ChatPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { messages, sendMessage, clearHistory, isStreaming, abortStream } = useChatStream();
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages]);

  if (!open) return null;

  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;
  const headerBg = isDark ? "#15181f" : "#1f2937";

  return (
    <Box
      role="dialog"
      aria-label="Gió Phim Bot"
      sx={{
        position: "fixed",
        zIndex: 1402,
        right: isMobile ? 10 : 22,
        left: isMobile ? 10 : "auto",
        bottom: isMobile
          ? "calc(env(safe-area-inset-bottom, 0px) + 16px + var(--giophim-install-banner-h, 0px))"
          : "calc(88px + var(--giophim-install-banner-h, 0px))",
        top: isMobile ? "calc(env(safe-area-inset-top, 0px) + 84px)" : "auto",
        width: isMobile ? "auto" : 380,
        height: isMobile ? "auto" : 560,
        maxHeight: isMobile
          ? "min(560px, calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 110px))"
          : "calc(100vh - 110px - var(--giophim-install-banner-h, 0px))",
        backgroundColor: theme.palette.background.paper,
        borderRadius: isMobile ? 3 : 2,
        boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, isDark ? 0.55 : 0.2)}`,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "giophim-panel-in 200ms ease-out",
        "@keyframes giophim-panel-in": {
          from: { transform: "translateY(12px) scale(0.98)", opacity: 0 },
          to: { transform: "translateY(0) scale(1)", opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: headerBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha("#fff", 0.08)}`,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha("#fff", 0.06),
              border: `1px solid ${alpha(accent, 0.5)}`,
              color: accent,
            }}
            variant="rounded"
          >
            <AutoAwesomeRoundedIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Gió Phim Bot
            </Typography>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <CircleIcon
                sx={{
                  fontSize: 8,
                  color: isStreaming ? accent : "#22c55e",
                  animation: isStreaming ? "giophim-pulse 1.4s ease-in-out infinite" : undefined,
                  "@keyframes giophim-pulse": {
                    "0%, 100%": { opacity: 0.4 },
                    "50%": { opacity: 1 },
                  },
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "0.72rem" }}>
                {isStreaming ? "Đang trả lời..." : "Sẵn sàng trợ giúp"}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.25}>
          <IconButton
            size="small"
            onClick={clearHistory}
            aria-label="Xoá hội thoại"
            sx={{
              color: alpha("#fff", 0.7),
              "&:hover": { color: "#fff", backgroundColor: alpha("#fff", 0.08) },
            }}
          >
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Đóng"
            sx={{
              color: alpha("#fff", 0.7),
              "&:hover": { color: "#fff", backgroundColor: alpha("#fff", 0.08) },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box
        ref={listRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 1.75,
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          backgroundColor: theme.palette.background.default,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.text.primary, 0.18),
            borderRadius: 6,
          },
        }}
      >
        {messages.length === 0 && (
          <Stack spacing={1.5} sx={{ py: 1, alignItems: "flex-start" }}>
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                px: 1.75,
                py: 1.25,
                borderRadius: 1.5,
                maxWidth: "88%",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.6, fontSize: "0.88rem", color: "inherit" }}
              >
                Xin chào, mình là Gió Phim Bot. Mình có thể gợi ý phim, hướng dẫn dùng nền tảng,
                hoặc trả lời câu hỏi về tài khoản. Bạn cần hỗ trợ gì hôm nay?
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem", pl: 0.5 }}
            >
              Gợi ý câu hỏi
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {SUGGESTIONS.map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  size="small"
                  onClick={() => sendMessage(suggestion)}
                  sx={{
                    borderRadius: 1.25,
                    height: 28,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    transition: "border-color 160ms ease, background-color 160ms ease",
                    "&:hover": {
                      bgcolor: theme.palette.background.paper,
                      borderColor: alpha(accent, 0.6),
                      color: accent,
                    },
                  }}
                />
              ))}
            </Box>
          </Stack>
        )}

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </Box>

      <ChatComposer isStreaming={isStreaming} onSend={sendMessage} onStop={abortStream} />
    </Box>
  );
}
