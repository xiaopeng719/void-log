"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import styles from "./CommentSection.module.css";

interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export default function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorName: name,
          authorEmail: email,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "评论提交失败");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setContent("");
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Group comments by parent
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <MessageSquare size={20} />
        <h2 className={styles.title}>
          {comments.length} 条评论
        </h2>
      </div>

      {/* Comment Form */}
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>发表评论</h3>
        
        {submitted && (
          <div className={styles.successMessage}>
            你的评论已提交，等待审核后将会显示。
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>昵称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="你的昵称"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>评论内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              placeholder="分享你的想法..."
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                <span>提交中...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>发表评论</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className={styles.commentsList}>
          {topLevelComments.map((comment) => {
            const replies = getReplies(comment.id);
            return (
              <div key={comment.id} className={styles.commentThread}>
                <div className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    <User size={16} />
                  </div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.authorName}</span>
                      <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className={styles.replies}>
                    {replies.map((reply) => (
                      <div key={reply.id} className={styles.comment}>
                        <div className={styles.commentAvatar}>
                          <User size={14} />
                        </div>
                        <div className={styles.commentBody}>
                          <div className={styles.commentHeader}>
                            <span className={styles.commentAuthor}>{reply.authorName}</span>
                            <span className={styles.commentDate}>{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className={styles.commentContent}>{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
