import { Box, Typography, Stack, alpha, useTheme } from "@mui/material";
import { BentoContainer } from "../BentoContainer";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: string;
};

export function SystemTerminal({
  signals,
  activities,
  adminActivities = [],
}: {
  signals: { label: string; value: string; detail: string; status: string }[];
  activities: ActivityItem[];
  adminActivities?: ActivityItem[];
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

  const renderFeed = (title: string, items: ActivityItem[]) => (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        bgcolor: alpha(theme.palette.common.white, 0.025),
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1.25}>
        {items.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Chưa có hoạt động mới
          </Typography>
        ) : (
          items.map((activity) => {
            const color = getStatusColor(activity.severity);
            return (
              <Box
                key={activity.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "82px 1fr" },
                  gap: { xs: 0.5, sm: 2 },
                  alignItems: "start",
                  py: 1,
                  borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.18)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: alpha(theme.palette.text.secondary, 0.82), fontFamily: "monospace" }}
                >
                  {activity.time}
                </Typography>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 850, color, mb: 0.2 }}>
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
          })
        )}
      </Stack>
    </Box>
  );

  return (
    <>
      <BentoContainer gridColumn="1 / -1">
        <Typography variant="h6" sx={{ fontWeight: 950, mb: 0.5 }}>
          Tổng quan vận hành hôm nay
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Các chỉ số cần theo dõi để vận hành nội dung, kiểm duyệt, doanh thu và hiệu năng.
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
                  borderRadius: 2.5,
                  bgcolor: alpha(color, 0.055),
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
          Nhật ký hoạt động
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {renderFeed("Hoạt động người dùng", activities)}
          {renderFeed("Hoạt động quản trị", adminActivities)}
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
