"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

// Dynamic import to avoid SSR issues with Tiptap
const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), {
  ssr: false,
  loading: () => <div className={styles.editorLoading}>加载编辑器中...</div>,
});

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  }, [title, autoSlug]);

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(formatted);
  };

  const handleSubmit = async (e: React.FormEvent, newStatus?: "draft" | "published") => {
    e.preventDefault();
    setSaving(true);

    const postStatus = newStatus || status;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          status: postStatus,
        }),
      });

      if (!res.ok) throw new Error("创建文章失败");

      const post = await res.json();
      router.push(`/posts/edit/${post.id}`);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("创建文章失败，请重试。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/posts" className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>返回文章列表</span>
        </Link>
        <div className={styles.actions}>
          <button
            onClick={(e) => handleSubmit(e, "draft")}
            className={styles.saveDraftBtn}
            disabled={saving || !title || !content}
          >
            <Save size={18} />
            <span>保存草稿</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, "published")}
            className={styles.publishBtn}
            disabled={saving || !title || !content}
          >
            {saving ? <Loader2 size={18} className={styles.spinner} /> : <Eye size={18} />}
            <span>发布</span>
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
              <label className={styles.label}>slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
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
          </div>
        </div>
      </form>
    </div>
  );
}
