"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiFor, extractErrorMessage, fieldErrors } from "@/lib/api";
import { firstImage, FURNITURE_STATUS_META } from "@/lib/utils";
import type { Brand, Category, Furniture } from "@/lib/types";
import { PageHeader, Spinner, EmptyState, useConfirm } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextareaField, SelectField } from "@/components/ui/Field";
import { FileUploadField } from "@/components/ui/FileUploadField";

type Mode = "category" | "brand";

interface FormState {
  name: string;
  description: string;
  categoryMode: Mode;
  category_id: string;
  category_text: string;
  brandMode: Mode;
  brand_id: string;
  brand_text: string;
  images: { name: string; preview: string; file: File | null }[];
}

const emptyForm: FormState = {
  name: "",
  description: "",
  categoryMode: "category",
  category_id: "",
  category_text: "",
  brandMode: "brand",
  brand_id: "",
  brand_text: "",
  images: [],
};

export default function FurnituresPage() {
  const [furnitures, setFurnitures] = useState<Furniture[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Furniture | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();

  function load() {
    setLoading(true);
    apiFor("user")
      .get("/user/furnitures")
      .then(({ data }) => setFurnitures(data.data.items))
      .catch(() => toast.error("Gagal memuat furnitur."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    apiFor("user").get("/user/categories").then(({ data }) => setCategories(data.data)).catch(() => {});
    apiFor("user").get("/user/brands").then(({ data }) => setBrands(data.data)).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(f: Furniture) {
    setEditing(f);
    setForm({
      name: f.name,
      description: f.description ?? "",
      categoryMode: f.category_id ? "category" : "brand",
      category_id: f.category_id ?? "",
      category_text: f.category_text ?? "",
      brandMode: f.brand_id ? "brand" : "brand",
      brand_id: f.brand_id ?? "",
      brand_text: f.brand_text ?? "",
      images: (f.images ?? []).map((img) => {
        const url = typeof img === "string" ? img : img.image_url;
        return { name: url, preview: url, file: null };
      }),
    });
    setErrors({});
    setModalOpen(true);
  }

  async function onSubmit() {
    setSaving(true);
    setErrors({});

    const hasFiles = form.images.some((img) => img.file !== null);

    try {
      let response;
      if (hasFiles || editing) {
        const fd = new FormData();
        fd.append("name", form.name);
        if (form.description) fd.append("description", form.description);
        if (form.categoryMode === "category" && form.category_id) fd.append("category_id", form.category_id);
        else if (form.category_text) fd.append("category_text", form.category_text);
        if (form.brandMode === "brand" && form.brand_id) fd.append("brand_id", form.brand_id);
        else if (form.brand_text) fd.append("brand_text", form.brand_text);

        // Track which existing images were removed (only for update)
        if (editing) {
          const existingUrls = (editing.images ?? []).map((img) => typeof img === "string" ? img : img.image_url);
          const currentUrls = form.images.map((img) => img.preview);
          const removed = existingUrls.filter((url) => !currentUrls.includes(url));
          if (removed.length > 0) {
            fd.append("remove_images", JSON.stringify(removed));
          }
        }

        form.images.forEach((img) => {
          if (img.file) {
            fd.append("images[]", img.file, img.file.name);
          }
        });

        const editId = editing?.id;
        if (editId) {
          response = await apiFor("user").post(`/user/furnitures/${editId}`, fd);
        } else {
          response = await apiFor("user").post("/user/furnitures", fd);
        }
      } else {
        const payload: Record<string, unknown> = {
          name: form.name,
          description: form.description || undefined,
          images: form.images.map((img) => img.preview),
        };
        if (form.categoryMode === "category" && form.category_id) payload.category_id = form.category_id;
        else payload.category_text = form.category_text;
        if (form.brandMode === "brand" && form.brand_id) payload.brand_id = form.brand_id;
        else payload.brand_text = form.brand_text;

        const current = editing;
        const editId: string | undefined = current ? current.id : undefined;
        if (editId) {
          response = await apiFor("user").put(`/user/furnitures/${editId}`, payload);
        } else {
          response = await apiFor("user").post("/user/furnitures", payload);
        }
      }

      toast.success(editing ? "Furnitur berhasil diperbarui." : "Furnitur berhasil ditambahkan.");
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(extractErrorMessage(err, "Gagal menyimpan furnitur."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(f: Furniture) {
    const ok = await confirm("Hapus furnitur", `Hapus "${f.name}" dari daftar furnitur Anda?`, true);
    if (!ok) return;
    try {
      await apiFor("user").delete(`/user/furnitures/${f.id}`);
      toast.success("Furnitur dihapus.");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menghapus furnitur."));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Milik Anda"
        title="Furnitur saya"
        description="Kelola furnitur yang bisa Anda tawarkan untuk ditukar."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah furnitur
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : furnitures.length === 0 ? (
        <EmptyState title="Belum ada furnitur" description="Tambahkan furnitur pertama Anda untuk mulai menukar." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {furnitures.map((f) => {
            const meta = FURNITURE_STATUS_META[f.status];
            const img = firstImage(f.images);
            const editable = f.status === "available" || f.status === "rejected";
            return (
              <div key={f.id} className="overflow-hidden rounded-md border border-line bg-surface">
                <div className="aspect-[4/3] w-full bg-paper-deep">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-ink-soft">
                      Tanpa gambar
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-base font-medium text-ink">{f.name}</p>
                    <Stamp label={meta.label} color={meta.color} bg={meta.bg} className="text-[10px]" />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {f.brand?.name ?? f.brand_text ?? "Tanpa brand"} ·{" "}
                    {f.category?.name ?? f.category_text ?? "Tanpa kategori"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" disabled={!editable} onClick={() => openEdit(f)}>
                      <Pencil className="size-3.5" />
                      Ubah
                    </Button>
                    <Button variant="ghost" size="sm" disabled={!editable} onClick={() => onDelete(f)}>
                      <Trash2 className="size-3.5" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Ubah furnitur" : "Tambah furnitur"}
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="Nama furnitur"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Kategori <span className="text-rust">*</span>
            </span>
            <div className="mb-2 flex gap-4 text-xs text-ink-soft">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={form.categoryMode === "category"}
                  onChange={() => setForm((f) => ({ ...f, categoryMode: "category" }))}
                />
                Pilih dari master
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={form.categoryMode === "brand"}
                  onChange={() => setForm((f) => ({ ...f, categoryMode: "brand" }))}
                />
                Tulis manual
              </label>
            </div>
            {form.categoryMode === "category" ? (
              <SelectField
                error={errors.category_id}
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">— Pilih kategori —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
            ) : (
              <TextField
                placeholder="mis. Kursi"
                error={errors.category_text}
                value={form.category_text}
                onChange={(e) => setForm((f) => ({ ...f, category_text: e.target.value }))}
              />
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Brand <span className="text-rust">*</span>
            </span>
            <div className="mb-2 flex gap-4 text-xs text-ink-soft">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={form.brandMode === "brand"}
                  onChange={() => setForm((f) => ({ ...f, brandMode: "brand" }))}
                />
                Pilih dari master
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={form.brandMode === "category"}
                  onChange={() => setForm((f) => ({ ...f, brandMode: "category" }))}
                />
                Tulis manual
              </label>
            </div>
            {form.brandMode === "brand" ? (
              <SelectField
                error={errors.brand_id}
                value={form.brand_id}
                onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
              >
                <option value="">— Pilih brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </SelectField>
            ) : (
              <TextField
                placeholder="mis. Custom"
                error={errors.brand_text}
                value={form.brand_text}
                onChange={(e) => setForm((f) => ({ ...f, brand_text: e.target.value }))}
              />
            )}
          </div>

          <TextareaField
            label="Deskripsi"
            hint="Opsional"
            value={form.description}
            error={errors.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <FileUploadField
            label="Gambar (File)"
            value={form.images}
            onChange={(images) => setForm((f) => ({ ...f, images }))}
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
