import { Metadata } from "next";
import MovieDetailPage from "@/components/MovieDetail/MovieDetailPage";
import movieService from "@/modules/movie/api/movie-service";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const result = await movieService.getMovieDetailBySlug(slug);
    const movie = result.movie;

    const title = `${movie.title} | Gió Phim`;
    const description =
      movie.description ||
      `Xem phim ${movie.title} HD trực tuyến tại Gió Phim. Đánh giá: ${movie.averageRating?.toFixed(1) || "N/A"}/10`;
    const posterUrl = movie.posterUrl
      ? `${APP_URL}${movie.posterUrl}`
      : `${APP_URL}/icons/logo.webp`;
    const movieUrl = `${APP_URL}/movies/${slug}`;

    return {
      title,
      description,
      openGraph: {
        type: "video.movie",
        url: movieUrl,
        title,
        description,
        images: [
          {
            url: posterUrl,
            width: 500,
            height: 750,
            alt: movie.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [posterUrl],
      },
      alternates: {
        canonical: `/movies/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: "Chi tiết phim | Gió Phim",
      description:
        "Khám phá thông tin phim, tập phim, đánh giá và bình luận cộng đồng trên Gió Phim.",
    };
  }
}

export default async function MovieSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} routeType="movies" />;
}
