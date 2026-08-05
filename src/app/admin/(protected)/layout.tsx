"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Boxes, Tags, Layers, Repeat2, Users } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/auth";
import { Shell, NavItem } from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Misc";

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produk", icon: Boxes },
  { href: "/admin/brands", label: "Brand", icon: Tags },
  { href: "/admin/categories", label: "Kategori", icon: Layers },
  { href: "/admin/transactions", label: "Transaksi", icon: Repeat2 },
  { href: "/admin/admins", label: "Admin", icon: Users },
];

function Guard({ children }: { children: ReactNode }) {
  const { profile, ready, isAuthenticated, logout } = useAdminAuth();
  const router = useRouter();

  if (!ready) return <Spinner label="Menyiapkan dashboard admin..." />;

  if (!isAuthenticated) {
    router.replace("/admin/login");
    return <Spinner label="Mengalihkan ke halaman login..." />;
  }

  return (
    <Shell
      role="Admin"
      nav={nav}
      identity={profile ? { name: profile.name, sub: profile.email } : null}
      onLogout={logout}
    >
      {children}
    </Shell>
  );
}

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <Guard>{children}</Guard>
    </AdminAuthProvider>
  );
}
