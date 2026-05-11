"use client";

import { Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminUser, AdminUserPayload, adminService } from "@/modules/admin/api";

type UserFormValues = AdminUserPayload & Record<string, unknown>;

const userFields: AdminFormField<UserFormValues>[] = [
  {
    name: "email",
    label: "Email",
    required: true,
  },
  {
    name: "fullName",
    label: "Họ tên",
    required: true,
  },
  {
    name: "avatarUrl",
    label: "Avatar URL",
  },
  {
    name: "role",
    label: "Vai trò",
    type: "select",
    required: true,
    options: [
      { label: "Admin", value: "ROLE_ADMIN" },
      { label: "Moderator", value: "ROLE_MODERATOR" },
      { label: "User", value: "ROLE_USER" },
    ],
  },
  {
    name: "accountStatus",
    label: "Trạng thái tài khoản",
    type: "select",
    required: true,
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Locked", value: "LOCKED" },
      { label: "Disabled", value: "DISABLED" },
      { label: "Pending", value: "PENDING" },
    ],
  },
  {
    name: "premiumExpiryDate",
    label: "Hết hạn Premium",
    type: "datetime",
  },
];

function toDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

function toUserForm(user?: AdminUser | null): UserFormValues {
  return {
    email: user?.email ?? "",
    fullName: user?.fullName ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    role: user?.role ?? "ROLE_USER",
    accountStatus: user?.accountStatus ?? "ACTIVE",
    premiumExpiryDate: toDateTimeLocal(user?.premiumExpiryDate),
  };
}

function toUserPayload(values: UserFormValues): AdminUserPayload {
  return {
    email: String(values.email ?? "").trim(),
    fullName: String(values.fullName ?? "").trim(),
    avatarUrl: values.avatarUrl ? String(values.avatarUrl).trim() : null,
    role: values.role as AdminUserPayload["role"],
    accountStatus: values.accountStatus as AdminUserPayload["accountStatus"],
    premiumExpiryDate: values.premiumExpiryDate ? String(values.premiumExpiryDate) : null,
  };
}

export default function AdminUsersPage() {
  return (
    <AdminManagementPage<AdminUser>
      permission="users:manage"
      title="Quản lý người dùng"
      description="Kiểm soát tài khoản, vai trò và trạng thái khóa để giảm rủi ro abuse."
      queryKey={["admin", "users"]}
      queryFn={adminService.getUsers}
      searchPlaceholder="Tìm username, email, họ tên, role..."
      getSearchText={(user) => `${user.username} ${user.email} ${user.fullName ?? ""} ${user.role}`}
      getStatus={(user) => user.accountStatus}
      stats={[
        { label: "Tài khoản", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Admin/Mod",
          getValue: (items) => items.filter((item) => item.role !== "ROLE_USER").length,
          tone: "violet",
        },
        {
          label: "Bị khóa",
          getValue: (items) => items.filter((item) => item.accountStatus === "LOCKED").length,
          tone: "rose",
        },
      ]}
      columns={[
        {
          key: "identity",
          label: "Người dùng",
          render: (user) => (
            <Stack>
              <Typography fontWeight={800}>{user.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Stack>
          ),
        },
        {
          key: "name",
          label: "Họ tên",
          render: (user) => <Typography>{user.fullName || "-"}</Typography>,
        },
        {
          key: "role",
          label: "Vai trò",
          render: (user) => (
            <AdminStatusChip
              label={user.role}
              tone={
                user.role === "ROLE_ADMIN"
                  ? "rose"
                  : user.role === "ROLE_MODERATOR"
                    ? "amber"
                    : "cyan"
              }
            />
          ),
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (user) => (
            <AdminStatusChip
              label={user.accountStatus}
              tone={user.accountStatus === "ACTIVE" ? "emerald" : "rose"}
            />
          ),
        },
      ]}
      quickActions={[
        {
          id: "lock",
          label: "Khóa",
          tone: "rose",
          disabled: (user) => user.accountStatus === "LOCKED",
          run: (user) => adminService.updateUserStatus(user.id, "LOCKED"),
        },
        {
          id: "active",
          label: "Mở",
          tone: "emerald",
          disabled: (user) => user.accountStatus === "ACTIVE",
          run: (user) => adminService.updateUserStatus(user.id, "ACTIVE"),
        },
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (user) => adminService.deleteUser(user.id),
        },
      ]}
      createLabel="Tạo tài khoản"
      createHint="Tạo user mới vẫn đi qua flow đăng ký/xác thực; Admin có thể sửa toàn bộ thông tin lưu trong bảng users."
      onEdit={(user, payload) => adminService.updateUser(user.id, toUserPayload(payload as UserFormValues))}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<UserFormValues>
          open={open}
          mode={mode}
          title={`Cập nhật ${item?.username ?? "user"}`}
          description="Admin có thể sửa email, họ tên, avatar, quyền, trạng thái và hạn Premium theo dữ liệu DB."
          fields={userFields}
          initialValues={toUserForm(item)}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}
