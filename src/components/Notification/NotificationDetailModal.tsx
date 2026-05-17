"use client";

import {
  alpha,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Tv,
  Settings,
  MessageSquareReply,
  Heart,
  Flame,
  CreditCard,
  ExternalLink,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Notification, NotificationType } from "@/modules/notification/types";

interface NotificationDetailModalProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  PAYMENT_SUCCESS: { icon: <CheckCircle size={18} />, color: "#22c55e", label: "Thanh toán" },
  PAYMENT_FAILED: { icon: <AlertCircle size={18} />, color: "#ef4444", label: "Thanh toán" },
  PREMIUM_EXPIRING: { icon: <Clock size={18} />, color: "#f59e0b", label: "Gói thuê bao" },
  SUBSCRIPTION_EXPIRED: { icon: <CreditCard size={18} />, color: "#ef4444", label: "Gói thuê bao" },
  NEW_EPISODE: { icon: <Tv size={18} />, color: "#3b82f6", label: "Nội dung mới" },
  COMMENT_REPLY: { icon: <MessageSquareReply size={18} />, color: "#8b5cf6", label: "Bình luận" },
  COMMENT_LIKE: { icon: <Heart size={18} />, color: "#ec4899", label: "Bình luận" },
  REVIEW_LIKE: { icon: <Star size={18} />, color: "#f59e0b", label: "Đánh giá" },
  HOT_MOVIES: { icon: <Flame size={18} />, color: "#f97316", label: "Phim hot" },
  SYSTEM: { icon: <Settings size={18} />, color: "#6b7280", label: "Hệ thống" },
};

const SOCIAL_TYPES: NotificationType[] = ["COMMENT_REPLY", "COMMENT_LIKE", "REVIEW_LIKE"];

function resolveActionUrl(notification: Notification): string | null {
  const url = notification.actionUrl;
  if (!url) return null;
  if (SOCIAL_TYPES.includes(notification.type) && url.startsWith("/watch/")) {
    return url.replace(/^\/watch\//, "/movies/");
  }
  return url;
}

export default function NotificationDetailModal({
  notification,
  open,
  onClose,
}: NotificationDetailModalProps) {
  const theme = useTheme();
  const router = useRouter();

  if (!notification) return null;

  const config = typeConfig[notification.type] ?? typeConfig.SYSTEM;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  })();

  const fullDate = (() => {
    try {
      return format(new Date(notification.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi });
    } catch {
      return "";
    }
  })();

  const handleActionClick = () => {
    const url = resolveActionUrl(notification);
    if (url) {
      onClose();
      router.push(url);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 32px 80px rgba(0,0,0,0.8)"
              : "0 16px 48px rgba(0,0,0,0.16)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          bgcolor: alpha(config.color, 0.06),
          borderBottom: `1px solid ${alpha(config.color, 0.15)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 2.5 }}>
          <Box
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: alpha(config.color, 0.12),
              color: config.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${alpha(config.color, 0.25)}`,
              mt: 0.25,
            }}
          >
            {config.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.01em" }}
            >
              {notification.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
              <Chip
                label={config.label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: alpha(config.color, 0.1),
                  color: config.color,
                  border: `1px solid ${alpha(config.color, 0.2)}`,
                  borderRadius: 0.75,
                }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
                {timeAgo} · {fullDate}
              </Typography>
              {!notification.isRead && (
                <Chip
                  label="Chưa đọc"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    borderRadius: 0.75,
                  }}
                />
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ flexShrink: 0, color: "text.secondary", "&:hover": { color: "text.primary" } }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.75,
              color: "text.primary",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {notification.content}
          </Typography>
        </Box>

        {resolveActionUrl(notification) && (
          <>
            <Divider />
            <Box
              onClick={handleActionClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 1.75,
                cursor: "pointer",
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              <ExternalLink size={15} color={theme.palette.primary.main} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                Xem chi tiết
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
