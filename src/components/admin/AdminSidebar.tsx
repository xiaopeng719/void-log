"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Palette,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  PenLine,
} from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./AdminSidebar.module.css";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/posts", label: "文章", icon: FileText },
  { href: "/comments", label: "评论", icon: MessageSquare },
  { href: "/styles", label: "样式", icon: Palette },
  { href: "/settings", label: "设置", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <ChevronRight size={20} />
          </span>
          <span className={styles.logoText}>虚空日志</span>
        </Link>
        <span className={styles.badge}>管理员</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.viewSite}>
          <PenLine size={16} />
          <span>查看站点</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={styles.logoutBtn}
        >
          <LogOut size={16} />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
