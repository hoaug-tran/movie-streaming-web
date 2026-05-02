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
        py: { xs: 1.1, sm: 1.2 },
        minHeight: 44,
        borderColor: "rgba(255, 255, 255, 0.15)",
        color: "#FFFFFF",
        fontSize: "0.9rem",
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 1,
        transition: "all 0.25s ease",
        "& .MuiButton-startIcon": { mr: 1 },
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
