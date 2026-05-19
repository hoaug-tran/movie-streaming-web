"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  alpha,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import NextLink from "next/link";
import {
  ChevronRight,
  Activity,
  Server,
  Cloud,
  CreditCard,
  Mail,
  Database,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  RefreshCw,
  Cpu,
  HardDrive,
  Film,
} from "lucide-react";
import { Footer } from "@/components/Layout/Footer";
import {
  systemService,
  type SystemComponentStatus,
  type SystemStatusLevel,
  type SystemStatusPayload,
} from "@/services/system-service";

const STATUS_META: Record<
  SystemStatusLevel,
  { label: string; color: string; bg: string; description: string }
> = {
  operational: {
    label: "Hoạt động bình thường",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    description: "Mọi tính năng đang phục vụ ổn định.",
  },
  degraded: {
    label: "Giảm hiệu năng",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    description: "Có chậm cục bộ ở một số khu vực.",
  },
  maintenance: {
    label: "Đang bảo trì",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    description: "Bảo trì theo lịch, người dùng có thể gián đoạn ngắn.",
  },
  outage: {
    label: "Mất kết nối",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    description: "Đang khắc phục, sẽ cập nhật liên tục.",
  },
};

const COMPONENT_ICONS: Record<string, typeof Server> = {
  api: Server,
  database: Database,
  redis: Cloud,
  payment: CreditCard,
  mail: Mail,
  storage: HardDrive,
  transcoder: Film,
};

function StatusPill({ status }: { status: SystemStatusLevel }) {
  const meta = STATUS_META[status];
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.1,
        py: 0.4,
        borderRadius: 99,
        backgroundColor: meta.bg,
        color: meta.color,
        fontSize: "0.72rem",
        fontWeight: 800,
        letterSpacing: "0.04em",
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: meta.color,
          boxShadow: `0 0 8px ${meta.color}`,
        }}
      />
      {meta.label}
    </Box>
  );
}

function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}

export default function StatusPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [data, setData] = useState<SystemStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const refresh = useCallback(async (silent: boolean = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const payload = await systemService.getStatus();
      setData(payload);
      setLastUpdated(
        new Date().toLocaleString("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      );
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Không lấy được dữ liệu trạng thái. Có thể máy chủ đang ngoại tuyến.";
      setError(message);
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

  const overall: SystemStatusLevel = data?.overall ?? "outage";
  const overallMeta = STATUS_META[overall];
  const components: SystemComponentStatus[] = useMemo(() => data?.components ?? [], [data]);

  const summary = useMemo(() => {
    if (!data) return null;
    const total = components.length;
    const healthy = components.filter((c) => c.status === "operational").length;
    return { total, healthy };
  }, [components, data]);

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          pt: { xs: 11, md: 14 },
          pb: { xs: 4, md: 6 },
          overflow: "hidden",
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: isDark
            ? `linear-gradient(180deg, ${alpha(overallMeta.color, 0.1)} 0%, transparent 70%)`
            : `linear-gradient(180deg, ${alpha(overallMeta.color, 0.06)} 0%, transparent 70%)`,
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 3,
              fontSize: "0.78rem",
              "& .MuiBreadcrumbs-separator": { color: "text.disabled", mx: 0.75 },
            }}
          >
            <MuiLink
              component={NextLink}
              href="/"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.78rem",
                fontWeight: 500,
                "&:hover": { color: "text.primary" },
              }}
            >
              Trang chủ
            </MuiLink>
            <MuiLink
              component={NextLink}
              href="/support"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.78rem",
                fontWeight: 500,
                "&:hover": { color: "text.primary" },
              }}
            >
              Hỗ trợ
            </MuiLink>
            <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.78rem" }}>
              Trạng thái hệ thống
            </Typography>
          </Breadcrumbs>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1px solid ${alpha(overallMeta.color, 0.4)}`,
              backgroundColor: isDark
                ? alpha(overallMeta.color, 0.08)
                : alpha(overallMeta.color, 0.05),
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "auto 1fr auto" },
              gap: 3,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: overallMeta.color,
                backgroundColor: alpha(overallMeta.color, 0.16),
                border: `1px solid ${alpha(overallMeta.color, 0.3)}`,
                flexShrink: 0,
              }}
            >
              {overall === "operational" ? (
                <CheckCircle2 size={26} />
              ) : overall === "outage" ? (
                <AlertTriangle size={26} />
              ) : overall === "maintenance" ? (
                <Wrench size={26} />
              ) : (
                <Activity size={26} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: overallMeta.color,
                  mb: 0.5,
                }}
              >
                Trạng thái tổng quan
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                  fontWeight: 950,
                  letterSpacing: "-0.03em",
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {loading && !data ? "Đang kiểm tra..." : overallMeta.label}
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.5, fontSize: "0.92rem" }}>
                {error ? error : overallMeta.description}
              </Typography>
            </Box>
            <Stack spacing={1} sx={{ alignItems: { xs: "flex-start", md: "flex-end" } }}>
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{ color: "text.secondary" }}
              >
                <Tooltip title="Tải lại ngay">
                  <IconButton
                    size="small"
                    onClick={() => refresh(true)}
                    disabled={refreshing}
                    sx={{ color: "text.secondary" }}
                  >
                    {refreshing ? (
                      <CircularProgress size={14} thickness={5} />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                  </IconButton>
                </Tooltip>
                <Typography sx={{ fontSize: "0.78rem" }}>Cập nhật {lastUpdated || "—"}</Typography>
              </Stack>
              {data ? (
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  Uptime hệ thống:{" "}
                  <Box component="span" sx={{ color: "text.primary", fontWeight: 800 }}>
                    {formatUptime(data.uptimeSeconds)}
                  </Box>
                </Typography>
              ) : null}
              {summary ? (
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  Thành phần khoẻ mạnh:{" "}
                  <Box component="span" sx={{ color: "text.primary", fontWeight: 800 }}>
                    {summary.healthy}/{summary.total}
                  </Box>
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 9 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "flex-end" }}
          sx={{ mb: 3, gap: 1 }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "primary.main",
                mb: 0.5,
              }}
            >
              Hệ thống thành phần
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "text.primary",
              }}
            >
              Theo dõi từng dịch vụ
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5, fontSize: "0.9rem" }}>
              Dữ liệu được kiểm tra trực tiếp từ máy chủ Spring Boot, Redis, MySQL, PayOS, mail và
              lưu trữ media. Tự động làm mới mỗi phút.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap", rowGap: 1 }}>
            {(Object.keys(STATUS_META) as SystemStatusLevel[]).map((s) => (
              <Stack key={s} direction="row" spacing={0.6} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: STATUS_META[s].color,
                  }}
                />
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
                  {STATUS_META[s].label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {loading && !data ? (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              py: 8,
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={28} thickness={4.5} />
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                Đang đo đạc các dịch vụ...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={2}>
            {components.map((service) => {
              const meta = STATUS_META[service.status];
              const Icon = COMPONENT_ICONS[service.id] ?? Cpu;
              return (
                <Box
                  key={service.id}
                  sx={{
                    p: { xs: 2.25, md: 2.75 },
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: isDark
                      ? alpha(theme.palette.background.paper, 0.55)
                      : theme.palette.background.paper,
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: alpha(meta.color, 0.4) },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ md: "center" }}
                    spacing={1.5}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1.25,
                          display: "grid",
                          placeItems: "center",
                          color: meta.color,
                          backgroundColor: alpha(meta.color, 0.14),
                          border: `1px solid ${alpha(meta.color, 0.3)}`,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
                          {service.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: "text.secondary",
                            mt: 0.25,
                            lineHeight: 1.55,
                          }}
                        >
                          {service.description}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={3}
                      alignItems="center"
                      sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}
                    >
                      {service.latencyMs !== null ? (
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: "text.secondary",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            Độ trễ
                          </Typography>
                          <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
                            {service.latencyMs} ms
                          </Typography>
                        </Box>
                      ) : null}
                      <StatusPill status={service.status} />
                    </Stack>
                  </Stack>
                  {service.detail ? (
                    <Typography
                      sx={{
                        mt: 1.5,
                        fontSize: "0.82rem",
                        color: "text.secondary",
                        fontFamily: "monospace",
                        backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.04 : 0.03),
                        px: 1.25,
                        py: 1,
                        borderRadius: 1,
                        border: `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      {service.detail}
                    </Typography>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        )}

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: isDark
              ? alpha(theme.palette.background.paper, 0.55)
              : theme.palette.background.paper,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "primary.main",
              mb: 0.5,
            }}
          >
            Cách đọc thông số
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              fontWeight: 800,
              color: "text.primary",
              mb: 1.5,
            }}
          >
            Mỗi thành phần được đo trực tiếp khi bạn mở trang
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.75, fontSize: "0.92rem" }}>
            • Cơ sở dữ liệu kiểm tra qua{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              Connection.isValid
            </Box>
            . • Redis kiểm tra qua lệnh{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              PING
            </Box>
            . • Cổng PayOS xác nhận theo cấu hình{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              client-id
            </Box>
            ,{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              api-key
            </Box>{" "}
            và{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              checksum-key
            </Box>
            . • Email kiểm tra cấu hình SMTP trên domain{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              giophim.libsys.me
            </Box>
            . • Lưu trữ media kiểm tra thư mục phim, HLS và keys cùng đường dẫn FFmpeg. Khi cần báo
            sự cố, gửi mô tả tới{" "}
            <MuiLink
              component={NextLink}
              href="/support/contact"
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              trang Liên hệ
            </MuiLink>{" "}
            để chuyển trực tiếp vào hộp thư quản trị viên.
          </Typography>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
