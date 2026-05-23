import { Metadata } from "next";

import MovieDetailPage from "@/components/MovieDetail/MovieDetailPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

import movieService from "@/modules/movie/api/movie-service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const result = await movieService.getMovieDetailBySlug(slug);
    const movie = result.movie;
    const title = `${movie.title} | Phim bộ | Gió Phim`;
    const description =
      movie.description ||
      `Xem phim bộ ${movie.title} HD, đầy đủ tập, đánh giá và bình luận cộng đồng tại Gió Phim.`;
    const image = movie.posterUrl?.startsWith("http")
      ? movie.posterUrl
      : `${APP_URL}${movie.posterUrl || "/icons/logo.webp"}`;

    return {
      title,
      description,
      alternates: { canonical: `/tv/${slug}` },
      openGraph: {
        type: "video.tv_show",
        url: `${APP_URL}/tv/${slug}`,
        title,
        description,
        images: [{ url: image, width: 500, height: 750, alt: movie.title }],
      },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch {
    return {
      title: "Chi tiết phim bộ | Gió Phim",
      description:
        "Khám phá thông tin phim bộ, danh sách tập, đánh giá và bình luận cộng đồng trên Gió Phim.",
      alternates: { canonical: "/tv" },
    };
  }
}

export default async function TvSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} routeType="tv" />;
}
