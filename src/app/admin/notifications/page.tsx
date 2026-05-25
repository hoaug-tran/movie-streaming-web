"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import AdminFormDrawer from "@/modules/admin/components/AdminFormDrawer";
import {
  adminService,
  AdminUser,
  type AdminNotification,
  type AdminNotificationPayload,
  type AdminNotificationUpdatePayload,
  type AdminBroadcastPayload,
} from "@/modules/admin/api";

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

type EditForm = { title: string; content: string; type: string; actionUrl: string };

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
    helperText: "VD: /movies/movie-slug hoặc /profile/subscription",
  },
];

type CreateFormState = {
  broadcastToAll: boolean;
  selectedUser: AdminUser | null;
  title: string;
  content: string;
  type: string;
  actionUrl: string;
};

function CreateNotificationDrawer({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminNotificationPayload | AdminBroadcastPayload, broadcast: boolean) => void;
  submitting: boolean;
  error: React.ReactNode;
}) {
  const [form, setForm] = useState<CreateFormState>({
    broadcastToAll: false,
    selectedUser: null,
    title: "",
    content: "",
    type: "SYSTEM",
    actionUrl: "",
  });
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
  });

  const users = usersQuery.data ?? [];

  const reset = () => {
    setForm({
      broadcastToAll: false,
      selectedUser: null,
      title: "",
      content: "",
      type: "SYSTEM",
      actionUrl: "",
    });
    setSendInApp(true);
    setSendEmail(false);
  };

  if (!open) return null;

  const channelError = !sendInApp && !sendEmail;

  return (
    <AdminFormDrawer<EditForm>
      open={open}
      title="Tạo thông báo"
      description="Gửi thông báo đến một người dùng cụ thể hoặc toàn bộ hệ thống."
      mode="create"
      fields={editFields}
      initialValues={{
        title: form.title,
        content: form.content,
        type: form.type,
        actionUrl: form.actionUrl,
      }}
      submitting={submitting}
      error={error}
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={(values) => {
        const merged = { ...form, ...values };
        setForm((prev) => ({ ...prev, ...values }));
        if (!merged.broadcastToAll && !merged.selectedUser) return;
        if (channelError) return;
        if (merged.broadcastToAll) {
          onSubmit(
            {
              title: values.title,
              content: values.content,
              type: values.type,
              actionUrl: values.actionUrl || undefined,
              sendInApp,
              sendEmail,
            } as AdminBroadcastPayload,
            true
          );
        } else {
          onSubmit(
            {
              userId: merged.selectedUser!.id,
              title: values.title,
              content: values.content,
              type: values.type,
              actionUrl: values.actionUrl || undefined,
              sendInApp,
              sendEmail,
            } as AdminNotificationPayload,
            false
          );
        }
      }}
      extraHeader={
        <Box sx={{ px: 3, pb: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={form.broadcastToAll}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    broadcastToAll: e.target.checked,
                    selectedUser: null,
                  }))
                }
                color="primary"
              />
            }
            label={
              <Typography variant="body2" fontWeight={700}>
                Gửi tất cả người dùng
              </Typography>
            }
          />
          {!form.broadcastToAll && (
            <Autocomplete<AdminUser>
              options={users}
              loading={usersQuery.isLoading}
              getOptionLabel={(u) => `${u.fullName ?? u.username} (@${u.username}) - #${u.id}`}
              value={form.selectedUser}
              onChange={(_, value) => setForm((prev) => ({ ...prev, selectedUser: value }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Người nhận"
                  size="small"
                  required
                  error={!form.selectedUser}
                  helperText={
                    !form.selectedUser
                      ? "Chọn người nhận hoặc bật Gửi tất cả"
                      : `ID: ${form.selectedUser.id}`
                  }
                />
              )}
            />
          )}

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Kênh gửi
            </Typography>
            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={700}>
                    Thông báo trong trang
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    color="secondary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={700}>
                    Gửi email
                  </Typography>
                }
              />
            </Stack>
            {channelError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                Vui lòng chọn ít nhất một kênh gửi.
              </Typography>
            )}
          </Box>
        </Box>
      }
    />
  );
}

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<AdminNotification | null>(null);

  const handleCreate = async (
    payload: AdminNotificationPayload | AdminBroadcastPayload,
    broadcast: boolean
  ) => {
    if (createSubmitting) {
      console.warn("[AdminNotif] Submission already in progress, ignoring duplicate request");
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);
    try {
      if (broadcast) {
        await adminService.broadcastNotification(payload as AdminBroadcastPayload);
      } else {
        await adminService.createNotification(payload as AdminNotificationPayload);
      }
      console.log("[AdminNotif] create/broadcast success — invalidating query");
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      console.log("[AdminNotif] invalidateQueries done");
    } catch (err) {
      console.error("[AdminNotif] create/broadcast failed:", err);
      setCreateError("Gửi thất bại. Kiểm tra lại backend.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <>
      <AdminManagementPage<AdminNotification>
        permission="notifications:manage"
        title="Quản lý thông báo"
        description="Xem toàn bộ thông báo của người dùng. Tạo thông báo thủ công hoặc gửi broadcast toàn hệ thống."
        queryKey={["admin-notifications"]}
        queryFn={adminService.getNotifications}
        searchPlaceholder="Tìm theo tiêu đề, nội dung..."
        getSearchText={(item) => `${item.title} ${item.content}`}
        extraFilters={[
          {
            key: "type",
            label: "Loại",
            options: NOTIFICATION_TYPES.map((t) => ({ label: t.label, value: t.value })),
            getValue: (item) => item.type,
          },
        ]}
        stats={[
          { label: "Tổng thông báo", getValue: (items) => items.length, tone: "cyan" },
          {
            label: "Hệ thống",
            getValue: (items) => items.filter((i) => i.type === "SYSTEM").length,
            tone: "violet",
          },
          {
            label: "Nội dung mới",
            getValue: (items) => items.filter((i) => i.type === "NEW_EPISODE").length,
            tone: "cyan",
          },
          {
            label: "Thanh toán",
            getValue: (items) =>
              items.filter((i) => i.type === "PAYMENT_SUCCESS" || i.type === "PAYMENT_FAILED")
                .length,
            tone: "emerald",
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
            key: "user",
            label: "Người nhận",
            render: (item) => {
              if (!item.userId) {
                return <AdminStatusChip label="Toàn hệ thống" tone="violet" />;
              }
              const displayName = item.userFullName ?? item.userUsername;
              return (
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {displayName ?? `#${item.userId}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {item.userUsername ? `@${item.userUsername}` : `ID #${item.userId}`}
                  </Typography>
                </Stack>
              );
            },
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
            key: "createdAt",
            label: "Thời gian",
            render: (item) => (
              <Typography variant="caption" color="text.secondary">
                {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "-"}
              </Typography>
            ),
          },
        ]}
        createLabel="Tạo thông báo"
        onCreateClick={() => setCreateOpen(true)}
        onEdit={(item, payload) =>
          adminService.updateNotification(item.id, payload as AdminNotificationUpdatePayload)
        }
        onDelete={(item) => adminService.deleteNotification(item.id)}
        onRowClick={(item) => setDetailItem(item)}
        renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => {
          if (mode === "create") return null;
          return (
            <AdminFormDrawer<EditForm>
              open={open}
              title={`Sửa thông báo #${item?.id}`}
              description="Chỉnh sửa nội dung thông báo."
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
      />

      <CreateNotificationDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitting={createSubmitting}
        error={createError}
      />

      <Box>
        {detailItem && (
          <Box
            component="div"
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1300,
            }}
            onClick={() => setDetailItem(null)}
          >
            <Box
              component="div"
              onClick={(e) => e.stopPropagation()}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                p: 3,
                maxWidth: 600,
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Chi tiết thông báo #{detailItem.id}
                </Typography>
                <IconButton size="small" onClick={() => setDetailItem(null)}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Tiêu đề
                  </Typography>
                  <Typography variant="body2">{detailItem.title}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Nội dung
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {detailItem.content}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Loại
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <AdminStatusChip
                      label={
                        NOTIFICATION_TYPES.find((t) => t.value === detailItem.type)?.label ??
                        detailItem.type
                      }
                      tone={TYPE_TONE[detailItem.type] ?? "cyan"}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Người nhận
                  </Typography>
                  <Typography variant="body2">
                    {!detailItem.userId
                      ? "Toàn hệ thống"
                      : `${detailItem.userFullName ?? detailItem.userUsername ?? `#${detailItem.userId}`}`}
                  </Typography>
                </Box>
                {detailItem.actionUrl && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      URL hành động
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {detailItem.actionUrl}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Thời gian tạo
                  </Typography>
                  <Typography variant="body2">
                    {detailItem.createdAt
                      ? new Date(detailItem.createdAt).toLocaleString("vi-VN")
                      : "-"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 3, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button onClick={() => setDetailItem(null)} sx={{ textTransform: "none" }}>
                  Đóng
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
