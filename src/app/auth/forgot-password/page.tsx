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
import { OtpVerifyStep } from "@/modules/auth/components/OtpVerifyStep";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import authService from "@/modules/auth/api/auth-service";
import { OtpChallengeResponse } from "@/modules/auth/types/auth";

type ForgotStep = "email" | "otp" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState<OtpChallengeResponse | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
      const result = await authService.forgotPassword(email);
      setChallenge(result);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi email đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpAndPasswordSubmit = async (otp: string) => {
    if (!challenge?.challengeToken) return;

    const pwdErrors: Record<string, string> = {};
    if (!newPassword) pwdErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (newPassword.length < 6) pwdErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    if (!confirmPassword) pwdErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (newPassword !== confirmPassword) pwdErrors.confirmPassword = "Mật khẩu không khớp";

    if (Object.keys(pwdErrors).length > 0) {
      setPasswordErrors(pwdErrors);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authService.resetPassword({
        challengeToken: challenge.challengeToken,
        otp,
        newPassword,
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      if (result.challengeToken) setChallenge(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại OTP");
    } finally {
      setLoading(false);
    }
  };

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

  if (step === "success") {
    return (
      <AuthLayout
        title="Mật khẩu đã được đặt lại"
        subtitle="Bạn có thể đăng nhập với mật khẩu mới."
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
            Mật khẩu của bạn đã được cập nhật thành công.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push("/auth/login")}
            sx={{
              py: { xs: 1.15, sm: 1.25 },
              minHeight: 44,
              textTransform: "none",
              fontSize: "0.92rem",
              fontWeight: 800,
              borderRadius: 1,
              background: "white",
              color: "black",
              "&:hover": { background: alpha(theme.palette.common.white, 0.8) },
            }}
          >
            Đăng nhập ngay
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  if (step === "otp" && challenge) {
    return (
      <AuthLayout
        title="Đặt lại mật khẩu"
        subtitle="Nhập mã OTP và mật khẩu mới của bạn."
        kineticText="PASSWORD"
      >
        <Stack spacing={3.5}>
          <OtpVerifyStep
            maskedEmail={challenge.email || email}
            expiresInSeconds={challenge.expiresInSeconds}
            resendAfterSeconds={challenge.resendAfterSeconds ?? 60}
            loading={loading}
            error={error}
            onVerify={handleOtpAndPasswordSubmit}
            onResend={handleResendOtp}
          />

          <Box
            sx={{
              pt: 1,
              borderTop: `1px solid ${alpha(theme.palette.common.white, 0.07)}`,
            }}
          >
            <Stack spacing={2}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: alpha(theme.palette.common.white, 0.5),
                  fontWeight: 600,
                }}
              >
                Mật khẩu mới
              </Typography>

              <PasswordInput
                value={newPassword}
                onChange={(v) => {
                  setNewPassword(v);
                  setPasswordErrors({ ...passwordErrors, newPassword: "" });
                }}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                placeholder="Mật khẩu mới"
                sx={inputSx}
              />

              <PasswordInput
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  setPasswordErrors({ ...passwordErrors, confirmPassword: "" });
                }}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                label="Xác nhận mật khẩu mới"
                placeholder="Xác nhận mật khẩu mới"
                sx={inputSx}
              />
            </Stack>
          </Box>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Khôi phục mật khẩu"
      subtitle="Nhập email tài khoản của bạn để nhận mã OTP đặt lại mật khẩu."
      kineticText="PASSWORD"
    >
      <form onSubmit={handleEmailSubmit}>
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
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Gửi mã OTP"}
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
