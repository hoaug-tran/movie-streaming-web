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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import { GoogleOAuthButton } from "@/modules/auth/components/GoogleOAuthButton";
import { AuthContext } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
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
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Hãy đăng nhập để tiếp tục trải nghiệm điện ảnh đỉnh cao."
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
                      color: "rgba(255, 255, 255, 0.3)",
                      "&.Mui-checked": {
                        color: "#fff",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)" }}>
                    Ghi nhớ tôi
                  </Typography>
                }
                disabled={loading}
              />

              <Link
                href="/auth/forgot-password"
                sx={{
                  fontSize: "0.85rem",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 500,
                  opacity: 0.7,
                  "&:hover": { opacity: 1 },
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập ngay"}
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
              <Typography
                sx={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Hoặc
              </Typography>
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
              Bạn mới sử dụng Gió Phim?{" "}
              <Link
                href="/auth/register"
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
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
