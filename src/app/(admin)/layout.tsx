import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "./layout.module.css";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  let user: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch {
      redirect("/login");
    }
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
