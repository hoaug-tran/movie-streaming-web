"use client";

import { Box } from "@mui/material";
import { SectionHeader } from "@/components/Common/SectionHeader";
import { useMovieCategories } from "@/modules/movie/hooks/useClientMovies";
import { CategoryCard } from "@/components/Common/CategoryCard";
import { useRouter } from "next/navigation";
import { HorizontalScrollGrid } from "@/components/Common/HorizontalScrollGrid";

export function CategoriesSection() {
  const { data: categories = [], isLoading, isError } = useMovieCategories();
  const router = useRouter();

  if (isLoading || isError || !categories || categories.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", py: { xs: 0.75, md: 1 }, px: { xs: 2, md: 4 } }}>
      <SectionHeader title="Danh mục phổ biến" />

      <HorizontalScrollGrid itemWidth={200}>
        {categories.map((category) => (
          <Box
            key={category.id}
            onClick={() => router.push(`/movies/category/${category.id}`)}
            sx={{
              minWidth: 200,
              cursor: "pointer",
              scrollSnapAlign: "start",
            }}
          >
            <CategoryCard name={category.name} />
          </Box>
        ))}
      </HorizontalScrollGrid>
    </Box>
  );
}
