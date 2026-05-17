"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AdminPermissionGate from "@/modules/admin/components/AdminPermissionGate";
import { AdminReport, adminService, ResolveReportPayload } from "@/modules/admin/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const statusOptions = ["ALL", "PENDING", "RESOLVED", "REJECTED"] as const;
const targetOptions = ["ALL", "COMMENT", "REVIEW"] as const;

type StatusFilter = (typeof statusOptions)[number];
type TargetFilter = (typeof targetOptions)[number];

const statusLabel: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Đang chờ",
  RESOLVED: "Đã xử lý",
  REJECTED: "Từ chối",
};

function getTargetType(report: AdminReport) {
  return report.commentId ? "COMMENT" : "REVIEW";
}

function formatTime(value?: string | null) {
  if (!value) return "Chưa rõ";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export default function AdminReportsPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [target, setTarget] = useState<TargetFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reportsQuery = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => adminService.getReports(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, payload }: { reportId: number; payload: ResolveReportPayload }) =>
      adminService.resolveReport(reportId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });

  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const matchStatus = status === "ALL" || r.status === status;
      const matchTarget = target === "ALL" || getTargetType(r) === target;
      const matchSearch =
        !q ||
        r.reason.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        String(r.id).includes(q);
      return matchStatus && matchTarget && matchSearch;
    });
  }, [reports, search, status, target]);

  const selectedReport =
    filteredReports.find((r) => r.id === selectedId) ?? filteredReports[0] ?? null;
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const commentCount = reports.filter((r) => r.commentId).length;
  const reviewCount = reports.filter((r) => r.reviewId).length;

  // ── Action helpers ──────────────────────────────────────────────────────────

  const runAction = async (key: string, fn: () => Promise<unknown>) => {
    setActionLoading(key);
    try {
      await fn();
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    } finally {
      setActionLoading(null);
    }
  };

  const handleHideComment = () => {
    if (!selectedReport?.commentId) return;
    runAction("hide-comment", async () => {
      await adminService.updateComment(selectedReport.commentId!, {
        content: "",
        userId: 0,
        movieId: 0,
        status: "HIDDEN",
      });
      await adminService.resolveReport(selectedReport.id, { status: "RESOLVED" });
    });
  };

  const handleDeleteComment = () => {
    if (!selectedReport?.commentId) return;
    runAction("delete-comment", async () => {
      await adminService.deleteComment(selectedReport.commentId!);
      await adminService.resolveReport(selectedReport.id, { status: "RESOLVED" });
    });
  };

  const handleHideReview = () => {
    if (!selectedReport?.reviewId) return;
    runAction("hide-review", async () => {
      await adminService.updateReviewStatus(selectedReport.reviewId!, "HIDDEN");
      await adminService.resolveReport(selectedReport.id, { status: "RESOLVED" });
    });
  };

  const handleDeleteReview = () => {
    if (!selectedReport?.reviewId) return;
    runAction("delete-review", async () => {
      await adminService.deleteReview(selectedReport.reviewId!);
      await adminService.resolveReport(selectedReport.id, { status: "RESOLVED" });
    });
  };

  const handleReject = () => {
    if (!selectedReport) return;
    resolveMutation.mutate({ reportId: selectedReport.id, payload: { status: "REJECTED" } });
  };

  const isActing = !!actionLoading || resolveMutation.isPending;
  const targetType = selectedReport ? getTargetType(selectedReport) : null;

  const statCards = [
    { label: "Đang chờ xử lý", value: pendingCount, color: theme.palette.warning.main },
    { label: "Báo cáo bình luận", value: commentCount, color: theme.palette.primary.main },
    { label: "Báo cáo đánh giá", value: reviewCount, color: theme.palette.secondary.light },
  ];

  return (
    <AdminPermissionGate permission="reports:manage">
      <Box sx={{ p: { xs: 2, md: 4 }, color: theme.palette.text.primary }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}>
              Trung tâm kiểm duyệt
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Xử lý báo cáo bình luận và đánh giá với hành động cụ thể.
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {statCards.map((item) => (
              <Box key={item.label} sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: 200 }}>
                <Card sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.background.paper, 0.72), border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h3" sx={{ color: item.color, fontWeight: 900 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.paper, 0.72), border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
            <Stack spacing={1.5}>
              <TextField
                id="admin-report-search-input"
                fullWidth size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo lý do, mô tả hoặc mã report"
                InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <TextField id="admin-report-status-filter" select size="small" label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} sx={{ minWidth: 160 }}>
                  {statusOptions.map((o) => <MenuItem key={o} value={o}>{statusLabel[o]}</MenuItem>)}
                </TextField>
                <TextField id="admin-report-target-filter" select size="small" label="Loại nội dung" value={target} onChange={(e) => setTarget(e.target.value as TargetFilter)} sx={{ minWidth: 160 }}>
                  {targetOptions.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o === "ALL" ? "Tất cả" : o === "COMMENT" ? "Bình luận" : "Đánh giá"}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </Paper>

          {reportsQuery.isLoading && <LinearProgress color="primary" />}
          {reportsQuery.isError && <Alert severity="error">Không tải được danh sách báo cáo.</Alert>}
          {(resolveMutation.isError || actionLoading === null && resolveMutation.isError) && (
            <Alert severity="error">Không thể xử lý báo cáo. Vui lòng thử lại.</Alert>
          )}

          {!reportsQuery.isLoading && filteredReports.length === 0 ? (
            <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, color: "text.secondary" }}>
              <Typography variant="h6" fontWeight={700}>Không tìm thấy báo cáo phù hợp</Typography>
              <Typography variant="body2">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {/* Report list */}
              <Grid item xs={12} lg={7}>
                <Stack spacing={1.5}>
                  {filteredReports.map((report) => {
                    const active = selectedReport?.id === report.id;
                    return (
                      <Paper
                        key={report.id}
                        id={`admin-report-row-${report.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(report.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(report.id); }}
                        sx={{
                          p: 2, cursor: "pointer", borderRadius: 1.5,
                          bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.background.paper, 0.7),
                          border: active ? `1px solid ${alpha(theme.palette.primary.main, 0.34)}` : `1px solid ${theme.palette.divider}`,
                          boxShadow: "none",
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} justifyContent="space-between">
                          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <ReportProblemRoundedIcon sx={{ color: report.status === "PENDING" ? theme.palette.warning.main : theme.palette.success.main, fontSize: 18 }} />
                              <Typography sx={{ fontWeight: 800 }} noWrap>
                                #{report.id} · {report.reason}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {report.description || "Không có mô tả bổ sung"}
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end" spacing={0.75} flexShrink={0}>
                            <Chip
                              size="small"
                              label={statusLabel[report.status] ?? report.status}
                              color={report.status === "PENDING" ? "warning" : report.status === "RESOLVED" ? "success" : "default"}
                              sx={{ borderRadius: 1, fontWeight: 800 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {getTargetType(report) === "COMMENT" ? "Bình luận" : "Đánh giá"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Grid>

              {/* Detail panel */}
              <Grid item xs={12} lg={5}>
                <Paper sx={{ p: 3, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.paper, 0.76), border: `1px solid ${theme.palette.divider}`, boxShadow: "none", position: { lg: "sticky" }, top: 24 }}>
                  {selectedReport ? (
                    <Stack spacing={2}>
                      {/* Title row */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" sx={{ fontWeight: 850 }}>
                          Report #{selectedReport.id}
                        </Typography>
                        <Chip
                          label={statusLabel[selectedReport.status] ?? selectedReport.status}
                          color={selectedReport.status === "PENDING" ? "warning" : selectedReport.status === "RESOLVED" ? "success" : "default"}
                          sx={{ borderRadius: 1, fontWeight: 800 }}
                        />
                      </Stack>

                      {/* Target info + view link */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {targetType === "COMMENT" ? "Bình luận" : "Đánh giá"} ID
                          </Typography>
                          <Typography fontWeight={700}>
                            #{selectedReport.commentId ?? selectedReport.reviewId}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                          href={`/admin/moderation?tab=${targetType === "COMMENT" ? "0" : "1"}`}
                          sx={{ borderRadius: 1.25, fontWeight: 700, fontSize: 12 }}
                        >
                          Xem {targetType === "COMMENT" ? "bình luận" : "đánh giá"}
                        </Button>
                      </Stack>

                      <Divider />

                      {/* Reason */}
                      <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight={800}>Lý do</Typography>
                        <Typography fontWeight={700}>{selectedReport.reason}</Typography>
                      </Box>
                      {selectedReport.description && (
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight={800}>Mô tả chi tiết</Typography>
                          <Typography>{selectedReport.description}</Typography>
                        </Box>
                      )}

                      <Divider />

                      {/* Time */}
                      <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight={800}>Thời gian</Typography>
                        <Typography variant="body2">Tạo: {formatTime(selectedReport.createdAt)}</Typography>
                        {selectedReport.resolvedAt && (
                          <Typography variant="body2">Xử lý: {formatTime(selectedReport.resolvedAt)}</Typography>
                        )}
                      </Box>

                      {/* Actions — only for PENDING */}
                      {selectedReport.status === "PENDING" && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 1.5, display: "block" }}>
                              Hành động kiểm duyệt
                            </Typography>

                            {targetType === "COMMENT" && (
                              <Stack spacing={1}>
                                <Tooltip title="Ẩn bình luận này và đánh dấu báo cáo là đã xử lý">
                                  <Button
                                    id="admin-report-hide-comment"
                                    fullWidth
                                    variant="contained"
                                    color="warning"
                                    startIcon={isActing && actionLoading === "hide-comment" ? <CircularProgress size={16} color="inherit" /> : <VisibilityOffRoundedIcon />}
                                    onClick={handleHideComment}
                                    disabled={isActing}
                                    sx={{ borderRadius: 1.5, fontWeight: 800, justifyContent: "flex-start" }}
                                  >
                                    Ẩn bình luận
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Xóa vĩnh viễn bình luận và đánh dấu báo cáo là đã xử lý">
                                  <Button
                                    id="admin-report-delete-comment"
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    startIcon={isActing && actionLoading === "delete-comment" ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverRoundedIcon />}
                                    onClick={handleDeleteComment}
                                    disabled={isActing}
                                    sx={{ borderRadius: 1.5, fontWeight: 800, justifyContent: "flex-start" }}
                                  >
                                    Xóa bình luận
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Báo cáo không hợp lệ, không thực hiện hành động nào">
                                  <Button
                                    id="admin-report-reject"
                                    fullWidth
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={resolveMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CancelRoundedIcon />}
                                    onClick={handleReject}
                                    disabled={isActing}
                                    sx={{ borderRadius: 1.5, fontWeight: 800, justifyContent: "flex-start" }}
                                  >
                                    Từ chối báo cáo
                                  </Button>
                                </Tooltip>
                              </Stack>
                            )}

                            {targetType === "REVIEW" && (
                              <Stack spacing={1}>
                                <Tooltip title="Ẩn đánh giá này và đánh dấu báo cáo là đã xử lý">
                                  <Button
                                    id="admin-report-hide-review"
                                    fullWidth
                                    variant="contained"
                                    color="warning"
                                    startIcon={isActing && actionLoading === "hide-review" ? <CircularProgress size={16} color="inherit" /> : <VisibilityOffRoundedIcon />}
                                    onClick={handleHideReview}
                                    disabled={isActing}
                                    sx={{ borderRadius: 1.5, fontWeight: 800, justifyContent: "flex-start" }}
                                  >
                                    Ẩn đánh giá
                                  </Button>
                                </Tooltip>
                                {isAdmin && (
                                  <Tooltip title="Xóa vĩnh viễn đánh giá và đánh dấu báo cáo là đã xử lý">
                                    <Button
                                      id="admin-report-delete-review"
                                      fullWidth
                                      variant="contained"
                                      color="error"
                                      startIcon={isActing && actionLoading === "delete-review" ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverRoundedIcon />}
                                      onClick={handleDeleteReview}
                                      disabled={isActing}
                                      sx={{ borderRadius: 1.5, fontWeight: 800, justifyContent: "flex-start" }}
                                    >
                                      Xóa đánh giá
                                    </Button>
                                  </Tooltip>
                                )}
                                <Tooltip title="Báo cáo không hợp lệ, không thực hiện hành động nào">
                                  <Button
                                    id="admin-report-reject-review"
                                    fullWidth
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={resolveMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CancelRoundedIcon />}
                                    onClick={handleReject}
                                    disabled={isActing}
                                    sx={{ borderRadius: 1.5, fontWeight: 800, justifyContent: "flex-start" }}
                                  >
                                    Từ chối báo cáo
                                  </Button>
                                </Tooltip>
                              </Stack>
                            )}
                          </Box>

                          {/* Moderator note */}
                          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                            <Typography variant="caption" color="info.main" fontWeight={700}>
                              {isAdmin ? "ADMIN" : "MODERATOR"} · Quyền hạn
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                              {targetType === "COMMENT"
                                ? "Moderator và Admin có thể ẩn hoặc xóa bình luận."
                                : isAdmin
                                ? "Admin có thể ẩn hoặc xóa đánh giá."
                                : "Moderator chỉ có thể ẩn đánh giá. Xóa yêu cầu quyền Admin."}
                            </Typography>
                          </Box>
                        </>
                      )}

                      {selectedReport.status !== "PENDING" && (
                        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 18 }} />
                            <Typography variant="body2" color="success.main" fontWeight={700}>
                              Báo cáo này đã được xử lý ({statusLabel[selectedReport.status] ?? selectedReport.status})
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Chọn một báo cáo để xem chi tiết.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Box>
    </AdminPermissionGate>
  );
}
