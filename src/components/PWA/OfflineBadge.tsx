"use client";

import { Chip } from "@mui/material";
import { WifiOff } from "lucide-react";

interface OfflineBadgeProps {
  sx?: object;
}

export default function OfflineBadge({ sx }: OfflineBadgeProps) {
  return (
    <Chip
      icon={<WifiOff size={13} />}
      label="Offline"
      size="small"
      sx={{
        bgcolor: "rgba(200,16,46,0.18)",
        color: "#C8102E",
        border: "1px solid rgba(200,16,46,0.35)",
        fontWeight: 600,
        fontSize: "0.72rem",
        height: 24,
        "& .MuiChip-icon": { color: "#C8102E", ml: 0.5 },
        ...sx,
      }}
    />
  );
}
