import { Box, Typography, useTheme, alpha } from "@mui/material";

export function RadialProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeMax = Math.max(max, 1);
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;
  const activeColor = color || theme.palette.primary.main;

  return (
    <Box sx={{ position: "relative", width: size, height: size, display: "inline-flex" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${size} ${size}`}
        sx={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={alpha(activeColor, 0.15)}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 900, fontSize: size * 0.25, color: activeColor }}
        >
          {Math.round(percentage)}%
        </Typography>
      </Box>
    </Box>
  );
}
