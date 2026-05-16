"use client";

import { alpha, Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { Bell, BellRing } from "lucide-react";
import { useState } from "react";
import NotificationPopup from "./NotificationPopup";
import { useUnreadCount } from "@/modules/notification/hooks/useNotifications";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface NotificationBellProps {
  isScrolled?: boolean;
  variant?: "badge" | "drawer";
}

export default function NotificationBell({
  isScrolled = false,
  variant = "badge",
}: NotificationBellProps) {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data: unreadCount = 0 } = useUnreadCount(isAuthenticated);

  const hasUnread = unreadCount > 0;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (variant === "drawer") {
    return (
      <>
        <Box
          onClick={handleOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.2,
            borderRadius: 1.5,
            cursor: "pointer",
            color: "text.primary",
            transition: "background-color 0.15s",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
          }}
        >
          <Box
            sx={{
              display: "flex",
              position: "relative",
              color: hasUnread ? "primary.main" : "text.secondary",
              opacity: hasUnread ? 1 : 0.7,
            }}
          >
            {hasUnread ? (
              <BellRing size={20} strokeWidth={2} fill="currentColor" />
            ) : (
              <Bell size={20} strokeWidth={1.5} />
            )}
            {hasUnread && (
              <Box
                sx={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                  border: `1.5px solid ${theme.palette.background.default}`,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: 1 },
                    "50%": { transform: "scale(1.3)", opacity: 0.8 },
                  },
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              fontWeight: hasUnread ? 800 : 600,
              fontSize: "0.95rem",
              letterSpacing: "-0.01em",
              flex: 1,
            }}
          >
            Thông báo
          </Typography>
          {hasUnread && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                bgcolor: "error.main",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 800,
                px: 0.75,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </Box>
        <NotificationPopup anchorEl={anchorEl} onClose={handleClose} />
      </>
    );
  }

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          id="notification-bell-button"
          onClick={handleOpen}
          size="small"
          aria-label={`Thông báo${hasUnread ? ` (${unreadCount} chưa đọc)` : ""}`}
          sx={{
            color: "#ffffff",
            transition: "color 0.25s ease, transform 0.2s ease",
            "&:hover": {
              bgcolor: alpha("#ffffff", 0.1),
              transform: "scale(1.1)",
            },
          }}
        >
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            {hasUnread ? (
              <BellRing size={20} strokeWidth={2} fill="currentColor" />
            ) : (
              <Bell size={20} strokeWidth={1.5} />
            )}
            {hasUnread && (
              <Box
                sx={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 14,
                  height: 14,
                  borderRadius: 7,
                  bgcolor: "error.main",
                  color: "#fff",
                  fontSize: "0.55rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 0.4,
                  border: `1.5px solid ${isScrolled ? theme.palette.background.paper : "transparent"}`,
                  animation: "bellPulse 2s infinite",
                  "@keyframes bellPulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.2)" },
                  },
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Box>
            )}
          </Box>
        </IconButton>
      </Tooltip>
      <NotificationPopup anchorEl={anchorEl} onClose={handleClose} />
    </>
  );
}
