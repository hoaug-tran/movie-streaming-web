import { Chip, ChipProps } from "@mui/material";

interface BadgeProps extends Omit<ChipProps, "variant"> {
  variant?: "primary" | "secondary" | "info" | "success" | "warning" | "error";
}

export function Badge({ variant = "primary", ...props }: BadgeProps) {
  const colorMap = {
    primary: { backgroundColor: "#E63946", color: "white" },
    secondary: { backgroundColor: "#BB86FC", color: "white" },
    info: { backgroundColor: "#4D9DE0", color: "white" },
    success: { backgroundColor: "#10B981", color: "white" },
    warning: { backgroundColor: "#F59E0B", color: "white" },
    error: { backgroundColor: "#EF4444", color: "white" },
  };

  return (
    <Chip
      {...props}
      sx={{
        fontWeight: 600,
        fontSize: "12px",
        borderRadius: "6px",
        ...colorMap[variant],
        ...props.sx,
      }}
      size="small"
    />
  );
}
