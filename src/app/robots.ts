import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giophim.libsys.me";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/tv", "/discovery", "/pricing", "/movie"],
        disallow: [
          "/admin",
          "/access",
          "/auth",
          "/api",
          "/profile",
          "/account",
          "/favorites",
          "/history",
          "/watchlist",
          "/downloads",
          "/watch/offline",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
