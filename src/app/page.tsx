"use client";

import { Box } from "@mui/material";
import { HeroBanner } from "@/components/Homepage/HeroBanner";
import { ContinueWatchingSection } from "@/components/Homepage/ContinueWatchingSection";
import { TrendingSection } from "@/components/Homepage/TrendingSection";
import { LatestReleasesSection } from "@/components/Homepage/LatestReleasesSection";
import { RecommendedSection } from "@/components/Homepage/RecommendedSection";
import { CategoriesSection } from "@/components/Homepage/CategoriesSection";
import { TopRankedSection } from "@/components/Homepage/TopRankedSection";
import { Footer } from "@/components/Layout/Footer";

export default function Home() {
  return (
    <Box sx={{ backgroundColor: "#0F0F0F" }}>
      <Box sx={{ position: "relative" }}>
        <HeroBanner />

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            transform: "translateY(50%)",
            width: "100%",
          }}
        >
          <TrendingSection />
        </Box>
      </Box>

      <Box sx={{ pt: { xs: 20, sm: 24, md: 28 } }}>
        <ContinueWatchingSection />
        <LatestReleasesSection />
        <RecommendedSection />
        <CategoriesSection />
        <TopRankedSection />
      </Box>

      <Footer />
    </Box>
  );
}
