"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import { GoogleOAuthButton } from "@/modules/auth/components/GoogleOAuthButton";
import { AuthContext } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const rememberedIdentifier = localStorage.getItem("rememberedIdentifier");

    if (remembered && rememberedIdentifier) {
      setIdentifier(rememberedIdentifier);
      setRememberMe(true);
    }
  }, []);

  if (!authContext) return null;

  const { login, loading, error } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIdentifierError("");
    setPasswordError("");

    if (!identifier) {
      setIdentifierError("Vui lòng nhập email hoặc tên đăng nhập");
      return;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      await login(identifier, password);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedIdentifier", identifier);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedIdentifier");
      }
      router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
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

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục khám phá vũ trụ điện ảnh riêng biệt của bạn."
      kineticText="WELCOME"
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
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email hoặc Tên đăng nhập"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setIdentifierError("");
              }}
              error={!!identifierError}
              helperText={identifierError}
              disabled={loading}
              variant="outlined"
              sx={inputSx}
            />

            <PasswordInput
              value={password}
              onChange={(value) => {
                setPassword(value);
                setPasswordError("");
              }}
              error={!!passwordError}
              helperText={passwordError}
              placeholder="Nhập mật khẩu"
              sx={inputSx}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
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
                    sx={{
                      fontSize: "0.85rem",
                      color: alpha(theme.palette.common.white, 0.5),
                      fontWeight: 600,
                    }}
                  >
                    Ghi nhớ tôi
                  </Typography>
                }
                disabled={loading}
              />

              <Link
                href="/auth/forgot-password"
                sx={{
                  fontSize: "0.85rem",
                  color: theme.palette.primary.light,
                  textDecoration: "none",
                  fontWeight: 700,
                  "&:hover": { color: "white" },
                }}
              >
                Quên mật khẩu?
              </Link>
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
                "&.Mui-disabled": {
                  background: alpha(theme.palette.common.white, 0.05),
                  color: alpha(theme.palette.common.white, 0.2),
                },
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập ngay"}
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
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                Hoặc tiếp tục với
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
              Bạn mới sử dụng Gió Phim?{" "}
              <Link
                href="/auth/register"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  textDecoration: "none",
                  "&:hover": { color: theme.palette.primary.main },
                }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Stack>
        </form>
      </Stack>
    </AuthLayout>
  );
}
