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
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Footer } from "@/components/Layout/Footer";
import {
  systemService,
  type SystemStatusLevel,
  type SystemStatusPayload,
} from "@/services/system-service";

const STATUS_META: Record<
  SystemStatusLevel,
  { label: string; headline: string; description: string; color: string }
> = {
  operational: {
    label: "Hoạt động ổn định",
    headline: "Gió Phim đang hoạt động bình thường",
    description: "Chưa ghi nhận sự cố ảnh hưởng đến hệ thống.",
    color: "#2dd4bf",
  },
  degraded: {
    label: "Có chậm nhẹ",
    headline: "Một số tính năng có thể phản hồi chậm",
    description: "Bạn vẫn có thể sử dụng Gió Phim, nhưng vài thao tác có thể chậm hơn bình thường.",
    color: "#fbbf24",
  },
  maintenance: {
    label: "Đang bảo trì",
    headline: "Gió Phim đang được bảo trì",
    description: "Một số tính năng có thể tạm thời không khả dụng trong thời gian ngắn.",
    color: "#60a5fa",
  },
  outage: {
    label: "Đang gặp sự cố",
    headline: "Một số dịch vụ đang gián đoạn",
    description: "Đội ngũ Gió Phim đang kiểm tra và khắc phục sự cố.",
    color: "#fb7185",
  },
};

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
        new Date().toLocaleString("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
    const id = window.setInterval(() => refresh(true), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const overall = data?.overall ?? "operational";
  const meta = STATUS_META[overall];
  const components = useMemo(() => data?.components ?? [], [data]);
  const hasIncident = overall !== "operational";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Box
        sx={{
          pt: { xs: 11, md: 14 },
          pb: { xs: 4, md: 6 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `radial-gradient(circle at 20% 0%, ${alpha(
            meta.color,
            0.18
          )}, transparent 34%)`,
        }}
      >
        <Container maxWidth="md">
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
              overflow: "hidden",
              borderRadius: 3,
              border: `1px solid ${alpha(meta.color, 0.55)}`,
              bgcolor: "background.paper",
              boxShadow: `0 24px 80px ${alpha(meta.color, 0.12)}`,
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, md: 3 },
                py: 2,
                bgcolor: alpha(meta.color, isDark ? 0.22 : 0.14),
                color: meta.color,
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                {hasIncident ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                <Typography sx={{ fontWeight: 950 }}>{meta.headline}</Typography>
              </Stack>
            </Box>

            <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2.5 }}>
              <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                {loading && !data ? "Đang kiểm tra hệ thống..." : meta.description}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.72 : 1),
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: { xs: 2.5, md: 3 },
                py: 2.25,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography sx={{ fontWeight: 950, fontSize: "1.05rem" }}>
                Trạng thái hệ thống
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <ChevronLeft size={16} />
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                  90 ngày gần đây
                </Typography>
                <ChevronRight size={16} />

                <IconButton
                  onClick={() => refresh(true)}
                  disabled={refreshing}
                  size="small"
                  aria-label="Làm mới trạng thái hệ thống"
                >
                  {refreshing ? <CircularProgress size={17} /> : <RefreshCw size={17} />}
                </IconButton>
              </Stack>
            </Stack>

            {components.map((component) => {
              const componentMeta = STATUS_META[component.status as SystemStatusLevel];

              return (
                <Box
                  key={component.id}
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    "&:last-of-type": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      {component.status === "operational" ? (
                        <CheckCircle2 size={18} color={componentMeta.color} />
                      ) : (
                        <AlertCircle size={18} color={componentMeta.color} />
                      )}

                      <Typography sx={{ fontWeight: 600 }}>{component.name}</Typography>

                      {component.status !== "operational" && (
                        <Typography
                          sx={{
                            px: 1,
                            py: 0.35,
                            borderRadius: 99,
                            bgcolor: alpha(componentMeta.color, 0.14),
                            color: componentMeta.color,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {componentMeta.label}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              Cập nhật lần cuối: {lastUpdated || "—"}
            </Typography>

            <Button
              component={NextLink}
              href="/support/contact"
              variant={hasIncident ? "contained" : "outlined"}
              startIcon={<HelpCircle size={18} />}
            >
              Báo lỗi đang gặp
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
