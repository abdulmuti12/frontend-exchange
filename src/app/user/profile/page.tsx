"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFor, extractErrorMessage, fieldErrors } from "@/lib/api";
import { useUserAuth } from "@/lib/auth";
import { PageHeader, Spinner } from "@/components/ui/Misc";
import { TextField, TextareaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { setProfile } = useUserAuth();
  const [form, setForm] = useState({ name: "", email: "", phone_number: "", address: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFor("user")
      .get("/user/profile")
      .then(({ data }) => {
        const p = data.data;
        setForm({
          name: p.name ?? "",
          email: p.email ?? "",
          phone_number: p.phone_number ?? "",
          address: p.address ?? "",
          password: "",
        });
      })
      .catch(() => toast.error("Gagal memuat profil."))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload: Record<string, string> = {
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        address: form.address,
      };
      if (form.password) payload.password = form.password;
      const { data } = await apiFor("user").put("/user/profile", payload);
      setProfile(data.data);
      setForm((f) => ({ ...f, password: "" }));
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(extractErrorMessage(err, "Gagal memperbarui profil."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-lg">
      <PageHeader eyebrow="Akun" title="Profil saya" description="Perbarui data diri dan kata sandi Anda." />
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
        <TextField
          label="Nama lengkap"
          required
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <TextField
          label="Nomor WhatsApp"
          hint="Gunakan format internasional, contoh: 08123456789 atau +628123456789"
          type="tel"
          autoComplete="tel"
          value={form.phone_number}
          error={errors.phone_number}
          onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
        />
        <TextareaField
          label="Alamat"
          value={form.address}
          error={errors.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          rows={3}
        />
        <TextField
          label="Kata sandi baru"
          type="password"
          hint="Kosongkan jika tidak ingin mengganti kata sandi"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <Button type="submit" loading={saving} className="mt-1 self-start">
          Simpan perubahan
        </Button>
      </form>
    </div>
  );
}
