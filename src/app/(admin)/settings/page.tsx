"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Settings } from "lucide-react";
import styles from "./page.module.css";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    site_name: "VOID LOG",
    site_description: "A personal blog in the void",
    posts_per_page: 10,
    comment_moderation: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings({
        site_name: data.site_name || "VOID LOG",
        site_description: data.site_description || "",
        posts_per_page: data.posts_per_page || 10,
        comment_moderation: data.comment_moderation ?? true,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载设置中...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>设置</h1>
          <p className={styles.subtitle}>配置博客设置</p>
        </div>
        <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
          {saving ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : saved ? (
            <Save size={16} />
          ) : (
            <Save size={16} />
          )}
          <span>{saved ? "已保存！" : "保存更改"}</span>
        </button>
      </div>

      <div className={styles.sections}>
        {/* General Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Settings size={18} />
            常规设置
          </h2>
          
          <div className={styles.field}>
            <label className={styles.label}>网站名称</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className={styles.input}
              placeholder="你的博客名称"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>网站描述</label>
            <textarea
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              className={styles.textarea}
              rows={3}
              placeholder="简短的博客描述"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>每页文章数</label>
            <input
              type="number"
              value={settings.posts_per_page}
              onChange={(e) => setSettings({ ...settings, posts_per_page: parseInt(e.target.value) || 10 })}
              className={styles.input}
              min={1}
              max={50}
            />
          </div>
        </div>

        {/* Comment Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>评论设置</h2>
          
          <div className={styles.toggleField}>
            <div className={styles.toggleInfo}>
              <label className={styles.toggleLabel}>需要审核</label>
              <p className={styles.toggleDesc}>
                评论必须经过审核才能公开展示
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.comment_moderation}
                onChange={(e) => setSettings({ ...settings, comment_moderation: e.target.checked })}
                className={styles.checkbox}
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>

        {/* Account Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>账户信息</h2>
          <div className={styles.accountInfo}>
            <p className={styles.accountText}>
              当前登录账户：<strong>admin@voidlog.com</strong>
            </p>
            <p className={styles.accountHint}>
              如需更改密码，请使用命令行工具。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
