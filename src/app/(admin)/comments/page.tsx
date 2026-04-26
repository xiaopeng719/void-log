"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, MessageSquare, Clock, AlertCircle, CheckCircle } from "lucide-react";
import styles from "./page.module.css";

interface Comment {
  id: string;
  postId: string;
  postTitle: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  status: "pending" | "approved" | "spam" | "deleted";
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "spam" | "deleted") => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setComments(comments.map((c) => 
          c.id === id ? { ...c, status } : c
        ));
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const filteredComments = comments.filter((c) =>
    statusFilter === "all" || c.status === statusFilter
  );

  const counts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>评论</h1>
          <p className={styles.subtitle}>
            管理所有文章的用户评论
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className={styles.statusTabs}>
        <button
          className={`${styles.tab} ${statusFilter === "all" ? styles.tabActive : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <MessageSquare size={16} />
          <span>全部</span>
          <span className={styles.count}>{counts.all}</span>
        </button>
        <button
          className={`${styles.tab} ${statusFilter === "pending" ? styles.tabActive : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <Clock size={16} />
          <span>待审核</span>
          <span className={styles.count}>{counts.pending}</span>
        </button>
        <button
          className={`${styles.tab} ${statusFilter === "approved" ? styles.tabActive : ""}`}
          onClick={() => setStatusFilter("approved")}
        >
          <CheckCircle size={16} />
          <span>已通过</span>
          <span className={styles.count}>{counts.approved}</span>
        </button>
        <button
          className={`${styles.tab} ${statusFilter === "spam" ? styles.tabActive : ""}`}
          onClick={() => setStatusFilter("spam")}
        >
          <AlertCircle size={16} />
          <span>垃圾评论</span>
          <span className={styles.count}>{counts.spam}</span>
        </button>
      </div>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {loading ? (
          <div className={styles.loading}>加载评论中...</div>
        ) : filteredComments.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={48} />
            <p>暂无评论</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{comment.authorName}</span>
                    <span className={styles.authorEmail}>{comment.authorEmail}</span>
                  </div>
                </div>
                <span className={`${styles.status} ${styles[`status${comment.status}`]}`}>
                  {comment.status === "pending" ? "待审核" : comment.status === "approved" ? "已通过" : comment.status === "spam" ? "垃圾评论" : "已删除"}
                </span>
              </div>

              <div className={styles.commentMeta}>
                <span>文章：<a href={`/posts/${comment.postId}`}>{comment.postTitle}</a></span>
                <span>{formatDate(comment.createdAt)}</span>
                {comment.ip && <span>IP：{comment.ip}</span>}
              </div>

              <div className={styles.commentContent}>
                {comment.content}
              </div>

              <div className={styles.commentActions}>
                {comment.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(comment.id, "approved")}
                      className={`${styles.actionBtn} ${styles.approveBtn}`}
                      title="通过"
                    >
                      <Check size={16} />
                      <span>通过</span>
                    </button>
                    <button
                      onClick={() => updateStatus(comment.id, "spam")}
                      className={`${styles.actionBtn} ${styles.spamBtn}`}
                      title="标记为垃圾评论"
                    >
                      <AlertCircle size={16} />
                      <span>垃圾评论</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteComment(comment.id)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="删除"
                >
                  <Trash2 size={16} />
                  <span>删除</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
