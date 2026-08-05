"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFor, extractErrorMessage, setToken, setStoredProfile } from "@/lib/api";

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiFor("user").post("/auth/user/login", { email, password });
      setToken("user", data.data.access_token);
      setStoredProfile("user", data.data.user);
      toast.success(data.message ?? "Login berhasil.");
      router.push("/user");
    } catch (err) {
      setError(extractErrorMessage(err, "Email atau password salah."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Pengguna"
      title="Masuk ke akun Anda"
      description="Lihat katalog, ajukan pertukaran, dan pantau transaksi Anda."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-teak hover:underline">
            Daftar sekarang
          </Link>
          <div className="mt-2">
            <Link href="/admin/login" className="text-xs text-ink-soft hover:underline">
              Masuk sebagai admin →
            </Link>
          </div>
        </>
      }
    >
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
        <TextField
          label="Kata sandi"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm font-medium text-rust">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Masuk
        </Button>
      </form>
    </AuthCard>
  );
}
