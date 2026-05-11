import { Box, Typography, Stack, alpha, useTheme } from "@mui/material";
import { BentoContainer } from "../BentoContainer";

export function SystemTerminal({
  signals,
  activities,
}: {
  signals: { label: string; value: string; detail: string; status: string }[];
  activities: { id: string; title: string; description: string; time: string; severity: string }[];
}) {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "error":
      case "danger":
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <>
      <BentoContainer gridColumn="1 / -1">
        <Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>
          Trạng thái vận hành
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.25, sm: 1.5, md: 2 },
          }}
        >
          {signals.map((signal) => {
            const color = getStatusColor(signal.status);
            return (
              <Box
                key={signal.label}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.05),
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {signal.value}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {signal.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {signal.detail}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </BentoContainer>

      <BentoContainer gridColumn="1 / -1">
        <Typography
          variant="h6"
          sx={{ fontWeight: 950, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: theme.palette.error.main,
              animation: "pulse 2s infinite",
            }}
          />
          Nhật ký hoạt động hệ thống
        </Typography>
        <Box
          sx={{
            maxHeight: { xs: 360, md: 280 },
            overflowY: "auto",
            pr: { xs: 0, sm: 1 },
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: alpha(theme.palette.divider, 0.2),
              borderRadius: 2,
            },
          }}
        >
          <Stack spacing={1.5}>
            {activities.map((activity) => {
              const color = getStatusColor(activity.severity);
              return (
                <Box
                  key={activity.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "80px 1fr" },
                    gap: { xs: 0.5, sm: 2 },
                    alignItems: "start",
                    py: 1,
                    borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(theme.palette.text.secondary, 0.8),
                      fontFamily: "monospace",
                    }}
                  >
                    {activity.time}
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color, mb: 0.2 }}>
                      {activity.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {activity.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
        <style>
          {`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0.7); }
              70% { box-shadow: 0 0 0 6px rgba(200, 16, 46, 0); }
              100% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0); }
            }
          `}
        </style>
      </BentoContainer>
    </>
  );
}
