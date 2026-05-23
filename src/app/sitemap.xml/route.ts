import { MetadataRoute } from "next";
import movieService from "@/modules/movie/api/movie-service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";

export async function GET(): Promise<Response> {
  try {
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: `${APP_URL}/`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${APP_URL}/movies`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${APP_URL}/tv`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${APP_URL}/discovery`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${APP_URL}/pricing`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    let dynamicRoutes: MetadataRoute.Sitemap = [];
    try {
      const moviesData = await movieService.getMovies({ page: 0, limit: 1000 });
      if (moviesData.content) {
        dynamicRoutes = moviesData.content.map((movie) => ({
          url: `${APP_URL}/movies/${movie.slug}`,
          lastModified: movie.updatedAt ? new Date(movie.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    } catch {
      console.warn("Could not fetch movies for sitemap");
    }

    const allRoutes = [...staticRoutes, ...dynamicRoutes];

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map((route) => {
    const lastmod = route.lastModified
      ? typeof route.lastModified === "string"
        ? route.lastModified
        : route.lastModified.toISOString()
      : new Date().toISOString();
    return `  <url>
    <loc>${route.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(xmlContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
