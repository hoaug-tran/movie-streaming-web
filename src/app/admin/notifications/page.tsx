"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import AdminFormDrawer from "@/modules/admin/components/AdminFormDrawer";
import {
  adminService,
  type AdminNotification,
  type AdminNotificationPayload,
  type AdminNotificationUpdatePayload,
  type AdminBroadcastPayload,
} from "@/modules/admin/api";
import { NOTIFICATION_KEYS } from "@/modules/notification/hooks/useNotifications";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

const NOTIFICATION_TYPES = [
  { value: "SYSTEM", label: "Hệ thống" },
  { value: "NEW_EPISODE", label: "Nội dung mới" },
  { value: "PAYMENT_SUCCESS", label: "Thanh toán thành công" },
  { value: "PAYMENT_FAILED", label: "Thanh toán thất bại" },
  { value: "PREMIUM_EXPIRING", label: "Gói sắp hết hạn" },
  { value: "SUBSCRIPTION_EXPIRED", label: "Gói đã hết hạn" },
  { value: "COMMENT_REPLY", label: "Phản hồi bình luận" },
  { value: "COMMENT_LIKE", label: "Thích bình luận" },
  { value: "REVIEW_LIKE", label: "Thích đánh giá" },
  { value: "HOT_MOVIES", label: "Phim hot tuần này" },
];

const TYPE_TONE: Record<string, "cyan" | "emerald" | "rose" | "amber" | "violet"> = {
  SYSTEM: "violet",
  NEW_EPISODE: "cyan",
  PAYMENT_SUCCESS: "emerald",
  PAYMENT_FAILED: "rose",
  PREMIUM_EXPIRING: "amber",
  SUBSCRIPTION_EXPIRED: "rose",
  COMMENT_REPLY: "violet",
  COMMENT_LIKE: "rose",
  REVIEW_LIKE: "amber",
  HOT_MOVIES: "amber",
};

type CreateForm = {
  userId: number;
  title: string;
  content: string;
  type: string;
  actionUrl: string;
};
type EditForm = { title: string; content: string; type: string; actionUrl: string };

const createFields = [
  {
    name: "userId" as const,
    label: "User ID",
    type: "number" as const,
    required: true,
    min: 1,
    helperText: "ID của người dùng nhận thông báo",
  },
  {
    name: "title" as const,
    label: "Tiêu đề",
    type: "text" as const,
    required: true,
    maxLength: 255,
  },
  {
    name: "content" as const,
    label: "Nội dung",
    type: "textarea" as const,
    required: true,
    maxLength: 5000,
  },
  {
    name: "type" as const,
    label: "Loại thông báo",
    type: "select" as const,
    required: true,
    options: NOTIFICATION_TYPES,
  },
  {
    name: "actionUrl" as const,
    label: "URL hành động (tùy chọn)",
    type: "text" as const,
    maxLength: 500,
    helperText: "VD: /watch/movie-slug hoặc /profile/subscription",
  },
];

const editFields = [
  {
    name: "title" as const,
    label: "Tiêu đề",
    type: "text" as const,
    required: true,
    maxLength: 255,
  },
  {
    name: "content" as const,
    label: "Nội dung",
    type: "textarea" as const,
    required: true,
    maxLength: 5000,
  },
  {
    name: "type" as const,
    label: "Loại thông báo",
    type: "select" as const,
    required: true,
    options: NOTIFICATION_TYPES,
  },
  {
    name: "actionUrl" as const,
    label: "URL hành động (tùy chọn)",
    type: "text" as const,
    maxLength: 500,
    helperText: "VD: /watch/movie-slug hoặc /profile/subscription",
  },
];

function BroadcastDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();

  const broadcastMutation = useMutation({
    mutationFn: (payload: AdminBroadcastPayload) => adminService.broadcastNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.adminList() });
    },
  });

  const handleSubmit = (values: EditForm) => {
    broadcastMutation.mutate({ title: values.title, content: values.content, type: values.type });
  };

  return (
    <AdminFormDrawer<EditForm>
      open={open}
      title="Broadcast thông báo"
      description="Gửi thông báo đến tất cả người dùng đang hoạt động trong hệ thống."
      mode="create"
      fields={editFields}
      initialValues={{ title: "", content: "", type: "SYSTEM", actionUrl: "" }}
      submitting={broadcastMutation.isPending}
      error={broadcastMutation.isError ? "Gửi thất bại. Kiểm tra lại backend." : null}
      onClose={() => {
        broadcastMutation.reset();
        onClose();
      }}
      onSubmit={handleSubmit}
    />
  );
}

export default function AdminNotificationsPage() {
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, md: 24 },
            right: { xs: 16, md: 32 },
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CampaignRoundedIcon />}
            onClick={() => setBroadcastOpen(true)}
            sx={{ borderRadius: 1.5, fontWeight: 800 }}
          >
            Broadcast
          </Button>
        </Box>

        <AdminManagementPage<AdminNotification>
          permission="notifications:manage"
          title="Quản lý thông báo"
          description="Tạo, sửa, xóa thông báo cho người dùng. Dùng Broadcast để gửi cho tất cả."
          queryKey={["admin-notifications"]}
          queryFn={adminService.getNotifications}
          searchPlaceholder="Tìm theo tiêu đề, nội dung..."
          getSearchText={(item) => `${item.title} ${item.content}`}
          getStatus={(item) => item.type}
          stats={[
            {
              label: "Tổng thông báo",
              getValue: (items) => items.length,
              tone: "cyan",
            },
            {
              label: "Chưa đọc",
              getValue: (items) => items.filter((i) => !i.isRead).length,
              tone: "amber",
            },
            {
              label: "Đã đọc",
              getValue: (items) => items.filter((i) => i.isRead).length,
              tone: "emerald",
            },
            {
              label: "Hệ thống",
              getValue: (items) => items.filter((i) => i.type === "SYSTEM").length,
              tone: "violet",
            },
          ]}
          columns={[
            {
              key: "id",
              label: "ID",
              render: (item) => (
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>
                  #{item.id}
                </Typography>
              ),
            },
            {
              key: "title",
              label: "Tiêu đề",
              render: (item) => (
                <Typography variant="body2" sx={{ fontWeight: 700, maxWidth: 200 }} noWrap>
                  {item.title}
                </Typography>
              ),
            },
            {
              key: "content",
              label: "Nội dung",
              render: (item) => (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ maxWidth: 280, display: "block" }}
                  noWrap
                >
                  {item.content}
                </Typography>
              ),
            },
            {
              key: "type",
              label: "Loại",
              render: (item) => (
                <AdminStatusChip
                  label={NOTIFICATION_TYPES.find((t) => t.value === item.type)?.label ?? item.type}
                  tone={TYPE_TONE[item.type] ?? "cyan"}
                />
              ),
            },
            {
              key: "isRead",
              label: "Trạng thái",
              render: (item) => (
                <AdminStatusChip
                  label={item.isRead ? "Đã đọc" : "Chưa đọc"}
                  tone={item.isRead ? "emerald" : "amber"}
                />
              ),
            },
            {
              key: "createdAt",
              label: "Thời gian",
              render: (item) => (
                <Typography variant="caption" color="text.secondary">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}
                </Typography>
              ),
            },
          ]}
          createLabel="Tạo thông báo"
          renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => {
            if (mode === "create") {
              return (
                <AdminFormDrawer<CreateForm>
                  open={open}
                  title="Tạo thông báo"
                  description="Tạo thông báo mới cho một người dùng cụ thể."
                  mode="create"
                  fields={createFields}
                  initialValues={{
                    userId: 0,
                    title: "",
                    content: "",
                    type: "SYSTEM",
                    actionUrl: "",
                  }}
                  submitting={submitting}
                  error={error}
                  onClose={onClose}
                  onSubmit={(values) =>
                    onSubmit({
                      userId: Number(values.userId),
                      title: values.title,
                      content: values.content,
                      type: values.type,
                      actionUrl: values.actionUrl || undefined,
                    } as AdminNotificationPayload)
                  }
                />
              );
            }
            return (
              <AdminFormDrawer<EditForm>
                open={open}
                title="Sửa thông báo"
                description={`Chỉnh sửa thông báo #${item?.id}`}
                mode="edit"
                fields={editFields}
                initialValues={{
                  title: item?.title ?? "",
                  content: item?.content ?? "",
                  type: item?.type ?? "SYSTEM",
                  actionUrl: item?.actionUrl ?? "",
                }}
                submitting={submitting}
                error={error}
                onClose={onClose}
                onSubmit={(values) =>
                  onSubmit({
                    title: values.title,
                    content: values.content,
                    type: values.type,
                    actionUrl: values.actionUrl || undefined,
                  } as AdminNotificationUpdatePayload)
                }
              />
            );
          }}
          onCreate={(payload) =>
            adminService.createNotification(payload as AdminNotificationPayload)
          }
          onEdit={(item, payload) =>
            adminService.updateNotification(item.id, payload as AdminNotificationUpdatePayload)
          }
          onDelete={(item) => adminService.deleteNotification(item.id)}
        />
      </Box>

      <BroadcastDialog open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
    </>
  );
}
