"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellRing } from "lucide-react";
import { apiFor } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/types";
import { PageHeader, Spinner, EmptyState } from "@/components/ui/Misc";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFor("user")
      .get("/user/notifications")
      .then(({ data }) => setNotifications(data.data.items))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markRead(n: Notification) {
    if (n.read_at) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    try {
      await apiFor("user").patch(`/user/notifications/${n.id}/read`);
    } catch {
      load();
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Inbox" title="Notifications" description="Transaction status updates." />

      {loading ? (
        <Spinner />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const unread = !n.read_at;
            const content = (
              <div
                className={`flex items-start gap-3 rounded-md border px-4 py-3.5 transition-colors ${
                  unread ? "border-teak/30 bg-brass-soft/40" : "border-line bg-surface"
                }`}
              >
                {unread ? (
                  <BellRing className="mt-0.5 size-4 shrink-0 text-teak" />
                ) : (
                  <Bell className="mt-0.5 size-4 shrink-0 text-ink-soft" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${unread ? "font-display text-ink" : "text-ink-soft"}`}>{n.message}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink-soft">{formatDate(n.created_at)}</p>
                </div>
              </div>
            );
            return n.transaction_id ? (
              <Link key={n.id} href={`/user/transactions/${n.transaction_id}`} onClick={() => markRead(n)}>
                {content}
              </Link>
            ) : (
              <button key={n.id} onClick={() => markRead(n)} className="text-left">
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
