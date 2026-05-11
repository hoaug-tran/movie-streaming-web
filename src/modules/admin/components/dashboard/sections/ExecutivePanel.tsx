import { Box, Stack, Typography, useTheme } from "@mui/material";
import { type AdminMetric } from "@/modules/admin/api";
import { BentoContainer } from "../BentoContainer";
import { SparklineBar } from "../charts/SparklineBar";

const toneColorMap: Record<string, string> = {
  cyan: "#38bdf8",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  emerald: "#10b981",
};

export function ExecutivePanel({
  metrics,
  trendSets,
}: {
  metrics: AdminMetric[];
  workload: { name: string; value: number; color: string; caption?: string }[];
  maxWorkload: number;
  trendSets: number[][];
}) {
  const theme = useTheme();

  return (
    <>
      {metrics.slice(0, 4).map((metric, index) => {
        const color = toneColorMap[metric.tone] ?? theme.palette.primary.main;
        const trend = trendSets[index % trendSets.length] || [];
        return (
          <BentoContainer key={metric.label}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 800, lineHeight: 1.2 }}
                >
                  {metric.label}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                    mt: 0.5,
                    color: index === 0 ? theme.palette.primary.main : "text.primary",
                  }}
                >
                  {metric.value}
                </Typography>
              </Box>
              <SparklineBar data={trend} color={color} width={48} height={28} />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: "auto" }}>
              <Typography
                variant="caption"
                sx={{
                  color,
                  fontWeight: 900,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: `${color}1A`,
                }}
              >
                {metric.delta}
              </Typography>
              <Typography noWrap variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {metric.helper}
              </Typography>
            </Stack>
          </BentoContainer>
        );
      })}
    </>
  );
}
