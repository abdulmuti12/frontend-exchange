"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { apiFor, extractErrorMessage, fieldErrors } from "@/lib/api";
import type { Admin, AdminStatus } from "@/lib/types";
import { PageHeader, Spinner, EmptyState, useConfirm } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField, SelectField } from "@/components/ui/Field";

const emptyForm = { name: "", email: "", password: "", status: "active" as AdminStatus };

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();

  function load() {
    setLoading(true);
    apiFor("admin")
      .get("/systemAdmin/admins", { params: search ? { search } : {} })
      .then(({ data }) => setAdmins(data.data.items))
      .catch(() => toast.error("Gagal memuat daftar admin."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(a: Admin) {
    setEditing(a);
    setForm({ name: a.name, email: a.email, password: "", status: a.status });
    setErrors({});
    setModalOpen(true);
  }

  async function onSubmit() {
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        const payload: Record<string, string> = { name: form.name, email: form.email, status: form.status };
        if (form.password) payload.password = form.password;
        await apiFor("admin").put(`/systemAdmin/admins/${editing.id}`, payload);
        toast.success("Admin berhasil diperbarui.");
      } else {
        await apiFor("admin").post("/systemAdmin/admins", form);
        toast.success("Admin berhasil ditambahkan.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(extractErrorMessage(err, "Gagal menyimpan admin."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(a: Admin) {
    const ok = await confirm("Hapus admin", `Hapus akun admin "${a.name}"?`, true);
    if (!ok) return;
    try {
      await apiFor("admin").delete(`/systemAdmin/admins/${a.id}`);
      toast.success("Admin dihapus.");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menghapus admin."));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Akses"
        title="Kelola admin"
        description="Atur siapa saja yang dapat mengelola katalog dan memverifikasi transaksi."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah admin
          </Button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari admin..."
          className="w-full rounded-sm border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teak"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : admins.length === 0 ? (
        <EmptyState title="Belum ada admin" />
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{a.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{a.email}</td>
                  <td className="px-4 py-3">
                    <Stamp
                      label={a.status === "active" ? "Aktif" : "Nonaktif"}
                      color={a.status === "active" ? "var(--moss)" : "var(--rust)"}
                      bg={a.status === "active" ? "var(--moss-soft)" : "var(--rust-soft)"}
                      className="text-[10px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(a)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Ubah admin" : "Tambah admin"}>
        <div className="flex flex-col gap-4">
          <TextField
            label="Nama"
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
            label="Kata sandi"
            type="password"
            required={!editing}
            hint={editing ? "Kosongkan jika tidak ingin mengganti kata sandi" : undefined}
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminStatus }))}
          >
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </SelectField>
          <div className="mt-1 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={onSubmit} loading={saving}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
      {dialog}
    </div>
  );
}
