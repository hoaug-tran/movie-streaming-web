"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Skeleton } from "@mui/material";
import { adminService } from "@/modules/admin/api";
import { ExecutivePanel } from "@/modules/admin/components/dashboard/sections/ExecutivePanel";
import { ContentRadar } from "@/modules/admin/components/dashboard/sections/ContentRadar";
import { SystemTerminal } from "@/modules/admin/components/dashboard/sections/SystemTerminal";
import { MainAreaChart } from "@/modules/admin/components/dashboard/charts/MainAreaChart";
import { MultiLineChart } from "@/modules/admin/components/dashboard/charts/MultiLineChart";
import { BentoContainer } from "@/modules/admin/components/dashboard/BentoContainer";
import Link from "next/link";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import MovieCreationRoundedIcon from "@mui/icons-material/MovieCreationRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AdminPermissionGate from "@/modules/admin/components/AdminPermissionGate";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

const workloadConfig: Record<string, { href: string; icon: any; actionLabel: string }> = {
  "Báo cáo chờ xử lý": {
    href: "/admin/reports",
    icon: ReportProblemRoundedIcon,
    actionLabel: "Duyệt báo cáo",
  },
  "Phim nháp": {
    href: "/admin/movies",
    icon: MovieCreationRoundedIcon,
    actionLabel: "Biên tập ngay",
  },
  "Bình luận bị ẩn": {
    href: "/admin/comments",
    icon: ForumRoundedIcon,
    actionLabel: "Xem bình luận",
  },
  "Tài khoản chờ kích hoạt": {
    href: "/admin/users",
    icon: PeopleAltRoundedIcon,
    actionLabel: "Xác minh ngay",
  },
  "Gói sắp hết hạn": {
    href: "/admin/subscriptions",
    icon: WorkspacePremiumRoundedIcon,
    actionLabel: "Xem chi tiết",
  },
};

function AdminDashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: adminService.getDashboardSummary,
    refetchInterval: 5000,
    retry: 1,
  });

  const metrics = data?.metrics ?? [];
  const trendSets = data?.trendSets ?? [];
  const mainTrend = data?.mainTrend ?? [];
  const rankings = data?.rankingCards ?? [];
  const distributions = data?.distributions ?? [];
  const workload = data?.workload ?? [];
  const signals = data?.systemSignals ?? [];
  const activities = data?.userActivities ?? data?.activities ?? [];
  const adminActivities = data?.adminActivities ?? [];

  const maxDistribution = useMemo(
    () => Math.max(1, ...(data?.distributions ?? []).map((item) => item.value)),
    [data?.distributions]
  );

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Không thể tải dữ liệu bảng điều khiển";
    const isAuthError = (error as any)?.status === 403;

    return (
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 6, md: 8 },
          maxWidth: 1600,
          mx: "auto",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 950,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.125rem" },
              lineHeight: { xs: 1.15, md: 1.2 },
            }}
          >
            Trang quản trị Gió Phim
          </Typography>
        </Box>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              color: "#ef4444",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            {isAuthError ? "Lỗi Quyền Truy Cập" : "Lỗi Tải Dữ Liệu"}
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            {isAuthError
              ? "Tài khoản của bạn không có quyền truy cập bảng điều khiển quản trị."
              : errorMessage}
          </Typography>
          {isAuthError && (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.9rem" }}>
              Bạn cần có vai trò ADMIN hoặc MODERATOR để truy cập trang này.
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 6, md: 8 },
          maxWidth: 1600,
          mx: "auto",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 950,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.125rem" },
              lineHeight: { xs: 1.15, md: 1.2 },
            }}
          >
            Trang quản trị Gió Phim
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            autoRows: { xs: "auto", xl: "minmax(180px, auto)" },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            alignItems: "stretch",
          }}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <BentoContainer key={idx}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={32} />
                </Box>
                <Skeleton variant="rectangular" width={48} height={28} sx={{ borderRadius: 1 }} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "auto" }}>
                <Skeleton variant="rectangular" width={40} height={16} sx={{ borderRadius: 0.5 }} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            </BentoContainer>
          ))}

          {Array.from({ length: 2 }).map((_, idx) => (
            <BentoContainer
              key={idx}
              gridColumn={{ xs: "1 / -1", xl: "span 2" }}
              gridRow={{ xs: "auto", xl: "span 2" }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="text" width="30%" height={16} />
                  <Skeleton variant="text" width="50%" height={60} sx={{ mt: 1, mb: 1 }} />
                  <Skeleton variant="text" width="20%" height={16} />
                </Box>
                <Box sx={{ mt: "auto" }}>
                  <Skeleton
                    variant="rectangular"
                    height={120}
                    width="100%"
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </Box>
            </BentoContainer>
          ))}

          <BentoContainer gridColumn={{ xs: "1 / -1", xl: "span 2" }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 155,
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Skeleton variant="circular" width={36} height={36} />
                      <Skeleton
                        variant="rectangular"
                        width={40}
                        height={24}
                        sx={{ borderRadius: 1.5 }}
                      />
                    </Box>
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={14} />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="circular" width={16} height={16} />
                  </Box>
                </Box>
              ))}
            </Box>
          </BentoContainer>

          <BentoContainer gridColumn={{ xs: "1 / -1", xl: "span 2" }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5 }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Skeleton variant="text" width="30%" height={16} />
                    <Skeleton variant="text" width="10%" height={16} />
                  </Box>
                  <Skeleton
                    variant="rectangular"
                    height={4}
                    width="100%"
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              ))}
            </Box>
          </BentoContainer>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        pt: { xs: 2, md: 3 },
        pb: { xs: 6, md: 8 },
        maxWidth: 1600,
        mx: "auto",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 950,
            letterSpacing: "-0.02em",
            fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.125rem" },
            lineHeight: { xs: 1.15, md: 1.2 },
          }}
        >
          Trang quản trị Gió Phim
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          autoRows: { xs: "auto", xl: "minmax(180px, auto)" },
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          alignItems: "stretch",
        }}
      >
        <ExecutivePanel
          metrics={metrics}
          workload={workload}
          maxWorkload={1}
          trendSets={trendSets}
        />

        <BentoContainer
          gridColumn={{ xs: "1 / -1", xl: "span 2" }}
          gridRow={{ xs: "auto", xl: "span 2" }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 800, letterSpacing: "0.1em" }}
              >
                Tổng Doanh Thu Hệ Thống
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 950,
                  letterSpacing: "-0.06em",
                  mt: 1,
                  mb: 1,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3.75rem" },
                  lineHeight: 1,
                }}
              >
                {metrics[0]?.value || "0 đ"}
              </Typography>
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                {metrics[0]?.delta} {metrics[0]?.helper}
              </Typography>
            </Box>
            <Box
              sx={{
                mx: { xs: -1.5, sm: -2.5 },
                mb: { xs: -1.5, sm: -2.5 },
                mt: "auto",
                display: "flex",
                minWidth: 0,
              }}
            >
              <MainAreaChart data={mainTrend} height={120} />
            </Box>
          </Box>
        </BentoContainer>

        <BentoContainer
          gridColumn={{ xs: "1 / -1", xl: "span 2" }}
          gridRow={{ xs: "auto", xl: "span 2" }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 800, letterSpacing: "0.1em" }}
              >
                Tổng Lượt Truy Cập & Xem
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 950,
                  letterSpacing: "-0.06em",
                  mt: 1,
                  mb: 1,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3.75rem" },
                  lineHeight: 1,
                }}
              >
                {metrics[3]?.value || "0"}
              </Typography>
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                {metrics[3]?.delta} {metrics[3]?.helper}
              </Typography>
            </Box>
            <Box
              sx={{
                mx: { xs: -1.5, sm: -2.5 },
                mb: { xs: -1.5, sm: -2.5 },
                mt: "auto",
                display: "flex",
                minWidth: 0,
              }}
            >
              <MainAreaChart data={[...mainTrend].reverse()} height={120} />
            </Box>
          </Box>
        </BentoContainer>

        <BentoContainer gridColumn={{ xs: "1 / -1", xl: "span 2" }}>
          <Typography variant="h6" sx={{ fontWeight: 950, mb: 3 }}>
            Công việc & Cần xử lý
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {workload.slice(0, 6).map((item) => {
              const config = workloadConfig[item.name] || {
                href: "/admin",
                icon: AssignmentRoundedIcon,
                actionLabel: "Xử lý",
              };
              const IconComponent = config.icon;
              return (
                <Box
                  key={item.name}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 155,
                    textDecoration: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                      borderColor: `${item.color}50`,
                      boxShadow: `0 8px 24px ${item.color}15`,
                      "& .workload-action-icon": {
                        transform: "translateX(4px)",
                        color: "text.primary",
                      },
                    },
                  }}
                  component={Link}
                  href={config.href}
                >
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: `${item.color}15`,
                          color: item.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComponent sx={{ fontSize: 20 }} />
                      </Box>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: item.color }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, mb: 0.5, color: "text.primary", lineHeight: 1.3 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {item.caption || "Công việc đang chờ xử lý."}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 2,
                      pt: 1.5,
                      borderTop: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: item.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {config.actionLabel}
                    </Typography>
                    <ChevronRightRoundedIcon
                      className="workload-action-icon"
                      sx={{ fontSize: 18, color: "text.secondary", transition: "all 0.2s ease" }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </BentoContainer>

        <BentoContainer gridColumn={{ xs: "1 / -1", xl: "span 2" }}>
          <Typography variant="h6" sx={{ fontWeight: 950, mb: 3 }}>
            Phân bố danh mục
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5 }}>
            {distributions.map((item) => (
              <Box key={`${item.scope}-${item.label}`}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {item.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 4,
                    bgcolor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${(item.value / maxDistribution) * 100}%`,
                      bgcolor: item.color,
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </BentoContainer>

        <ContentRadar rankings={rankings} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>
          Dữ liệu chi tiết các phân hệ
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          {data?.metricGroups?.map((group) => (
            <BentoContainer key={group.title}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                {group.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                {group.subtitle}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {group.items.map((item) => (
                  <Box
                    key={item.label}
                    sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)" }}
                  >
                    <Typography
                      noWrap
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 800 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 950, mt: 0.5 }}>
                      {item.value}
                    </Typography>
                    <Typography
                      noWrap
                      variant="caption"
                      sx={{ color: "primary.main", fontWeight: 900 }}
                    >
                      {item.delta}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </BentoContainer>
          ))}
          <BentoContainer>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                Hiệu năng Server (API & DB)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.5 }}
              >
                Số hiện tại: CPU/RAM theo %, DB theo số kết nối, API theo ms.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 1,
                  mb: 1.5,
                }}
              >
                {(data?.serverPerformance || []).map((item) => (
                  <Box
                    key={item.label}
                    sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)" }}
                  >
                    <Typography
                      noWrap
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 800 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 950, color: item.color }}>
                      {item.value ?? `${item.data.at(-1) ?? 0}${item.unit ?? ""}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%" }}>
                  <MultiLineChart datasets={data?.serverPerformance || []} height={120} />
                </Box>
              </Box>
            </Box>
          </BentoContainer>
        </Box>
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 3, md: 4 },
          }}
        >
          <SystemTerminal
            signals={signals}
            activities={activities}
            adminActivities={adminActivities}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.role === "ROLE_MODERATOR") {
      router.replace("/admin/moderation");
    }
  }, [loading, router, user?.role]);

  if (!loading && user?.role === "ROLE_MODERATOR") return null;

  return (
    <AdminPermissionGate permission="dashboard:read">
      <AdminDashboardContent />
    </AdminPermissionGate>
  );
}
