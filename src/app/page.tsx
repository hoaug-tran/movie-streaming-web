"use client";

import { Box } from "@mui/material";
import { HeroBanner } from "@/components/Homepage/HeroBanner";
import { ContinueWatchingSection } from "@/components/Homepage/ContinueWatchingSection";
import { TrendingSection } from "@/components/Homepage/TrendingSection";
import { RecommendedSection } from "@/components/Homepage/RecommendedSection";
import { CategoriesSection } from "@/components/Homepage/CategoriesSection";
import { DiscoverySection } from "@/components/Homepage/DiscoverySection";
import { RegionalDiscovery } from "@/components/Homepage/RegionalDiscovery";
import { SocialEngagementSection } from "@/components/Homepage/SocialEngagementSection";
import { Footer } from "@/components/Layout/Footer";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useDiscovery } from "@/modules/movie/hooks/useDiscovery";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { weeklyNewMovies, upcomingMovies, topRatedMovies, topSeries } = useDiscovery();

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ position: "relative" }}>
        <HeroBanner />
        <Box
          sx={{
            position: "relative",
            mt: { xs: "-80px", sm: "-120px", md: "-160px" },
            zIndex: 10,
          }}
        >
          <TrendingSection />
        </Box>
      </Box>

      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 6, md: 10 },
          pb: 12,
        }}
      >
        {isAuthenticated && <ContinueWatchingSection />}
        {isAuthenticated && <RecommendedSection />}

        <DiscoverySection
          title="Phim mới tuần này"
          subtitle="Cập nhật những siêu phẩm vừa ra mắt"
          movies={weeklyNewMovies.data || []}
          isLoading={weeklyNewMovies.isLoading}
          isError={weeklyNewMovies.isError}
          href="/movies?sort=newest"
          hideRating
        />

        <CategoriesSection />

        <DiscoverySection
          title="Đánh giá cao nhất"
          subtitle="Những bộ phim được cộng đồng yêu thích nhất"
          movies={topRatedMovies.data || []}
          isLoading={topRatedMovies.isLoading}
          isError={topRatedMovies.isError}
          href="/movies?sort=rating"
          variant="compact"
        />

        <DiscoverySection
          title="Top 10 phim bộ hôm nay"
          subtitle="Xu hướng phim dài tập không thể bỏ lỡ"
          movies={topSeries.data || []}
          isLoading={topSeries.isLoading}
          isError={topSeries.isError}
          variant="ranked"
        />

        <RegionalDiscovery />

        <SocialEngagementSection />

        <DiscoverySection
          title="Phim Sắp Tới"
          subtitle="Đừng bỏ lỡ những siêu phẩm sắp ra mắt"
          movies={upcomingMovies.data || []}
          isLoading={upcomingMovies.isLoading}
          isError={upcomingMovies.isError}
          hideRating
        />
      </Box>

      <Footer />
    </Box>
  );
}
