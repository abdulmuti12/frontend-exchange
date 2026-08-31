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
  { value: "", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "checking", label: "Diperiksa" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
];

export default function UserTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFor("user")
      .get("/user/transactions", { params: status ? { status } : {} })
      .then(({ data }) => setTransactions(data.data.items))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <PageHeader
        eyebrow="Riwayat"
        title="My transactions"
        description="Track your swap request status, from waiting to approved."
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
        <EmptyState title="No transactions yet" description="Submit a swap from the catalog page to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {transactions.map((t) => {
            const meta = TRANSACTION_STATUS_META[t.status];
            const yourImg = firstImage(t.user_furniture?.images);
            const theirImg = firstImage(t.product?.images);
            return (
              <Link
                key={t.id}
                href={`/user/transactions/${t.id}`}
                className="rounded-md border border-line bg-surface transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between px-5 pt-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    Tiket #{shortId(t.id)}
                  </span>
                  <Stamp label={meta.label} color={meta.color} bg={meta.bg} />
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5">
                  <div className="flex items-center gap-2">
                    <div className="size-12 shrink-0 overflow-hidden rounded-sm bg-paper-deep">
                      {yourImg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={yourImg} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-ink-soft">Your item</p>
                      <p className="truncate text-sm font-display text-ink">
                        {t.user_furniture?.name ?? "-"}
                      </p>
                      {t.user_furniture?.admin_price != null && (
                        <p className="mt-0.5 text-[11px] font-display text-teak">
                          {`Rp ${Number(t.user_furniture.admin_price).toLocaleString('id-ID')}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Repeat className="size-4 text-teak" />
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 text-right">
                      <p className="text-[11px] text-ink-soft">Dari katalog</p>
                      <p className="truncate text-sm font-display text-ink">{t.product?.name ?? "-"}</p>
                      {t.product?.price != null && (
                        <p className="mt-0.5 text-[11px] font-display text-ink-soft">
                          {`Rp ${Number(t.product.price).toLocaleString('id-ID')}`}
                        </p>
                      )}
                    </div>
                    <div className="size-12 shrink-0 overflow-hidden rounded-sm bg-paper-deep">
                      {theirImg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={theirImg} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="perforated h-2.5 border-y border-dashed border-line" />
                <div className="px-5 py-3 font-mono text-[11px] text-ink-soft">
                  Diajukan {formatDate(t.created_at)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
