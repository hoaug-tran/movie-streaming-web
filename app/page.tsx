"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import { Suspense } from "react";

const Footer = dynamic(
  () => import("@/components/Layout/Footer").then((mod) => ({ default: mod.Footer })),
  {
    ssr: false,
    loading: () => <Box sx={{ height: 200, backgroundColor: "#1a1a1a" }} />,
  }
);

const HeroBanner = dynamic(
  () => import("@/components/Homepage/HeroBanner").then((mod) => ({ default: mod.HeroBanner })),
  {
    ssr: false,
  }
);

const TrendingSection = dynamic(
  () =>
    import("@/components/Homepage/TrendingSection").then((mod) => ({
      default: mod.TrendingSection,
    })),
  {
    ssr: false,
  }
);

const LatestReleasesSection = dynamic(
  () =>
    import("@/components/Homepage/LatestReleasesSection").then((mod) => ({
      default: mod.LatestReleasesSection,
    })),
  {
    ssr: false,
  }
);

const RecommendedSection = dynamic(
  () =>
    import("@/components/Homepage/RecommendedSection").then((mod) => ({
      default: mod.RecommendedSection,
    })),
  {
    ssr: false,
  }
);

const CategoriesSection = dynamic(
  () =>
    import("@/components/Homepage/CategoriesSection").then((mod) => ({
      default: mod.CategoriesSection,
    })),
  {
    ssr: false,
  }
);

const TopRankedSection = dynamic(
  () =>
    import("@/components/Homepage/TopRankedSection").then((mod) => ({
      default: mod.TopRankedSection,
    })),
  {
    ssr: false,
  }
);

const ContinueWatchingSection = dynamic(
  () =>
    import("@/components/Homepage/ContinueWatchingSection").then((mod) => ({
      default: mod.ContinueWatchingSection,
    })),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <Box sx={{ backgroundColor: "#0F0F0F" }}>
      <Box>
        <Suspense fallback={<Box sx={{ height: 500, backgroundColor: "#1a1a1a" }} />}>
          <HeroBanner />
        </Suspense>

        <Suspense fallback={<Box sx={{ height: 300, backgroundColor: "#1a1a1a" }} />}>
          <ContinueWatchingSection />
        </Suspense>

        <Suspense fallback={<Box sx={{ height: 300, backgroundColor: "#1a1a1a" }} />}>
          <TrendingSection />
        </Suspense>

        <Suspense fallback={<Box sx={{ height: 300, backgroundColor: "#1a1a1a" }} />}>
          <LatestReleasesSection />
        </Suspense>

        <Suspense fallback={<Box sx={{ height: 300, backgroundColor: "#1a1a1a" }} />}>
          <RecommendedSection />
        </Suspense>

        <Suspense fallback={<Box sx={{ height: 300, backgroundColor: "#1a1a1a" }} />}>
          <CategoriesSection />
        </Suspense>

        <Suspense fallback={<Box sx={{ height: 300, backgroundColor: "#1a1a1a" }} />}>
          <TopRankedSection />
        </Suspense>
      </Box>

      <Footer />
    </Box>
  );
}
