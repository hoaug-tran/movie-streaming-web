"use client";

import { Box } from "@mui/material";
import { LocalMovies, WorkspacePremium, Diamond } from "@mui/icons-material";

interface SubscriptionBadgeProps {
  planCode?: string | null;
  planName?: string | null;
  variant?: "icon-only" | "full";
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  planCode,
  planName,
  variant = "icon-only",
}) => {
  if (!planCode || !planName) {
    return null;
  }

  const getBadgeConfig = () => {
    const code = planCode.toUpperCase();

    if (code === "PREMIUM_PLUS" || code === "PREMIUM+") {
      return {
        label: "Premium+",
        icon: <Diamond sx={{ fontSize: 15 }} />,
        color: "#9A6A00",
        bgColor: "linear-gradient(135deg, #FFF7D6 0%, #F4B400 100%)",
        borderColor: "rgba(244, 180, 0, 0.72)",
        shadowColor: "rgba(244, 180, 0, 0.18)",
      };
    }

    if (code === "PREMIUM") {
      return {
        label: "Premium",
        icon: <WorkspacePremium sx={{ fontSize: 15 }} />,
        color: "#C8102E",
        bgColor: "linear-gradient(135deg, #FFF1F3 0%, #F6C8D0 100%)",
        borderColor: "rgba(200, 16, 46, 0.58)",
        shadowColor: "rgba(200, 16, 46, 0.16)",
      };
    }

    if (code === "BASIC") {
      return {
        label: "Basic",
        icon: <LocalMovies sx={{ fontSize: 15 }} />,
        color: "#4F6FD7",
        bgColor: "linear-gradient(135deg, #F1F5FF 0%, #C9D6FF 100%)",
        borderColor: "rgba(142, 167, 233, 0.68)",
        shadowColor: "rgba(142, 167, 233, 0.18)",
      };
    }

    return null;
  };

  const config = getBadgeConfig();

  if (!config) {
    return null;
  }

  if (variant === "icon-only") {
    return (
      <Box
        sx={{
          minWidth: 28,
          height: 18,
          px: 0.45,
          borderRadius: 0.9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          color: config.color,
          boxShadow: `0 0 0 2px rgba(8, 8, 10, 0.95), 0 4px 10px ${config.shadowColor}`,
          backdropFilter: "blur(8px)",
        }}
      >
        {config.icon}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.35,
        borderRadius: 999,
        bgcolor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.color,
        fontSize: "0.72rem",
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: "0.01em",
        boxShadow: `0 4px 12px ${config.shadowColor}`,
      }}
    >
      {config.icon}
      <Box component="span">{config.label}</Box>
    </Box>
  );
};
