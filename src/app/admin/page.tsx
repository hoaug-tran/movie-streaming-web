"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography } from "@mui/material";
import { adminService } from "@/modules/admin/api";
import { ExecutivePanel } from "@/modules/admin/components/dashboard/sections/ExecutivePanel";
import { ContentRadar } from "@/modules/admin/components/dashboard/sections/ContentRadar";
import { SystemTerminal } from "@/modules/admin/components/dashboard/sections/SystemTerminal";
import { MainAreaChart } from "@/modules/admin/components/dashboard/charts/MainAreaChart";
import { MultiLineChart } from "@/modules/admin/components/dashboard/charts/MultiLineChart";
import { RadialProgress } from "@/modules/admin/components/dashboard/charts/RadialProgress";
import { BentoContainer } from "@/modules/admin/components/dashboard/BentoContainer";

export default function AdminPage() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: adminService.getDashboardSummary,
  });

  const metrics = data?.metrics ?? [];
  const trendSets = data?.trendSets ?? [];
  const mainTrend = data?.mainTrend ?? [];
  const rankings = data?.rankingCards ?? [];
  const distributions = data?.distributions ?? [];
  const workload = data?.workload ?? [];
  const signals = data?.systemSignals ?? [];
  const activities = data?.activities ?? [];

  const maxWorkload = useMemo(
    () => Math.max(1, ...(data?.workload ?? []).map((item) => item.value)),
    [data?.workload]
  );

  const maxDistribution = useMemo(
    () => Math.max(1, ...(data?.distributions ?? []).map((item) => item.value)),
    [data?.distributions]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 8, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: "-0.02em" }}>
          Trang quản trị Gió Phim / Tổng quan
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
          autoRows: "minmax(180px, auto)",
          gap: 2.5,
        }}
      >
        <ExecutivePanel
          metrics={metrics}
          workload={workload}
          maxWorkload={maxWorkload}
          trendSets={trendSets}
        />

        <BentoContainer gridColumn={{ xs: "1fr", xl: "span 2" }} gridRow="span 2">
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
                sx={{ fontWeight: 950, letterSpacing: "-0.06em", mt: 1, mb: 1 }}
              >
                {metrics[0]?.value || "0 đ"}
              </Typography>
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                {metrics[0]?.delta} {metrics[0]?.helper}
              </Typography>
            </Box>
            <Box sx={{ mx: -2.5, mb: -2.5, mt: "auto", display: "flex" }}>
              <MainAreaChart data={mainTrend} height={120} />
            </Box>
          </Box>
        </BentoContainer>

        <BentoContainer gridColumn={{ xs: "1fr", xl: "span 2" }} gridRow="span 2">
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
                sx={{ fontWeight: 950, letterSpacing: "-0.06em", mt: 1, mb: 1 }}
              >
                {metrics[3]?.value || "0"}
              </Typography>
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                {metrics[3]?.delta} {metrics[3]?.helper}
              </Typography>
            </Box>
            <Box sx={{ mx: -2.5, mb: -2.5, mt: "auto", display: "flex" }}>
              <MainAreaChart data={[...mainTrend].reverse()} height={120} />
            </Box>
          </Box>
        </BentoContainer>

        <BentoContainer gridColumn={{ xs: "1fr", xl: "span 2" }}>
          <Typography variant="h6" sx={{ fontWeight: 950, mb: 3 }}>
            Công việc & Cần xử lý
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {workload.slice(0, 6).map((item) => (
              <Box key={item.name} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <RadialProgress
                  value={item.value}
                  max={maxWorkload}
                  color={item.color}
                  size={54}
                  strokeWidth={5}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap variant="subtitle2" sx={{ fontWeight: 900 }}>
                    {item.name}
                  </Typography>
                  <Typography noWrap variant="caption" color="text.secondary">
                    {item.value} chờ xử lý
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </BentoContainer>

        <BentoContainer gridColumn={{ xs: "1fr", xl: "span 2" }}>
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

        <SystemTerminal signals={signals} activities={activities} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>
          Dữ liệu chi tiết các phân hệ
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
            gap: 2.5,
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
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
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
                Hiệu năng Server (Tải API & DB)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Tải trung bình CPU / RAM
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%" }}>
                  <MultiLineChart datasets={data?.serverPerformance || []} height={120} />
                </Box>
              </Box>
            </Box>
          </BentoContainer>
        </Box>
      </Box>
    </Box>
  );
}
