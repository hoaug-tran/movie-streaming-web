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
  useTheme,
  alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import { GoogleOAuthButton } from "@/modules/auth/components/GoogleOAuthButton";
import { AuthContext } from "@/context/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
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

    if (!username.trim()) {
      newErrors.username = "Vui lòng nhập tên tài khoản";
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
      await register(fullName, username, email, password);
      router.push("/");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor =
    passwordStrength < 40
      ? theme.palette.error.main
      : passwordStrength < 70
        ? theme.palette.warning.main
        : theme.palette.success.main;

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

  return (
    <AuthLayout
      title="Cùng Gió bắt đầu"
      subtitle="Để Gió Phim đưa bạn vào thế giới điện ảnh."
      kineticText="REGISTER"
    >
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
              "& .MuiAlert-icon": { color: theme.palette.error.light },
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
              label="Tên tài khoản"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: "" });
              }}
              error={!!errors.username}
              helperText={errors.username}
              placeholder="Nhập tên tài khoản của bạn"
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
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.8 }}>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: strengthColor,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: strengthColor,
                        fontWeight: 900,
                        minWidth: 60,
                        textAlign: "right",
                      }}
                    >
                      {passwordStrength < 40
                        ? "YẾU"
                        : passwordStrength < 70
                          ? "TRUNG BÌNH"
                          : "MẠNH"}
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
                      color: alpha(theme.palette.common.white, 0.2),
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{ color: alpha(theme.palette.common.white, 0.5), fontWeight: 600 }}
                  >
                    Tôi đồng ý với{" "}
                    <Link
                      href="/terms"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Điều khoản
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/privacy"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Bảo mật
                    </Link>
                  </Typography>
                }
              />
              {errors.terms && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", mt: 0.5, fontWeight: 600 }}
                >
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
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                "&.Mui-disabled": {
                  background: alpha(theme.palette.common.white, 0.05),
                  color: alpha(theme.palette.common.white, 0.2),
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Tạo tài khoản ngay"}
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1, height: "1px", backgroundColor: theme.palette.divider }} />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: alpha(theme.palette.common.white, 0.3),
                  fontWeight: 950,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                Hoặc kết nối qua
              </Typography>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: theme.palette.divider }} />
            </Box>

            <GoogleOAuthButton isLoading={loading} />

            <Typography
              sx={{
                textAlign: "center",
                color: alpha(theme.palette.common.white, 0.4),
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Đã có tài khoản?{" "}
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
          </Stack>
        </form>
      </Stack>
    </AuthLayout>
  );
}
