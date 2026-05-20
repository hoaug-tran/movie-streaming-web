"use client";

import { useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminUser,
  AdminUserPayload,
  AdminCreateUserPayload,
  AdminSubscriptionPlan,
  adminService,
} from "@/modules/admin/api";
import AdminPermissionGate from "@/modules/admin/components/AdminPermissionGate";
import { AdminStatusChip } from "@/modules/admin/components/AdminManagementPage";
import AvatarCropUpload from "@/components/Common/AvatarCropUpload";

type SortKey = "name-asc" | "name-desc" | "created-desc" | "login-desc";
type RoleFilter = "ALL" | "ROLE_ADMIN" | "ROLE_USER";
type StatusFilter = "ALL" | "ACTIVE" | "BLOCKED" | "PENDING" | "DELETED";
type PlanFilter = "ALL" | "BASIC" | "PREMIUM" | "PREMIUM_PLUS" | "NONE";

const ROLE_LABEL: Record<string, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_USER: "User",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Hoạt động",
  BLOCKED: "Bị khóa",
  PENDING: "Chờ xác thực",
  DELETED: "Đã xóa",
};

const STATUS_TONE: Record<string, "emerald" | "rose" | "amber" | "violet"> = {
  ACTIVE: "emerald",
  BLOCKED: "rose",
  PENDING: "amber",
  DELETED: "rose",
};

const PLAN_LABEL: Record<string, string> = {
  BASIC: "Basic",
  PREMIUM: "Premium",
  PREMIUM_PLUS: "Premium+",
};

function getPlanDisplay(user: AdminUser): {
  label: string;
  tone: "cyan" | "emerald" | "violet" | "amber";
} {
  if (!user.currentPlanCode) return { label: "Không", tone: "violet" };
  const label = PLAN_LABEL[user.currentPlanCode] ?? user.currentPlanName ?? user.currentPlanCode;
  const tone =
    user.currentPlanCode === "PREMIUM_PLUS"
      ? "emerald"
      : user.currentPlanCode === "PREMIUM"
        ? "cyan"
        : "amber";
  return { label, tone };
}

function UserFormDialog({
  open,
  mode,
  user,
  plans,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  mode: "create" | "edit";
  user?: AdminUser | null;
  plans: AdminSubscriptionPlan[];
  onClose: () => void;
  onSubmit: (data: {
    userPayload?: AdminUserPayload;
    createPayload?: AdminCreateUserPayload;
    planId?: number | null;
  }) => void;
  submitting: boolean;
  error?: string | null;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [role, setRole] = useState<AdminUser["role"]>(user?.role ?? "ROLE_USER");
  const [accountStatus, setAccountStatus] = useState<AdminUser["accountStatus"]>(
    user?.accountStatus ?? "ACTIVE"
  );
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleCropped = (file: File, previewUrl: string) => {
    setAvatarFile(file);
    setAvatarUrl(previewUrl);
  };

  const handleSubmit = async () => {
    let finalAvatarUrl = user?.avatarUrl ?? null;
    if (avatarFile) {
      finalAvatarUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(avatarFile);
      });
    } else if (avatarUrl === null) {
      finalAvatarUrl = null;
    }
    if (mode === "create") {
      onSubmit({
        createPayload: { username, email, password, fullName, role, avatarUrl: finalAvatarUrl },
        planId: selectedPlanId !== "" ? Number(selectedPlanId) : null,
      });
    } else {
      onSubmit({
        userPayload: { email, fullName, role, accountStatus, avatarUrl: finalAvatarUrl },
        planId: selectedPlanId !== "" ? Number(selectedPlanId) : null,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800}>
        {mode === "create" ? "Tạo người dùng mới" : `Chỉnh sửa ${user?.username}`}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <AvatarCropUpload
            currentUrl={avatarUrl}
            size={64}
            onCropped={handleCropped}
            onClear={() => {
              setAvatarUrl(null);
              setAvatarFile(null);
            }}
          />
          {mode === "create" && (
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              size="small"
            />
          )}
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
            type="email"
          />
          {mode === "create" && (
            <TextField
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
              type="password"
            />
          )}
          <TextField
            label="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            select
            label="Vai trò"
            value={role}
            onChange={(e) => setRole(e.target.value as AdminUser["role"])}
            fullWidth
            size="small"
          >
            <MenuItem value="ROLE_USER">User</MenuItem>
            <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
          </TextField>
          {mode === "edit" && (
            <TextField
              select
              label="Trạng thái tài khoản"
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value as AdminUser["accountStatus"])}
              fullWidth
              size="small"
            >
              <MenuItem value="ACTIVE">Hoạt động</MenuItem>
              <MenuItem value="BLOCKED">Bị khóa</MenuItem>
              <MenuItem value="PENDING">Chờ xác thực</MenuItem>
              <MenuItem value="DELETED">Đã xóa</MenuItem>
            </TextField>
          )}
          <TextField
            select
            label="Gán gói thuê bao"
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value === "" ? "" : Number(e.target.value))}
            fullWidth
            size="small"
            helperText={
              mode === "edit"
                ? `Gói hiện tại: ${user?.currentPlanName ?? "Không có"}`
                : "Tùy chọn - gán ngay sau khi tạo"
            }
          >
            <MenuItem value="">Không thay đổi</MenuItem>
            {plans
              .filter((p) => p.isActive !== false)
              .map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          disabled={
            submitting || !email || !fullName || (mode === "create" && (!username || !password))
          }
          onClick={handleSubmit}
        >
          {mode === "create" ? "Tạo" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const theme = useTheme();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("ALL");
  const [formState, setFormState] = useState<{ mode: "create" | "edit"; user?: AdminUser } | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
  });

  const { data: plans = [] } = useQuery<AdminSubscriptionPlan[]>({
    queryKey: ["admin", "subscriptions"],
    queryFn: adminService.getSubscriptionPlans,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminUser["accountStatus"] }) =>
      adminService.updateUserStatus(id, status),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const handleFormSubmit = async (data: {
    userPayload?: AdminUserPayload;
    createPayload?: AdminCreateUserPayload;
    planId?: number | null;
  }) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      let userId: number | undefined;
      if (formState?.mode === "create" && data.createPayload) {
        const created = await adminService.createUser(data.createPayload);
        userId = created.id;
      } else if (formState?.mode === "edit" && formState.user && data.userPayload) {
        await adminService.updateUser(formState.user.id, data.userPayload);
        userId = formState.user.id;
      }
      if (userId && data.planId) {
        await adminService.assignSubscription(userId, data.planId);
      }
      invalidate();
      setFormState(null);
    } catch {
      setFormError("Thao tác thất bại. Kiểm tra lại dữ liệu.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => {
        if (q && !`${u.username} ${u.email} ${u.fullName ?? ""}`.toLowerCase().includes(q))
          return false;
        if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
        if (statusFilter !== "ALL" && u.accountStatus !== statusFilter) return false;
        if (planFilter === "NONE" && u.currentPlanCode) return false;
        if (planFilter !== "ALL" && planFilter !== "NONE" && u.currentPlanCode !== planFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "name-asc")
          return (a.fullName ?? a.username).localeCompare(b.fullName ?? b.username);
        if (sort === "name-desc")
          return (b.fullName ?? b.username).localeCompare(a.fullName ?? a.username);
        if (sort === "created-desc")
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        if (sort === "login-desc")
          return new Date(b.lastLoginAt ?? 0).getTime() - new Date(a.lastLoginAt ?? 0).getTime();
        return 0;
      });
  }, [users, search, sort, roleFilter, statusFilter, planFilter]);

  const stats = [
    { label: "Tổng tài khoản", value: users.length, tone: theme.palette.primary.main },
    {
      label: "Admin",
      value: users.filter((u) => u.role === "ROLE_ADMIN").length,
      tone: theme.palette.error.main,
    },
    {
      label: "Bị khóa",
      value: users.filter((u) => u.accountStatus === "BLOCKED").length,
      tone: theme.palette.warning.main,
    },
    {
      label: "Có gói",
      value: users.filter((u) => u.currentPlanCode).length,
      tone: theme.palette.success.main,
    },
  ];

  return (
    <AdminPermissionGate permission="users:manage">
      <Box sx={{ p: { xs: 2, md: 4 }, color: theme.palette.text.primary }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography
                component="h1"
                variant="h3"
                sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                Quản lý người dùng
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Xem và quản lý tài khoản, phân quyền, trạng thái và gói thuê bao.
              </Typography>
            </Box>
            <Button
              id="admin-users-create-button"
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormError(null);
                setFormState({ mode: "create" });
              }}
              sx={{
                alignSelf: { xs: "stretch", md: "center" },
                borderRadius: 1.5,
                fontWeight: 900,
              }}
            >
              Tạo người dùng
            </Button>
          </Stack>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {stats.map((s) => (
              <Box key={s.label} sx={{ flex: "1 1 calc(25% - 16px)", minWidth: 200 }}>
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
                      {s.label}
                    </Typography>
                    <Typography variant="h3" sx={{ color: s.tone, fontWeight: 900 }}>
                      {s.value}
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
              <Grid item xs={12} md={4}>
                <TextField
                  id="admin-users-search"
                  fullWidth
                  size="small"
                  placeholder="Tìm username, email, họ tên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary", fontSize: 18 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  id="admin-users-sort"
                  select
                  fullWidth
                  size="small"
                  label="Sắp xếp"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  <MenuItem value="name-asc">Tên A→Z</MenuItem>
                  <MenuItem value="name-desc">Tên Z→A</MenuItem>
                  <MenuItem value="created-desc">Mới nhất</MenuItem>
                  <MenuItem value="login-desc">Đăng nhập gần nhất</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  id="admin-users-role"
                  select
                  fullWidth
                  size="small"
                  label="Vai trò"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                  <MenuItem value="ROLE_USER">User</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  id="admin-users-status"
                  select
                  fullWidth
                  size="small"
                  label="Trạng thái"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="BLOCKED">Bị khóa</MenuItem>
                  <MenuItem value="PENDING">Chờ xác thực</MenuItem>
                  <MenuItem value="DELETED">Đã xóa</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  id="admin-users-plan"
                  select
                  fullWidth
                  size="small"
                  label="Gói"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as PlanFilter)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="BASIC">Basic</MenuItem>
                  <MenuItem value="PREMIUM">Premium</MenuItem>
                  <MenuItem value="PREMIUM_PLUS">Premium+</MenuItem>
                  <MenuItem value="NONE">Không có gói</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {isLoading && <LinearProgress color="primary" />}
          {isError && <Typography color="error">Không tải được danh sách người dùng.</Typography>}

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
                sx={{ width: "100%", minWidth: 960, borderCollapse: "collapse" }}
              >
                <Box
                  component="thead"
                  sx={{
                    bgcolor: alpha(theme.palette.background.default, 0.92),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box component="tr">
                    {[
                      "Người dùng",
                      "Vai trò",
                      "Trạng thái",
                      "Gói thuê bao",
                      "Đăng nhập cuối",
                      "Thao tác",
                    ].map((h) => (
                      <Box
                        component="th"
                        key={h}
                        sx={{
                          p: 2,
                          textAlign: "left",
                          fontSize: 12,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.primary",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {filtered.map((user) => {
                    const plan = getPlanDisplay(user);
                    return (
                      <Box
                        component="tr"
                        key={user.id}
                        sx={{
                          borderTop: `1px solid ${theme.palette.divider}`,
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                        }}
                      >
                        <Box component="td" sx={{ p: 2 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={user.avatarUrl ?? undefined}
                              sx={{ width: 36, height: 36, fontSize: 14 }}
                            >
                              {(user.fullName ?? user.username).charAt(0).toUpperCase()}
                            </Avatar>
                            <Stack>
                              <Typography variant="body2" fontWeight={800}>
                                {user.fullName || user.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <AdminStatusChip
                            label={ROLE_LABEL[user.role] ?? user.role}
                            tone={user.role === "ROLE_ADMIN" ? "rose" : "cyan"}
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <AdminStatusChip
                            label={STATUS_LABEL[user.accountStatus] ?? user.accountStatus}
                            tone={STATUS_TONE[user.accountStatus] ?? "cyan"}
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <AdminStatusChip label={plan.label} tone={plan.tone} />
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleString("vi-VN")
                              : "Chưa đăng nhập"}
                          </Typography>
                        </Box>
                        <Box
                          component="td"
                          sx={{
                            p: 2,
                            whiteSpace: "nowrap",
                            minWidth: 160,
                            textAlign: "right",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                            alignItems="center"
                            flexWrap="nowrap"
                          >
                            <Tooltip
                              title={
                                user.accountStatus === "BLOCKED" ? "Mở khóa" : "Khóa tài khoản"
                              }
                              arrow
                              placement="top"
                            >
                              <span>
                                <IconButton
                                  id={`admin-users-toggle-lock-${user.id}`}
                                  size="small"
                                  color={user.accountStatus === "BLOCKED" ? "success" : "warning"}
                                  disabled={statusMutation.isPending}
                                  onClick={() =>
                                    statusMutation.mutate({
                                      id: user.id,
                                      status:
                                        user.accountStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED",
                                    })
                                  }
                                  aria-label={
                                    user.accountStatus === "BLOCKED" ? "Mở khóa" : "Khóa tài khoản"
                                  }
                                  sx={{
                                    borderRadius: 1.25,
                                    border: `1px solid ${theme.palette.divider}`,
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    flexShrink: 0,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        user.accountStatus === "BLOCKED"
                                          ? theme.palette.success.main
                                          : theme.palette.warning.main,
                                        0.12
                                      ),
                                      borderColor: alpha(
                                        user.accountStatus === "BLOCKED"
                                          ? theme.palette.success.main
                                          : theme.palette.warning.main,
                                        0.4
                                      ),
                                    },
                                  }}
                                >
                                  {user.accountStatus === "BLOCKED" ? (
                                    <LockOpenIcon fontSize="small" />
                                  ) : (
                                    <LockIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Sửa" arrow placement="top">
                              <span>
                                <IconButton
                                  id={`admin-users-edit-${user.id}`}
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setFormError(null);
                                    setFormState({ mode: "edit", user });
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
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Xóa" arrow placement="top">
                              <span>
                                <IconButton
                                  id={`admin-users-delete-${user.id}`}
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteTarget(user)}
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
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
            {!isLoading && filtered.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">Không có người dùng phù hợp.</Typography>
              </Box>
            )}
          </Paper>
        </Stack>
      </Box>

      {formState && (
        <UserFormDialog
          open
          mode={formState.mode}
          user={formState.user}
          plans={plans}
          onClose={() => setFormState(null)}
          onSubmit={handleFormSubmit}
          submitting={formSubmitting}
          error={formError}
        />
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={800}>Xóa tài khoản</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa tài khoản <strong>{deleteTarget?.username}</strong>? Hành động này
            không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPermissionGate>
  );
}
