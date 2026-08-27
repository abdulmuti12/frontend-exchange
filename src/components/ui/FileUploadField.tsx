"use client";

import { useState, useRef } from "react";
import { Plus, X, ImageOff, Upload } from "lucide-react";
import { resolveImage } from "@/lib/utils";

interface UploadedImage {
  name: string;
  preview: string;
  file: File | null;
}

export function FileUploadField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: UploadedImage[];
  onChange: (files: UploadedImage[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, { name: trimmed, preview: resolveImage(trimmed) ?? trimmed, file: null }]);
    setDraft("");
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedImage[] = files.map((f) => ({
      name: f.name,
      preview: URL.createObjectURL(f),
      file: f,
    }));
    onChange([...value, ...newFiles]);
    e.target.value = "";
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-baskerville text-ink">{label}</span>}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={onFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-sm border border-dashed border-line bg-surface py-2 text-sm text-ink-soft hover:border-teak hover:text-teak"
        >
          <div className="flex items-center justify-center gap-1.5">
            <Upload className="size-4" />
            <span>Pilih gambar dari file</span>
          </div>
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {value.map((item, idx) => {
            const resolved = item.file ? item.preview : resolveImage(item.preview);
            return (
              <div key={`${item.name}-${idx}`} className="group relative size-16 overflow-hidden rounded-sm border border-line bg-paper-deep">
                {resolved ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolved} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="size-4 text-ink-soft" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label="Hapus gambar"
                  className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-surface opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}