"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { apiFor } from "@/lib/api";
import { TRANSACTION_STATUS_META, firstImage, formatDate, shortId } from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { PageHeader, Spinner, EmptyState } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";

const FILTERS: { value: TransactionStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "checking", label: "Checking" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFor("admin")
      .get("/systemAdmin/transactions", { params: status ? { status } : {} })
      .then(({ data }) => setTransactions(data.data.items))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <PageHeader
        eyebrow="Verifikasi"
        title="Transaction management"
        description="Periksa dan verifikasi pengajuan tukar dari seluruh pengguna."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-sm border px-3 py-1.5 text-sm font-display transition-colors ${
              status === f.value
                ? "border-teak bg-teak text-surface"
                : "border-line text-ink-soft hover:border-teak hover:text-teak"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" />
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-display">Ticket</th>
                <th className="px-4 py-3 font-display">User</th>
                <th className="px-4 py-3 font-display">Swap</th>
                <th className="px-4 py-3 font-display">Status</th>
                <th className="px-4 py-3 font-display">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const meta = TRANSACTION_STATUS_META[t.status];
                const yourImg = firstImage(t.user_furniture?.images);
                const theirImg = firstImage(t.product?.images);
                return (
                  <tr
                    key={t.id}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-paper/60"
                    onClick={() => (window.location.href = `/systemAdmin/transactions/${t.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">#{shortId(t.id)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/systemAdmin/transactions/${t.id}`} className="font-display text-ink hover:underline">
                        {t.user?.name ?? "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-ink-soft">
                        <div className="size-8 shrink-0 overflow-hidden rounded-sm bg-paper-deep">
                          {yourImg && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={yourImg} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="max-w-[100px] truncate">{t.user_furniture?.name}</span>
                        <Repeat className="size-3.5 shrink-0 text-teak" />
                        <span className="max-w-[100px] truncate">{t.product?.name}</span>
                        <div className="size-8 shrink-0 overflow-hidden rounded-sm bg-paper-deep">
                          {theirImg && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={theirImg} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Stamp label={meta.label} color={meta.color} bg={meta.bg} className="text-[10px]" />
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{formatDate(t.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
