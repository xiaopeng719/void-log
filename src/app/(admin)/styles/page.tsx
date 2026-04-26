"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, Loader2, Palette } from "lucide-react";
import styles from "./page.module.css";

interface ThemeStyle {
  id: string;
  name: string;
  cssVariables: string;
  customCss: string | null;
  isActive: boolean;
}

const defaultVariables = {
  "--bg-primary": "#0a0a0f",
  "--bg-secondary": "#12121a",
  "--bg-card": "#16161f",
  "--text-primary": "#ffffff",
  "--text-secondary": "#8888aa",
  "--accent": "#6366f1",
};

export default function StylesPage() {
  const [stylesList, setStylesList] = useState<ThemeStyle[]>([]);
  const [activeStyle, setActiveStyle] = useState<ThemeStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customCss, setCustomCss] = useState("");

  // Editable variables
  const [variables, setVariables] = useState(defaultVariables);

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const res = await fetch("/api/styles");
      const data = await res.json();
      setStylesList(data);
      
      // Find active style
      const active = data.find((s: ThemeStyle) => s.isActive);
      if (active) {
        setActiveStyle(active);
        setCustomCss(active.customCss || "");
        try {
          setVariables(JSON.parse(active.cssVariables));
        } catch (e) {
          console.error("Error parsing CSS variables:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching styles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables({ ...variables, [key]: value });
  };

  const handleSave = async () => {
    if (!activeStyle) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/styles/${activeStyle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cssVariables: JSON.stringify(variables),
          customCss,
        }),
      });

      if (res.ok) {
        // Update the CSS variables in the document
        Object.entries(variables).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
        });
        
        // Reload styles
        fetchStyles();
      }
    } catch (error) {
      console.error("Error saving style:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setVariables(defaultVariables);
  };

  const handlePresetSelect = (style: ThemeStyle) => {
    try {
      const parsed = JSON.parse(style.cssVariables);
      setVariables(parsed);
      setActiveStyle(style);
    } catch (e) {
      console.error("Error parsing CSS variables:", e);
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载样式中...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>样式编辑</h1>
          <p className={styles.subtitle}>自定义博客的外观和风格</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleReset} className={styles.resetBtn}>
            <RotateCcw size={16} />
            <span>重置</span>
          </button>
          <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
            {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
            <span>保存更改</span>
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Presets Panel */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>
            <Palette size={18} />
            主题预设
          </h3>
          <div className={styles.presetsList}>
            {stylesList.map((style) => (
              <button
                key={style.id}
                onClick={() => handlePresetSelect(style)}
                className={`${styles.presetItem} ${activeStyle?.id === style.id ? styles.presetActive : ""}`}
              >
                <div className={styles.presetPreview}>
                  {Object.entries(JSON.parse(style.cssVariables)).slice(0, 3).map(([key, value]) => (
                    <div
                      key={key}
                      className={styles.presetColor}
                      style={{ background: value as string }}
                    />
                  ))}
                </div>
                <div className={styles.presetInfo}>
                  <span className={styles.presetName}>{style.name}</span>
                  {style.isActive && <Check size={14} className={styles.checkIcon} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variables Editor */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>颜色变量</h3>
          <div className={styles.variablesGrid}>
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className={styles.variableItem}>
                <label className={styles.variableLabel}>{key}</label>
                <div className={styles.variableInput}>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div className={styles.preview}>
            <h4 className={styles.previewTitle}>实时预览</h4>
            <div
              className={styles.previewCard}
              style={{
                background: variables["--bg-card"],
                borderColor: variables["--accent"] + "40",
              }}
            >
              <h5 style={{ color: variables["--text-primary"], margin: 0 }}>Sample Post Title</h5>
                <p style={{ color: variables["--text-secondary"], margin: "0.5rem 0" }}>
                这是使用当前颜色设置的文本示例。
                </p>
                <button
                  style={{
                    background: variables["--accent"],
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  阅读更多
                </button>
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>自定义 CSS</h3>
          <textarea
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            placeholder="/* 在此添加自定义 CSS 规则 */
/* 示例：
.my-class {
  border-radius: 8px;
}
*/"
            className={styles.customCss}
          />
        </div>
      </div>
    </div>
  );
}
