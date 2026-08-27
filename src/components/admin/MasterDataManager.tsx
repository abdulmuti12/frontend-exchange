"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { apiFor, extractErrorMessage, fieldErrors } from "@/lib/api";
import { resolveImage } from "@/lib/utils";
import type { Brand, Category } from "@/lib/types";
import { PageHeader, Spinner, EmptyState, useConfirm } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextareaField } from "@/components/ui/Field";

type Item = Brand | Category;

const emptyForm = { name: "", description: "", image: "" };

export function MasterDataManager({
  resource,
  singular,
  eyebrow,
  title,
  description,
}: {
  resource: "brands" | "categories";
  singular: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();

  function load() {
    setLoading(true);
    apiFor("admin")
      .get(`/systemAdmin/${resource}`, { params: search ? { search } : {} })
      .then(({ data }) => setItems(data.data.items))
      .catch(() => toast.error(`Gagal memuat ${singular}.`))
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

  function openEdit(item: Item) {
    setEditing(item);
    setForm({ name: item.name, description: item.description ?? "", image: item.image ?? "" });
    setErrors({});
    setModalOpen(true);
  }

  async function onSubmit() {
    setSaving(true);
    setErrors({});
    const payload = {
      name: form.name,
      description: form.description || undefined,
      image: form.image || undefined,
    };
    try {
      if (editing) {
        await apiFor("admin").put(`/systemAdmin/${resource}/${editing.id}`, payload);
        toast.success(`${singular} berhasil diperbarui.`);
      } else {
        await apiFor("admin").post(`/systemAdmin/${resource}`, payload);
        toast.success(`${singular} berhasil ditambahkan.`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(extractErrorMessage(err, `Gagal menyimpan ${singular}.`));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(item: Item) {
    const ok = await confirm(`Hapus ${singular}`, `Hapus "${item.name}"? Tindakan ini tidak dapat dibatalkan.`, true);
    if (!ok) return;
    try {
      await apiFor("admin").delete(`/systemAdmin/${resource}/${item.id}`);
      toast.success(`${singular} dihapus.`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, `Gagal menghapus ${singular}.`));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah {singular}
          </Button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Cari ${singular}...`}
          className="w-full rounded-sm border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teak"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title={`Belum ada ${singular}`} />
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-display">Nama</th>
                <th className="px-4 py-3 font-display">Deskripsi</th>
                <th className="px-4 py-3 font-display text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveImage(item.image) ?? undefined}
                          alt=""
                          className="size-8 rounded-sm object-cover"
                        />
                      )}
                      <span className="font-display text-ink">{item.name}</span>
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-ink-soft">{item.description || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Ubah ${singular}` : `Tambah ${singular}`}>
        <div className="flex flex-col gap-4">
          <TextField
            label="Nama"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextareaField
            label="Deskripsi"
            hint="Opsional"
            value={form.description}
            error={errors.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <TextField
            label="URL gambar"
            hint="Opsional"
            value={form.image}
            error={errors.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          />
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
