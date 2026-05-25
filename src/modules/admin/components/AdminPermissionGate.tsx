"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Typography, alpha, useTheme } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { AdminPermission, hasAdminPermission } from "../permissions";

interface AdminPermissionGateProps {
  permission: AdminPermission;
  children: ReactNode;
}

export default function AdminPermissionGate({ permission, children }: AdminPermissionGateProps) {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  if (hasAdminPermission(user?.role, permission)) return <>{children}</>;

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
      <Stack
        spacing={2}
        alignItems="center"
        sx={{
          width: "min(100%, 560px)",
          textAlign: "center",
          p: { xs: 3, md: 5 },
          borderRadius: 1.5,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.28)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.82),
          boxShadow: "none",
        }}
      >
        <LockRoundedIcon sx={{ fontSize: 64, color: theme.palette.warning.main }} />
        <Typography component="h1" variant="h4" sx={{ fontWeight: 850 }}>
          Module bị khóa
        </Typography>
        <Typography color="text.secondary">
          Tài khoản hiện tại không có quyền dùng module này. Moderator chỉ được thao tác khu vực
          Kiểm duyệt.
        </Typography>
        <Button
          id="admin-locked-back-button"
          variant="contained"
          onClick={() => router.replace("/admin/moderation")}
          sx={{ borderRadius: 1.5, fontWeight: 900 }}
        >
          Về danh mục Kiểm duyệt
        </Button>
      </Stack>
    </Box>
  );
}
