"use client";

import React, { useState } from "react";
import { Box, Button, TextField, Alert, CircularProgress, Stack, Link } from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import authService from "@/modules/auth/api/auth-service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError("");
    setError("");

    if (!email) {
      setEmailError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể gửi email đặt lại mật khẩu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Kiểm tra email" subtitle="Liên kết đặt lại mật khẩu đã được gửi">
        <Stack spacing={2}>
          <Alert severity="success">
            Gió Phim đã gửi một đường link đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng
            kiểm tra email và làm theo hướng dẫn.
          </Alert>

          <Alert severity="info">
            Nếu không nhận được email, hãy kiểm tra thư mục thư rác hoặc{" "}
            <Button
              size="small"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              sx={{ textTransform: "none" }}
            >
              thử lại
            </Button>
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
            Quay lại đăng nhập
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Quên mật khẩu?" subtitle="Nhập email để đặt lại mật khẩu">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            error={!!emailError}
            helperText={emailError}
            placeholder="Nhập email của bạn"
            disabled={loading}
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
            {loading ? <CircularProgress size={24} /> : "Gửi liên kết đặt lại mật khẩu"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            Đã nhớ mật khẩu?{" "}
            <Link href="/auth/login" underline="hover" sx={{ fontWeight: 600 }}>
              Đăng nhập
            </Link>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
}
