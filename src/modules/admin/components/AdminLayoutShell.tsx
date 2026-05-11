"use client";

import NextLink from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MovieCreationRoundedIcon from "@mui/icons-material/MovieCreationRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import TheaterComedyRoundedIcon from "@mui/icons-material/TheaterComedyRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { AdminPermission, hasAdminPermission } from "../permissions";

const expandedDrawerWidth = 288;
const collapsedDrawerWidth = 80;

type AdminNavSection = "core" | "catalog" | "system" | "moderation";

interface AdminNavItem {
  label: string;
  href: string;
  permission: AdminPermission;
  icon: ReactNode;
  section: AdminNavSection;
}

const navItems: AdminNavItem[] = [
  {
    label: "Tổng quan",
    href: "/admin",
    permission: "dashboard:read",
    icon: <DashboardRoundedIcon />,
    section: "core",
  },
  {
    label: "Phim",
    href: "/admin/movies",
    permission: "movies:manage",
    icon: <MovieCreationRoundedIcon />,
    section: "core",
  },
  {
    label: "Tập phim",
    href: "/admin/episodes",
    permission: "movies:manage",
    icon: <MovieCreationRoundedIcon />,
    section: "core",
  },
  {
    label: "Người dùng",
    href: "/admin/users",
    permission: "users:manage",
    icon: <PeopleAltRoundedIcon />,
    section: "core",
  },
  {
    label: "Thể loại",
    href: "/admin/categories",
    permission: "categories:manage",
    icon: <CategoryRoundedIcon />,
    section: "catalog",
  },
  {
    label: "Diễn viên",
    href: "/admin/cast",
    permission: "persons:manage",
    icon: <TheaterComedyRoundedIcon />,
    section: "catalog",
  },
  {
    label: "Đạo diễn",
    href: "/admin/directors",
    permission: "persons:manage",
    icon: <PersonRoundedIcon />,
    section: "catalog",
  },
  {
    label: "Nhà sản xuất",
    href: "/admin/producers",
    permission: "studios:manage",
    icon: <BusinessRoundedIcon />,
    section: "catalog",
  },
  {
    label: "Bình luận",
    href: "/admin/comments",
    permission: "comments:manage",
    icon: <ForumRoundedIcon />,
    section: "moderation",
  },
  {
    label: "Báo cáo",
    href: "/admin/reports",
    permission: "reports:manage",
    icon: <ReportProblemRoundedIcon />,
    section: "moderation",
  },
  {
    label: "Gói thuê bao",
    href: "/admin/subscriptions",
    permission: "subscriptions:manage",
    icon: <WorkspacePremiumRoundedIcon />,
    section: "system",
  },
  {
    label: "Quảng cáo",
    href: "/admin/ads",
    permission: "ads:manage",
    icon: <CampaignRoundedIcon />,
    section: "system",
  },
  {
    label: "Cài đặt hệ thống",
    href: "/admin/settings",
    permission: "settings:manage",
    icon: <SettingsRoundedIcon />,
    section: "system",
  },
];

const sectionLabels: Record<AdminNavSection, string> = {
  core: "Vận hành",
  catalog: "Danh mục phim",
  system: "Hệ thống",
  moderation: "Kiểm duyệt",
};

const getSectionTitle = (pathname: string) =>
  navItems.find(
    (item) => item.href === pathname || (item.href !== "/admin" && pathname.startsWith(item.href))
  )?.label ?? "Trang quản trị";

export default function AdminLayoutShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { push, replace } = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  const drawerWidth = collapsed ? collapsedDrawerWidth : expandedDrawerWidth;
  const sectionTitle = getSectionTitle(pathname);
  const roleLabel = user?.role === "ROLE_ADMIN" ? "Admin" : "Moderator";
  const displayName = user?.fullName || user?.email || "Người quản trị";
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  const closeProfileMenu = () => setProfileAnchor(null);

  const groupedNav = useMemo(
    () =>
      (["core", "catalog", "system", "moderation"] as AdminNavSection[]).map((section) => ({
        section,
        items: navItems.filter((item) => item.section === section),
      })),
    []
  );

  const drawer = useMemo(
    () => (
      <Stack
        sx={{
          height: "100%",
          p: collapsed ? 1 : 2,
          color: theme.palette.text.primary,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.default, 0.99)} 100%)`,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create("padding", {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={collapsed ? "center" : "space-between"}
          sx={{ minHeight: 56, px: collapsed ? 0 : 0.5 }}
        >
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.2, fontWeight: 900 }} noWrap>
                Gió Phim
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Trang quản trị
              </Typography>
            </Box>
          )}
          {isDesktop && (
            <IconButton
              id="admin-drawer-collapse-button"
              onClick={() => setCollapsed((value) => !value)}
              size="small"
              aria-label={collapsed ? "Mở rộng thanh quản trị" : "Thu gọn thanh quản trị"}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: 1.5,
              }}
            >
              {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />
        <List sx={{ flex: 1, overflowY: "auto", px: 0 }}>
          {groupedNav.map(({ section, items }) => (
            <Box key={section} sx={{ mt: section === "core" ? 0 : 1.25 }}>
              {!collapsed && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.25,
                    pb: 0.75,
                    display: "block",
                    color: theme.palette.text.secondary,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {sectionLabels[section]}
                </Typography>
              )}
              {items.map((item) => {
                const allowed = hasAdminPermission(user?.role, item.permission);
                const active = pathname === item.href;
                const button = (
                  <ListItemButton
                    component={allowed ? NextLink : "button"}
                    href={allowed ? item.href : undefined}
                    disabled={!allowed}
                    selected={active}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      mb: 0.5,
                      borderRadius: 1.5,
                      minHeight: 48,
                      justifyContent: collapsed ? "center" : "flex-start",
                      px: collapsed ? 1 : 1.25,
                      border: active
                        ? `1px solid ${alpha(theme.palette.primary.main, 0.34)}`
                        : "1px solid transparent",
                      background: active ? alpha(theme.palette.primary.main, 0.14) : "transparent",
                      transition: theme.transitions.create(["background-color", "border-color"], {
                        duration: theme.transitions.duration.shorter,
                      }),
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      "&.Mui-disabled": { opacity: 0.48 },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: active
                          ? theme.palette.primary.light
                          : allowed
                            ? theme.palette.text.primary
                            : theme.palette.text.secondary,
                        minWidth: collapsed ? 0 : 40,
                        justifyContent: "center",
                      }}
                    >
                      {allowed ? item.icon : <LockRoundedIcon />}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontWeight: 800, fontSize: 14, noWrap: true }}
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <Tooltip
                    key={item.href}
                    title={collapsed ? item.label : allowed ? "" : "Không có quyền truy cập"}
                    placement="right"
                  >
                    <Box>{button}</Box>
                  </Tooltip>
                );
              })}
              {section !== "moderation" && <Divider sx={{ mt: 1, opacity: collapsed ? 0 : 1 }} />}
            </Box>
          ))}
        </List>

        <Divider sx={{ my: 1.5 }} />
        <Tooltip title={collapsed ? "Về trang chủ" : ""} placement="right">
          <Button
            id="admin-sidebar-home-button"
            component={NextLink}
            href="/"
            variant="text"
            startIcon={collapsed ? undefined : <HomeRoundedIcon />}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              minWidth: 0,
              px: collapsed ? 1 : 1.5,
              color: theme.palette.text.primary,
              fontWeight: 900,
              borderRadius: 1.5,
            }}
          >
            {collapsed ? <HomeRoundedIcon fontSize="small" /> : "Về trang chủ"}
          </Button>
        </Tooltip>
      </Stack>
    ),
    [collapsed, groupedNav, isDesktop, pathname, theme, user?.role]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: theme.palette.text.primary,
        background: `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.14)}, transparent 28%), ${theme.palette.background.default}`,
      }}
    >
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.shorter,
          }),
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: 0,
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
            }),
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: expandedDrawerWidth, border: 0 },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          ml: { lg: `${drawerWidth}px` },
          minHeight: "100vh",
          transition: theme.transitions.create("margin-left", {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            minHeight: { xs: 64, md: 72 },
            px: { xs: 1.5, sm: 2, md: 4 },
            py: { xs: 1, md: 1.5 },
            bgcolor: alpha(theme.palette.background.default, 0.86),
            borderBottom: { xs: 0, lg: `1px solid ${theme.palette.divider}` },
            backdropFilter: "blur(18px)",
            gap: { xs: 1, sm: 1.5 },
            minWidth: 0,
          }}
        >
          {!isDesktop && (
            <IconButton
              id="admin-mobile-menu-button"
              onClick={() => setMobileOpen(true)}
              edge="start"
              sx={{
                flex: "0 0 auto",
                color: theme.palette.text.primary,
                bgcolor: "transparent",
                borderRadius: 1.5,
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              }}
              aria-label="Mở menu quản trị"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 800, display: { xs: "none", sm: "block" } }}
            >
              Trang quản trị Gió Phim
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                lineHeight: 1.1,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
              noWrap
            >
              {sectionTitle}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={{ xs: 0.75, sm: 1.5 }}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ minWidth: 0, flex: "0 0 auto" }}
          >
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.light,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                borderRadius: 1,
                fontWeight: 800,
              }}
            />
            <Button
              id="admin-profile-menu-button"
              onClick={(event) => setProfileAnchor(event.currentTarget)}
              startIcon={
                <Avatar
                  src={user?.avatarUrl ?? undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "text.primary",
                    color: "background.default",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    borderRadius: 1,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {userInitial}
                </Avatar>
              }
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: theme.palette.text.primary,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: "transparent",
                boxShadow: "none",
                fontWeight: 500,
                textTransform: "none",
                minWidth: 0,
                maxWidth: { xs: 58, sm: 220, md: 280 },
                px: { xs: 0.75, sm: 1.5 },
                py: 0.75,
                "& .MuiButton-startIcon": { mr: 0, ml: 0 },
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: "divider",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: "none", sm: "inline" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </Box>
            </Button>
          </Stack>
        </Stack>
        {children}
      </Box>
      <Menu
        id="admin-profile-menu"
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={closeProfileMenu}
        PaperProps={{ sx: { minWidth: 240, borderRadius: 1.5 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={900}>{displayName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {roleLabel}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          id="admin-profile-home-item"
          component={NextLink}
          href="/"
          onClick={closeProfileMenu}
        >
          <ListItemIcon>
            <HomeRoundedIcon fontSize="small" />
          </ListItemIcon>
          Trang chủ
        </MenuItem>
        <MenuItem
          id="admin-profile-account-item"
          onClick={() => {
            closeProfileMenu();
            push("/profile");
          }}
        >
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          Hồ sơ
        </MenuItem>
        <MenuItem
          id="admin-profile-logout-item"
          onClick={() => {
            closeProfileMenu();
            logout?.();
            replace("/");
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  );
}
