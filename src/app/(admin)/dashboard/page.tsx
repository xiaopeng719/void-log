import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { FileText, MessageSquare, Eye, Clock } from "lucide-react";
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

  const stats = [
    { label: "文章总数", value: "12", icon: FileText, trend: "本月 +3 篇" },
    { label: "评论总数", value: "48", icon: MessageSquare, trend: "5 条待审核" },
    { label: "总浏览量", value: "2.4K", icon: Eye, trend: "本周 +12%" },
    { label: "运行时间", value: "99.9%", icon: Clock, trend: "最近 30 天" },
  ];

  const recentPosts = [
    { id: "1", title: "Next.js 15 入门指南", status: "published", date: "2026-04-20" },
    { id: "2", title: "构建深色主题系统", status: "draft", date: "2026-04-18" },
    { id: "3", title: "理解 TypeScript 泛型", status: "published", date: "2026-04-15" },
  ];

  const recentComments = [
    { id: "1", author: "小明", content: "写得真好，非常有帮助！", post: "Next.js 15", status: "approved" },
    { id: "2", author: "小红", content: "感谢分享！", post: "TypeScript 泛型", status: "pending" },
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
            {recentPosts.map((post) => (
              <div key={post.id} className={styles.listItem}>
                <div className={styles.listItemContent}>
                  <span className={styles.listItemTitle}>{post.title}</span>
                  <span className={styles.listItemMeta}>{post.date}</span>
                </div>
                <span className={`${styles.status} ${styles[`status${post.status}`]}`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>最近评论</h2>
            <a href="/comments" className={styles.sectionLink}>查看全部 →</a>
          </div>
          <div className={styles.list}>
            {recentComments.map((comment) => (
              <div key={comment.id} className={styles.listItem}>
                <div className={styles.listItemContent}>
                  <span className={styles.listItemTitle}>{comment.author}</span>
                  <span className={styles.listItemText}>{comment.content}</span>
                  <span className={styles.listItemMeta}>文章：{comment.post}</span>
                </div>
                <span className={`${styles.status} ${styles[`status${comment.status}`]}`}>
                  {comment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
