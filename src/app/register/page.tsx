"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFor, extractErrorMessage, fieldErrors, setToken, setStoredProfile } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});
    try {
      const { data } = await apiFor("user").post("/auth/user/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number || undefined,
        address: form.address || undefined,
      });
      setToken("user", data.data.access_token);
      setStoredProfile("user", data.data.user);
      toast.success("Akun berhasil dibuat.");
      router.push("/user");
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(extractErrorMessage(err, "Registrasi gagal, periksa data Anda."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Pengguna Baru"
      title="Buat akun"
      description="Daftar untuk mulai menawarkan furnitur dan menukarnya."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-teak hover:underline">
            Masuk di sini
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nama lengkap"
          required
          autoComplete="name"
          value={form.name}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <TextField
          label="Kata sandi"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          onChange={(e) => update("password", e.target.value)}
        />
        <TextField
          label="Nomor telepon"
          hint="Opsional"
          value={form.phone_number}
          error={errors.phone_number}
          onChange={(e) => update("phone_number", e.target.value)}
        />
        <TextField
          label="Alamat"
          hint="Opsional"
          value={form.address}
          error={errors.address}
          onChange={(e) => update("address", e.target.value)}
        />
        {error && <p className="text-sm font-medium text-rust">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Daftar
        </Button>
      </form>
    </AuthCard>
  );
}
