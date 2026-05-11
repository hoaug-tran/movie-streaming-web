"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Stack, Typography, alpha, useTheme } from "@mui/material";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { canAccessAdmin } from "../permissions";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading, isAuthenticated } = useAuth();
  const allowed = canAccessAdmin(user?.role);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/auth/login?next=/admin");
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Đang xác minh quyền quản trị...</Typography>
        </Stack>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          p: 3,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            maxWidth: 520,
            textAlign: "center",
            p: { xs: 3, sm: 5 },
            borderRadius: 1.5,
            border: `1px solid ${alpha(theme.palette.error.main, 0.28)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.82),
            boxShadow: "none",
          }}
        >
          <LockPersonRoundedIcon sx={{ fontSize: 62, color: theme.palette.error.main }} />
          <Typography variant="h4" sx={{ fontWeight: 850 }}>
            Không có quyền vào Admin
          </Typography>
          <Typography color="text.secondary">
            Chỉ tài khoản Admin hoặc Moderator hợp lệ mới được truy cập khu vực quản trị. Token tự
            inject hoặc role không hợp lệ sẽ bị chặn.
          </Typography>
          <Button
            id="admin-denied-home-button"
            variant="contained"
            onClick={() => router.replace("/")}
            sx={{ borderRadius: 1.5, fontWeight: 900 }}
          >
            Về trang chủ
          </Button>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
