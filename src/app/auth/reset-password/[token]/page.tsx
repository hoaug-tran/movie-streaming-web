"use client";

import React, { useState } from "react";
import { Box, Button, Alert, CircularProgress, Stack, Link, useTheme, alpha } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import authService from "@/modules/auth/api/auth-service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordError("");
    setConfirmError("");
    setError("");

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (!confirmPassword) {
      setConfirmError("Vui lòng xác nhận mật khẩu");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể đặt lại mật khẩu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: alpha(theme.palette.common.white, 0.03),
      borderRadius: 2,
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: alpha(theme.palette.common.white, 0.1),
      },
      "&:hover fieldset": {
        borderColor: alpha(theme.palette.common.white, 0.25),
      },
      "&.Mui-focused": {
        backgroundColor: alpha(theme.palette.common.white, 0.05),
        "& fieldset": {
          borderColor: theme.palette.primary.main,
          borderWidth: "1.5px",
        },
      },
    },
    "& .MuiInputLabel-root": {
      color: alpha(theme.palette.common.white, 0.4),
      fontSize: "0.9rem",
      "&.Mui-focused": {
        color: theme.palette.primary.main,
      },
    },
  };

  if (success) {
    return (
      <AuthLayout 
        title="Đăng ký mật khẩu mới" 
        subtitle="Mật khẩu của bạn đã được cập nhật thành công."
        kineticText="SUCCESS"
      >
        <Stack spacing={4}>
          <Alert 
            severity="success"
            variant="filled"
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.15),
              color: theme.palette.success.light,
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          >
            Mật khẩu mới đã sẵn sàng. Bạn có thể đăng nhập ngay bây giờ.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push("/auth/login")}
            sx={{
              py: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 900,
              borderRadius: 2,
              background: "white",
              color: "black",
              "&:hover": { background: alpha(theme.palette.common.white, 0.8) }
            }}
          >
            Đến trang Đăng nhập
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Đặt lại mật khẩu" 
      subtitle="Thiết lập mật khẩu mới cho tài khoản của bạn."
      kineticText="SECURITY"
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && (
            <Alert 
              severity="error"
              variant="filled"
              sx={{
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.15),
                color: theme.palette.error.light,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              {error}
            </Alert>
          )}

          <PasswordInput
            value={password}
            onChange={(value) => {
              setPassword(value);
              setPasswordError("");
            }}
            error={!!passwordError}
            helperText={passwordError}
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            sx={inputSx}
          />

          <PasswordInput
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              setConfirmError("");
            }}
            error={!!confirmError}
            helperText={confirmError}
            label="Xác nhận mật khẩu"
            placeholder="Xác nhận lại mật khẩu mới"
            sx={inputSx}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{
              py: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 900,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: "translateY(-2px)",
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Xác nhận mật khẩu mới"}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link 
              href="/auth/login" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.4), 
                fontWeight: 600, 
                textDecoration: "none",
                "&:hover": { color: "white" }
              }}
            >
              Hủy bỏ và Quay lại
            </Link>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
}
