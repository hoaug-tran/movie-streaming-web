"use client";

import { ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AdminPermissionGate from "./AdminPermissionGate";
import { AdminPermission } from "../permissions";

type Tone = "cyan" | "violet" | "amber" | "emerald" | "rose";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
}

export interface AdminQuickAction<T> {
  id: string;
  label: string;
  tone?: Tone;
  disabled?: (item: T) => boolean;
  run: (item: T) => Promise<unknown>;
}

interface AdminManagementPageProps<T extends { id: number }> {
  permission: AdminPermission;
  title: string;
  description: string;
  queryKey: readonly string[];
  queryFn: () => Promise<T[]>;
  searchPlaceholder: string;
  columns: AdminTableColumn<T>[];
  getSearchText: (item: T) => string;
  getStatus?: (item: T) => string;
  stats: Array<{ label: string; getValue: (items: T[]) => number | string; tone: Tone }>;
  quickActions?: AdminQuickAction<T>[];
  createLabel?: string;
  createHint?: string;
  renderForm?: (props: {
    mode: "create" | "edit";
    item: T | null;
    open: boolean;
    submitting: boolean;
    error: ReactNode;
    onClose: () => void;
    onSubmit: (payload: unknown) => void;
  }) => ReactNode;
  onCreate?: (payload: unknown) => Promise<unknown>;
  onEdit?: (item: T, payload: unknown) => Promise<unknown>;
  onDelete?: (item: T) => Promise<unknown>;
}

const getToneColor = (tone: Tone, theme: Theme) => {
  const toneMap: Record<Tone, string> = {
    cyan: theme.palette.primary.main,
    violet: theme.palette.secondary.light,
    amber: theme.palette.warning.main,
    emerald: theme.palette.success.main,
    rose: theme.palette.error.main,
  };

  return toneMap[tone];
};

export default function AdminManagementPage<T extends { id: number }>({
  permission,
  title,
  description,
  queryKey,
  queryFn,
  searchPlaceholder,
  columns,
  getSearchText,
  getStatus,
  stats,
  quickActions = [],
  createLabel = "Tạo mới",
  createHint = "Form tạo mới sẽ mở rộng theo hợp đồng backend chi tiết.",
  renderForm,
  onCreate,
  onEdit,
  onDelete,
}: AdminManagementPageProps<T>) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [notice, setNotice] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ mode: "create" | "edit"; item: T | null } | null>(
    null
  );

  const listQuery = useQuery({ queryKey, queryFn });
  const actionMutation = useMutation({
    mutationFn: ({ item, action }: { item: T; action: AdminQuickAction<T> }) => action.run(item),
    onSuccess: (_data, variables) => {
      setNotice(`Đã thực hiện: ${variables.action.label}`);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const formMutation = useMutation({
    mutationFn: ({
      mode,
      item,
      payload,
    }: {
      mode: "create" | "edit";
      item: T | null;
      payload: unknown;
    }) => {
      if (mode === "edit" && item && onEdit) return onEdit(item, payload);
      if (mode === "create" && onCreate) return onCreate(payload);
      return Promise.reject(new Error("Form action is not configured"));
    },
    onSuccess: (_data, variables) => {
      setNotice(variables.mode === "create" ? "Đã tạo bản ghi." : "Đã cập nhật bản ghi.");
      setFormState(null);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const statuses = useMemo(() => {
    if (!getStatus) return [];
    return Array.from(new Set(items.map(getStatus).filter(Boolean)));
  }, [getStatus, items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch || getSearchText(item).toLowerCase().includes(normalizedSearch);
      const matchesStatus = !getStatus || status === "ALL" || getStatus(item) === status;
      return matchesSearch && matchesStatus;
    });
  }, [getSearchText, getStatus, items, search, status]);

  return (
    <AdminPermissionGate permission={permission}>
      <Box sx={{ p: { xs: 2, md: 4 }, color: theme.palette.text.primary }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography
                component="h1"
                variant="h3"
                sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                {title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {description}
              </Typography>
            </Box>
            <Button
              id={`${queryKey.join("-")}-create-button`}
              variant="contained"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                if (renderForm && onCreate) setFormState({ mode: "create", item: null });
                else setNotice(createHint);
              }}
              sx={{
                borderRadius: 1.5,
                fontWeight: 900,
                alignSelf: { xs: "stretch", md: "center" },
              }}
            >
              {createLabel}
            </Button>
          </Stack>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {stats.map((stat) => {
              const tone = getToneColor(stat.tone, theme);
              return (
                <Box key={stat.label} sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: 280 }}>
                  <Card
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.background.paper, 0.72),
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: "none",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ fontWeight: 800 }}
                      >
                        {stat.label}
                      </Typography>
                      <Typography variant="h3" sx={{ color: tone, fontWeight: 900 }}>
                        {stat.getValue(items)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
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
              <Grid item xs={12} md={getStatus ? 8 : 12}>
                <TextField
                  id={`${queryKey.join("-")}-search-input`}
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  InputProps={{
                    startAdornment: (
                      <SearchRoundedIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    ),
                  }}
                />
              </Grid>
              {getStatus && (
                <Grid item xs={12} md={4}>
                  <TextField
                    id={`${queryKey.join("-")}-status-filter`}
                    select
                    fullWidth
                    size="small"
                    label="Trạng thái"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <MenuItem value="ALL">Tất cả</MenuItem>
                    {statuses.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </Paper>

          {listQuery.isLoading && <LinearProgress color="primary" />}
          {listQuery.isError && (
            <Alert severity="error">
              Không tải được dữ liệu quản trị. Kiểm tra quyền hoặc backend.
            </Alert>
          )}
          {actionMutation.isError && (
            <Alert severity="error">
              Thao tác thất bại. Backend có thể từ chối hoặc payload chưa khớp contract.
            </Alert>
          )}
          {formMutation.isError && (
            <Alert severity="error">
              Không lưu được form. Kiểm tra dữ liệu hoặc quyền backend.
            </Alert>
          )}
          {notice && (
            <Alert severity="info" onClose={() => setNotice(null)}>
              {notice}
            </Alert>
          )}

          <Paper
            sx={{
              overflow: "hidden",
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.background.paper, 0.76),
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            }}
          >
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}
              >
                <Box
                  component="thead"
                  sx={{
                    bgcolor: alpha(theme.palette.background.default, 0.92),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box component="tr">
                    {columns.map((column) => (
                      <Box
                        component="th"
                        key={column.key}
                        sx={{
                          p: 2,
                          textAlign: "left",
                          color: theme.palette.text.primary,
                          fontSize: 12,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {column.label}
                      </Box>
                    ))}
                    <Box
                      component="th"
                      sx={{
                        p: 2,
                        textAlign: "right",
                        color: theme.palette.text.primary,
                        fontSize: 12,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Thao tác
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {filteredItems.map((item) => (
                    <Box
                      component="tr"
                      key={item.id}
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                      }}
                    >
                      {columns.map((column) => (
                        <Box component="td" key={column.key} sx={{ p: 2, verticalAlign: "middle" }}>
                          {column.render(item)}
                        </Box>
                      ))}
                      <Box component="td" sx={{ p: 2, textAlign: "right" }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {renderForm && onEdit && (
                            <Button
                              id={`${queryKey.join("-")}-edit-${item.id}`}
                              size="small"
                              variant="outlined"
                              disabled={actionMutation.isPending || formMutation.isPending}
                              onClick={() => setFormState({ mode: "edit", item })}
                              startIcon={<EditRoundedIcon />}
                              sx={{ borderRadius: 1.25, fontWeight: 800 }}
                            >
                              Sửa
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              id={`${queryKey.join("-")}-delete-${item.id}`}
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={actionMutation.isPending || formMutation.isPending}
                              onClick={() => {
                                if (window.confirm("Xóa bản ghi này?")) {
                                  actionMutation.mutate({
                                    item,
                                    action: {
                                      id: "delete",
                                      label: "Xóa",
                                      tone: "rose",
                                      run: onDelete,
                                    },
                                  });
                                }
                              }}
                              startIcon={<DeleteRoundedIcon />}
                              sx={{ borderRadius: 1.25, fontWeight: 800 }}
                            >
                              Xóa
                            </Button>
                          )}
                          {quickActions.map((action) => (
                            <Button
                              key={action.id}
                              id={`${queryKey.join("-")}-${action.id}-${item.id}`}
                              size="small"
                              variant="outlined"
                              color={
                                action.tone === "rose"
                                  ? "error"
                                  : action.tone === "emerald"
                                    ? "success"
                                    : "primary"
                              }
                              disabled={action.disabled?.(item) || actionMutation.isPending}
                              onClick={() => actionMutation.mutate({ item, action })}
                              startIcon={
                                action.tone === "rose" ? <DeleteRoundedIcon /> : <LockRoundedIcon />
                              }
                              sx={{ borderRadius: 1.25, fontWeight: 800 }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            {!listQuery.isLoading && filteredItems.length === 0 && (
              <Alert severity="info" sx={{ m: 2 }}>
                Không có bản ghi phù hợp.
              </Alert>
            )}
          </Paper>
        </Stack>
        {renderForm &&
          formState &&
          renderForm({
            mode: formState.mode,
            item: formState.item,
            open: Boolean(formState),
            submitting: formMutation.isPending,
            error: formMutation.error instanceof Error ? formMutation.error.message : null,
            onClose: () => setFormState(null),
            onSubmit: (payload) =>
              formMutation.mutate({ mode: formState.mode, item: formState.item, payload }),
          })}
      </Box>
    </AdminPermissionGate>
  );
}

export function AdminStatusChip({ label, tone = "cyan" }: { label?: string | null; tone?: Tone }) {
  const theme = useTheme();
  const toneColor = getToneColor(tone, theme);

  return (
    <Chip
      size="small"
      label={label || "UNKNOWN"}
      sx={{
        bgcolor: alpha(toneColor, 0.12),
        color: toneColor,
        border: `1px solid ${alpha(toneColor, 0.32)}`,
        borderRadius: 1,
        fontWeight: 800,
      }}
    />
  );
}
