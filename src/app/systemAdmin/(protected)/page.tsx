"use client";

import { useEffect, useState } from "react";
import { Users, Boxes, Sofa, Layers3 } from "lucide-react";
import { apiFor } from "@/lib/api";
import { TRANSACTION_STATUS_META } from "@/lib/utils";
import type { DashboardStats, TransactionStatus } from "@/lib/types";
import { PageHeader, Spinner } from "@/components/ui/Misc";

const STATUS_ORDER: TransactionStatus[] = ["pending", "checking", "approved", "rejected"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFor("admin")
      .get("/dashboard")
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  const tiles = [
    { label: "Total Pengguna", value: stats.total_users, icon: Users },
    { label: "Total Produk", value: stats.total_products, icon: Boxes },
    { label: "Total Furnitur Pengguna", value: stats.total_user_furnitures, icon: Sofa },
    { label: "Total Barang", value: stats.total_items, icon: Layers3 },
  ];

  const maxCount = Math.max(1, ...Object.values(stats.transactions_by_status));

  return (
    <div>
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard"
        description="Statistik keseluruhan platform Tukar, diperbarui secara langsung."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md border border-line bg-surface p-5">
            <t.icon className="size-5 text-teak" />
            <p className="mt-3 font-display text-3xl font-semibold text-ink">{t.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-line bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            Transaksi berdasarkan status
          </h2>
          <span className="font-mono text-xs text-ink-soft">Total: {stats.total_transactions}</span>
        </div>
        <div className="flex flex-col gap-4">
          {STATUS_ORDER.map((status) => {
            const meta = TRANSACTION_STATUS_META[status];
            const count = stats.transactions_by_status[status] ?? 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={status}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{meta.label}</span>
                  <span className="font-mono text-ink-soft">{count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
