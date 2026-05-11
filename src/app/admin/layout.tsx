import type { Metadata } from "next";
import { ReactNode } from "react";
import AdminGuard from "@/modules/admin/components/AdminGuard";
import AdminLayoutShell from "@/modules/admin/components/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Admin Dashboard | Movie Streaming Platform",
  description: "Bảng điều khiển quản trị phim, người dùng, báo cáo, quảng cáo và gói đăng ký.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminGuard>
  );
}
