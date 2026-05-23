import type { Metadata } from "next";
import CategoryDetailPage from "@/components/CategoryDetail/CategoryDetailPage";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";

const prettifySlug = (slug: string) =>
  decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type CategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const name = prettifySlug(slug);
  const title = `${name} | Thể loại phim | Gió Phim`;
  const description = `Khám phá tuyển tập phim ${name} được cập nhật liên tục tại Gió Phim. Lọc phim theo năm, loại phim, đánh giá và mức độ nổi bật.`;

  return {
    title,
    description,
    alternates: { canonical: `/movies/category/${slug}` },
    openGraph: {
      type: "website",
      url: `${APP_URL}/movies/category/${slug}`,
      title,
      description,
      images: [{ url: `${APP_URL}/icons/logo.webp`, width: 512, height: 512, alt: "Gió Phim" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${APP_URL}/icons/logo.webp`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryRouteProps) {
  const { slug } = await params;
  return <CategoryDetailPage categorySlug={slug} />;
}
