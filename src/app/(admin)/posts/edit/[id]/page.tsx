"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), {
  ssr: false,
  loading: () => <div className={styles.editorLoading}>加载编辑器中...</div>,
});

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("文章未找到");
      const data = await res.json();
      setPost(data);
      setTitle(data.title);
      setSlug(data.slug);
      setContent(data.content);
      setExcerpt(data.excerpt || "");
      setStatus(data.status);
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("文章未找到");
      router.push("/posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, newStatus?: "draft" | "published" | "archived") => {
    e.preventDefault();
    setSaving(true);

    const postStatus = newStatus || status;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          status: postStatus,
        }),
      });

      if (!res.ok) throw new Error("更新文章失败");

      if (postStatus === "published" && !post?.publishedAt) {
        // Refresh to show published state
        fetchPost();
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("更新文章失败，请重试。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇文章吗？此操作无法撤销。")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除文章失败");
      router.push("/posts");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("删除文章失败，请重试。");
    }
  };

  if (loading) {
    return <div className={styles.editorLoading}>加载中...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/posts" className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>返回文章列表</span>
        </Link>
        <div className={styles.actions}>
          <button onClick={handleDelete} className={styles.saveDraftBtn} style={{ color: "#f87171" }}>
            <Trash2 size={18} />
            <span>删除</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, "draft")}
            className={styles.saveDraftBtn}
            disabled={saving}
          >
            <Save size={18} />
            <span>保存草稿</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, "published")}
            className={styles.publishBtn}
            disabled={saving}
          >
            {saving ? <Loader2 size={18} className={styles.spinner} /> : <Eye size={18} />}
            <span>{status === "published" ? "更新" : "发布"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.mainContent}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className={styles.titleInput}
            required
          />

          <div className={styles.editorWrapper}>
            <PostEditor
              content={content}
              onChange={setContent}
              placeholder="开始写作..."
            />
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>设置</h3>

            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-url-slug"
                className={styles.input}
                required
              />
              <p className={styles.hint}>URL：/posts/{slug || "..."}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>摘要</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="文章的简短描述..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>状态</label>
              <div className={styles.statusOptions}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    className={styles.radio}
                  />
                  <span className={styles.radioText}>
                    <span className={styles.radioTitle}>草稿</span>
                    <span className={styles.radioDesc}>仅自己可见</span>
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === "published"}
                    onChange={() => setStatus("published")}
                    className={styles.radio}
                  />
                  <span className={styles.radioText}>
                    <span className={styles.radioTitle}>已发布</span>
                    <span className={styles.radioDesc}>对所有人可见</span>
                  </span>
                </label>
              </div>
            </div>

            {post?.publishedAt && (
              <div className={styles.field}>
                <p className={styles.hint}>
                  发布于 {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
