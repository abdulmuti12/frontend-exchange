"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Repeat, CheckCircle2, XCircle, PlayCircle,
  Banknote, MessageCircle, Image as ImageIcon, Eye, X,
  Clock, Check, AlertCircle,
} from "lucide-react";
import { apiFor, extractErrorMessage } from "@/lib/api";
import {
  imageList, formatDate, shortId, TRANSACTION_STATUS_META, resolveImage,
} from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { Spinner, ErrorNote } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextareaField } from "@/components/ui/Field";
import { ChatPanel } from "@/components/ChatPanel";

function ImageGallery({
  images, title, mainAlt,
}: {
  images: string[];
  title: string;
  mainAlt: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-line bg-paper-deep/40 py-8 text-xs text-ink-soft">
        <ImageIcon className="size-6 opacity-40" />
        <span>Tanpa gambar</span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowAll(true)}
        className="group relative mb-2 block w-full overflow-hidden rounded-md border border-line bg-paper-deep"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIdx]}
          alt={mainAlt}
          className="h-64 w-full object-cover transition-opacity sm:h-80 md:h-96"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-surface">
            {activeIdx + 1} / {images.length}
          </div>
        )}
        <div className="absolute inset-0 hidden items-center justify-center bg-ink/40 transition-colors group-hover:flex">
          <Eye className="size-8 text-surface" />
        </div>
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 overflow-hidden rounded-sm border-2 transition-all ${
                activeIdx === idx
                  ? "border-teak ring-1 ring-teak/50"
                  : "border-line opacity-60 hover:opacity-100"
              }`}
              aria-label={`Tampilkan gambar ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square h-14 w-14 object-cover" />
            </button>
          ))}
        </div>
      )}

      <Modal open={showAll} onClose={() => setShowAll(false)} title={title} width="max-w-2xl">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIdx]}
            alt={mainAlt}
            className="w-full rounded-sm object-contain bg-paper-deep"
          />
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`shrink-0 overflow-hidden rounded-sm border-2 transition-all ${
                    activeIdx === idx
                      ? "border-teak"
                      : "border-line opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-square h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 text-center text-xs text-ink-soft">
            {activeIdx + 1} / {images.length}
          </p>
        </div>
      </Modal>
    </div>
  );
}

type TimelineStep = {
  label: string;
  status: TransactionStatus;
  time: string | null;
  icon: typeof Clock;
  description: string;
};

function TrackingTimeline({ transaction }: { transaction: Transaction }) {
  const steps: TimelineStep[] = [
    {
      label: "Diajukan",
      status: "pending",
      time: transaction.created_at,
      icon: Clock,
      description: "Transaksi berhasil diajukan oleh pengguna",
    },
    {
      label: "Diperiksa",
      status: "checking",
      time: null,
      icon: Eye,
      description: "Admin sedang memeriksa furnitur",
    },
    {
      label: "Disetujui",
      status: "approved",
      time: null,
      icon: CheckCircle2,
      description: "Transaksi disetujui dan ditukar",
    },
    {
      label: "Ditolak",
      status: "rejected",
      time: null,
      icon: XCircle,
      description: transaction.reject_reason ?? "Transaksi ditolak",
    },
  ];

  const statusOrder: TransactionStatus[] = ["pending", "checking", "approved", "rejected"];
  const currentIndex = statusOrder.indexOf(transaction.status);

  const currentTime = (() => {
    if (transaction.status === "pending") return transaction.created_at;
    return transaction.updated_at ?? transaction.created_at;
  })();

  return (
    <div className="mt-8">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">Riwayat Tracking</h2>
      <div className="rounded-md border border-line bg-surface p-5">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-8 bottom-8 w-px bg-line" />

          <div className="space-y-0">
            {steps.map((step, idx) => {
              const completed = idx <= currentIndex;
              const current = idx === currentIndex;
              const Icon = step.icon;
              const meta = TRANSACTION_STATUS_META[step.status];

              return (
                <div key={step.status} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {/* Dot */}
                  <div
                    className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                      current
                        ? "border-teak bg-teak text-surface"
                        : completed
                          ? "border-moss bg-moss text-surface"
                          : "border-line bg-paper-deep"
                    }`}
                  >
                    {current ? (
                      <Icon className="size-4 animate-pulse" />
                    ) : completed ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Icon className="size-4 text-ink-soft/40" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        current ? "text-ink" : completed ? "text-moss" : "text-ink-soft"
                      }`}>
                        {step.label}
                      </span>
                      {current && (
                        <Stamp label={meta.label} color={meta.color} bg={meta.bg} />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">{step.description}</p>
                    {completed && step.time && (
                      <p className="mt-1 font-mono text-[11px] text-ink-soft/70">
                        {formatDate(step.time)}
                      </p>
                    )}
                    {current && currentTime && (
                      <p className="mt-1 font-mono text-[11px] text-teak">
                        {formatDate(currentTime)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {transaction.status === "rejected" && transaction.reject_reason && (
          <div className="mt-4">
            <ErrorNote message={`Alasan penolakan: ${transaction.reject_reason}`} />
          </div>
        )}
      </div>
    </div>
  );
}

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
      .get(`/systemAdmin/transactions/${id}`)
      .then(({ data }) => setTransaction(data.data))
      .catch(() => setError("Transaksi tidak ditemukan."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function startChecking() {
    setActionLoading("checking");
    try {
      await apiFor("admin").patch(`/systemAdmin/transactions/${id}/checking`);
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
      await apiFor("admin").patch(`/systemAdmin/transactions/${id}/approve`);
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
      await apiFor("admin").patch(`/systemAdmin/transactions/${id}/set-price`, { admin_price: parsed });
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
      await apiFor("admin").patch(`/systemAdmin/transactions/${id}/reject`, { reject_reason: rejectReason });
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
  const yourImages = imageList(transaction.user_furniture?.images);
  const theirImages = imageList(transaction.product?.images);
  const theirStaticImgs = [
    transaction.product?.image1,
    transaction.product?.image2,
    transaction.product?.image3,
    transaction.product?.image4,
    transaction.product?.image5,
    transaction.product?.image6,
  ].map(resolveImage).filter(Boolean) as string[];

  // Combine static and DB images (deduplicated)
  const theirAllImages = [...theirStaticImgs, ...theirImages.filter((src) => !theirStaticImgs.includes(src))];
  const canCheck = transaction.status === "pending";
  const canApprove = transaction.status === "checking";
  const canReject = transaction.status === "pending" || transaction.status === "checking";
  const canSetPrice = !transaction.user_furniture?.admin_price && transaction.status !== "approved" && transaction.status !== "rejected";

  const waPhone = (() => {
    const raw = transaction.user?.phone_number;
    if (raw) {
      if (raw.startsWith("+62")) return "62" + raw.substring(3);
      if (raw.startsWith("0")) return "62" + raw.substring(1);
      return raw;
    }
    return "6285174189869";
  })();
  const waMessage = encodeURIComponent(
    `Halo ${transaction.user?.name ?? "User"}, saya admin terkait tiket #${shortId(transaction.id)}.`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

  return (
    <div className="max-w-3xl">
      <Link
        href="/systemAdmin/transactions"
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

        {/* Image Gallery Section */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* User Furniture Images */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-soft">
                Furnitur Pengguna ({yourImages.length} foto)
              </p>
              <ImageGallery
                images={yourImages}
                title={`${transaction.user_furniture?.name ?? "Furnitur"} - Foto`}
                mainAlt={transaction.user_furniture?.name ?? "Furnitur pengguna"}
              />
              {transaction.user_furniture?.admin_price != null && (
                <p className="mt-2 text-xs font-medium text-teak">
                  Harga: Rp {Number(transaction.user_furniture.admin_price).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Catalog Product Images */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-soft">
                Produk Katalog ({theirAllImages.length} foto)
              </p>
              <ImageGallery
                images={theirAllImages}
                title={`${transaction.product?.name ?? "Produk"} - Foto`}
                mainAlt={transaction.product?.name ?? "Produk katalog"}
              />
              {transaction.product?.price != null && (
                <p className="mt-2 text-xs font-medium text-teak">
                  Harga: Rp {Number(transaction.product.price).toLocaleString('id-ID')}
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

      {/* Tracking Timeline */}
      <TrackingTimeline transaction={transaction} />

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Percakapan dengan pengguna</h2>
        <ChatPanel role="admin" transactionId={transaction.id} status={transaction.status} />
      </div>

      <div className="mt-6 rounded-md border border-line bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-ink">Hubungi pengguna via WhatsApp</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {transaction.user?.phone_number
                ? `Kirim pesan langsung ke ${transaction.user.name} untuk koordinasi transaksi.`
                : `Nomor WhatsApp ${transaction.user?.name ?? "pengguna"} belum tersedia, hubungi via admin Tukar.`}
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-moss px-4 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-moss-deep"
          >
            <MessageCircle className="size-4" />
            Chat via WhatsApp
          </a>
        </div>
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
