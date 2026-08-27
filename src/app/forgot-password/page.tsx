"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { sendForgotPasswordOtp, extractErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await sendForgotPasswordOtp(email);
      setSent(true);
      toast.success(response.message ?? "Kode OTP telah dikirim.");
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal mengirim OTP. Pastikan email sudah terdaftar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Lupa Kata Sandi"
      title={sent ? "Periksa Email Anda" : "Lupa Kata Sandi"}
      description={
        sent
          ? "Kami telah mengirim kode OTP ke email Anda. Silakan cek inbox dan masukkan kodenya."
          : "Masukkan email yang terdaftar untuk menerima kode OTP reset kata sandi."
      }
      maxWidth="max-w-md"
      footer={
        <div className="text-center">
          <Link href="/login" className="text-sm text-ink-soft hover:text-ink">
            ← Kembali ke halaman login
          </Link>
        </div>
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-moss-soft flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-ink-soft mb-2">
            Kode OTP telah dikirim ke <strong className="text-ink">{email}</strong>
          </p>
          <p className="text-xs text-ink-soft">Kode berlaku selama 10 menit</p>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`)}
          >
            Lanjut Verifikasi OTP →
          </Button>
          <button
            type="button"
            className="mt-3 text-sm text-ink-soft hover:text-ink underline"
            onClick={() => setSent(false)}
          >
            Kirim ulang OTP
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="anda@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm font-display text-rust">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Kirim Kode OTP
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
