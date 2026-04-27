"use client";

import { useState } from "react";
import { Box, Tabs, Tab, useTheme, alpha } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { useRegionalMovies } from "@/modules/movie/hooks/useDiscovery";
import { useRouter } from "next/navigation";

const REGIONS = [
  { label: "Phim Hàn Quốc mới", value: "South Korea", slug: "han-quoc" },
  { label: "Phim Trung Quốc mới", value: "China", slug: "trung-quoc" },
  { label: "Phim Âu-Mỹ mới", value: "United States", slug: "au-my" },
];

export function RegionalDiscovery() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const router = useRouter();

  const { data: movies = [], isLoading, isError } = useRegionalMovies(REGIONS[activeTab].value);

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
        }}
      >
        <SectionHeader
          title="Theo quốc gia"
          subtitle="Khám phá điện ảnh khắp thế giới"
          sx={{ mb: 0 }}
        />

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: "auto",
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTabs-flexContainer": {
              gap: 1,
            },
          }}
        >
          {REGIONS.map((region, index) => (
            <Tab
              key={region.value}
              label={region.label}
              sx={{
                minHeight: "auto",
                py: 0.75,
                px: 1.75,
                borderRadius: 1,
                fontSize: "0.8rem",
                fontWeight: 500,
                color: alpha(theme.palette.text.primary, 0.5),
                backgroundColor: alpha(theme.palette.text.primary, 0.04),
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  color: theme.palette.common.white,
                  backgroundColor: theme.palette.primary.main,
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.08),
                  color: alpha(theme.palette.text.primary, 0.8),
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      <HorizontalScrollGrid itemWidth={280}>
        {isLoading || isError
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={`skeleton-${i}`} sx={{ minWidth: 280, scrollSnapAlign: "start" }}>
                <MovieCardSkeleton />
              </Box>
            ))
          : movies.map((movie) => (
              <Box
                key={movie.id}
                onClick={() => router.push(`/movies/${movie.slug}`)}
                sx={{
                  minWidth: 280,
                  cursor: "pointer",
                  scrollSnapAlign: "start",
                }}
              >
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.posterUrl ?? undefined}
                  bannerUrl={movie.bannerUrl ?? undefined}
                />
              </Box>
            ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
