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
      toast.success("Profile updated successfully.");
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
      <PageHeader eyebrow="Account" title="My profile" description="Update your personal data and password." />
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
        <TextField
          label="Full name"
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
          label="WhatsApp Number"
          hint="Use the international format, for example: 08123456789 or +628123456789."
          type="tel"
          autoComplete="tel"
          value={form.phone_number}
          error={errors.phone_number}
          onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
        />
        <TextareaField
          label="Address"
          value={form.address}
          error={errors.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          rows={3}
        />
        <TextField
          label="New password"
          type="password"
          hint="Leave blank if you do not want to change the password."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <Button type="submit" loading={saving} className="mt-1 self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}
