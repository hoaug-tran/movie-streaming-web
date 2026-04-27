"use client";

import { Box, Container, Button, Menu, MenuItem, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import movieService from "@/modules/movie/api/movie-service";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";

interface TVSeriesBrowserProps {}

const SECTION_CONFIGS = [
  {
    id: "drama-romance",
    title: "Chính kịch lãng mạn",
    description: "Những series tình cảm lãng mạn xúc động nhất",
    queryFn: () => movieService.getSeriesDrama(12),
  },
  {
    id: "trending",
    title: "Đang thịnh hành",
    description: "Series được xem nhiều nhất tuần này",
    queryFn: () => movieService.getTrendingMovies(12),
  },
  {
    id: "upcoming",
    title: "Sắp ra mắt",
    description: "Series mới sắp được phát hành",
    queryFn: () => movieService.getUpcomingMovies(12),
  },
  {
    id: "top-rated",
    title: "Series đánh giá cao",
    description: "Những series nhận đánh giá cao nhất",
    queryFn: () => movieService.getTopRatedMovies(12),
  },
  {
    id: "anime-series",
    title: "Anime nổi bật",
    description: "Những series anime được yêu thích",
    queryFn: () => movieService.getAnimeSeries(12),
  },
  {
    id: "most-commented",
    title: "Bình luận sôi nổi",
    description: "Series được cộng đồng thảo luận nhiều nhất",
    queryFn: () => movieService.getMostCommented(12),
  },
  {
    id: "top-10-vietnam",
    title: "Top 10 Việt Nam",
    description: "Series phổ biến nhất tại Việt Nam",
    queryFn: () => movieService.getTopSeriesByRegion("Vietnam", 12),
  },
  {
    id: "korea-series",
    title: "Series Hàn Quốc",
    description: "Những bộ series chất lượng từ Hàn Quốc",
    queryFn: () => movieService.getTopSeriesByRegion("South Korea", 12),
  },
  {
    id: "china-series",
    title: "Series Trung Quốc",
    description: "Những bộ series được yêu thích từ Trung Quốc",
    queryFn: () => movieService.getTopSeriesByRegion("China", 12),
  },
  {
    id: "top-series",
    title: "Top Series Hôm Nay",
    description: "Lựa chọn hàng đầu của chúng tôi cho bạn",
    queryFn: () => movieService.getTopSeries(12),
  },
  {
    id: "weekly-new",
    title: "Mới Trên Gió",
    description: "Những series mới nhất được phát hành tuần này",
    queryFn: () => movieService.getWeeklyNewMovies(12),
  },
];

const SectionRenderer: React.FC<{ config: (typeof SECTION_CONFIGS)[0] }> = ({ config }) => {
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["tv-series", config.id],
    queryFn: config.queryFn,
  });

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        <SectionHeader title={config.title} subtitle={config.description} sx={{ mb: 3 }} />

        <HorizontalScrollGrid itemWidth={280}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Box key={`skeleton-${i}`} sx={{ minWidth: 280, scrollSnapAlign: "start" }}>
                  <MovieCardSkeleton />
                </Box>
              ))
            : movies.map((movie: any) => (
                <Box
                  key={movie.id}
                  sx={{
                    minWidth: 280,
                    scrollSnapAlign: "start",
                  }}
                >
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl || ""}
                    bannerUrl={movie.bannerUrl || undefined}
                    rating={movie.averageRating}
                    releaseDate={movie.releaseYear?.toString() || movie.createdAt}
                    ageRating={movie.ageRating}
                    movieType={movie.movieType}
                  />
                </Box>
              ))}
        </HorizontalScrollGrid>
      </Container>
    </Box>
  );
};

export default function TVSeriesBrowser({}: TVSeriesBrowserProps) {
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["tv-categories"],
    queryFn: async () => {
      const all = await movieService.getCategories();
      return all.filter((cat: any) => cat.slug === "series" || cat.name.includes("Series"));
    },
  });

  const handleCategoryOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCategoryAnchor(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchor(null);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    handleCategoryClose();
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} fontSize="0.85rem">
            Bộ lọc nhanh
          </Typography>
          <Button
            startIcon={<FilterAltRoundedIcon />}
            onClick={handleCategoryOpen}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              px: 2,
              py: 1,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              color: "text.primary",
              backgroundColor: "background.paper",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(200, 16, 46, 0.08)",
              },
            }}
          >
            Thể loại
          </Button>

          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={handleCategoryClose}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  minWidth: 200,
                },
              },
            }}
          >
            <MenuItem onClick={() => handleCategorySelect("")} selected={!selectedCategory}>
              Tất cả
            </MenuItem>
            {categories.map((cat: any) => (
              <MenuItem
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                selected={selectedCategory === cat.name}
                sx={{
                  fontSize: "0.875rem",
                  py: 1,
                }}
              >
                {cat.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Container>

      {SECTION_CONFIGS.map((config) => (
        <SectionRenderer key={config.id} config={config} />
      ))}
    </Box>
  );
}
