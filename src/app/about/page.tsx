import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
  title: "关于 | 虚空日志",
  description: "关于这个博客及其作者",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            <span>返回首页</span>
          </Link>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>关于</h1>
        </header>

        <article className={styles.article}>
          <div className={styles.content}>
            <h2>欢迎来到虚空日志</h2>
            <p>
              虚空日志是一个使用 Next.js 15 构建的个人博客，具有自定义深色主题系统和实时样式定制功能。在这个空间里，我分享关于技术、编程和创意过程的想法。
            </p>

            <h2>技术栈</h2>
            <ul>
              <li><strong>框架：</strong> Next.js 15 (App Router)</li>
              <li><strong>数据库：</strong> SQLite + Drizzle ORM</li>
              <li><strong>样式：</strong> Tailwind CSS + CSS 变量</li>
              <li><strong>编辑器：</strong> Tiptap 富文本编辑器</li>
              <li><strong>认证：</strong> NextAuth.js 管理员访问</li>
            </ul>

            <h2>功能特点</h2>
            <ul>
              <li>📝 MDX 文章支持，带代码高亮</li>
              <li>🎨 通过管理面板实时定制主题</li>
              <li>💬 内置评论系统，支持审核</li>
              <li>📡 RSS 订阅源</li>
              <li>🔍 SEO 优化，带站点地图</li>
            </ul>

            <h2>管理后台</h2>
            <p>
              本博客拥有完整的管理后台，访问地址为{" "}
              <code>/login</code>。管理面板允许你管理文章、
              审核评论、自定义视觉主题和配置站点设置。
            </p>

            <h2>联系方式</h2>
            <p>
              欢迎在文章下方留言，或通过底部的社交链接联系我。
              期待与你的交流！
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
