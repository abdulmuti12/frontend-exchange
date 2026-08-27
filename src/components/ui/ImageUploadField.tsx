"use client";

import { useState, useRef } from "react";
import { Plus, X, Trash2, Upload } from "lucide-react";
import { resolveImage } from "@/lib/utils";

interface UploadedImage {
  name: string;
  preview: string;
  file: File | null;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  maxSize = 6,
}: {
  label?: string;
  value: UploadedImage[];
  onChange: (files: UploadedImage[]) => void;
  maxSize?: number;
}) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const existingUrls = value
    .filter((v) => !v.file)
    .map((v) => v.preview);

  const displaySlots = Array.from({ length: Math.max(maxSize, value.length) }, (_, i) => {
    const item = value[i] ?? null;
    return { item, idx: i };
  });

  function onFileSelect(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: UploadedImage[] = [...value];
    // Replace only the selected slot with the first file
    const file = files[0];
    newItems[idx] = {
      name: file.name,
      preview: URL.createObjectURL(file),
      file,
    };
    onChange(newItems);
    // Reset so selecting the same file again works
    e.target.value = "";
  }

  function triggerInput(idx: number) {
    inputRefs.current[idx]?.click();
  }

  function remove(idx: number) {
    const filtered = value.filter((_, i) => i !== idx);
    onChange(filtered);
  }

  function handleDrop(idx: number | "append", e: React.DragEvent) {
    e.preventDefault();
    setDragOverIdx(null);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;

    const newItems = [...value];
    const startIdx = idx === "append" ? newItems.length : idx;
    for (let i = 0; i < Math.min(files.length, maxSize - newItems.length); i++) {
      const file = files[i];
      newItems[startIdx + i] = {
        name: file.name,
        preview: URL.createObjectURL(file),
        file,
      };
    }
    onChange(newItems);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-baskerville text-ink">{label}</span>}
      <div className="grid grid-cols-3 gap-3">
        {displaySlots.map(({ item, idx }) => {
          const isExisting = item && !item.file;
          const resolved = isExisting
            ? resolveImage(item!.preview)
            : item?.file
            ? item.preview
            : null;

          return (
            <div key={idx} className="relative">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(idx);
                }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={(e) => handleDrop(idx, e)}
                className={`
                  group relative aspect-square w-full overflow-hidden rounded-md border-2 border-dashed
                  ${resolved ? "border-line" : "border-ink/20"}
                  ${dragOverIdx === idx ? "border-teak bg-teak/5" : ""}
                  cursor-pointer transition-colors
                `}
                onClick={() => triggerInput(idx)}
              >
                {resolved ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolved} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-ink-soft/50">
                    <Plus className="size-5" />
                    <span className="text-[10px]">Gambar {idx + 1}</span>
                  </div>
                )}
                {item && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(idx);
                    }}
                    aria-label={`Hapus gambar ${idx + 1}`}
                    title="Hapus gambar"
                    className="absolute right-1 top-1 z-10 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-surface shadow-md transition-opacity hover:bg-ink"
                  >
                    <Trash2 className="size-3" />
                    <span className="text-[10px] font-baskerville">Hapus</span>
                  </button>
                )}
                {/* Hover overlay hint */}
                {resolved && (
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors" />
                )}
              </div>
              <label className="mt-1 block text-center text-xs text-ink-soft">
                Gambar {idx + 1}
              </label>
              <input
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => onFileSelect(idx, e)}
              />
            </div>
          );
        })}
      </div>

      {/* Quick upload button for multiple */}
      <button
        type="button"
        onClick={() => {
          // Find first empty slot
          const firstEmpty = displaySlots.findIndex((s) => !s.item);
          if (firstEmpty >= 0) triggerInput(firstEmpty);
        }}
        className="mx-auto mt-1 rounded-sm border border-dashed border-line bg-surface py-2 text-xs text-ink-soft hover:border-teak hover:text-teak"
      >
        <div className="flex items-center justify-center gap-1">
          <Upload className="size-3.5" />
          <span>Unggah gambar</span>
        </div>
      </button>
    </div>
  );
}
