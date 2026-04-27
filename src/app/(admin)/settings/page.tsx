"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Settings, UserPlus, Trash2, Edit2, X, Check, Shield } from "lucide-react";
import styles from "./page.module.css";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: number;
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [settings, setSettings] = useState({
    site_name: "VOID LOG",
    site_description: "A personal blog in the void",
    posts_per_page: 10,
    comment_moderation: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Account management
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [addUserSuccess, setAddUserSuccess] = useState("");

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Edit user modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState("");
  const [editUserData, setEditUserData] = useState({ name: "", email: "", role: "", newPassword: "" });

  // Delete confirmation
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUsers();
    fetchCurrentUser();
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

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError("");
    setAddUserSuccess("");
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;

    if (!email || !name || !password) {
      setAddUserError("请填写所有必填项");
      return;
    }
    if (password.length < 6) {
      setAddUserError("密码长度至少为 6 位");
      return;
    }

    setAddUserLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddUserSuccess("用户创建成功！");
        form.reset();
        fetchUsers();
        setTimeout(() => { setShowAddUser(false); setAddUserSuccess(""); }, 1500);
      } else {
        setAddUserError(data.error || "创建失败");
      }
    } catch {
      setAddUserError("创建失败，请重试");
    } finally {
      setAddUserLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("请填写所有密码字段");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("新密码长度至少为 6 位");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("两次输入的新密码不一致");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`/api/users/${currentUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordData.newPassword,
          name: currentUser?.name,
          email: currentUser?.email,
          role: currentUser?.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("密码修改成功！");
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setTimeout(() => { setShowPasswordForm(false); setPasswordSuccess(""); }, 1500);
      } else {
        setPasswordError(data.error || "修改失败");
      }
    } catch {
      setPasswordError("修改失败，请重试");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert("不能删除当前登录的账户");
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } finally {
      setDeleteLoading(false);
      setDeletingUserId(null);
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUserData({ name: user.name, email: user.email, role: user.role, newPassword: "" });
    setEditUserError("");
  };

  // Save user edit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserError("");

    if (!editUserData.name || !editUserData.email) {
      setEditUserError("请填写所有必填项");
      return;
    }

    setEditUserLoading(true);
    try {
      const payload: any = { name: editUserData.name, email: editUserData.email, role: editUserData.role };
      if (editUserData.newPassword) {
        if (editUserData.newPassword.length < 6) {
          setEditUserError("密码长度至少为 6 位");
          setEditUserLoading(false);
          return;
        }
        payload.password = editUserData.newPassword;
      }
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
        fetchCurrentUser();
      } else {
        setEditUserError(data.error || "更新失败");
      }
    } catch {
      setEditUserError("更新失败，请重试");
    } finally {
      setEditUserLoading(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
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
          {saving ? <Loader2 size={16} className={styles.spinner} /> : saved ? <Check size={16} /> : <Save size={16} />}
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
              <p className={styles.toggleDesc}>评论必须经过审核才能公开展示</p>
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
          <h2 className={styles.sectionTitle}>
            <Shield size={18} />
            账户信息
          </h2>
          <div className={styles.accountInfo}>
            {currentUser ? (
              <>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>当前账户</span>
                  <span className={styles.accountValue}>{currentUser.email}</span>
                </div>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>显示名称</span>
                  <span className={styles.accountValue}>{currentUser.name}</span>
                </div>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>角色</span>
                  <span className={styles.accountValue}>{currentUser.role === "admin" ? "管理员" : "编辑"}</span>
                </div>
              </>
            ) : (
              <p className={styles.loadingText}>加载中...</p>
            )}
          </div>

          {/* Change Password */}
          {!showPasswordForm ? (
            <button onClick={() => setShowPasswordForm(true)} className={styles.changePasswordBtn}>
              修改密码
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className={styles.passwordForm}>
              <h4 className={styles.passwordFormTitle}>修改密码</h4>
              <div className={styles.field}>
                <label className={styles.label}>新密码</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={styles.input}
                  placeholder="至少 6 位"
                  minLength={6}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>确认新密码</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={styles.input}
                  placeholder="再次输入新密码"
                  minLength={6}
                />
              </div>
              {passwordError && <p className={styles.errorMsg}>{passwordError}</p>}
              {passwordSuccess && <p className={styles.successMsg}>{passwordSuccess}</p>}
              <div className={styles.formBtnRow}>
                <button type="submit" className={styles.saveBtn} disabled={passwordLoading}>
                  {passwordLoading ? <Loader2 size={14} className={styles.spinner} /> : <Check size={14} />}
                  <span>确认修改</span>
                </button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordError(""); setPasswordSuccess(""); }} className={styles.cancelBtn}>
                  <X size={14} /><span>取消</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* User Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>
              <UserPlus size={18} />
              账户管理
            </h2>
            <button onClick={() => setShowAddUser(!showAddUser)} className={styles.addUserBtn}>
              <UserPlus size={14} />
              <span>{showAddUser ? "取消" : "添加账户"}</span>
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <form onSubmit={handleAddUser} className={styles.addUserForm}>
              <h4 className={styles.addUserTitle}>新建账户</h4>
              <div className={styles.field}>
                <label className={styles.label}>邮箱</label>
                <input type="email" name="email" className={styles.input} placeholder="user@example.com" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>显示名称</label>
                <input type="text" name="name" className={styles.input} placeholder="用户名" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>密码</label>
                <input type="password" name="password" className={styles.input} placeholder="至少 6 位" minLength={6} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>角色</label>
                <select name="role" className={styles.input}>
                  <option value="editor">编辑</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              {addUserError && <p className={styles.errorMsg}>{addUserError}</p>}
              {addUserSuccess && <p className={styles.successMsg}>{addUserSuccess}</p>}
              <button type="submit" className={styles.saveBtn} disabled={addUserLoading}>
                {addUserLoading ? <Loader2 size={14} className={styles.spinner} /> : <Check size={14} />}
                <span>创建账户</span>
              </button>
            </form>
          )}

          {/* User List */}
          <div className={styles.userList}>
            {users.length === 0 ? (
              <p className={styles.emptyText}>暂无其他账户</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className={styles.userRow}>
                  <div className={styles.userAvatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <span className={`${styles.userRole} ${user.role === "admin" ? styles.roleAdmin : ""}`}>
                    {user.role === "admin" ? "管理员" : "编辑"}
                  </span>
                  <span className={styles.userDate}>{formatDate(user.created_at)}</span>
                  <div className={styles.userActions}>
                    <button onClick={() => openEditModal(user)} className={styles.iconBtn} title="编辑">
                      <Edit2 size={14} />
                    </button>
                    {user.id !== currentUser?.id && (
                      deletingUserId === user.id ? (
                        <div className={styles.deleteConfirm}>
                          <span>确认删除？</span>
                          <button onClick={() => handleDeleteUser(user.id)} className={styles.iconBtnDanger} disabled={deleteLoading}>
                            <Check size={12} />
                          </button>
                          <button onClick={() => setDeletingUserId(null)} className={styles.iconBtn}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingUserId(user.id)} className={styles.iconBtnDanger} title="删除">
                          <Trash2 size={14} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>编辑用户</h3>
              <button onClick={() => setEditingUser(null)} className={styles.iconBtn}><X size={16} /></button>
            </div>
            <form onSubmit={handleEditUser} className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>显示名称</label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>邮箱</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>角色</label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                  className={styles.input}
                >
                  <option value="editor">编辑</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>新密码 <span className={styles.labelHint}>(留空保持不变)</span></label>
                <input
                  type="password"
                  value={editUserData.newPassword}
                  onChange={(e) => setEditUserData({ ...editUserData, newPassword: e.target.value })}
                  className={styles.input}
                  placeholder="至少 6 位"
                  minLength={6}
                />
              </div>
              {editUserError && <p className={styles.errorMsg}>{editUserError}</p>}
              <div className={styles.modalFooter}>
                <button type="submit" className={styles.saveBtn} disabled={editUserLoading}>
                  {editUserLoading ? <Loader2 size={14} className={styles.spinner} /> : <Check size={14} />}
                  <span>保存更改</span>
                </button>
                <button type="button" onClick={() => setEditingUser(null)} className={styles.cancelBtn}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
