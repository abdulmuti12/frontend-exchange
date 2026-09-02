"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Repeat, MessageCircle, Image as ImageIcon, Eye } from "lucide-react";
import { apiFor } from "@/lib/api";
import { imageList, formatDate, shortId, TRANSACTION_STATUS_META, resolveImage } from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { Spinner, ErrorNote } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { Modal } from "@/components/ui/Modal";
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
          <div className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] text-surface">
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
  icon: typeof ImageIcon;
  description: string;
};

function TrackingTimeline({ transaction }: { transaction: Transaction }) {
  const steps: TimelineStep[] = [
    {
      label: "Diajukan",
      status: "pending",
      time: transaction.created_at,
      icon: ImageIcon,
      description: "Transaction successfully submitted",
    },
    {
      label: "Diperiksa",
      status: "checking",
      time: null,
      icon: ImageIcon,
      description: "Admin sedang memeriksa furnitur",
    },
    {
      label: "Disetujui",
      status: "approved",
      time: null,
      icon: ImageIcon,
      description: "Transaction approved and swapped",
    },
    {
      label: "Ditolak",
      status: "rejected",
      time: null,
      icon: ImageIcon,
      description: transaction.reject_reason ?? "Transaction rejected",
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
      <h2 className="mb-4 text-lg text-ink">Riwayat Tracking</h2>
      <div className="rounded-md border border-line bg-surface p-5">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-8 bottom-8 w-px bg-line" />

          <div className="space-y-0">
            {steps.map((step, idx) => {
              const completed = idx <= currentIndex;
              const current = idx === currentIndex;
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
                    {completed && !current ? (
                      <svg className="size-3.5 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs text-ink-soft/40">{idx + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm ${
                        current ? "text-ink" : completed ? "text-moss" : "text-ink-soft"
                      }`}>
                        {step.label}
                      </span>
                      {current && (
                        <Stamp label={meta.label} color={meta.color} bg={meta.bg} />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">{step.description}</p>
                    {(completed || current) && step.time && (
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

export default function UserTransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFor("user")
      .get(`/user/transactions/${id}`)
      .then(({ data }) => setTransaction(data.data))
      .catch(() => setError("Transaction not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !transaction) return <ErrorNote message={error ?? "Transaction not found."} />;

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

  const waPhone = "6285174189869";
  const waMessage = encodeURIComponent(
    `Halo Admin Tukar, saya butuh bantuan terkait tiket #${shortId(transaction.id)}.`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

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

        {/* Image Gallery Section */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* User Furniture Images */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-ink-soft">
                Your furniture ({yourImages.length} photos)
              </p>
              <ImageGallery
                images={yourImages}
                title={`${transaction.user_furniture?.name ?? "Furniture"} - Photos`}
                mainAlt={transaction.user_furniture?.name ?? "Your furniture"}
              />
              {transaction.user_furniture?.admin_price != null && (
                <p className="mt-2 text-xs text-teak">
                  Value Item: Rp {Number(transaction.user_furniture.admin_price).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Catalog Product Images */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-ink-soft">
                Catalog Product ({theirImages.length} photos)
              </p>
              <ImageGallery
                images={theirAllImages}
                title={`${transaction.product?.name ?? "Produk"} - Photos`}
                mainAlt={transaction.product?.name ?? "Produk katalog"}
              />
              {transaction.product?.price != null && (
                <p className="mt-2 text-xs text-teak">
                  Value Item: Rp {Number(transaction.product.price).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="perforated h-3 border-y border-dashed border-line" />

        <div className="grid grid-cols-2 gap-4 px-6 py-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink-soft">Diajukan</p>
            <p className="mt-0.5 text-ink">{formatDate(transaction.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">Diperbarui</p>
            <p className="mt-0.5 text-ink">{formatDate(transaction.updated_at)}</p>
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

      {/* Tracking Timeline */}
      <TrackingTimeline transaction={transaction} />

      <div className="mt-8">
        <h2 className="mb-3 text-lg text-ink">Conversation with admin</h2>
        <ChatPanel role="user" transactionId={transaction.id} status={transaction.status} />
      </div>

      <div className="mt-6 rounded-md border border-line bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-ink">Butuh respon cepat?</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              Hubungi admin via WhatsApp untuk bantuan langsung di luar jam chat.
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-moss px-4 py-2.5 text-sm text-surface transition-colors hover:bg-moss-deep"
          >
            <MessageCircle className="size-4" />
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
