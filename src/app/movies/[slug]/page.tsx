import { Metadata } from "next";

import MovieDetailPage from "@/components/MovieDetail/MovieDetailPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Chi tiết phim | Gió Phim",
  description: "Khám phá thông tin phim, tập phim, đánh giá và bình luận cộng đồng trên Gió Phim.",
};

export default async function MovieSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} routeType="movies" />;
}
