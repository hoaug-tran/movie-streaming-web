"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Link,
  useTheme,
  alpha,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import authService from "@/modules/auth/api/auth-service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
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

  if (submitted) {
    return (
      <AuthLayout
        title="Kiểm tra email"
        subtitle="Hệ thống đã gửi liên kết khôi phục tới hòm thư của bạn."
        kineticText="PASSWORD"
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
            Liên kết đặt lại mật khẩu đã được gửi đến <strong>{email}</strong>. Vui lòng kiểm tra và
            làm theo hướng dẫn.
          </Alert>

          <Stack spacing={1.5}>
            <Typography
              variant="body2"
              sx={{ color: alpha(theme.palette.common.white, 0.4), textAlign: "center" }}
            >
              Nếu không nhận được email, hãy kiểm tra thư mục Spam hoặc
            </Typography>
            <Button
              variant="text"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                color: theme.palette.primary.light,
                "&:hover": { color: "white" },
              }}
            >
              Gửi lại yêu cầu
            </Button>
          </Stack>

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
              "&:hover": { background: alpha(theme.palette.common.white, 0.8) },
            }}
          >
            Quay lại đăng nhập
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Khôi phục mật khẩu"
      subtitle="Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu."
      kineticText="PASSWORD"
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3.5}>
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

          <TextField
            fullWidth
            label="Email tài khoản"
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
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Gửi liên kết khôi phục"}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: alpha(theme.palette.common.white, 0.4), fontWeight: 500 }}
            >
              Đã nhớ mật khẩu?{" "}
              <Link
                href="/auth/login"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  textDecoration: "none",
                  "&:hover": { color: theme.palette.primary.main },
                }}
              >
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
}
