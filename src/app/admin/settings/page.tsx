"use client";

import {
  alpha,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AdminPermissionGate from "@/modules/admin/components/AdminPermissionGate";

const settingsGroups = [
  {
    title: "Trải nghiệm xem phim",
    icon: <TuneRoundedIcon />,
    items: [
      { label: "Bật banner nổi bật trang chủ", enabled: true },
      { label: "Tự động phát trailer khi hover", enabled: true },
      { label: "Ưu tiên phim đang thịnh hành", enabled: true },
    ],
  },
  {
    title: "Kiểm duyệt & an toàn",
    icon: <ShieldRoundedIcon />,
    items: [
      { label: "Ẩn bình luận khi có nhiều báo cáo", enabled: true },
      { label: "Yêu cầu đăng nhập khi gửi báo cáo", enabled: true },
      { label: "Khóa tài khoản spam tự động", enabled: false },
    ],
  },
  {
    title: "Quảng cáo toàn web",
    icon: <CampaignRoundedIcon />,
    items: [
      { label: "Hiển thị quảng cáo đầu trang", enabled: true },
      { label: "Giới hạn tần suất quảng cáo", enabled: true },
      { label: "Tạm dừng chiến dịch hết hạn", enabled: true },
    ],
  },
];

export default function AdminSettingsPage() {
  const theme = useTheme();

  return (
    <AdminPermissionGate permission="settings:manage">
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack spacing={3}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.72),
              backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, transparent 42%)`,
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>
                  Cấu hình toàn hệ thống
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: "-0.04em" }}>
                  Cài đặt hệ thống
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 760, mt: 1 }}>
                  Trung tâm điều khiển các thiết lập ảnh hưởng toàn bộ Gió Phim: giao diện, kiểm
                  duyệt, quảng cáo và an toàn phiên đăng nhập.
                </Typography>
              </Box>
              <Tooltip title="Cài đặt chưa kết nối backend — sẽ được bật trong phiên bản tiếp theo">
                <span>
                  <Button
                    id="admin-settings-save-button"
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    disabled
                    sx={{
                      alignSelf: { xs: "stretch", md: "center" },
                      borderRadius: 1.5,
                      fontWeight: 900,
                    }}
                  >
                    Lưu cấu hình
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Paper>

          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
            {settingsGroups.map((group) => (
              <Box key={group.title} sx={{ flex: "1 1 calc(33.333% - 20px)", minWidth: 320 }}>
                <Paper
                  sx={{
                    height: "100%",
                    p: 2.5,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box sx={{ color: theme.palette.primary.light, display: "flex" }}>
                        {group.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {group.title}
                      </Typography>
                    </Stack>
                    <Divider />
                    {group.items.map((item) => (
                      <Stack
                        key={item.label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Typography sx={{ fontWeight: 750 }}>{item.label}</Typography>
                        <Switch defaultChecked={item.enabled} color="primary" />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            ))}
          </Box>

          <Paper
            sx={{
              p: 2.5,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Prod policy" color="primary" sx={{ borderRadius: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Tham số vận hành
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Ngưỡng báo cáo tự ẩn" defaultValue="5" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Thời gian phiên quản trị (phút)" defaultValue="120" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Giới hạn quảng cáo / phiên" defaultValue="3" />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AdminPermissionGate>
  );
}
