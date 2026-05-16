"use client";

import { alpha, Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Tv,
  Settings,
  X,
  MessageSquareReply,
  Heart,
  Flame,
  CreditCard,
  Star,
} from "lucide-react";
import type { Notification, NotificationType } from "@/modules/notification/types";
import NotificationDetailModal from "./NotificationDetailModal";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose?: () => void;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  PAYMENT_SUCCESS: { icon: <CheckCircle size={15} />, color: "#22c55e", label: "Thanh toán" },
  PAYMENT_FAILED: { icon: <AlertCircle size={15} />, color: "#ef4444", label: "Thanh toán" },
  PREMIUM_EXPIRING: { icon: <Clock size={15} />, color: "#f59e0b", label: "Gói thuê bao" },
  SUBSCRIPTION_EXPIRED: { icon: <CreditCard size={15} />, color: "#ef4444", label: "Gói thuê bao" },
  NEW_EPISODE: { icon: <Tv size={15} />, color: "#3b82f6", label: "Nội dung mới" },
  COMMENT_REPLY: { icon: <MessageSquareReply size={15} />, color: "#8b5cf6", label: "Bình luận" },
  COMMENT_LIKE: { icon: <Heart size={15} />, color: "#ec4899", label: "Bình luận" },
  REVIEW_LIKE: { icon: <Star size={15} />, color: "#f59e0b", label: "Đánh giá" },
  HOT_MOVIES: { icon: <Flame size={15} />, color: "#f97316", label: "Phim hot" },
  SYSTEM: { icon: <Settings size={15} />, color: "#6b7280", label: "Hệ thống" },
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const theme = useTheme();
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const config = typeConfig[notification.type] ?? typeConfig.SYSTEM;

  const handleClick = () => {
    if (!notification.isRead) onMarkAsRead(notification.id);
    if (notification.actionUrl) {
      onClose?.();
      router.push(notification.actionUrl);
    } else {
      setDetailOpen(true);
    }
  };

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  })();

  const isContentTruncated = notification.content.length > 80;

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          bgcolor: notification.isRead ? "transparent" : alpha(theme.palette.primary.main, 0.06),
          borderLeft: notification.isRead
            ? "3px solid transparent"
            : `3px solid ${theme.palette.primary.main}`,
          transition: "background-color 0.2s",
          "&:hover": { bgcolor: alpha(config.color, 0.05) },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: alpha(config.color, 0.12),
            color: config.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 0.25,
            border: `1px solid ${alpha(config.color, 0.2)}`,
          }}
        >
          {config.icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: notification.isRead ? 500 : 700,
                lineHeight: 1.4,
                color: "text.primary",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                fontSize: "0.8125rem",
              }}
            >
              {notification.title}
            </Typography>
            <Tooltip title="Xóa thông báo">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                sx={{
                  flexShrink: 0,
                  p: 0.25,
                  color: "text.disabled",
                  "&:hover": { color: "error.main", bgcolor: alpha("#ef4444", 0.08) },
                }}
              >
                <X size={12} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              mt: 0.25,
              fontSize: "0.75rem",
            }}
          >
            {notification.content}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                color: config.color,
                fontWeight: 700,
                bgcolor: alpha(config.color, 0.1),
                px: 0.75,
                py: 0.15,
                borderRadius: 0.75,
                border: `1px solid ${alpha(config.color, 0.2)}`,
              }}
            >
              {config.label}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
              {timeAgo}
            </Typography>
            {(isContentTruncated || notification.actionUrl) && (
              <Typography
                variant="caption"
                sx={{ fontSize: "0.65rem", color: "primary.main", fontWeight: 600, ml: "auto" }}
              >
                {notification.actionUrl ? "Xem →" : "Đọc thêm →"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <NotificationDetailModal
        notification={notification}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
