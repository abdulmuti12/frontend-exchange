"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { LogOut, Menu, X, Repeat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function Shell({
  role,
  nav,
  identity,
  onLogout,
  children,
}: {
  role: "Admin" | "Pengguna";
  nav: NavItem[];
  identity: { name: string; sub: string } | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Link href={role === "Admin" ? "/admin" : "/user"} className="flex items-center gap-2">
          <Repeat className="size-5 text-teak" />
          <span className="font-display text-lg font-semibold">Tukar</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Buka menu" className="p-1.5 text-ink">
          <Menu className="size-5" />
        </button>
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 py-6">
            <Link href={role === "Admin" ? "/admin" : "/user"} className="flex items-center gap-2">
              <Repeat className="size-6 text-teak" />
              <div>
                <p className="font-display text-xl font-semibold leading-none text-ink">Tukar</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  {role}
                </p>
              </div>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="p-1 text-ink-soft lg:hidden">
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-teak text-surface"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {identity && (
            <div className="border-t border-line px-3 py-4">
              <div className="flex items-center justify-between gap-2 rounded-sm px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{identity.name}</p>
                  <p className="truncate text-xs text-ink-soft">{identity.sub}</p>
                </div>
                <button
                  onClick={onLogout}
                  aria-label="Keluar"
                  title="Keluar"
                  className="shrink-0 rounded-sm p-2 text-ink-soft hover:bg-rust-soft hover:text-rust"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
