"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Store, Sofa, Repeat2, Bell, UserRound } from "lucide-react";
import { UserAuthProvider, useUserAuth } from "@/lib/auth";
import { Shell, NavItem } from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Misc";

const nav: NavItem[] = [
  { href: "/user", label: "Katalog", icon: Store, exact: true },
  { href: "/user/furnitures", label: "Furnitur Saya", icon: Sofa },
  { href: "/user/transactions", label: "Transaksi", icon: Repeat2 },
  { href: "/user/notifications", label: "Notifikasi", icon: Bell },
  { href: "/user/profile", label: "Profil", icon: UserRound },
];

function Guard({ children }: { children: ReactNode }) {
  const { profile, ready, isAuthenticated, logout } = useUserAuth();
  const router = useRouter();

  if (!ready) return <Spinner label="Menyiapkan akun Anda..." />;

  if (!isAuthenticated) {
    router.replace("/login");
    return <Spinner label="Mengalihkan ke halaman login..." />;
  }

  return (
    <Shell
      role="Pengguna"
      nav={nav}
      identity={profile ? { name: profile.name, sub: profile.email } : null}
      onLogout={logout}
    >
      {children}
    </Shell>
  );
}

export default function UserProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <UserAuthProvider>
      <Guard>{children}</Guard>
    </UserAuthProvider>
  );
}
