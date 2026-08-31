"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Store, Sofa, Repeat2, Bell, UserRound } from "lucide-react";
import { UserAuthProvider, useUserAuth } from "@/lib/auth";
import { Shell, NavItem } from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Misc";

const nav: NavItem[] = [
  { href: "/user/furnitures", label: "My Furniture", icon: Sofa },
  { href: "/user", label: "Catalog", icon: Store, exact: true },
  { href: "/user/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/user/notifications", label: "Notifications", icon: Bell },
  { href: "/user/profile", label: "Profile", icon: UserRound },
];

function Guard({ children }: { children: ReactNode }) {
  const { profile, ready, isAuthenticated, logout } = useUserAuth();
  const router = useRouter();

  if (!ready) return <Spinner label="Setting up your account..." />;

  if (!isAuthenticated) {
    router.replace("/login");
    return <Spinner label="Redirecting to login page..." />;
  }

  return (
    <Shell
      role="User"
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
