"use client";

import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Popover,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Bell, BellRing, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationItem from "./NotificationItem";
import {
  useDeleteAllMyNotifications,
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
  totalCount,
  isPending,
  onMarkAll,
  isClearing,
  onClearAll,
}: {
  unreadCount: number;
  totalCount: number;
  isPending: boolean;
  onMarkAll: () => void;
  isClearing: boolean;
  onClearAll: () => void;
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
        gap: 1,
        flexShrink: 0,
        bgcolor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Thông báo
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Tất cả đã đọc"}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
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
            {isPending ? <CircularProgress size={12} /> : "Đánh dấu đã đọc"}
          </Button>
        )}
        {totalCount > 0 && (
          <Button
            size="small"
            variant="text"
            color="error"
            disabled={isClearing}
            onClick={onClearAll}
            startIcon={isClearing ? null : <Trash2 size={14} />}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "none",
              px: 1,
              borderRadius: 1,
              "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) },
            }}
          >
            {isClearing ? <CircularProgress size={12} /> : "Xoá tất cả"}
          </Button>
        )}
      </Stack>
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
  const [readyToShow, setReadyToShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReadyToShow(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!readyToShow) return null;
  if (!isSupported || permission === "denied" || isSubscribed || dismissed) return null;
  if (permission === "granted") return null;

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
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { data: notifications = [], isLoading, isError } = useMyNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAllMyNotifications = useDeleteAllMyNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const needsScroll = notifications.length >= SCROLL_THRESHOLD;

  const handleClearAll = () => setConfirmClearOpen(true);
  const handleConfirmClear = () => {
    deleteAllMyNotifications.mutate(undefined, {
      onSettled: () => setConfirmClearOpen(false),
    });
  };

  const sharedProps = {
    notifications,
    isLoading,
    isError,
    needsScroll,
    onMarkAsRead: (id: number) => markAsRead.mutate(id),
    onDelete: (id: number) => deleteNotification.mutate(id),
    onClose,
  };

  const headerNode = (
    <NotificationHeader
      unreadCount={unreadCount}
      totalCount={notifications.length}
      isPending={markAllAsRead.isPending}
      onMarkAll={() => markAllAsRead.mutate()}
      isClearing={deleteAllMyNotifications.isPending}
      onClearAll={handleClearAll}
    />
  );

  const confirmDialog = (
    <Dialog
      open={confirmClearOpen}
      onClose={() => !deleteAllMyNotifications.isPending && setConfirmClearOpen(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Xoá tất cả thông báo?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Toàn bộ {notifications.length} thông báo của bạn sẽ bị xoá vĩnh viễn. Hành động này không
          thể hoàn tác.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setConfirmClearOpen(false)}
          disabled={deleteAllMyNotifications.isPending}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Huỷ
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirmClear}
          disabled={deleteAllMyNotifications.isPending}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {deleteAllMyNotifications.isPending ? <CircularProgress size={16} /> : "Xoá tất cả"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
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
          {headerNode}
          <Divider />
          <PushPermissionBanner />
          <NotificationList {...sharedProps} needsScroll={true} />
          <NotificationFooter count={notifications.length} />
        </Drawer>
        {confirmDialog}
      </>
    );
  }

  return (
    <>
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
        {headerNode}
        <Divider />
        <PushPermissionBanner />
        <NotificationList {...sharedProps} />
        <NotificationFooter count={notifications.length} />
      </Popover>
      {confirmDialog}
    </>
  );
}
