"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Pagination,
  PaginationItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { AlertColor } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AdminPermissionGate from "./AdminPermissionGate";
import { AdminPermission } from "../permissions";
import { getAdminErrorMessage } from "../utils/admin-errors";

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
  getEditItem?: (item: T) => Promise<T>;
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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  UPCOMING: "Sắp chiếu",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
  HIDDEN: "Đã ẩn",
  VISIBLE: "Hiển thị",
  PENDING: "Đang chờ",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  RESOLVED: "Đã xử lý",
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
  ACTIVE: "Hoạt động",
  INACTIVE: "Tạm tắt",
  BLOCKED: "Bị khóa",
  ROLE_ADMIN: "Quản trị viên",
  ROLE_MODERATOR: "Điều hành viên",
  ROLE_USER: "Người dùng",
  SINGLE: "Phim lẻ",
  SERIES: "Phim bộ",
};

const formatAdminFilterOption = (value: string) => STATUS_LABELS[value] ?? value;

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
  getEditItem,
}: AdminManagementPageProps<T>) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [extraFilterValues, setExtraFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(extraFilters.map((f) => [f.key, "ALL"]))
  );
  const [toast, setToast] = useState<{
    open: boolean;
    severity: AlertColor;
    message: string;
  }>({ open: false, severity: "info", message: "" });
  const [formState, setFormState] = useState<{ mode: "create" | "edit"; item: T | null } | null>(
    null
  );
  const [hydratingEditId, setHydratingEditId] = useState<number | null>(null);

  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  
  useEffect(() => {
    setPage(1);
  }, [search, status, extraFilterValues]);

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
      setToast({ open: true, severity: "success", message: `Thao tác "${lbl}" thành công.` });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      setToast({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(error, "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu."),
      });
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
      setToast({
        open: true,
        severity: "success",
        message:
          variables.mode === "create"
            ? `Tạo ${entityLabel} thành công.`
            : `Cập nhật ${entityLabel} thành công.`,
      });
      setFormState(null);
      queryClient.invalidateQueries({ queryKey });
      if (variables.mode === "create" && onCreateSuccess) onCreateSuccess(data);
    },
    onError: (error) => {
      setToast({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(error, "Không thể lưu thay đổi. Vui lòng kiểm tra lại."),
      });
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

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

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
                    setToast({ open: true, severity: "info", message: createHint });
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
                          {formatAdminFilterOption(option)}
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
              {getAdminErrorMessage(
                listQuery.error,
                "Không tải được dữ liệu. Vui lòng thử lại hoặc kiểm tra kết nối."
              )}
            </Alert>
          )}
          {actionMutation.isError && (
            <Alert severity="error">
              {getAdminErrorMessage(
                actionMutation.error,
                "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu."
              )}
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
                  {paginatedItems.map((item) => (
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
                      <Box
                        component="td"
                        onClick={(event) => event.stopPropagation()}
                        sx={{
                          p: 2,
                          textAlign: "right",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          minWidth: 200,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                          alignItems="center"
                          flexWrap="nowrap"
                        >
                          {renderForm && onEdit && (
                            <Tooltip title="Sửa" arrow placement="top">
                              <span>
                                <IconButton
                                  id={`${queryKey.join("-")}-edit-${item.id}`}
                                  size="small"
                                  color="primary"
                                  disabled={
                                    actionMutation.isPending ||
                                    formMutation.isPending ||
                                    hydratingEditId === item.id
                                  }
                                  onClick={async (event) => {
                                    event.stopPropagation();
                                    if (!getEditItem) {
                                      setFormState({ mode: "edit", item });
                                      return;
                                    }
                                    setHydratingEditId(item.id);
                                    try {
                                      const freshItem = await getEditItem(item);
                                      setFormState({ mode: "edit", item: freshItem });
                                    } catch (error) {
                                      setToast({
                                        open: true,
                                        severity: "error",
                                        message: getAdminErrorMessage(
                                          error,
                                          "Không tải được dữ liệu mới nhất để chỉnh sửa."
                                        ),
                                      });
                                    } finally {
                                      setHydratingEditId(null);
                                    }
                                  }}
                                  aria-label="Sửa"
                                  sx={{
                                    borderRadius: 1.25,
                                    border: `1px solid ${theme.palette.divider}`,
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    flexShrink: 0,
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                                      borderColor: alpha(theme.palette.primary.main, 0.4),
                                    },
                                  }}
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Xóa" arrow placement="top">
                              <span>
                                <IconButton
                                  id={`${queryKey.join("-")}-delete-${item.id}`}
                                  size="small"
                                  color="error"
                                  disabled={actionMutation.isPending || formMutation.isPending}
                                  onClick={(event) => {
                                    event.stopPropagation();
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
                                  aria-label="Xóa"
                                  sx={{
                                    borderRadius: 1.25,
                                    border: `1px solid ${theme.palette.divider}`,
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    flexShrink: 0,
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.12),
                                      borderColor: alpha(theme.palette.error.main, 0.4),
                                    },
                                  }}
                                >
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {quickActions.length > 0 && (renderForm || onDelete) && (
                            <Box
                              sx={{
                                width: "1px",
                                height: 22,
                                bgcolor: theme.palette.divider,
                                mx: 0.5,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {quickActions.map((action) => {
                            const href = action.href?.(item);
                            const resolvedLabel =
                              typeof action.label === "function"
                                ? action.label(item)
                                : action.label;
                            const resolvedTone =
                              typeof action.tone === "function" ? action.tone(item) : action.tone;
                            const muiColor =
                              resolvedTone === "rose"
                                ? "error"
                                : resolvedTone === "emerald"
                                  ? "success"
                                  : resolvedTone === "amber"
                                    ? "warning"
                                    : resolvedTone === "violet"
                                      ? "secondary"
                                      : "primary";
                            const iconNode =
                              resolvedTone === "rose" ? (
                                <DeleteRoundedIcon fontSize="small" />
                              ) : action.id === "view" || action.id === "detail" ? (
                                <VisibilityRoundedIcon fontSize="small" />
                              ) : action.id === "upload" ? (
                                <CloudUploadRoundedIcon fontSize="small" />
                              ) : action.id === "lock" || action.id === "unlock" ? (
                                <LockRoundedIcon fontSize="small" />
                              ) : action.id === "retranscode" || action.id === "refresh" ? (
                                <RefreshRoundedIcon fontSize="small" />
                              ) : (
                                <OpenInNewRoundedIcon fontSize="small" />
                              );
                            const isDisabled = action.disabled?.(item) || actionMutation.isPending;
                            const button = (
                              <IconButton
                                key={action.id}
                                id={`${queryKey.join("-")}-${action.id}-${item.id}`}
                                size="small"
                                color={muiColor}
                                disabled={isDisabled}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (!href && action.run) actionMutation.mutate({ item, action });
                                }}
                                {...(href ? { component: "a", href } : {})}
                                sx={{
                                  borderRadius: 1.25,
                                  border: `1px solid ${theme.palette.divider}`,
                                  bgcolor: alpha(theme.palette.background.default, 0.4),
                                  flexShrink: 0,
                                  "&:hover": {
                                    bgcolor: alpha(
                                      getToneColor(resolvedTone || "cyan", theme),
                                      0.12
                                    ),
                                    borderColor: alpha(
                                      getToneColor(resolvedTone || "cyan", theme),
                                      0.4
                                    ),
                                  },
                                }}
                                aria-label={resolvedLabel}
                              >
                                {iconNode}
                              </IconButton>
                            );
                            return (
                              <Tooltip key={action.id} title={resolvedLabel} arrow placement="top">
                                <span>{button}</span>
                              </Tooltip>
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

            {filteredItems.length > 0 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Hiển thị{" "}
                  <strong style={{ color: theme.palette.text.primary }}>
                    {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
                  </strong>{" "}
                  -{" "}
                  <strong style={{ color: theme.palette.text.primary }}>
                    {Math.min(page * pageSize, totalItems)}
                  </strong>{" "}
                  trong số{" "}
                  <strong style={{ color: theme.palette.text.primary }}>{totalItems}</strong>{" "}
                  {entityLabel}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  alignItems="center"
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: { xs: "space-between", sm: "flex-end" },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                      Số dòng mỗi trang:
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      SelectProps={{
                        IconComponent: KeyboardArrowDownRoundedIcon,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.25,
                          fontSize: 13,
                          bgcolor: alpha(theme.palette.background.paper, 0.4),
                          "& fieldset": { borderColor: theme.palette.divider },
                        },
                        "& .MuiSelect-select": { py: 0.5, px: 1.5 },
                        minWidth: 70,
                      }}
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, val) => setPage(val)}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    size="small"
                    renderItem={(item) => (
                      <PaginationItem
                        slots={{
                          previous: ChevronLeftRoundedIcon,
                          next: ChevronRightRoundedIcon,
                        }}
                        {...item}
                        sx={{
                          borderRadius: 1.25,
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.background.paper, 0.4),
                          color: theme.palette.text.secondary,
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                            color: theme.palette.primary.main,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            fontWeight: 800,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.24),
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Stack>
              </Stack>
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
            error: formMutation.error ? getAdminErrorMessage(formMutation.error) : null,
            onClose: () => setFormState(null),
            onSubmit: (payload) =>
              formMutation.mutate({ mode: formState.mode, item: formState.item, payload }),
          })}
        <Snackbar
          open={toast.open}
          autoHideDuration={4500}
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            top: {
              xs: "calc(env(safe-area-inset-top, 0px) + 76px)",
              md: "calc(env(safe-area-inset-top, 0px) + 84px)",
            },
            right: { xs: "10vw", sm: 24 },
            left: { xs: "10vw", sm: "auto" },
            width: { xs: "80vw", sm: "auto" },
            maxWidth: { xs: "80vw", sm: 520 },
            zIndex: theme.zIndex.snackbar,
          }}
        >
          <Alert
            onClose={() => setToast((current) => ({ ...current, open: false }))}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%", borderRadius: 1.5, boxShadow: "none" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
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
