import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { FileText, MessageSquare, Eye, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { posts, comments } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import styles from "./page.module.css";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  let user: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch {
      redirect("/login");
    }
  }

  if (!user) {
    redirect("/login");
  }

  // Fetch real stats from database
  const [totalPosts] = await db.select({ count: count() }).from(posts);
  const [totalPublishedPosts] = await db
    .select({ count: count() })
    .from(posts)
    .where(eq(posts.status, "published"));
  const [totalComments] = await db.select({ count: count() }).from(comments);
  const [pendingComments] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.status, "pending"));

  // Fetch recent posts (latest 5)
  const recentPostsData = await db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(5);

  // Fetch recent comments (latest 5)
  const recentCommentsData = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorName: comments.authorName,
      content: comments.content,
      status: comments.status,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .orderBy(desc(comments.createdAt))
    .limit(5);

  // Fetch post titles for comment mapping
  const allPosts = await db.select({ id: posts.id, title: posts.title }).from(posts);
  const postTitleMap: Record<string, string> = {};
  allPosts.forEach((p) => {
    postTitleMap[p.id] = p.title;
  });

  // Format dates
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const stats = [
    {
      label: "文章总数",
      value: String(totalPosts?.count ?? 0),
      icon: FileText,
      trend: `已发布 ${totalPublishedPosts?.count ?? 0} 篇`,
    },
    {
      label: "评论总数",
      value: String(totalComments?.count ?? 0),
      icon: MessageSquare,
      trend: `${pendingComments?.count ?? 0} 条待审核`,
    },
    {
      label: "总浏览量",
      value: "—",
      icon: Eye,
      trend: "暂无统计",
    },
    {
      label: "运行时间",
      value: "—",
      icon: Clock,
      trend: "暂无统计",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>仪表盘</h1>
        <p className={styles.greeting}>
          欢迎回来，{user?.name || "管理员"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statTrend}>{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className={styles.activityGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>最近文章</h2>
            <a href="/posts" className={styles.sectionLink}>查看全部 →</a>
          </div>
          <div className={styles.list}>
            {recentPostsData.length === 0 ? (
              <div className={styles.empty}>暂无文章</div>
            ) : (
              recentPostsData.map((post) => (
                <div key={post.id} className={styles.listItem}>
                  <div className={styles.listItemContent}>
                    <span className={styles.listItemTitle}>{post.title}</span>
                    <span className={styles.listItemMeta}>{formatDate(post.createdAt)}</span>
                  </div>
                  <span className={`${styles.status} ${styles[`status${post.status}`]}`}>
                    {post.status === "published" ? "已发布" : post.status === "draft" ? "草稿" : "归档"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>最近评论</h2>
            <a href="/comments" className={styles.sectionLink}>查看全部 →</a>
          </div>
          <div className={styles.list}>
            {recentCommentsData.length === 0 ? (
              <div className={styles.empty}>暂无评论</div>
            ) : (
              recentCommentsData.map((comment) => (
                <div key={comment.id} className={styles.listItem}>
                  <div className={styles.listItemContent}>
                    <span className={styles.listItemTitle}>{comment.authorName}</span>
                    <span className={styles.listItemText}>{comment.content}</span>
                    <span className={styles.listItemMeta}>文章：{postTitleMap[comment.postId as string] || "—"}</span>
                  </div>
                  <span className={`${styles.status} ${styles[`status${comment.status}`]}`}>
                    {comment.status === "approved" ? "已审核" : comment.status === "pending" ? "待审核" : comment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
