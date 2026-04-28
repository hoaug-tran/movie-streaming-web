import CategoryDetailPage from "@/components/CategoryDetail/CategoryDetailPage";

type CategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryRouteProps) {
  const { slug } = await params;
  return <CategoryDetailPage categorySlug={slug} />;
}
