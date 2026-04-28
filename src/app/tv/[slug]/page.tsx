import { Metadata } from "next";

import MovieDetailPage from "@/components/MovieDetail/MovieDetailPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Chi tiết phim bộ | Gió Phim",
  description:
    "Khám phá thông tin phim bộ, danh sách tập, đánh giá và bình luận cộng đồng trên Gió Phim.",
};

export default async function TvSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} routeType="tv" />;
}
