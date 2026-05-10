"use client";

import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { MarkEmailRead } from "@mui/icons-material";
import { OtpInput } from "./OtpInput";

interface OtpVerifyStepProps {
  maskedEmail: string;
  expiresInSeconds?: number;
  resendAfterSeconds?: number;
  loading: boolean;
  error?: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export const OtpVerifyStep: React.FC<OtpVerifyStepProps> = ({
  maskedEmail,
  expiresInSeconds = 600,
  resendAfterSeconds = 60,
  loading,
  error,
  onVerify,
  onResend,
}) => {
  const theme = useTheme();
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(resendAfterSeconds);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    setSecondsLeft(expiresInSeconds);
  }, [expiresInSeconds]);

  useEffect(() => {
    setResendSecondsLeft(resendAfterSeconds);
  }, [resendAfterSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setResendSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendSecondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }
    setOtpError("");
    onVerify(otp);
  };

  const handleResend = () => {
    if (resendSecondsLeft > 0 || loading) return;
    setOtp("");
    setOtpError("");
    setResendSecondsLeft(resendAfterSeconds);
    onResend();
  };

  const canResend = resendSecondsLeft <= 0 && !loading;

  return (
    <Stack spacing={4}>
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            mb: 2,
          }}
        >
          <MarkEmailRead sx={{ fontSize: 36, color: theme.palette.primary.main }} />
        </Box>
        <Typography
          sx={{
            color: alpha(theme.palette.common.white, 0.5),
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          Mã OTP đã được gửi đến{" "}
          <Box component="span" sx={{ color: "white", fontWeight: 700 }}>
            {maskedEmail}
          </Box>
        </Typography>
      </Box>

      {(error || otpError) && (
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
          {error || otpError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3.5}>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setOtpError("");
            }}
            disabled={loading}
            error={!!(error || otpError)}
          />

          <Box sx={{ textAlign: "center" }}>
            {secondsLeft > 0 ? (
              <Typography
                sx={{ color: alpha(theme.palette.common.white, 0.4), fontSize: "0.85rem" }}
              >
                Mã hết hạn sau{" "}
                <Box
                  component="span"
                  sx={{
                    color:
                      secondsLeft < 60 ? theme.palette.error.light : theme.palette.primary.light,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatTime(secondsLeft)}
                </Box>
              </Typography>
            ) : (
              <Typography
                sx={{ color: theme.palette.error.light, fontSize: "0.85rem", fontWeight: 600 }}
              >
                Mã OTP đã hết hạn
              </Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading || otp.length !== 6 || secondsLeft <= 0}
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
              "&.Mui-disabled": {
                background: alpha(theme.palette.common.white, 0.05),
                color: alpha(theme.palette.common.white, 0.2),
              },
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Xác nhận OTP"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                color: alpha(theme.palette.common.white, 0.4),
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Không nhận được mã?{" "}
              <Box
                component="span"
                onClick={handleResend}
                sx={{
                  color: canResend ? "white" : alpha(theme.palette.common.white, 0.2),
                  fontWeight: 800,
                  cursor: canResend ? "pointer" : "not-allowed",
                  "&:hover": canResend ? { color: theme.palette.primary.main } : {},
                  transition: "color 0.2s ease",
                }}
              >
                {canResend ? "Gửi lại" : `Gửi lại sau ${resendSecondsLeft}s`}
              </Box>
            </Typography>
          </Box>
        </Stack>
      </form>
    </Stack>
  );
};
