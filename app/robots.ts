import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/candidate/profile", "/employer/dashboard", "/login", "/signup", "/p/"],
      disallow: ["/api/", "/admin/"],
    },
    sitemap: "https://meritlane.app/sitemap.xml",
  };
}
