import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/tv", "/discovery", "/pricing"],
        disallow: ["/admin", "/access", "/auth", "/api", "/profile", "/_next", "/watch/offline"],
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
    sitemap: "https://giophim.libsys.me/sitemap.xml",
  };
}
