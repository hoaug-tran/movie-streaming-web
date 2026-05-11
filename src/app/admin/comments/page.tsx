"use client";

import { Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminComment, AdminCommentPayload, adminService } from "@/modules/admin/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";

type CommentFormValues = AdminCommentPayload & Record<string, unknown>;

const fields: AdminFormField<CommentFormValues>[] = [
  { name: "content", label: "Nội dung", required: true, type: "textarea", maxLength: 5000 },
  { name: "userId", label: "Người dùng (ID kỹ thuật)", type: "number", required: true, min: 1 },
  { name: "movieId", label: "Phim (ID kỹ thuật)", type: "number", required: true, min: 1 },
  { name: "episodeId", label: "Tập phim (ID kỹ thuật)", type: "number", min: 1 },
  { name: "parentCommentId", label: "Bình luận cha (ID kỹ thuật)", type: "number", min: 1 },
  {
    name: "status",
    label: "Trạng thái",
    type: "select",
    required: true,
    options: [
      { value: "VISIBLE", label: "Hiển thị" },
      { value: "PENDING", label: "Chờ duyệt" },
      { value: "HIDDEN", label: "Ẩn" },
    ],
  },
];

function toForm(comment?: AdminComment | null): CommentFormValues {
  return {
    content: comment?.content ?? "",
    userId: comment?.userId ?? 0,
    movieId: comment?.movieId ?? 0,
    episodeId: comment?.episodeId ?? null,
    parentCommentId: comment?.parentCommentId ?? null,
    status: comment?.status ?? "VISIBLE",
  };
}

export default function AdminCommentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <AdminManagementPage<AdminComment>
      permission="comments:manage"
      title="Quản lý đánh giá và bình luận"
      description="Kiểm duyệt nội dung người dùng, ẩn/xóa bình luận vi phạm."
      queryKey={["admin", "comments"]}
      queryFn={adminService.getComments}
      searchPlaceholder="Tìm nội dung, người dùng, tên phim..."
      getSearchText={(comment) =>
        `${comment.content ?? ""} ${comment.authorUsername ?? ""} ${comment.authorFullName ?? ""} ${comment.movieTitle ?? ""} ${comment.userId ?? ""} ${comment.movieId ?? ""} ${comment.status ?? ""}`
      }
      stats={[
        { label: "Bình luận", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Đang hiển thị",
          getValue: (items) => items.filter((item) => item.status === "VISIBLE").length,
          tone: "emerald",
        },
        {
          label: "Chờ duyệt",
          getValue: (items) => items.filter((item) => item.status === "PENDING").length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "content",
          label: "Nội dung",
          render: (comment) => (
            <Typography color="text.secondary">{comment.content || "Không có nội dung"}</Typography>
          ),
        },
        {
          key: "owner",
          label: "Nguồn",
          render: (comment) => (
            <AdminStatusChip
              label={`${comment.authorFullName || comment.authorUsername || `User #${comment.userId ?? "—"}`} · ${comment.movieTitle || `Movie #${comment.movieId ?? "—"}`}`}
              tone="violet"
            />
          ),
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (comment) => (
            <AdminStatusChip
              label={comment.status || "UNKNOWN"}
              tone={comment.status === "VISIBLE" ? "emerald" : "amber"}
            />
          ),
        },
      ]}
      quickActions={[
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (comment) => adminService.deleteComment(comment.id),
        },
      ]}
      createLabel={isAdmin ? "Thêm bình luận" : undefined}
      onCreate={
        isAdmin
          ? (payload) => adminService.createComment(payload as AdminCommentPayload)
          : undefined
      }
      onEdit={
        isAdmin
          ? (comment, payload) =>
              adminService.updateComment(comment.id, payload as AdminCommentPayload)
          : undefined
      }
      renderForm={
        isAdmin
          ? ({ mode, item, open, submitting, error, onClose, onSubmit }) => {
              const authorLabel = item?.authorFullName || item?.authorUsername || "Chưa có tên người dùng";
              const movieLabel = item?.movieTitle || "Chưa có tên phim";

              return (
                <AdminFormDrawer<CommentFormValues>
                  open={open}
                  mode={mode}
                  title={mode === "create" ? "Thêm bình luận" : `Sửa bình luận #${item?.id ?? ""}`}
                  description="Admin có thể tạo/sửa bình luận. Moderator chỉ xóa."
                  fields={fields}
                  initialValues={toForm(item)}
                  meta={
                    mode === "edit"
                      ? [
                          {
                            label: "Người dùng",
                            value: authorLabel,
                            helperText: `User ID: ${item?.userId ?? "—"}`,
                          },
                          {
                            label: "Phim",
                            value: movieLabel,
                            helperText: `Movie ID: ${item?.movieId ?? "—"}`,
                          },
                        ]
                      : []
                  }
                  submitting={submitting}
                  error={error}
                  onClose={onClose}
                  onSubmit={onSubmit}
                />
              );
            }
          : undefined
      }
    />
  );
}
