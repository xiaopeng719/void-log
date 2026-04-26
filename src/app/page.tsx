import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { posts, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Starfield from "@/components/public/Starfield";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getPosts() {
  const allPosts = await db.select().from(posts);
  return allPosts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
}

async function getSiteSettings() {
  const allSettings = await db.select().from(settings);
  const map: Record<string, string> = {};
  allSettings.forEach((s) => { map[s.key] = s.value; });
  return {
    siteName: map["site_name"] || "VOID LOG",
    siteDescription: map["site_description"] || "A personal blog in the void",
  };
}

export default async function HomePage() {
  const [postsList, siteSettings] = await Promise.all([getPosts(), getSiteSettings()]);

  return (
    <div className={styles.page}>
      <Starfield />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoMark}>
            <ChevronRight size={32} />
          </div>
          <h1 className={styles.heroTitle}>
            {siteSettings.siteName}
          </h1>
          <p className={styles.heroSubtitle}>
            {siteSettings.siteDescription}
          </p>
          <div className={styles.scrollIndicator}>
            <span>向下滚动探索</span>
            <div className={styles.scrollArrow}>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className={styles.posts}>
        <div className={styles.postsHeader}>
          <h2 className={styles.sectionTitle}>最新文章</h2>
          <div className={styles.line} />
        </div>

        {postsList.length === 0 ? (
          <div className={styles.empty}>
            <p>暂无文章，敬请期待！</p>
          </div>
        ) : (
          <div className={styles.postsList}>
            {postsList.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className={styles.postCard}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.postMeta}>
                  <span className={styles.postDate}>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "草稿"}
                  </span>
                </div>
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  {post.excerpt && (
                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                  )}
                </div>
                <div className={styles.postArrow}>
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <ChevronRight size={16} />
            <span>{siteSettings.siteName}</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/posts">文章归档</Link>
            <a href="/rss.xml">RSS</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} 版权所有
          </p>
        </div>
      </footer>
    </div>
  );
}
