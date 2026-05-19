"use client";

import { useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminComment, AdminCommentPayload, AdminReview, adminService } from "@/modules/admin/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { getAbsoluteAvatarUrl } from "@/utils/avatar";

type CommentFormValues = AdminCommentPayload & Record<string, unknown>;

const commentFields: AdminFormField<CommentFormValues>[] = [
  { name: "content", label: "Nội dung", required: true, type: "textarea", maxLength: 5000 },
  { name: "userId", label: "Người dùng (ID)", type: "number", required: true, min: 1 },
  { name: "movieId", label: "Phim (ID)", type: "number", required: true, min: 1 },
  { name: "episodeId", label: "Tập phim (ID)", type: "number", min: 1 },
  { name: "parentCommentId", label: "Bình luận cha (ID)", type: "number", min: 1 },
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

function toCommentForm(c?: AdminComment | null): CommentFormValues {
  return {
    content: c?.content ?? "",
    userId: c?.userId ?? 0,
    movieId: c?.movieId ?? 0,
    episodeId: c?.episodeId ?? null,
    parentCommentId: c?.parentCommentId ?? null,
    status: c?.status ?? "VISIBLE",
  };
}

type ReviewFormValues = {
  title: string;
  content: string;
  rating: number;
  status: string;
} & Record<string, unknown>;

const reviewFields: AdminFormField<ReviewFormValues>[] = [
  { name: "title", label: "Tiêu đề", maxLength: 255 },
  { name: "content", label: "Nội dung", type: "textarea", maxLength: 800 },
  { name: "rating", label: "Điểm (1-5)", type: "number", required: true, min: 1, max: 5 },
  {
    name: "status",
    label: "Trạng thái",
    type: "select",
    required: true,
    options: [
      { value: "VISIBLE", label: "Hiển thị" },
      { value: "HIDDEN", label: "Ẩn" },
      { value: "PENDING", label: "Chờ duyệt" },
    ],
  },
];

function toReviewForm(r?: AdminReview | null): ReviewFormValues {
  return {
    title: r?.title ?? "",
    content: r?.content ?? "",
    rating: r?.rating ?? 5,
    status: r?.status ?? "VISIBLE",
  };
}

function formatTime(value?: string | null) {
  if (!value) return "Chưa rõ";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

function StatusChip({ status }: { status?: string | null }) {
  const label =
    status === "VISIBLE"
      ? "Hiển thị"
      : status === "HIDDEN"
        ? "Ẩn"
        : status === "PENDING"
          ? "Chờ duyệt"
          : status || "UNKNOWN";
  const color = status === "VISIBLE" ? "success" : status === "HIDDEN" ? "error" : "warning";
  return (
    <Chip
      label={label}
      color={color as "success" | "error" | "warning"}
      size="small"
      sx={{ borderRadius: 1, fontWeight: 800 }}
    />
  );
}

export default function AdminModerationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [tab, setTab] = useState(0);
  const [selectedComment, setSelectedComment] = useState<AdminComment | null>(null);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);

  const tabs = (
    <Tabs
      value={tab}
      onChange={(_, v) => setTab(v)}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Tab
        icon={<CommentRoundedIcon sx={{ fontSize: 18 }} />}
        iconPosition="start"
        label="Bình luận"
        id="moderation-tab-comments"
        aria-controls="moderation-panel-comments"
      />
      <Tab
        icon={<StarRoundedIcon sx={{ fontSize: 18 }} />}
        iconPosition="start"
        label="Đánh giá"
        id="moderation-tab-reviews"
        aria-controls="moderation-panel-reviews"
      />
    </Tabs>
  );

  return (
    <Box>
      {/* Comments tab */}
      <Box
        role="tabpanel"
        id="moderation-panel-comments"
        aria-labelledby="moderation-tab-comments"
        hidden={tab !== 0}
      >
        {tab === 0 && (
          <AdminManagementPage<AdminComment>
            permission="comments:manage"
            title="Kiểm duyệt nội dung"
            description="Quản lý bình luận và đánh giá của người dùng. Ẩn hoặc xóa nội dung vi phạm."
            headerExtra={tabs}
            hideCreateButton
            onRowClick={setSelectedComment}
            queryKey={["admin", "comments"]}
            queryFn={adminService.getComments}
            searchPlaceholder="Tìm nội dung, người dùng, tên phim..."
            getSearchText={(c) =>
              `${c.content ?? ""} ${c.authorUsername ?? ""} ${c.authorFullName ?? ""} ${c.movieTitle ?? ""} ${c.userId ?? ""} ${c.movieId ?? ""} ${c.status ?? ""}`
            }
            getStatus={(c) => c.status ?? "UNKNOWN"}
            extraFilters={[
              {
                key: "type",
                label: "Loại",
                options: [
                  { label: "Bình luận gốc", value: "root" },
                  { label: "Phản hồi", value: "reply" },
                ],
                getValue: (c) => (c.parentCommentId ? "reply" : "root"),
              },
              {
                key: "status",
                label: "Trạng thái",
                options: [
                  { label: "Hiển thị", value: "VISIBLE" },
                  { label: "Ẩn", value: "HIDDEN" },
                  { label: "Chờ duyệt", value: "PENDING" },
                ],
                getValue: (c) => c.status ?? "",
              },
            ]}
            stats={[
              { label: "Bình luận", getValue: (items) => items.length, tone: "cyan" },
              {
                label: "Hiển thị",
                getValue: (items) => items.filter((i) => i.status === "VISIBLE").length,
                tone: "emerald",
              },
              {
                label: "Đã ẩn",
                getValue: (items) => items.filter((i) => i.status === "HIDDEN").length,
                tone: "amber",
              },
            ]}
            columns={[
              {
                key: "content",
                label: "Nội dung",
                render: (c) => (
                  <Box sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {c.content || "Không có nội dung"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {c.parentCommentId ? `Phản hồi #${c.parentCommentId}` : "Bình luận gốc"}
                      {c.episodeId ? ` · Tập #${c.episodeId}` : ""}
                    </Typography>
                  </Box>
                ),
              },
              {
                key: "owner",
                label: "Người dùng · Phim",
                render: (c) => (
                  <AdminStatusChip
                    label={`${c.authorFullName || c.authorUsername || `User #${c.userId ?? "-"}`} · ${c.movieTitle || `Movie #${c.movieId ?? "-"}`}`}
                    tone="violet"
                  />
                ),
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (c) => (
                  <AdminStatusChip
                    label={
                      c.status === "VISIBLE"
                        ? "Hiển thị"
                        : c.status === "HIDDEN"
                          ? "Ẩn"
                          : c.status === "PENDING"
                            ? "Chờ duyệt"
                            : c.status || "UNKNOWN"
                    }
                    tone={
                      c.status === "VISIBLE" ? "emerald" : c.status === "HIDDEN" ? "rose" : "amber"
                    }
                  />
                ),
              },
            ]}
            quickActions={[
              {
                id: "toggle-visibility",
                label: (c) => (c.status === "HIDDEN" ? "Hiện" : "Ẩn"),
                tone: (c) => (c.status === "HIDDEN" ? "emerald" : "amber"),
                run: (c) =>
                  adminService.updateComment(c.id, {
                    ...toCommentForm(c),
                    status: c.status === "HIDDEN" ? "VISIBLE" : "HIDDEN",
                  } as AdminCommentPayload),
              },
              {
                id: "delete",
                label: "Xóa",
                tone: "rose",
                run: (c) => adminService.deleteComment(c.id),
              },
            ]}
            createLabel={isAdmin ? "Thêm bình luận" : undefined}
            onCreate={
              isAdmin ? (p) => adminService.createComment(p as AdminCommentPayload) : undefined
            }
            onEdit={
              isAdmin
                ? (c, p) => adminService.updateComment(c.id, p as AdminCommentPayload)
                : undefined
            }
            renderForm={
              isAdmin
                ? ({ mode, item, open, submitting, error, onClose, onSubmit }) => (
                    <AdminFormDrawer<CommentFormValues>
                      open={open}
                      mode={mode}
                      title={
                        mode === "create" ? "Thêm bình luận" : `Sửa bình luận #${item?.id ?? ""}`
                      }
                      description="Chỉnh sửa nội dung hoặc trạng thái bình luận."
                      fields={commentFields}
                      initialValues={toCommentForm(item)}
                      meta={
                        mode === "edit"
                          ? [
                              {
                                label: "Người dùng",
                                value:
                                  item?.authorFullName || item?.authorUsername || "Chưa có tên",
                                helperText: `User ID: ${item?.userId ?? "-"}`,
                              },
                              {
                                label: "Phim",
                                value: item?.movieTitle || "Chưa có tên phim",
                                helperText: `Movie ID: ${item?.movieId ?? "-"}`,
                              },
                            ]
                          : []
                      }
                      submitting={submitting}
                      error={error}
                      onClose={onClose}
                      onSubmit={onSubmit}
                    />
                  )
                : undefined
            }
          />
        )}
      </Box>

      {/* Reviews tab */}
      <Box
        role="tabpanel"
        id="moderation-panel-reviews"
        aria-labelledby="moderation-tab-reviews"
        hidden={tab !== 1}
      >
        {tab === 1 && (
          <AdminManagementPage<AdminReview>
            permission="comments:manage"
            title="Kiểm duyệt nội dung"
            description="Quản lý bình luận và đánh giá của người dùng. Ẩn hoặc xóa nội dung vi phạm."
            headerExtra={tabs}
            hideCreateButton
            onRowClick={setSelectedReview}
            queryKey={["admin", "reviews"]}
            queryFn={adminService.getReviews}
            searchPlaceholder="Tìm nội dung, người dùng, tên phim..."
            getSearchText={(r) =>
              `${r.content ?? ""} ${r.title ?? ""} ${r.authorUsername ?? ""} ${r.authorFullName ?? ""} ${r.movieTitle ?? ""} ${r.userId ?? ""} ${r.movieId ?? ""} ${r.status ?? ""}`
            }
            getStatus={(r) => r.status ?? "UNKNOWN"}
            extraFilters={[
              {
                key: "status",
                label: "Trạng thái",
                options: [
                  { label: "Hiển thị", value: "VISIBLE" },
                  { label: "Ẩn", value: "HIDDEN" },
                  { label: "Chờ duyệt", value: "PENDING" },
                ],
                getValue: (r) => r.status ?? "",
              },
              {
                key: "rating",
                label: "Điểm",
                options: [
                  { label: "1 sao", value: "1" },
                  { label: "2 sao", value: "2" },
                  { label: "3 sao", value: "3" },
                  { label: "4 sao", value: "4" },
                  { label: "5 sao", value: "5" },
                ],
                getValue: (r) => String(r.rating ?? ""),
              },
            ]}
            stats={[
              { label: "Đánh giá", getValue: (items) => items.length, tone: "cyan" },
              {
                label: "Hiển thị",
                getValue: (items) => items.filter((i) => i.status === "VISIBLE").length,
                tone: "emerald",
              },
              {
                label: "Đã ẩn",
                getValue: (items) => items.filter((i) => i.status === "HIDDEN").length,
                tone: "amber",
              },
            ]}
            columns={[
              {
                key: "content",
                label: "Nội dung",
                render: (r) => (
                  <Box sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {r.title || "(Không có tiêu đề)"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {r.content || "Không có nội dung"}
                    </Typography>
                  </Box>
                ),
              },
              {
                key: "rating",
                label: "Điểm",
                render: (r) => (
                  <AdminStatusChip
                    label={`${r.rating ?? "-"} ★`}
                    tone={
                      (r.rating ?? 0) >= 4 ? "emerald" : (r.rating ?? 0) >= 3 ? "amber" : "rose"
                    }
                  />
                ),
              },
              {
                key: "owner",
                label: "Người dùng · Phim",
                render: (r) => (
                  <AdminStatusChip
                    label={`${r.authorFullName || r.authorUsername || `User #${r.userId ?? "-"}`} · ${r.movieTitle || `Movie #${r.movieId ?? "-"}`}`}
                    tone="violet"
                  />
                ),
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (r) => (
                  <AdminStatusChip
                    label={
                      r.status === "VISIBLE"
                        ? "Hiển thị"
                        : r.status === "HIDDEN"
                          ? "Ẩn"
                          : r.status === "PENDING"
                            ? "Chờ duyệt"
                            : r.status || "UNKNOWN"
                    }
                    tone={
                      r.status === "VISIBLE" ? "emerald" : r.status === "HIDDEN" ? "rose" : "amber"
                    }
                  />
                ),
              },
            ]}
            quickActions={[
              {
                id: "toggle-visibility",
                label: (r) => (r.status === "HIDDEN" ? "Hiện" : "Ẩn"),
                tone: (r) => (r.status === "HIDDEN" ? "emerald" : "amber"),
                run: (r) =>
                  adminService.updateReviewStatus(
                    r.id,
                    r.status === "HIDDEN" ? "VISIBLE" : "HIDDEN"
                  ),
              },
              ...(isAdmin
                ? [
                    {
                      id: "delete",
                      label: "Xóa",
                      tone: "rose" as const,
                      run: (r: AdminReview) => adminService.deleteReview(r.id),
                    },
                  ]
                : []),
            ]}
            onEdit={(r, p) => adminService.updateReviewStatus(r.id, (p as ReviewFormValues).status)}
            renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
              <AdminFormDrawer<ReviewFormValues>
                open={open}
                mode={mode}
                title={`Sửa đánh giá #${item?.id ?? ""}`}
                description="Chỉnh sửa trạng thái hoặc nội dung đánh giá."
                fields={reviewFields}
                initialValues={toReviewForm(item)}
                meta={
                  mode === "edit"
                    ? [
                        {
                          label: "Người dùng",
                          value: item?.authorFullName || item?.authorUsername || "Chưa có tên",
                          helperText: `User ID: ${item?.userId ?? "-"}`,
                        },
                        {
                          label: "Phim",
                          value: item?.movieTitle || "Chưa có tên phim",
                          helperText: `Movie ID: ${item?.movieId ?? "-"}`,
                        },
                      ]
                    : []
                }
                submitting={submitting}
                error={error}
                onClose={onClose}
                onSubmit={onSubmit}
              />
            )}
          />
        )}
      </Box>

      {/* Comment detail modal */}
      <Dialog
        open={Boolean(selectedComment)}
        onClose={() => setSelectedComment(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}
        >
          <Typography variant="h6" fontWeight={800}>
            Chi tiết bình luận #{selectedComment?.id}
          </Typography>
          <IconButton size="small" onClick={() => setSelectedComment(null)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {selectedComment && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={getAbsoluteAvatarUrl(selectedComment.authorAvatarUrl) || undefined}
                  sx={{ width: 40, height: 40 }}
                >
                  {(selectedComment.authorFullName || selectedComment.authorUsername || "U")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>
                    {selectedComment.authorFullName ||
                      selectedComment.authorUsername ||
                      `User #${selectedComment.userId}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{selectedComment.authorUsername} · User ID: {selectedComment.userId}
                  </Typography>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <StatusChip status={selectedComment.status} />
                </Box>
              </Stack>
              <Divider />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Nội dung
                </Typography>
                <Typography sx={{ mt: 0.5, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {selectedComment.content || "Không có nội dung"}
                </Typography>
              </Box>
              <Divider />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Phim
                  </Typography>
                  <Typography fontWeight={600}>
                    {selectedComment.movieTitle || `Movie #${selectedComment.movieId}`}
                  </Typography>
                  {selectedComment.episodeId && (
                    <Typography variant="caption" color="text.secondary">
                      Ấp #{selectedComment.episodeId}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Loại
                  </Typography>
                  <Typography fontWeight={600}>
                    {selectedComment.parentCommentId
                      ? `Phản hồi #${selectedComment.parentCommentId}`
                      : "Bình luận gốc"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Thời gian
                  </Typography>
                  <Typography fontWeight={600}>{formatTime(selectedComment.createdAt)}</Typography>
                </Box>
              </Stack>
              {selectedComment.likeCount != null && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
                  }}
                >
                  <Typography variant="caption" color="primary" fontWeight={700}>
                    ♥ {selectedComment.likeCount} lượt thích
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Review detail modal */}
      <Dialog
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}
        >
          <Typography variant="h6" fontWeight={800}>
            Chi tiết đánh giá #{selectedReview?.id}
          </Typography>
          <IconButton size="small" onClick={() => setSelectedReview(null)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {selectedReview && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={getAbsoluteAvatarUrl(selectedReview.authorAvatarUrl) || undefined}
                  sx={{ width: 40, height: 40 }}
                >
                  {(selectedReview.authorFullName || selectedReview.authorUsername || "U")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>
                    {selectedReview.authorFullName ||
                      selectedReview.authorUsername ||
                      `User #${selectedReview.userId}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{selectedReview.authorUsername} · User ID: {selectedReview.userId}
                  </Typography>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <StatusChip status={selectedReview.status} />
                </Box>
              </Stack>
              <Divider />
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Điểm
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="primary">
                    {selectedReview.rating}{" "}
                    <Typography component="span" variant="body2" color="text.secondary">
                      / 5
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Tiêu đề
                  </Typography>
                  <Typography fontWeight={700}>
                    {selectedReview.title || "(Không có tiêu đề)"}
                  </Typography>
                </Box>
              </Stack>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Nội dung
                </Typography>
                <Typography sx={{ mt: 0.5, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {selectedReview.content || "Không có nội dung"}
                </Typography>
              </Box>
              <Divider />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Phim
                  </Typography>
                  <Typography fontWeight={600}>
                    {selectedReview.movieTitle || `Movie #${selectedReview.movieId}`}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Thời gian
                  </Typography>
                  <Typography fontWeight={600}>{formatTime(selectedReview.createdAt)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    ♥ Thích
                  </Typography>
                  <Typography fontWeight={600}>{selectedReview.likeCount ?? 0}</Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
