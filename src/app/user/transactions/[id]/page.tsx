"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Repeat } from "lucide-react";
import { apiFor } from "@/lib/api";
import { firstImage, formatDate, shortId, TRANSACTION_STATUS_META } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { Spinner, ErrorNote } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { ChatPanel } from "@/components/ChatPanel";

export default function UserTransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFor("user")
      .get(`/user/transactions/${id}`)
      .then(({ data }) => setTransaction(data.data))
      .catch(() => setError("Transaksi tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !transaction) return <ErrorNote message={error ?? "Transaksi tidak ditemukan."} />;

  const meta = TRANSACTION_STATUS_META[transaction.status];
  const yourImg = firstImage(transaction.user_furniture?.images);
  const theirImg = firstImage(transaction.product?.images);

  return (
    <div className="max-w-3xl">
      <Link
        href="/user/transactions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Kembali ke transaksi
      </Link>

      <div className="rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
            Tiket #{shortId(transaction.id)}
          </span>
          <Stamp label={meta.label} color={meta.color} bg={meta.bg} />
        </div>

        <div className="grid grid-cols-1 items-center gap-4 px-6 py-6 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3">
            <div className="size-20 shrink-0 overflow-hidden rounded-sm bg-paper-deep">
              {yourImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={yourImg} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-xs text-ink-soft">Furnitur Anda</p>
              <p className="font-display text-base font-medium text-ink">
                {transaction.user_furniture?.name ?? "-"}
              </p>
              {transaction.user_furniture?.admin_price != null && (
                <p className="text-xs font-medium text-teak mt-0.5">
                  {`Rp ${Number(transaction.user_furniture.admin_price).toLocaleString('id-ID')}`}
                </p>
              )}
            </div>
          </div>
          <Repeat className="mx-auto size-5 text-teak" />
          <div className="flex items-center gap-3 sm:flex-row-reverse sm:text-right">
            <div className="size-20 shrink-0 overflow-hidden rounded-sm bg-paper-deep">
              {theirImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={theirImg} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-xs text-ink-soft">Dari katalog</p>
              <p className="font-display text-base font-medium text-ink">
                {transaction.product?.name ?? "-"}
              </p>
              {transaction.product?.price != null && (
                <p className="text-xs font-medium text-teak mt-0.5">
                  {`Rp ${Number(transaction.product.price).toLocaleString('id-ID')}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="perforated h-3 border-y border-dashed border-line" />

        <div className="grid grid-cols-2 gap-4 px-6 py-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink-soft">Diajukan</p>
            <p className="mt-0.5 font-medium text-ink">{formatDate(transaction.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">Diperbarui</p>
            <p className="mt-0.5 font-medium text-ink">{formatDate(transaction.updated_at)}</p>
          </div>
        </div>

        {transaction.status === "rejected" && transaction.reject_reason && (
          <div className="mx-6 mb-6">
            <ErrorNote message={`Alasan penolakan: ${transaction.reject_reason}`} />
          </div>
        )}

        {transaction.status === "pending" && (
          <p className="mx-6 mb-6 rounded-sm bg-brass-soft px-3 py-2.5 text-sm text-brass">
            Pengajuan Anda sedang menunggu admin memulai pemeriksaan.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Percakapan dengan admin</h2>
        <ChatPanel role="user" transactionId={transaction.id} status={transaction.status} />
      </div>
    </div>
  );
}
