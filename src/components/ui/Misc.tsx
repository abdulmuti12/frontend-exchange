"use client";

import { Loader2, Inbox, AlertTriangle } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-teak">{eyebrow}</p>
        )}
        <h1 className="text-2xl text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-soft">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <Inbox className="size-8 text-ink-soft/50" />
      <p className="text-base text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-sm border border-rust/40 bg-rust-soft px-3 py-2.5 text-sm text-rust">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
    danger?: boolean;
    resolve?: (v: boolean) => void;
  }>({ open: false, title: "", description: "" });

  function confirm(title: string, description: string, danger = false) {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, title, description, danger, resolve });
    });
  }

  function close(result: boolean) {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false }));
  }

  const dialog = (
    <Modal open={state.open} onClose={() => close(false)} title={state.title} width="max-w-sm">
      <p className="text-sm text-ink-soft">{state.description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => close(false)}>
          Batal
        </Button>
        <Button variant={state.danger ? "danger" : "primary"} size="sm" onClick={() => close(true)}>
          Ya, lanjutkan
        </Button>
      </div>
    </Modal>
  );

  return { confirm, dialog };
}
