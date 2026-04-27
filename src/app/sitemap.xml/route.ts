import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  try {
    const allPosts = await db.select().from(posts);
    const publishedPosts = allPosts.filter((p) => p.status === "published");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const now = new Date().toISOString();

    const staticRoutes = [
      { url: siteUrl, lastmod: now, priority: "1.0", changefreq: "daily" },
      { url: `${siteUrl}/about`, lastmod: now, priority: "0.8", changefreq: "weekly" },
    ];

    const postUrls = publishedPosts.map((post) => {
      const lastmod = post.updatedAt
        ? new Date(post.updatedAt).toISOString()
        : now;
      return {
        url: `${siteUrl}/posts/${post.id}`,
        lastmod,
        priority: "0.9",
        changefreq: "monthly",
      };
    });

    const allUrls = [...staticRoutes, ...postUrls];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemapXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("<?xml version=\"1.0\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
