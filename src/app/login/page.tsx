"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
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
      maxWidth="max-w-md"
    >
      <GoogleAuthButton
        onLogin={(token, user) => {
          setToken("user", token as string);
          setStoredProfile("user", user);
          router.push("/user");
        }}
        onError={(msg) => setError(msg)}
      />
      <div className="mt-6 flex items-center">
        <div className="flex-1 h-px bg-line"></div>
        <span className="mx-4 text-xs text-ink-soft font-mono">OR</span>
        <div className="flex-1 h-px bg-line"></div>
      </div>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
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
      <div className="mt-4 text-right">
        <Link href="/forgot-password" className="text-xs text-teak hover:underline">
          Lupa kata sandi?
        </Link>
      </div>
      <div className="mt-5 text-center text-sm text-ink-soft">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-teak hover:underline">
          Daftar sekarang
        </Link>
        <div className="mt-2">
          <Link href="/systemAdmin/login" className="text-xs text-ink-soft hover:underline">
            Masuk sebagai admin →
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
