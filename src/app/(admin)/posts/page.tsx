"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import styles from "./page.module.css";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>文章</h1>
          <p className={styles.subtitle}>共 {posts.length} 篇文章</p>
        </div>
        <Link href="/posts/new" className={styles.newBtn}>
          <Plus size={18} />
          <span>新建文章</span>
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusTabs}>
          <button
            className={`${styles.tab} ${statusFilter === "all" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            全部
          </button>
          <button
            className={`${styles.tab} ${statusFilter === "published" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("published")}
          >
            已发布
          </button>
          <button
            className={`${styles.tab} ${statusFilter === "draft" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("draft")}
          >
            草稿
          </button>
          <button
            className={`${styles.tab} ${statusFilter === "archived" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("archived")}
          >
            已归档
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : filteredPosts.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={48} />
            <p>未找到文章</p>
            <Link href="/posts/new" className={styles.emptyLink}>
              创建第一篇文章
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>发布时间</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.postTitle}>{post.title}</span>
                      <span className={styles.postSlug}>/{post.slug}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[`status${post.status}`]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{formatDate(post.publishedAt)}</td>
                  <td className={styles.dateCell}>{formatDate(post.updatedAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/posts/edit/${post.id}`} className={styles.actionBtn} title="编辑">
                        <Edit size={16} />
                      </Link>
                      <Link href={`/posts/${post.slug}`} className={styles.actionBtn} title="查看">
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
