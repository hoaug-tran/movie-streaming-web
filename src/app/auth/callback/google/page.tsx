"use client";

import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import authService from "@/modules/auth/api/auth-service";
import { getFromLocalStorage, setInLocalStorage } from "@/utils/helpers";

import { useRef } from "react";

export default function GoogleCallbackPage() {
  const [error, setError] = useState("");

  const hasStarted = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (hasStarted.current) {
        return;
      }
      hasStarted.current = true;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const savedState = sessionStorage.getItem("google_oauth_state");

      if (!code) {
        if (getFromLocalStorage("user")) {
          window.location.replace("/");
          return;
        }
        setError("Không nhận được mã xác thực từ Google");
        window.setTimeout(() => {
          window.location.replace("/auth/login?error=missing_google_code");
        }, 1500);
        return;
      }

      window.history.replaceState({}, document.title, "/auth/callback/google");

      if (!state || state !== savedState) {
        setError("Trạng thái xác thực Google không hợp lệ");
        window.setTimeout(() => {
          window.location.replace("/auth/login?error=invalid_google_state");
        }, 1500);
        return;
      }

      try {
        const response = await authService.exchangeOAuthCode(code, "google");

        setInLocalStorage("user", response.user);
        setInLocalStorage("accessToken", response.accessToken);
        setInLocalStorage("refreshToken", response.refreshToken);

        sessionStorage.removeItem("google_oauth_state");

        window.location.replace("/");
      } catch (err) {
        const tokenAfterError = getFromLocalStorage<string>("accessToken");

        if (tokenAfterError) {
          sessionStorage.removeItem("google_oauth_state");
          window.location.replace("/");
          return;
        }

        const message = err instanceof Error ? err.message : "Đăng nhập Google thất bại";
        setError(message);

        window.setTimeout(() => {
          window.location.replace("/auth/login?error=google_oauth_failed");
        }, 1500);
      }
    };

    run();
  }, []);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
