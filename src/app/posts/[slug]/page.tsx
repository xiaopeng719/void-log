import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { posts, comments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import CommentSection from "@/components/public/CommentSection";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });
  
  if (!post) return { title: "文章未找到" };
  
  return {
    title: `${post.title} | VOID LOG`,
    description: post.excerpt || post.title,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });

  if (!post || post.status !== "published") {
    notFound();
  }

  // Fetch approved comments directly from DB
  const postComments = await db.select().from(comments).where(
    and(eq(comments.postId, post.id), eq(comments.status, "approved"))
  );

  // Convert dates to strings for the CommentSection component
  const serializedComments = postComments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  const formatDate = (date: string | null) => {
    if (!date) return "草稿";
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const readingTime = Math.ceil(post.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            <span>返回首页</span>
          </Link>
        </nav>

        {/* Article Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              <span>{formatDate(post.publishedAt?.toString() || null)}</span>
            </span>
            <span className={styles.metaItem}>
              <Clock size={14} />
              <span>{readingTime} 分钟阅读</span>
            </span>
          </div>
        </header>

        {/* Article Content */}
        <article className={styles.article}>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Comments */}
        <CommentSection postId={post.id} comments={serializedComments} />
      </div>
    </div>
  );
}
