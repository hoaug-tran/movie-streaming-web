import { Box, Typography } from "@mui/material";

function buildPolyline(
  values: number[],
  width: number,
  height: number,
  globalMin: number,
  globalMax: number
) {
  const range = Math.max(globalMax - globalMin, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - globalMin) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function MultiLineChart({
  datasets,
  height = 180,
}: {
  datasets: { label: string; color: string; data: number[] }[];
  height?: number;
}) {
  const width = 800;

  const allValues = datasets.flatMap((d) => d.data);
  const globalMin = Math.min(...allValues);
  const globalMax = Math.max(...allValues);

  return (
    <Box sx={{ width: "100%", height, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mb: 2 }}>
        {datasets.map((ds) => (
          <Box key={ds.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 3, bgcolor: ds.color, borderRadius: 1 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
              {ds.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ flex: 1, position: "relative" }}>
        <Box
          component="svg"
          viewBox={`0 0 ${width} ${height - 30}`}
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            overflow: "visible",
          }}
          preserveAspectRatio="none"
        >
          {datasets.map((ds, idx) => {
            const points = buildPolyline(ds.data, width, height - 30, globalMin, globalMax);
            return (
              <polyline
                key={idx}
                points={points}
                fill="none"
                stroke={ds.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "all 0.3s" }}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
