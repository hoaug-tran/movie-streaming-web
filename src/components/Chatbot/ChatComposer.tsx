"use client";

import { Box, IconButton, InputBase, alpha, useTheme } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import { KeyboardEvent, useState } from "react";

interface ChatComposerProps {
  isStreaming: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
}

export default function ChatComposer({ isStreaming, onSend, onStop }: ChatComposerProps) {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 0.75,
        p: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "flex-start",
          backgroundColor: isDark
            ? alpha(theme.palette.text.primary, 0.04)
            : alpha(theme.palette.text.primary, 0.03),
          borderRadius: 1.25,
          px: 1.25,
          py: 0.75,
          minHeight: 40,
          maxHeight: 96,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          boxSizing: "border-box",
          transition: "border-color 160ms ease, background-color 160ms ease",
          "&:focus-within": {
            borderColor: alpha(accent, 0.5),
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <InputBase
          fullWidth
          multiline
          maxRows={3}
          autoComplete="off"
          placeholder="Hỏi Gió Phim Bot bất cứ điều gì..."
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 1800))}
          onKeyDown={handleKeyDown}
          inputProps={{ "aria-label": "Tin nhắn" }}
          sx={{
            fontSize: "0.88rem",
            color: theme.palette.text.primary,
            width: "100%",
            alignItems: "flex-start",
            p: 0,
            "& textarea": {
              lineHeight: "1.45 !important",
              maxHeight: "76px !important",
              overflowY: "auto !important",
              boxSizing: "border-box",
              resize: "none",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.text.primary, 0.2),
                borderRadius: 4,
              },
            },
          }}
        />
      </Box>
      {isStreaming ? (
        <IconButton
          aria-label="Dừng"
          onClick={onStop}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.25,
            backgroundColor: alpha(theme.palette.error.main, 0.12),
            color: theme.palette.error.main,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.2),
            },
          }}
        >
          <StopCircleRoundedIcon fontSize="small" />
        </IconButton>
      ) : (
        <IconButton
          aria-label="Gửi"
          onClick={handleSend}
          disabled={!value.trim()}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.25,
            backgroundColor: "#1f2937",
            color: accent,
            border: `1px solid ${alpha(accent, 0.4)}`,
            transition: "all 160ms ease",
            "&:hover": {
              backgroundColor: "#252e3d",
              borderColor: accent,
            },
            "&.Mui-disabled": {
              opacity: 0.45,
              color: alpha(accent, 0.5),
              borderColor: alpha(accent, 0.2),
            },
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
