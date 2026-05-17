export type AdminRole = "ROLE_ADMIN" | "ROLE_MODERATOR";
export type AppRole = AdminRole | "ROLE_USER" | string;

export type AdminPermission =
  | "dashboard:read"
  | "reports:manage"
  | "movies:manage"
  | "users:manage"
  | "categories:manage"
  | "persons:manage"
  | "studios:manage"
  | "tags:manage"
  | "comments:manage"
  | "subscriptions:manage"
  | "ads:manage"
  | "notifications:manage"
  | "settings:manage";

const ADMIN_PERMISSIONS: AdminPermission[] = [
  "dashboard:read",
  "reports:manage",
  "movies:manage",
  "users:manage",
  "categories:manage",
  "persons:manage",
  "studios:manage",
  "tags:manage",
  "comments:manage",
  "subscriptions:manage",
  "ads:manage",
  "notifications:manage",
  "settings:manage",
];

const MODERATOR_PERMISSIONS: AdminPermission[] = ["dashboard:read", "reports:manage", "comments:manage"];

export const getAdminPermissions = (role?: AppRole | null): AdminPermission[] => {
  if (role === "ROLE_ADMIN") {
    return ADMIN_PERMISSIONS;
  }
  if (role === "ROLE_MODERATOR") {
    return MODERATOR_PERMISSIONS;
  }
  return [];
};

export const canAccessAdmin = (role?: AppRole | null) => getAdminPermissions(role).length > 0;

export const hasAdminPermission = (role: AppRole | null | undefined, permission: AdminPermission) =>
  getAdminPermissions(role).includes(permission);

export const isModeratorOnly = (role?: AppRole | null) => role === "ROLE_MODERATOR";
