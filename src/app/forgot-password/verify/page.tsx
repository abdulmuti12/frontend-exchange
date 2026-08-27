"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { verifyForgotPasswordOtp, sendForgotPasswordOtp, extractErrorMessage } from "@/lib/api";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (email) {
      setOtp(["", "", "", "", "", ""]);
    }
  }, [email]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  }

  async function onSubmit() {
    if (otp.some((v) => !v)) {
      setError("Silakan masukkan kode OTP lengkap.");
      return;
    }

    const otpValue = otp.join("");
    setLoading(true);
    setError(null);

    try {
      const response = await verifyForgotPasswordOtp(email, otpValue);
      setSent(true);
      toast.success(response.message ?? "OTP berhasil diverifikasi.");
    } catch (err) {
      setError(extractErrorMessage(err, "Kode OTP salah atau telah kedaluwarsa."));
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    try {
      const response = await sendForgotPasswordOtp(email);
      toast.success(response.message ?? "Kode OTP baru telah dikirim.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mengirim ulang OTP."));
    } finally {
      setResendLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        eyebrow="Lupa Kata Sandi"
        title="OTP Berhasil Diverifikasi"
        description="Silakan buat kata sandi baru untuk akun Anda."
        maxWidth="max-w-md"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-moss-soft flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Button className="w-full" onClick={() => router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`)}>
            Buat Kata Sandi Baru →
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Lupa Kata Sandi"
      title="Masukkan Kode OTP"
      description={`Kami telah mengirim kode 6 digit ke ${email}. Masukkan kode di bawah ini.`}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <button
            type="button"
            className="hover:underline disabled:opacity-50"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Mengirim..." : "Kirim ulang OTP"}
          </button>
          <span className="font-mono">{email}</span>
        </div>
      }
    >
      <div className="flex justify-center gap-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 text-center text-xl font-mono font-display border border-line rounded-sm bg-surface text-ink focus:border-teak outline-none transition-colors"
          />
        ))}
      </div>
      {error && <p className="text-sm font-display text-rust text-center mb-4">{error}</p>}
      <Button onClick={onSubmit} loading={loading} className="w-full">
        Verifikasi
      </Button>
    </AuthCard>
  );
}

function VerifyOtpFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md text-center text-ink-soft">Memuat...</div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpContent />
    </Suspense>
  );
}