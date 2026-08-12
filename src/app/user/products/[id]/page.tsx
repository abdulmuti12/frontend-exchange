"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Repeat, ZoomIn, ZoomOut, ImageOff } from "lucide-react";
import { apiFor, extractErrorMessage } from "@/lib/api";
import { imageList, PRODUCT_STATUS_META, resolveImage } from "@/lib/utils";
import type { Furniture, Product } from "@/lib/types";
import { Spinner, ErrorNote } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [furnitures, setFurnitures] = useState<Furniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState("");
  const [userProfile, setUserProfile] = useState<{ address?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Image gallery state — must be declared above early returns to satisfy Rules of Hooks
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFor("user").get(`/user/products/${id}`),
      apiFor("user").get("/user/furnitures", { params: { status: "available" } }),
      apiFor("user").get("/user/profile"),
    ])
      .then(([p, f, profile]) => {
        setProduct(p.data.data);
        setFurnitures(f.data.data.items);
        setUserProfile(profile.data.data);
      })
      .catch((err) => {
        if (!err?.response?.data?.success) {
          setError("Produk tidak ditemukan.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function submitSwap() {
    if (!selectedFurniture) {
      toast.error("Pilih salah satu furnitur Anda terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await apiFor("user").post("/user/transactions", {
        user_furniture_id: selectedFurniture,
        product_id: id,
      });
      toast.success("Pengajuan berhasil, menunggu verifikasi admin.");
      router.push(`/user/transactions/${data.data.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mengajukan tukar."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;
  if (error || !product) return <ErrorNote message={error ?? "Produk tidak ditemukan."} />;

  // Combine image1–image6 with images table entries (deduplicated, sorted)
  const staticImgs: string[] = [];
  const imgFields = [product.image1, product.image2, product.image3, product.image4, product.image5, product.image6];
  for (const raw of imgFields) {
    const resolved = resolveImage(raw);
    if (resolved) staticImgs.push(resolved);
  }
  const dbImages = imageList(product.images);
  // Merge: static first, then DB images (avoid duplicates)
  const seen = new Set<string>();
  for (const src of staticImgs) seen.add(src);
  for (const src of dbImages) if (!seen.has(src)) seen.add(src);
  const allImages = [...staticImgs, ...dbImages.filter((src) => !seen.has(src))];
  const statusMeta = PRODUCT_STATUS_META[product.status];
  const canSwap = product.status === "available";

  return (
    <div className="max-w-4xl">
      <Link href="/user" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" />
        Kembali ke katalog
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-md border border-line bg-paper-deep">
            {allImages.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={allImages[activeImgIdx]}
                alt={product.name}
                className="h-full w-full object-cover transition-opacity"
                onLoad={() => setShowAll(false)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 font-mono text-xs text-ink-soft">
                <ImageOff className="size-6 opacity-40" />
                Tanpa gambar
              </div>
            )}
            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-surface">
                {activeImgIdx + 1} / {allImages.length}
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {allImages.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative shrink-0 overflow-hidden rounded-sm border-2 transition-all ${
                      activeImgIdx === idx
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
              {/* Expand to full gallery modal */}
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft hover:text-teak"
              >
                {showAll ? <ZoomOut className="size-3.5" /> : <ZoomIn className="size-3.5" />}
                <span>{showAll ? "Sembunyikan galeri" : "Tampilkan semua gambar"}</span>
              </button>
              {showAll && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {allImages.map((src, idx) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        setActiveImgIdx(idx);
                        setShowAll(false);
                      }}
                      className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                        activeImgIdx === idx ? "border-teak" : "border-line hover:border-ink/40"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 right-1 rounded bg-ink/70 px-1.5 py-0.5 text-[9px] text-surface">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <Stamp label={statusMeta.label} color={statusMeta.color} bg={statusMeta.bg} />
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {product.brand?.name ?? "Brand tidak diketahui"} · {product.category?.name ?? "Tanpa kategori"}
          </p>
          {product.price != null && (
            <p className="mt-2 font-display text-2xl font-semibold text-teak">
              {`Rp ${Number(product.price).toLocaleString('id-ID')}`}
            </p>
          )}
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {product.description || "Tidak ada deskripsi untuk produk ini."}
          </p>

          <div className="mt-8 rounded-md border border-line bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Ajukan tukar</h2>
            {!canSwap ? (
              <p className="mt-2 text-sm text-ink-soft">
                Produk ini sedang tidak tersedia untuk ditukar.
              </p>
            ) : !userProfile?.address ? (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-brass">
                  Anda belum mengisi alamat. Silakan lengkapi alamat di halaman profil terlebih dahulu sebelum mengajukan tukar.
                </p>
                <Link href="/user/profile" className="inline-block text-sm font-medium text-teak hover:underline">
                  → Lengkapi alamat di profil
                </Link>
              </div>
            ) : furnitures.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">
                Anda belum memiliki furnitur berstatus tersedia.{" "}
                <Link href="/user/furnitures" className="font-medium text-teak hover:underline">
                  Tambah furnitur
                </Link>{" "}
                terlebih dahulu.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <SelectField
                  label="Pilih furnitur Anda"
                  value={selectedFurniture}
                  onChange={(e) => setSelectedFurniture(e.target.value)}
                >
                  <option value="">— Pilih furnitur —</option>
                  {furnitures.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </SelectField>
                <Button onClick={submitSwap} loading={submitting}>
                  <Repeat className="size-4" />
                  Ajukan tukar sekarang
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
