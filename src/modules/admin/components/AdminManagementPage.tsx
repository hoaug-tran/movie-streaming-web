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
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
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
  label: string | ((item: T) => string);
  tone?: Tone | ((item: T) => Tone);
  href?: (item: T) => string;
  disabled?: (item: T) => boolean;
  run?: (item: T) => Promise<unknown>;
}

interface AdminFilterDef<T> {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  getValue: (item: T) => string;
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
  extraFilters?: AdminFilterDef<T>[];
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
  onCreateClick?: () => void;
  onCreateSuccess?: (data: unknown) => void;
  onEdit?: (item: T, payload: unknown) => Promise<unknown>;
  onDelete?: (item: T) => Promise<unknown>;
  noPadding?: boolean;
  headerExtra?: ReactNode;
  hideCreateButton?: boolean;
  onRowClick?: (item: T) => void;
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
  extraFilters = [],
  stats,
  quickActions = [],
  createLabel = "Tạo mới",
  createHint = "Tạo mới",
  renderForm,
  onCreate,
  onCreateClick,
  onCreateSuccess,
  onEdit,
  onDelete,
  noPadding = false,
  headerExtra,
  hideCreateButton = false,
  onRowClick,
}: AdminManagementPageProps<T>) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [extraFilterValues, setExtraFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(extraFilters.map((f) => [f.key, "ALL"]))
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ mode: "create" | "edit"; item: T | null } | null>(
    null
  );

  const entityLabel =
    title
      .replace(/quản lý/i, "")
      .replace(/thêm/i, "")
      .trim()
      .toLowerCase() || "mục";

  const listQuery = useQuery({ queryKey, queryFn });
  const actionMutation = useMutation({
    mutationFn: ({ item, action }: { item: T; action: AdminQuickAction<T> }) =>
      action.run ? action.run(item) : Promise.resolve(),
    onSuccess: (_data, variables) => {
      const lbl =
        typeof variables.action.label === "function"
          ? variables.action.label(variables.item)
          : variables.action.label;
      setNotice(`Thao tác "${lbl}" thành công.`);
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
    onSuccess: (data, variables) => {
      setNotice(
        variables.mode === "create"
          ? `Tạo ${entityLabel} thành công.`
          : `Cập nhật ${entityLabel} thành công.`
      );
      setFormState(null);
      queryClient.invalidateQueries({ queryKey });
      if (variables.mode === "create" && onCreateSuccess) onCreateSuccess(data);
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
      const matchesExtra = extraFilters.every(
        (f) => extraFilterValues[f.key] === "ALL" || f.getValue(item) === extraFilterValues[f.key]
      );
      return matchesSearch && matchesStatus && matchesExtra;
    });
  }, [getSearchText, getStatus, items, search, status, extraFilters, extraFilterValues]);

  return (
    <AdminPermissionGate permission={permission}>
      <Box sx={{ p: noPadding ? 0 : { xs: 2, md: 4 }, color: theme.palette.text.primary }}>
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
            {!hideCreateButton && (
              <Button
                id={`${queryKey.join("-")}-create-button`}
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  if (onCreateClick) {
                    onCreateClick();
                  } else if (renderForm && onCreate) {
                    setFormState({ mode: "create", item: null });
                  } else {
                    setNotice(createHint);
                  }
                }}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 900,
                  alignSelf: { xs: "stretch", md: "center" },
                }}
              >
                {createLabel}
              </Button>
            )}
          </Stack>
          {headerExtra && <Box>{headerExtra}</Box>}

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
            <Stack spacing={1.5}>
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
              {(getStatus || extraFilters.length > 0) && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {getStatus && (
                    <TextField
                      id={`${queryKey.join("-")}-status-filter`}
                      select
                      size="small"
                      label="Trạng thái"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value="ALL">Tất cả</MenuItem>
                      {statuses.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                  {extraFilters.map((f) => (
                    <TextField
                      key={f.key}
                      id={`${queryKey.join("-")}-${f.key}-filter`}
                      select
                      size="small"
                      label={f.label}
                      value={extraFilterValues[f.key] ?? "ALL"}
                      onChange={(event) =>
                        setExtraFilterValues((prev) => ({ ...prev, [f.key]: event.target.value }))
                      }
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value="ALL">Tất cả</MenuItem>
                      {f.options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>

          {listQuery.isLoading && <LinearProgress color="primary" />}
          {listQuery.isError && (
            <Alert severity="error">
              Không tải được dữ liệu. Vui lòng thử lại hoặc kiểm tra kết nối.
            </Alert>
          )}
          {actionMutation.isError && (
            <Alert severity="error">
              Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu hoặc liên hệ quản trị viên.
            </Alert>
          )}
          {formMutation.isError && (
            <Alert severity="error">
              Không lưu được. Vui lòng kiểm tra lại thông tin và thử lại.
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
                      onClick={() => onRowClick?.(item)}
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        cursor: onRowClick ? "pointer" : "default",
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                      }}
                    >
                      {columns.map((column) => (
                        <Box component="td" key={column.key} sx={{ p: 2, verticalAlign: "middle" }}>
                          {column.render(item)}
                        </Box>
                      ))}
                      <Box component="td" sx={{ p: 2, textAlign: "right", verticalAlign: "top" }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="flex-start"
                          flexWrap="wrap"
                        >
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
                                if (
                                  window.confirm(
                                    "Bạn có chắc muốn xóa mục này không? Hành động này không thể hoàn tác."
                                  )
                                ) {
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
                          {quickActions.map((action) => {
                            const href = action.href?.(item);
                            const resolvedLabel =
                              typeof action.label === "function"
                                ? action.label(item)
                                : action.label;
                            const resolvedTone =
                              typeof action.tone === "function" ? action.tone(item) : action.tone;
                            return (
                              <Button
                                key={action.id}
                                id={`${queryKey.join("-")}-${action.id}-${item.id}`}
                                size="small"
                                variant="outlined"
                                color={
                                  resolvedTone === "rose"
                                    ? "error"
                                    : resolvedTone === "emerald"
                                      ? "success"
                                      : "primary"
                                }
                                disabled={action.disabled?.(item) || actionMutation.isPending}
                                onClick={() => {
                                  if (!href && action.run) actionMutation.mutate({ item, action });
                                }}
                                href={href}
                                startIcon={
                                  resolvedTone === "rose" ? (
                                    <DeleteRoundedIcon />
                                  ) : action.id === "view" || action.id === "detail" ? (
                                    <VisibilityRoundedIcon />
                                  ) : action.id === "upload" ? (
                                    <CloudUploadRoundedIcon />
                                  ) : action.id === "lock" || action.id === "unlock" ? (
                                    <LockRoundedIcon />
                                  ) : (
                                    <OpenInNewRoundedIcon />
                                  )
                                }
                                sx={{ borderRadius: 1.25, fontWeight: 800 }}
                              >
                                {resolvedLabel}
                              </Button>
                            );
                          })}
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            {!listQuery.isLoading && filteredItems.length === 0 && (
              <Box
                sx={{
                  py: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Không tìm thấy {entityLabel} phù hợp
                </Typography>
                <Typography variant="body2">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
                </Typography>
              </Box>
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
