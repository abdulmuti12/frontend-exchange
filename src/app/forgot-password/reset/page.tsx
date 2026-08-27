"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { resetForgotPassword, extractErrorMessage, fieldErrors } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    if (form.password.length < 6) {
      setErrors({ password: "Kata sandi minimal 6 karakter." });
      return;
    }

    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const response = await resetForgotPassword(email, "", form.password, form.password_confirmation);
      setSuccess(true);
      toast.success(response.message ?? "Kata sandi berhasil diubah.");
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(extractErrorMessage(err, "Gagal mereset kata sandi."));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard
        eyebrow="Lupa Kata Sandi"
        title="Kata Sandi Berhasil Diubah"
        description="Kata sandi Anda telah berhasil diubah. Silakan login dengan kata sandi baru."
        maxWidth="max-w-md"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-moss-soft flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Login Sekarang
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Lupa Kata Sandi"
      title="Buat Kata Sandi Baru"
      description={`Membuat kata sandi baru untuk akun ${email}.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label="Kata Sandi Baru"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          error={errors.password}
          onChange={(e) => update("password", e.target.value)}
        />
        <TextField
          label="Konfirmasi Kata Sandi"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password_confirmation}
          error={errors.password_confirmation}
          onChange={(e) => update("password_confirmation", e.target.value)}
        />
        {error && <p className="text-sm font-display text-rust">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Ubah Kata Sandi
        </Button>
      </form>
    </AuthCard>
  );
}

function ResetPasswordFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md text-center text-ink-soft">Memuat...</div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}