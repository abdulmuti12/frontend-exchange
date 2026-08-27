"use client";

import { useState } from "react";
import { Plus, X, ImageOff } from "lucide-react";
import { resolveImage } from "@/lib/utils";

export function ImageUrlsField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-baskerville text-ink">{label}</span>}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="/storage/products/contoh.jpg atau URL penuh"
          className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teak"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-sm border border-line px-3 py-2 text-ink-soft hover:border-teak hover:text-teak"
          aria-label="Tambah gambar"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {value.map((url, idx) => {
            const resolved = resolveImage(url);
            return (
              <div key={`${url}-${idx}`} className="group relative size-16 overflow-hidden rounded-sm border border-line bg-paper-deep">
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
                  onClick={() => onChange(value.filter((_, i) => i !== idx))}
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
