"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Repeat, CheckCircle2, XCircle, PlayCircle, Banknote } from "lucide-react";
import { apiFor, extractErrorMessage } from "@/lib/api";
import { firstImage, formatDate, shortId, TRANSACTION_STATUS_META } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { Spinner, ErrorNote } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextareaField } from "@/components/ui/Field";
import { ChatPanel } from "@/components/ChatPanel";

export default function AdminTransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  function getAdminPrice(): number | null | undefined {
    return transaction?.user_furniture?.admin_price;
  }

  function load() {
    apiFor("admin")
      .get(`/admin/transactions/${id}`)
      .then(({ data }) => setTransaction(data.data))
      .catch(() => setError("Transaksi tidak ditemukan."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function startChecking() {
    setActionLoading("checking");
    try {
      await apiFor("admin").patch(`/admin/transactions/${id}/checking`);
      toast.success("Transaksi kini dalam tahap pemeriksaan.");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal memulai pemeriksaan."));
    } finally {
      setActionLoading(null);
    }
  }

  async function approve() {
    setActionLoading("approve");
    try {
      await apiFor("admin").patch(`/admin/transactions/${id}/approve`);
      toast.success("Transaksi disetujui.");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menyetujui transaksi."));
    } finally {
      setActionLoading(null);
    }
  }

  async function openPriceModal() {
    setPriceValue(transaction?.user_furniture?.admin_price ? String(transaction.user_furniture.admin_price) : "");
    setPriceError(null);
    setPriceOpen(true);
  }

  async function submitPrice() {
    const parsed = Number(priceValue);
    if (Number.isNaN(parsed) || parsed < 0) {
      setPriceError("Harga harus angka positif.");
      return;
    }
    setPriceLoading(true);
    try {
      await apiFor("admin").patch(`/admin/transactions/${id}/set-price`, { admin_price: parsed });
      toast.success("Harga barang pengguna berhasil diatur.");
      setPriceOpen(false);
      load();
    } catch (err) {
      setPriceError(extractErrorMessage(err, "Gagal menyimpan harga."));
    } finally {
      setPriceLoading(false);
    }
  }

  async function reject() {
    if (rejectReason.trim().length < 3) {
      setRejectError("Alasan minimal 3 karakter.");
      return;
    }
    setActionLoading("reject");
    try {
      await apiFor("admin").patch(`/admin/transactions/${id}/reject`, { reject_reason: rejectReason });
      toast.success("Transaksi ditolak.");
      setRejectOpen(false);
      setRejectReason("");
      load();
    } catch (err) {
      setRejectError(extractErrorMessage(err, "Gagal menolak transaksi."));
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <Spinner />;
  if (error || !transaction) return <ErrorNote message={error ?? "Transaksi tidak ditemukan."} />;

  const meta = TRANSACTION_STATUS_META[transaction.status];
  const yourImg = firstImage(transaction.user_furniture?.images);
  const theirImg = firstImage(transaction.product?.images);
  const canCheck = transaction.status === "pending";
  const canApprove = transaction.status === "checking";
  const canReject = transaction.status === "pending" || transaction.status === "checking";
  const canSetPrice = !transaction.user_furniture?.admin_price && transaction.status !== "approved" && transaction.status !== "rejected";

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/transactions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar transaksi
      </Link>

      <div className="rounded-md border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
              Tiket #{shortId(transaction.id)}
            </span>
            <p className="mt-0.5 text-sm text-ink-soft">
              Diajukan oleh <span className="font-medium text-ink">{transaction.user?.name ?? "-"}</span>{" "}
              ({transaction.user?.email})
            </p>
          </div>
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
              <p className="text-xs text-ink-soft">Furnitur pengguna</p>
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
              <p className="text-xs text-ink-soft">Produk katalog</p>
              <p className="font-display text-base font-medium text-ink">{transaction.product?.name ?? "-"}</p>
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
          <div className="mx-6 mb-5">
            <ErrorNote message={`Alasan penolakan: ${transaction.reject_reason}`} />
          </div>
        )}

        {canSetPrice && (
          <div className="border-t border-line px-6 py-3 flex items-center gap-2">
            <Banknote className="size-4 text-ink-soft shrink-0" />
            <span className="text-sm text-ink-soft">Harga barang pengguna</span>
            <span className="ml-auto text-sm font-medium text-ink">
              {transaction.user_furniture?.admin_price
                ? `Rp ${Number(transaction.user_furniture.admin_price).toLocaleString('id-ID')}`
                : "Belum diatur"}
            </span>
            <Button variant="secondary" size="sm" onClick={openPriceModal}>
              Atur harga
            </Button>
          </div>
        )}

        {(canCheck || canApprove || canReject) && (
          <div className="flex flex-wrap gap-2 border-t border-line px-6 py-4">
            {canCheck && (
              <Button onClick={startChecking} loading={actionLoading === "checking"}>
                <PlayCircle className="size-4" />
                Mulai cek
              </Button>
            )}
            {canApprove && (
              <Button onClick={approve} loading={actionLoading === "approve"}>
                <CheckCircle2 className="size-4" />
                Setujui
              </Button>
            )}
            {canReject && (
              <Button variant="danger" onClick={() => setRejectOpen(true)}>
                <XCircle className="size-4" />
                Tolak
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Percakapan dengan pengguna</h2>
        <ChatPanel role="admin" transactionId={transaction.id} status={transaction.status} />
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Tolak transaksi" width="max-w-sm">
        <div className="flex flex-col gap-4">
          <TextareaField
            label="Alasan penolakan"
            required
            placeholder="mis. Kondisi furnitur tidak sesuai deskripsi."
            value={rejectReason}
            error={rejectError ?? undefined}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={reject} loading={actionLoading === "reject"}>
              Tolak transaksi
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={priceOpen} onClose={() => !priceLoading && setPriceOpen(false)} title="Atur harga barang pengguna" width="max-w-sm">
        <div className="flex flex-col gap-4">
          <div className="rounded-sm bg-paper-deep/40 p-3 text-xs text-ink-soft">
            {transaction.user_furniture?.name ?? "Furnitur"} — admin yang menetapkan harga.
          </div>
          <TextField
            label="Harga (Rp)"
            type="number"
            min="0"
            step="100"
            placeholder="Masukkan harga barang"
            value={priceValue}
            error={priceError ?? undefined}
            onChange={(e) => setPriceValue(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPriceOpen(false)} disabled={priceLoading}>
              Batal
            </Button>
            <Button onClick={submitPrice} loading={priceLoading}>
              Simpan harga
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
