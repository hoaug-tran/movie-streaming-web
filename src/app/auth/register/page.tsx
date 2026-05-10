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
import { OtpVerifyStep } from "@/modules/auth/components/OtpVerifyStep";
import { AuthContext } from "@/context/auth-context";
import authService from "@/modules/auth/api/auth-service";
import { OtpChallengeResponse } from "@/modules/auth/types/auth";

type RegisterStep = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const [step, setStep] = useState<RegisterStep>("form");
  const [challenge, setChallenge] = useState<OtpChallengeResponse | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authContext) return null;

  const { registerWithOtpVerified, loading: contextLoading } = authContext;

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

    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên tài khoản";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Vui lòng nhập một email hợp lệ";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 8) newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    if (!agreeTerms) newErrors.terms = "Bạn phải đồng ý với các điều khoản";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    try {
      const result = await authService.register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setChallenge(result);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    if (!challenge?.challengeToken) return;
    setLoading(true);
    setError("");
    try {
      await registerWithOtpVerified(challenge.challengeToken, otp);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await authService.register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (result.challengeToken) setChallenge(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại OTP");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
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
      "& fieldset": { borderColor: alpha(theme.palette.common.white, 0.1) },
      "&:hover fieldset": { borderColor: alpha(theme.palette.common.white, 0.25) },
      "&.Mui-focused": {
        backgroundColor: alpha(theme.palette.common.white, 0.05),
        "& fieldset": { borderColor: theme.palette.primary.main, borderWidth: "1.5px" },
      },
    },
    "& .MuiInputLabel-root": {
      color: alpha(theme.palette.common.white, 0.4),
      fontSize: "0.9rem",
      "&.Mui-focused": { color: theme.palette.primary.main },
    },
  };

  if (step === "otp" && challenge) {
    return (
      <AuthLayout
        title="Xác minh OTP"
        subtitle="Nhập mã xác nhận để kích hoạt tài khoản của bạn."
        kineticText="VERIFY"
      >
        <OtpVerifyStep
          maskedEmail={challenge.email || formData.email}
          expiresInSeconds={challenge.expiresInSeconds}
          resendAfterSeconds={challenge.resendAfterSeconds ?? 60}
          loading={loading || contextLoading}
          error={error}
          onVerify={handleOtpVerify}
          onResend={handleResendOtp}
        />
      </AuthLayout>
    );
  }

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

        <form onSubmit={handleFormSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Họ và Tên"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setErrors({ ...errors, fullName: "" });
              }}
              error={!!errors.fullName}
              helperText={errors.fullName}
              disabled={loading}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Tên tài khoản"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                setErrors({ ...errors, username: "" });
              }}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors({ ...errors, email: "" });
              }}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              sx={inputSx}
            />

            <Box>
              <PasswordInput
                value={formData.password}
                onChange={(value) => {
                  setFormData({ ...formData, password: value });
                  setErrors({ ...errors, password: "" });
                }}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Tạo mật khẩu mạnh"
                sx={inputSx}
              />
              {formData.password && (
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
                        "& .MuiLinearProgress-bar": { backgroundColor: strengthColor },
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
              value={formData.confirmPassword}
              onChange={(value) => {
                setFormData({ ...formData, confirmPassword: value });
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
                      "&.Mui-checked": { color: theme.palette.primary.main },
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
                py: { xs: 1.15, sm: 1.25 },
                minHeight: 44,
                textTransform: "none",
                fontSize: "0.92rem",
                fontWeight: 800,
                borderRadius: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.22)}`,
                "&:hover": {
                  boxShadow: `0 10px 22px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                "&.Mui-disabled": {
                  background: alpha(theme.palette.common.white, 0.05),
                  color: alpha(theme.palette.common.white, 0.2),
                },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Tạo tài khoản ngay"}
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
