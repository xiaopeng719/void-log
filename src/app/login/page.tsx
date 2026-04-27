"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doLogin = async () => {
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "登录失败");
        setLoading(false);
      }
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.stars} />
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
        </div>
        <h1 className={styles.title}>虚空日志</h1>
        <p className={styles.subtitle}>管理员登录</p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>邮箱</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@voidlog.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>密码</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="button"
            className={styles.button}
            onClick={doLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                登录中...
              </>
            ) : (
              <>
                登录
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        <a href="/" className={styles.back}>← 返回站点</a>
      </div>
    </div>
  );
}
