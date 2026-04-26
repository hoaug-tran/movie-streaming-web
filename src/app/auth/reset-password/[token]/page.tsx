"use client";

import React, { useState } from "react";
import { Box, Button, Alert, CircularProgress, Stack, Link } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import authService from "@/modules/auth/api/auth-service";

export default function ResetPasswordPage() {
  const router = useRouter();
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

  if (success) {
    return (
      <AuthLayout title="Đặt Lại Mật Khẩu" subtitle="Mật khẩu của bạn đã được đặt lại thành công">
        <Stack spacing={2}>
          <Alert severity="success">
            Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push("/auth/login")}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Đến trang Đăng nhập
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Đặt Lại Mật Khẩu" subtitle="Nhập mật khẩu mới của bạn bên dưới">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

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
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Xác nhận đặt lại"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link href="/auth/login" underline="hover" sx={{ fontWeight: 600 }}>
              Quay lại Đăng nhập
            </Link>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
}
