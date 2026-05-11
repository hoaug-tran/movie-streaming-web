import { Box, useTheme } from "@mui/material";

function buildPolyline(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function MainAreaChart({ data, height = 240 }: { data: number[]; height?: number }) {
  const theme = useTheme();
  const width = 800;
  const points = buildPolyline(data, width, height - 40);
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width} ${height}`}
      sx={{
        width: "100%",
        height: height,
        mt: "auto",
        opacity: 0.8,
        pointerEvents: "none",
        flexShrink: 0,
        display: "block",
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mainAreaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.35" />
          <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#mainAreaFill)" />
      <polyline
        points={points}
        fill="none"
        stroke={theme.palette.primary.main}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );
}
