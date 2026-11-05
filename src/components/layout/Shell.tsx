"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
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
  role: "Admin" | "User";
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
        <Link href={role === "Admin" ? "/systemAdmin" : "/user"} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img src="/icons/tradein.svg" alt="TradeIN" className="size-5" /> */}
          <span className="font-body text-lg">TradeIN</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1.5 text-ink">
          <Menu className="size-5" />
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-espresso transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href={role === "Admin" ? "/systemAdmin" : "/user"} className="flex flex-col items-center gap-1 text-center">
                <p className="font-body text-[13px] uppercase tracking-[0.22em] text-brass">The Luxury Asia</p>
                <span className="text-[10px] uppercase tracking-[0.4em] text-brass">Living</span>
                {/* <p className="mt-5 text-xl leading-none text-ink">TradeIN</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  {role}
                </p> */}
              </Link>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="p-1 text-surface/70 lg:hidden">
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-surface/15 text-surface"
                      : "text-surface/70 hover:bg-surface/10 hover:text-surface"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {identity && (
            <div className="border-t border-surface/15 px-2 py-3">
              <div className="flex items-center justify-between gap-2 rounded-sm px-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-surface">{identity.name}</p>
                  <p className="truncate text-xs text-surface/60">{identity.sub}</p>
                </div>
                <button
                  onClick={onLogout}
                  aria-label="Keluar"
                  title="Keluar"
                  className="shrink-0 rounded-sm p-2 text-surface/70 hover:bg-surface/10 hover:text-surface"
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
