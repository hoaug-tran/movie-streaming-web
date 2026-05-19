"use client";

import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Popover,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Bell, BellRing } from "lucide-react";
import { useState } from "react";
import NotificationItem from "./NotificationItem";
import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useMyNotifications,
} from "@/modules/notification/hooks/useNotifications";
import { usePushNotification } from "@/hooks/use-push-notification";

interface NotificationPopupProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const SCROLL_THRESHOLD = 5;

function NotificationHeader({
  unreadCount,
  isPending,
  onMarkAll,
}: {
  unreadCount: number;
  isPending: boolean;
  onMarkAll: () => void;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.75,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        bgcolor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Thông báo
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Tất cả đã đọc"}
        </Typography>
      </Box>
      {unreadCount > 0 && (
        <Button
          size="small"
          variant="text"
          disabled={isPending}
          onClick={onMarkAll}
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "primary.main",
            textTransform: "none",
            px: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          {isPending ? <CircularProgress size={12} /> : "Đánh dấu tất cả đã đọc"}
        </Button>
      )}
    </Box>
  );
}

function NotificationList({
  notifications,
  isLoading,
  isError,
  needsScroll,
  onMarkAsRead,
  onDelete,
  onClose,
}: {
  notifications: any[];
  isLoading: boolean;
  isError: boolean;
  needsScroll: boolean;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: needsScroll ? "auto" : "visible",
        maxHeight: needsScroll ? 400 : "none",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: alpha(theme.palette.text.disabled, 0.3),
          borderRadius: 2,
        },
      }}
    >
      {isLoading ? (
        <Box sx={{ px: 2, py: 1.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="65%" height={14} />
                <Skeleton variant="text" width="90%" height={12} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" width="40%" height={10} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : isError ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5, gap: 1 }}>
          <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
            Không thể tải thông báo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vui lòng thử lại sau
          </Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 7,
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.text.disabled, 0.08),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
            }}
          >
            <Bell size={24} strokeWidth={1.5} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Chưa có thông báo nào
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center", px: 3 }}>
            Các thông báo về phim, thanh toán và hoạt động sẽ xuất hiện ở đây
          </Typography>
        </Box>
      ) : (
        notifications.map((notification, index) => (
          <Box key={notification.id}>
            <NotificationItem
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
              onClose={onClose}
            />
            {index < notifications.length - 1 && <Divider sx={{ opacity: 0.4 }} />}
          </Box>
        ))
      )}
    </Box>
  );
}

function NotificationFooter({ count }: { count: number }) {
  const theme = useTheme();
  if (count === 0) return null;
  return (
    <>
      <Divider />
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          display: "flex",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.background.default, 0.5),
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
          {count} thông báo
        </Typography>
      </Box>
    </>
  );
}

function PushPermissionBanner() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotification();
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || permission === "denied" || isSubscribed || dismissed) return null;

  return (
    <Box
      sx={{
        mx: 2,
        my: 1.25,
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <BellRing size={18} color={theme.palette.primary.main} />
      <Typography sx={{ flex: 1, fontSize: "0.78rem", color: "text.secondary", lineHeight: 1.4 }}>
        Bật thông báo để nhận tin tức phim mới
      </Typography>
      <Button
        size="small"
        variant="contained"
        onClick={subscribe}
        disabled={isLoading}
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
          flexShrink: 0,
          textTransform: "none",
          minWidth: 60,
        }}
      >
        {isLoading ? <CircularProgress size={12} /> : "Bật"}
      </Button>
      <Box
        onClick={() => setDismissed(true)}
        sx={{
          cursor: "pointer",
          color: "text.disabled",
          display: "flex",
          "&:hover": { color: "text.secondary" },
        }}
      >
        <Bell size={14} />
      </Box>
    </Box>
  );
}

export default function NotificationPopup({ anchorEl, onClose }: NotificationPopupProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const open = Boolean(anchorEl);

  const { data: notifications = [], isLoading, isError } = useMyNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const needsScroll = notifications.length >= SCROLL_THRESHOLD;

  const sharedProps = {
    notifications,
    isLoading,
    isError,
    needsScroll,
    onMarkAsRead: (id: number) => markAsRead.mutate(id),
    onDelete: (id: number) => deleteNotification.mutate(id),
    onClose,
  };

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: false }}
        PaperProps={{
          sx: {
            borderRadius: "12px 12px 0 0",
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderBottom: "none",
            maxHeight: "85vh",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.disabled, 0.3),
            mx: "auto",
            mt: 1.25,
            mb: 0.5,
            flexShrink: 0,
          }}
        />
        <NotificationHeader
          unreadCount={unreadCount}
          isPending={markAllAsRead.isPending}
          onMarkAll={() => markAllAsRead.mutate()}
        />
        <Divider />
        <PushPermissionBanner />
        <NotificationList {...sharedProps} needsScroll={true} />
        <NotificationFooter count={notifications.length} />
      </Drawer>
    );
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: 420,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.97)
                : theme.palette.background.paper,
            backdropFilter: "blur(24px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)"
                : "0 16px 48px rgba(0,0,0,0.14)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            mt: 1.5,
            maxHeight: 560,
          },
        },
      }}
    >
      <NotificationHeader
        unreadCount={unreadCount}
        isPending={markAllAsRead.isPending}
        onMarkAll={() => markAllAsRead.mutate()}
      />
      <Divider />
      <PushPermissionBanner />
      <NotificationList {...sharedProps} />
      <NotificationFooter count={notifications.length} />
    </Popover>
  );
}
