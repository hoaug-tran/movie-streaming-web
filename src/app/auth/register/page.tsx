"use client";

import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress,
  Stack,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import { GoogleOAuthButton } from "@/modules/auth/components/GoogleOAuthButton";
import { AuthContext } from "@/context/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!authContext) {
    return null;
  }

  const { register, loading, error } = authContext;

  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 12;
    if (/[!@#$%^&*]/.test(pwd)) strength += 13;
    return Math.min(strength, 100);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Vui lòng nhập một email hợp lệ";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (!agreeTerms) {
      newErrors.terms = "Bạn phải đồng ý với các điều khoản";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(fullName, email, password);
      router.push("/");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor =
    passwordStrength < 40 ? "#ff4d4d" : passwordStrength < 70 ? "#ffcc00" : "#00cc66";

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderRadius: 0,
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.15)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffffff",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.5)",
      "&.Mui-focused": {
        color: "#ffffff",
      },
    },
  };

  return (
    <AuthLayout
      title="Tạo Tài Khoản"
      subtitle="Bắt đầu hành trình xem phim của bạn cùng Gió Phim ngay hôm nay."
    >
      <Stack spacing={3}>
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              borderRadius: 0,
              color: "#ff4d4d",
              borderColor: "#ff4d4d",
              "& .MuiAlert-icon": { color: "#ff4d4d" },
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Họ và Tên"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors({ ...errors, fullName: "" });
              }}
              error={!!errors.fullName}
              helperText={errors.fullName}
              placeholder="Nhập họ và tên của bạn"
              disabled={loading}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="Nhập email của bạn"
              disabled={loading}
              sx={inputSx}
            />

            <Box>
              <PasswordInput
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setErrors({ ...errors, password: "" });
                }}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Tạo mật khẩu mạnh"
                sx={inputSx}
              />
              {password && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        flex: 1,
                        height: 3,
                        borderRadius: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: strengthColor,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: strengthColor, fontWeight: 600 }}>
                      {passwordStrength < 40 ? "Yếu" : passwordStrength < 70 ? "Trung bình" : "Mạnh"}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <PasswordInput
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setErrors({ ...errors, confirmPassword: "" });
              }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              label="Xác nhận mật khẩu"
              placeholder="Xác nhận lại mật khẩu"
              sx={inputSx}
            />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      setErrors({ ...errors, terms: "" });
                    }}
                    disabled={loading}
                    sx={{
                      color: "rgba(255, 255, 255, 0.3)",
                      "&.Mui-checked": {
                        color: "#fff",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    Tôi đồng ý với{" "}
                    <Link href="/terms" sx={{ color: "#fff", fontWeight: 600 }}>
                      Điều khoản
                    </Link>{" "}
                    &{" "}
                    <Link href="/privacy" sx={{ color: "#fff", fontWeight: 600 }}>
                      Bảo mật
                    </Link>
                  </Typography>
                }
              />
              {errors.terms && (
                <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.terms}
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                py: 1.6,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                backgroundColor: "#ffffff",
                color: "#000000",
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Tạo tài khoản"}
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                opacity: 0.5,
              }}
            >
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
              <Typography sx={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hoặc</Typography>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            </Box>

            <GoogleOAuthButton isLoading={loading} />

            <Typography
              sx={{
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.9rem",
              }}
            >
              Đã có tài khoản?{" "}
              <Link
                href="/auth/login"
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Đăng nhập
              </Link>
            </Typography>
          </Stack>
        </form>
      </Stack>
    </AuthLayout>
  );
}
