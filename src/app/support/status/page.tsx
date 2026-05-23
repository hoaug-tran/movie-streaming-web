"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Film,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Footer } from "@/components/Layout/Footer";
import {
  systemService,
  type SystemComponentStatus,
  type SystemStatusLevel,
  type SystemStatusPayload,
} from "@/services/system-service";

type PublicService = {
  id: string;
  title: string;
  description: string;
  icon: typeof Film;
  componentIds: string[];
};

const STATUS_META: Record<SystemStatusLevel, { label: string; headline: string; color: string }> = {
  operational: {
    label: "Ổn định",
    headline: "Gió Phim đang hoạt động bình thường",
    color: "#22c55e",
  },
  degraded: {
    label: "Có chậm nhẹ",
    headline: "Một số tính năng có thể phản hồi chậm",
    color: "#f59e0b",
  },
  maintenance: { label: "Bảo trì", headline: "Hệ thống đang được bảo trì", color: "#3b82f6" },
  outage: { label: "Gián đoạn", headline: "Một số dịch vụ đang gián đoạn", color: "#ef4444" },
};

const PUBLIC_SERVICES: PublicService[] = [
  {
    id: "watch",
    title: "Xem phim & phát video",
    description: "Trải nghiệm xem phim, chuyển tập, chất lượng HLS và phát video.",
    icon: Film,
    componentIds: ["api", "storage", "transcoder"],
  },
  {
    id: "account",
    title: "Đăng nhập & tài khoản",
    description: "Đăng nhập, hồ sơ cá nhân, lịch sử xem và danh sách yêu thích.",
    icon: UserRound,
    componentIds: ["api", "database", "redis"],
  },
  {
    id: "premium",
    title: "Thanh toán Premium",
    description: "Đăng ký gói, xác nhận thanh toán và quyền xem nội dung Premium.",
    icon: CreditCard,
    componentIds: ["payment", "api", "database"],
  },
  {
    id: "notify",
    title: "Thông báo & email",
    description: "Email xác thực, thông báo tài khoản và cập nhật từ hệ thống.",
    icon: Bell,
    componentIds: ["mail", "api"],
  },
  {
    id: "offline",
    title: "Tải xuống & offline",
    description: "Tải phim về thiết bị, lưu cache và tiếp tục xem khi mạng yếu.",
    icon: Download,
    componentIds: ["storage", "api"],
  },
];

function mergeStatus(components: SystemComponentStatus[], ids: string[]): SystemStatusLevel {
  const picked = components.filter((c) => ids.includes(c.id));
  if (picked.some((c) => c.status === "outage")) return "outage";
  if (picked.some((c) => c.status === "maintenance")) return "maintenance";
  if (picked.some((c) => c.status === "degraded")) return "degraded";
  return "operational";
}

export default function StatusPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [data, setData] = useState<SystemStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const refresh = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const payload = await systemService.getStatus();
      setData(payload);
      setLastUpdated(
        new Date().toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
    const id = setInterval(() => refresh(true), 60000);
    return () => clearInterval(id);
  }, [refresh]);

  const overall = data?.overall ?? "operational";
  const meta = STATUS_META[overall];
  const components = useMemo(() => data?.components ?? [], [data]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 11, md: 15 },
          pb: { xs: 6, md: 9 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `radial-gradient(circle at 20% 0%, ${alpha(theme.palette.primary.main, 0.22)}, transparent 34%), radial-gradient(circle at 86% 12%, ${alpha(meta.color, 0.18)}, transparent 30%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 4, color: "text.secondary" }}
          >
            <MuiLink component={NextLink} href="/" color="inherit" underline="hover">
              Trang chủ
            </MuiLink>
            <ChevronRight size={14} />
            <MuiLink component={NextLink} href="/support" color="inherit" underline="hover">
              Hỗ trợ
            </MuiLink>
            <ChevronRight size={14} />
            <Typography color="text.primary">Trạng thái</Typography>
          </Stack>

          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              border: `1px solid ${alpha(meta.color, 0.36)}`,
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.68 : 0.9),
              boxShadow: `0 28px 90px ${alpha(meta.color, 0.16)}`,
              backdropFilter: "blur(20px)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={2} sx={{ maxWidth: 760 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    color: meta.color,
                    fontWeight: 900,
                  }}
                >
                  <CheckCircle2 size={18} /> {meta.label}
                </Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "2.25rem", md: "4rem" },
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                    lineHeight: 0.98,
                  }}
                >
                  {loading && !data ? "Đang kiểm tra hệ thống..." : meta.headline}
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    lineHeight: 1.8,
                  }}
                >
                  Trang này tóm tắt các chức năng quan trọng dành cho người xem. Dữ liệu tự động cập
                  nhật mỗi phút, không hiển thị chi tiết kỹ thuật nội bộ.
                </Typography>
              </Stack>
              <Stack spacing={1.5} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                <IconButton
                  onClick={() => refresh(true)}
                  disabled={refreshing}
                  sx={{ border: `1px solid ${theme.palette.divider}` }}
                >
                  {refreshing ? <CircularProgress size={18} /> : <RefreshCw size={18} />}
                </IconButton>
                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  Cập nhật: {lastUpdated || "—"}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={3}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.6rem", md: "2.4rem" },
              fontWeight: 950,
              letterSpacing: "-0.04em",
            }}
          >
            Tình trạng các chức năng chính
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {PUBLIC_SERVICES.map((service) => {
              const status = mergeStatus(components, service.componentIds);
              const serviceMeta = STATUS_META[status];
              const Icon = service.icon;
              return (
                <Box
                  key={service.id}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: "background.paper",
                    transition: "0.2s",
                    "&:hover": {
                      borderColor: alpha(serviceMeta.color, 0.55),
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        color: serviceMeta.color,
                        bgcolor: alpha(serviceMeta.color, 0.13),
                      }}
                    >
                      <Icon size={22} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                        alignItems="center"
                      >
                        <Typography sx={{ fontWeight: 900 }}>{service.title}</Typography>
                        <Typography
                          sx={{
                            px: 1.2,
                            py: 0.45,
                            borderRadius: 99,
                            bgcolor: alpha(serviceMeta.color, 0.12),
                            color: serviceMeta.color,
                            fontSize: "0.72rem",
                            fontWeight: 900,
                          }}
                        >
                          {serviceMeta.label}
                        </Typography>
                      </Stack>
                      <Typography sx={{ mt: 0.75, color: "text.secondary", lineHeight: 1.65 }}>
                        {service.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              mt: 3,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ md: "center" }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                    color: "primary.main",
                  }}
                >
                  <ShieldCheck size={24} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, fontSize: "1.2rem" }}>
                    Không có sự cố lớn đang được ghi nhận
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    Nếu bạn gặp lỗi riêng lẻ, gửi mô tả để đội ngũ Gió Phim kiểm tra.
                  </Typography>
                </Box>
              </Stack>
              <Button
                component={NextLink}
                href="/support/contact"
                variant="contained"
                startIcon={<HelpCircle size={18} />}
              >
                Liên hệ hỗ trợ
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}
