"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { SendHorizontal, MessageCircleOff } from "lucide-react";
import { apiFor, extractErrorMessage, type Role } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Message, TransactionStatus } from "@/lib/types";
import { toast } from "sonner";

export function ChatPanel({
  role,
  transactionId,
  status,
}: {
  role: Role;
  transactionId: string;
  status: TransactionStatus;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const open = status === "checking";
  const prefix = role === "admin" ? "/admin" : "/user";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function fetchMessages() {
      try {
        const { data } = await apiFor(role).get(`${prefix}/transactions/${transactionId}/messages`);
        if (!cancelled) setMessages(data.data.items);
      } catch {
        // stay silent on polling errors
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [open, role, prefix, transactionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data } = await apiFor(role).post(`${prefix}/transactions/${transactionId}/messages`, {
        message: text,
      });
      setMessages((prev) => [...prev, data.data]);
      setDraft("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mengirim pesan."));
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
        <MessageCircleOff className="size-6 text-ink-soft/50" />
        <p className="text-sm text-ink-soft">
          Chat hanya tersedia saat transaksi berstatus <strong>diperiksa</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[420px] flex-col rounded-md border border-line bg-surface">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!loaded ? (
          <p className="text-center text-xs text-ink-soft">Memuat percakapan...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-ink-soft">Belum ada pesan. Mulai percakapan di bawah.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_type === role;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                    mine ? "bg-teak text-surface" : "bg-paper-deep text-ink"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.message}</p>
                  <p className={`mt-1 font-mono text-[10px] ${mine ? "text-surface/70" : "text-ink-soft"}`}>
                    {m.sender_type === "admin" ? "Admin" : "Anda"} · {formatDate(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="flex gap-2 border-t border-line p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis pesan..."
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-teak"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Kirim pesan"
          className="shrink-0 rounded-sm bg-teak px-3 py-2 text-surface disabled:opacity-50"
        >
          <SendHorizontal className="size-4" />
        </button>
      </form>
    </div>
  );
}
