"use client";

import React from "react";
import { Button } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";

interface GoogleOAuthButtonProps {
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  isLoading = false,
  fullWidth = true,
}) => {
  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const state = crypto.randomUUID();

    if (!clientId) {
      alert("Google Client ID không được cấu hình. Vui lòng thử lại sau.");
      return;
    }

    sessionStorage.setItem("google_oauth_state", state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <Button
      fullWidth={fullWidth}
      variant="outlined"
      onClick={handleGoogleClick}
      disabled={isLoading}
      startIcon={<GoogleIcon sx={{ fontSize: 20 }} />}
      sx={{
        py: 1.5,
        borderColor: "rgba(255, 255, 255, 0.15)",
        color: "#FFFFFF",
        fontSize: "0.95rem",
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 0,
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.4)",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
        "&:disabled": {
          color: "rgba(255, 255, 255, 0.4)",
          borderColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      Tiếp tục với Google
    </Button>
  );
};
