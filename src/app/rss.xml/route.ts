import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const allPosts = await db.select().from(posts);
    const publishedPosts = allPosts
      .filter((p) => p.status === "published")
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

    const rssItems = publishedPosts
      .map((post) => {
        const pubDate = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : new Date().toUTCString();
        const postUrl = `${siteUrl}/posts/${post.id}`;
        const excerpt = post.excerpt || "";
        const content = post.content || "";

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${excerpt}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>admin@voidlog.com</author>
    </item>`;
      })
      .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VOID LOG</title>
    <link>${siteUrl}</link>
    <description>A personal blog in the void</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("<?xml version=\"1.0\"?><rss version=\"2.0\"><channel><title>Error</title></channel></rss>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
