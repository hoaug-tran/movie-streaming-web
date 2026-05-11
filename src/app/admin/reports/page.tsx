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
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AdminPermissionGate from "@/modules/admin/components/AdminPermissionGate";
import { AdminReport, adminService, ResolveReportPayload } from "@/modules/admin/api";

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
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [target, setTarget] = useState<TargetFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
    const normalizedSearch = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesStatus = status === "ALL" || report.status === status;
      const matchesTarget = target === "ALL" || getTargetType(report) === target;
      const matchesSearch =
        !normalizedSearch ||
        report.reason.toLowerCase().includes(normalizedSearch) ||
        (report.description ?? "").toLowerCase().includes(normalizedSearch) ||
        String(report.id).includes(normalizedSearch);
      return matchesStatus && matchesTarget && matchesSearch;
    });
  }, [reports, search, status, target]);

  const selectedReport =
    filteredReports.find((report) => report.id === selectedId) ?? filteredReports[0];
  const pendingCount = reports.filter((report) => report.status === "PENDING").length;
  const commentCount = reports.filter((report) => report.commentId).length;
  const reviewCount = reports.filter((report) => report.reviewId).length;

  const resolveReport = (payload: ResolveReportPayload) => {
    if (!selectedReport || selectedReport.status !== "PENDING") return;
    resolveMutation.mutate({ reportId: selectedReport.id, payload });
  };

  const statCards = [
    { label: "Đang chờ", value: pendingCount, color: theme.palette.warning.main },
    { label: "Báo cáo bình luận", value: commentCount, color: theme.palette.primary.main },
    { label: "Báo cáo đánh giá", value: reviewCount, color: theme.palette.secondary.light },
  ];

  return (
    <AdminPermissionGate permission="reports:manage">
      <Box sx={{ p: { xs: 2, md: 4 }, color: theme.palette.text.primary }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography
                component="h1"
                variant="h3"
                sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                Trung tâm kiểm duyệt
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Quản lý báo cáo comment và review với luồng xử lý rõ ràng cho Moderator.
              </Typography>
            </Box>
            <Chip
              icon={<GavelRoundedIcon />}
              label="Moderator workflow"
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.light,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                borderRadius: 1,
                fontWeight: 800,
              }}
            />
          </Stack>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {statCards.map((item) => (
              <Box key={item.label} sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: 280 }}>
                <Card
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.72),
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
                  }}
                >
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

          <Paper
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.background.paper, 0.72),
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  id="admin-report-search-input"
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo lý do, mô tả hoặc mã report"
                  InputProps={{
                    startAdornment: (
                      <SearchRoundedIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  id="admin-report-status-filter"
                  select
                  fullWidth
                  size="small"
                  label="Trạng thái"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StatusFilter)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {statusLabel[option]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  id="admin-report-target-filter"
                  select
                  fullWidth
                  size="small"
                  label="Loại nội dung"
                  value={target}
                  onChange={(event) => setTarget(event.target.value as TargetFilter)}
                >
                  {targetOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option === "ALL" ? "Tất cả" : option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {reportsQuery.isLoading && <LinearProgress color="primary" />}
          {reportsQuery.isError && (
            <Alert severity="error">
              Không tải được danh sách báo cáo. Vui lòng kiểm tra quyền hoặc backend.
            </Alert>
          )}
          {resolveMutation.isError && (
            <Alert severity="error">
              Không thể cập nhật trạng thái report. Backend có thể chưa cấp quyền Moderator.
            </Alert>
          )}

          {!reportsQuery.isLoading && filteredReports.length === 0 ? (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Alert severity="info" sx={{ maxWidth: 600, width: "100%", justifyContent: "center" }}>
                Không có báo cáo phù hợp bộ lọc hiện tại.
              </Alert>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={7}>
                <Stack spacing={1.5}>
                  {filteredReports.map((report) => {
                    const active = selectedReport?.id === report.id;
                    const statusColor =
                      report.status === "PENDING"
                        ? theme.palette.warning.main
                        : theme.palette.success.main;
                    return (
                      <Paper
                        key={report.id}
                        id={`admin-report-row-${report.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(report.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") setSelectedId(report.id);
                        }}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          borderRadius: 1.5,
                          bgcolor: active
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.background.paper, 0.7),
                          border: active
                            ? `1px solid ${alpha(theme.palette.primary.main, 0.34)}`
                            : `1px solid ${theme.palette.divider}`,
                          boxShadow: "none",
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} justifyContent="space-between">
                          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <ReportProblemRoundedIcon sx={{ color: statusColor }} />
                              <Typography sx={{ fontWeight: 800 }} noWrap>
                                #{report.id} · {report.reason}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {report.description || "Không có mô tả bổ sung"}
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end" spacing={1}>
                            <Chip
                              size="small"
                              label={statusLabel[report.status] ?? report.status}
                              color={report.status === "PENDING" ? "warning" : "success"}
                              sx={{ borderRadius: 1, fontWeight: 800 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {getTargetType(report)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.76),
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
                    position: { lg: "sticky" },
                    top: 24,
                  }}
                >
                  {selectedReport ? (
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" sx={{ fontWeight: 850 }}>
                          Report #{selectedReport.id}
                        </Typography>
                        <Chip
                          label={statusLabel[selectedReport.status] ?? selectedReport.status}
                          color={selectedReport.status === "PENDING" ? "warning" : "success"}
                          sx={{ borderRadius: 1, fontWeight: 800 }}
                        />
                      </Stack>
                      <Typography>
                        {getTargetType(selectedReport)} ID:{" "}
                        {selectedReport.commentId ?? selectedReport.reviewId}
                      </Typography>
                      <Divider />
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Lý do
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{selectedReport.reason}</Typography>
                      {selectedReport.description && (
                        <>
                          <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ fontWeight: 800 }}
                          >
                            Mô tả chi tiết
                          </Typography>
                          <Typography>{selectedReport.description}</Typography>
                        </>
                      )}
                      <Divider />
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Thời gian
                      </Typography>
                      <Typography>Tạo: {formatTime(selectedReport.createdAt)}</Typography>
                      {selectedReport.resolvedAt && (
                        <Typography>Xử lý: {formatTime(selectedReport.resolvedAt)}</Typography>
                      )}
                      {selectedReport.status === "PENDING" && (
                        <>
                          <Divider />
                          <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ fontWeight: 800 }}
                          >
                            Hành động
                          </Typography>
                          <Stack direction="row" spacing={1.5}>
                            <Button
                              id="admin-report-resolve-button"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleRoundedIcon />}
                              onClick={() => resolveReport({ status: "RESOLVED" })}
                              disabled={resolveMutation.isPending}
                              sx={{ flex: 1, borderRadius: 1.5, fontWeight: 900 }}
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              id="admin-report-reject-button"
                              variant="outlined"
                              color="error"
                              onClick={() => resolveReport({ status: "REJECTED" })}
                              disabled={resolveMutation.isPending}
                              sx={{ flex: 1, borderRadius: 1.5, fontWeight: 900 }}
                            >
                              Từ chối
                            </Button>
                          </Stack>
                        </>
                      )}
                    </Stack>
                  ) : null}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Box>
    </AdminPermissionGate>
  );
}
