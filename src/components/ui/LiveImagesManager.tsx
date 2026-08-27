"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, ImageOff, Upload } from "lucide-react";
import { apiFor, extractErrorMessage, type Role } from "@/lib/api";
import { resolveImage } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

type ImageEntry = ProductImage | string;

function entryId(img: ImageEntry): string | null {
  return typeof img === "string" ? null : img.id;
}
function entryUrl(img: ImageEntry): string {
  return typeof img === "string" ? img : img.image_url;
}

/**
 * Manages images for an already-created product/furniture via the dedicated
 * `/{resource}/{id}/images` endpoints — additions and removals apply immediately.
 * Supports only file uploads.
 */
export function LiveImagesManager({
  role,
  basePath,
  images,
  onChange,
}: {
  role: Role;
  basePath: string;
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onFileSelect() {
    if (!fileInputRef.current || busy) return;
    const files = Array.from(fileInputRef.current.files || []);
    if (files.length === 0) return;
    // Reset so selecting the same file(s) again works.
    fileInputRef.current.value = "";

    setBusy(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const { data } = await apiFor(role).post(`${basePath}/images`, formData);
        onChange([...images, data.data]);
      }
      toast.success(`${files.length} gambar berhasil ditambahkan.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menambah gambar."));
    } finally {
      setBusy(false);
    }
  }

  async function remove(imageId: string) {
    setBusy(true);
    try {
      await apiFor(role).delete(`${basePath}/images/${imageId}`);
      onChange(images.filter((img) => entryId(img) !== imageId));
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menghapus gambar."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-display text-ink">Gambar</span>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        className="rounded-sm border border-dashed border-line bg-surface py-2 text-sm text-ink-soft hover:border-teak hover:text-teak disabled:opacity-50"
      >
        <div className="flex items-center justify-center gap-1.5">
          <Upload className="size-4" />
          <span>{busy ? "Mengunggah..." : "Pilih gambar dari file (bisa banyak)"}</span>
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={onFileSelect}
        className="hidden"
      />
      {images.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {images.map((img, idx) => {
            const resolved = resolveImage(entryUrl(img));
            const id = entryId(img);
            return (
              <div key={id ?? `${entryUrl(img)}-${idx}`} className="group relative size-16 overflow-hidden rounded-sm border border-line bg-paper-deep">
                {resolved ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolved} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="size-4 text-ink-soft" />
                  </div>
                )}
                {id && (
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    disabled={busy}
                    aria-label="Hapus gambar"
                    className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-surface opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}