"use client";

import {
  Box,
  Fab,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePwa } from "@/hooks/use-pwa";

const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

const STORAGE_WELCOME_KEY = "giophim:chatbot:welcomeShown:v4";
const WELCOME_DELAY_MS = 2000;
const WELCOME_TIMEOUT_MS = 12000;

const HIDDEN_PATHS = ["/admin", "/auth"];

export default function GioPhimBot() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const { isOnline } = usePwa();
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const isHidden = HIDDEN_PATHS.some((prefix) => (pathname ? pathname.startsWith(prefix) : false));

  const handleOpen = useCallback(() => {
    setOpen(true);
    setShowWelcome(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_WELCOME_KEY, "1");
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_WELCOME_KEY, "1");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isHidden) return;
    if (sessionStorage.getItem(STORAGE_WELCOME_KEY)) return;

    const showTimer = window.setTimeout(() => {
      setShowWelcome(true);
    }, WELCOME_DELAY_MS);

    const hideTimer = window.setTimeout(() => {
      setShowWelcome(false);
    }, WELCOME_DELAY_MS + WELCOME_TIMEOUT_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isHidden]);

  if (isHidden) return null;

  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  return (
    <>
      <ChatPanel open={open} onClose={handleClose} />

      <Box
        sx={{
          position: "fixed",
          right: isMobile ? 14 : 22,
          bottom: isMobile
            ? "calc(14px + var(--giophim-install-banner-h, 0px))"
            : "calc(22px + var(--giophim-install-banner-h, 0px))",
          zIndex: 1401,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1.25,
          pointerEvents: "none",
          transition: "bottom 220ms ease",
        }}
      >
        {showWelcome && !open && isOnline && (
          <Box
            role="status"
            sx={{
              pointerEvents: "auto",
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, isDark ? 0.5 : 0.16)}`,
              borderRadius: 1.5,
              px: 1.5,
              py: 1.25,
              maxWidth: 300,
              minWidth: 240,
              position: "relative",
              transformOrigin: "bottom right",
              animation: "giophim-pop-in 280ms ease-out",
              "@keyframes giophim-pop-in": {
                from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
                to: { opacity: 1, transform: "translateY(0) scale(1)" },
              },
              "&::after": {
                content: '""',
                position: "absolute",
                right: 22,
                bottom: -7,
                width: 12,
                height: 12,
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
                borderBottom: `1px solid ${theme.palette.divider}`,
                transform: "rotate(45deg)",
              },
            }}
          >
            <IconButton
              size="small"
              onClick={dismissWelcome}
              aria-label="Đóng gợi ý"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                color: theme.palette.text.secondary,
                width: 22,
                height: 22,
                borderRadius: 1,
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ cursor: "pointer", pr: 2.5 }}
              onClick={handleOpen}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDark
                    ? alpha(theme.palette.text.primary, 0.06)
                    : alpha(theme.palette.text.primary, 0.05),
                  border: `1px solid ${alpha(accent, 0.35)}`,
                  color: accent,
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "0.86rem",
                    lineHeight: 1.3,
                  }}
                >
                  Gió Phim Bot đã sẵn sàng
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "block",
                    lineHeight: 1.35,
                    fontSize: "0.74rem",
                    mt: 0.25,
                  }}
                >
                  Cần gợi ý phim hay hỗ trợ? Bấm để chat ngay.
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Box sx={{ pointerEvents: "auto" }}>
          <Fab
            aria-label="Mở Gió Phim Bot"
            onClick={open ? handleClose : handleOpen}
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1.75,
              backgroundColor: isDark ? "#1a1d24" : "#1f2937",
              color: "#fff",
              boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, isDark ? 0.5 : 0.25)}`,
              border: `1px solid ${alpha(accent, 0.45)}`,
              transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
              "&:hover": {
                backgroundColor: isDark ? "#22262f" : "#252e3d",
                transform: "translateY(-2px)",
                boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, isDark ? 0.65 : 0.32)}`,
                borderColor: accent,
              },
              "&.Mui-disabled": {
                backgroundColor: isDark ? "#1a1d24" : "#1f2937",
                opacity: 0.6,
                borderColor: alpha(theme.palette.text.disabled, 0.2),
              },
              "& svg": { color: !isOnline ? theme.palette.text.disabled : accent, fontSize: 24 },
            }}
            disabled={!isOnline}
          >
            {open ? (
              <CloseRoundedIcon />
            ) : !isOnline ? (
              <WifiOffRoundedIcon />
            ) : (
              <AutoAwesomeRoundedIcon />
            )}
          </Fab>
        </Box>
      </Box>
    </>
  );
}
