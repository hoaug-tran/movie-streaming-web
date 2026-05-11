import { Box, useTheme } from "@mui/material";

export function SparklineBar({
  data,
  color,
  width = 60,
  height = 24,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const theme = useTheme();
  const max = Math.max(...data, 1);
  const activeColor = color || theme.palette.primary.main;
  const barWidth = width / Math.max(data.length, 1) - 1.5;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width} ${height}`}
      sx={{ width, height, display: "block" }}
    >
      {data.map((value, index) => {
        const h = (value / max) * height;
        const x = index * (width / data.length);
        const y = height - h;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={Math.max(barWidth, 1)}
            height={h}
            fill={activeColor}
            rx={1}
            opacity={0.8 + (index / data.length) * 0.2}
          />
        );
      })}
    </Box>
  );
}
