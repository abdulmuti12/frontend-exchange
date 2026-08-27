"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { apiFor, extractErrorMessage, fieldErrors } from "@/lib/api";
import { PRODUCT_STATUS_META, resolveImage } from "@/lib/utils";
import type { Brand, Category, Product, ProductImage, ProductStatus, Paginated } from "@/lib/types";
import { PageHeader, Spinner, EmptyState, useConfirm } from "@/components/ui/Misc";
import { Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextareaField, SelectField } from "@/components/ui/Field";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

interface UploadedImage {
  name: string;
  preview: string;
  file: File | null;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  category_id: string;
  brand_id: string;
  status: ProductStatus;
  imageSlots: UploadedImage[];
  /** Number of image slots that existed when the form was opened (only set in edit mode). */
  initialImageSlotCount: number;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  brand_id: "",
  status: "available",
  imageSlots: [],
  initialImageSlotCount: 0,
};

function resolveImageUrl(imageUrl?: string | null): string | null {
  return resolveImage(imageUrl);
}

interface ProductsMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductsMeta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();

  function load() {
    setLoading(true);
    const params: Record<string, string | number> = { per_page: 15 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (page > 1) params.page = page;
    apiFor("admin")
      .get("/systemAdmin/products", { params })
      .then(({ data }) => {
        const paginated = data.data as Paginated<Product>;
        setProducts(paginated.items);
        setMeta(paginated.meta);
      })
      .catch(() => toast.error("Gagal memuat produk."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setPage(1);
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > 1 || meta.current_page > 1) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    apiFor("admin").get("/systemAdmin/categories").then(({ data }) => setCategories(data.data.items ?? data.data)).catch(() => {});
    apiFor("admin").get("/systemAdmin/brands").then(({ data }) => setBrands(data.data.items ?? data.data)).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    const slots: UploadedImage[] = [];
    const imgFields = [p.image1, p.image2, p.image3, p.image4, p.image5, p.image6];
    const fieldNames = ["image1", "image2", "image3", "image4", "image5", "image6"];
    for (let i = 0; i < imgFields.length; i++) {
      if (imgFields[i]) {
        slots.push({ name: fieldNames[i], preview: imgFields[i]!, file: null });
      }
    }
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price ? String(p.price) : "",
      category_id: p.category_id ?? p.category?.id ?? "",
      brand_id: p.brand_id ?? p.brand?.id ?? "",
      status: p.status,
      imageSlots: slots,
      initialImageSlotCount: slots.length,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function onSubmit() {
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        const fd = new FormData();
        // PATCH + FormData = PHP ignores the body. Use POST + _method spoofing instead.
        fd.append("_method", "PUT");
        fd.append("name", form.name);
        if (form.description) fd.append("description", form.description);
        if (form.price) fd.append("price", form.price);
        if (form.category_id) fd.append("category_id", form.category_id);
        if (form.brand_id) fd.append("brand_id", form.brand_id);
        fd.append("status", form.status);
        form.imageSlots.forEach((slot, i) => {
          if (slot.file) {
            fd.append(`image${i + 1}`, slot.file);
          }
        });

        // Clear any image slots that existed before but were removed by user clicking X
        const removedIndices: number[] = [];
        for (let i = 0; i < form.initialImageSlotCount; i++) {
          if (i >= form.imageSlots.length) {
            removedIndices.push(i);
          }
        }
        if (removedIndices.length > 0) {
          fd.append("cleared_image_slots", JSON.stringify(removedIndices));
        }

        await apiFor("admin").post(`/systemAdmin/products/${editing.id}`, fd);
        toast.success("Produk berhasil diperbarui.");
      } else {
        const fd = new FormData();
        fd.append("name", form.name);
        if (form.description) fd.append("description", form.description);
        if (form.price) fd.append("price", form.price);
        if (form.category_id) fd.append("category_id", form.category_id);
        if (form.brand_id) fd.append("brand_id", form.brand_id);
        fd.append("status", form.status);
        form.imageSlots.forEach((slot, i) => {
          if (slot.file) {
            fd.append(`image${i + 1}`, slot.file);
          }
        });

        await apiFor("admin").post("/systemAdmin/products", fd);
        toast.success("Produk berhasil ditambahkan.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(extractErrorMessage(err, "Gagal menyimpan produk."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(p: Product) {
    const ok = await confirm("Hapus produk", `Hapus "${p.name}" dari katalog?`, true);
    if (!ok) return;
    try {
      await apiFor("admin").delete(`/systemAdmin/products/${p.id}`);
      toast.success("Produk dihapus.");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal menghapus produk."));
    }
  }

  function handlePageChange(target: number) {
    if (target < 1 || target > meta.last_page) return;
    setPage(target);
  }

  const PAGE_SIZE = 15;
  const totalPages = Math.min(meta.last_page, Math.ceil(1000 / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        eyebrow="Katalog"
        title="Kelola produk"
        description="Barang yang tersedia bagi pengguna untuk ditukar."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah produk
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full rounded-sm border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teak"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-sm border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-teak"
        >
          <option value="">Semua status</option>
          <option value="available">Tersedia</option>
          <option value="swapped">Sudah ditukar</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState title="Belum ada produk" />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-display">Gambar</th>
                  <th className="px-4 py-3 font-display">Nama</th>
                  <th className="px-4 py-3 font-display">Kategori</th>
                  <th className="px-4 py-3 font-display">Brand</th>
                  <th className="px-4 py-3 font-display">Harga</th>
                  <th className="px-4 py-3 font-display">Status</th>
                  <th className="px-4 py-3 font-display text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const meta = PRODUCT_STATUS_META[p.status];
                  // Try image1 first, then fall back to images table
                  let imgUrl: string | null = null;
                  if (p.image1) {
                    imgUrl = resolveImageUrl(p.image1);
                  }
                  if (!imgUrl && Array.isArray(p.images) && p.images.length > 0) {
                    const firstImg = p.images[0];
                    imgUrl = typeof firstImg === "string"
                      ? resolveImageUrl(firstImg)
                      : resolveImageUrl((firstImg as ProductImage).image_url);
                  }
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgUrl} alt={p.name} className="size-12 rounded-sm object-cover" />
                        ) : (
                          <div className="size-12 rounded-sm bg-paper-deep" />
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        <div className="font-display text-ink">{p.name}</div>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{p.category?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-ink-soft">{p.brand?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-ink">
                        {p.price ? `Rp ${Number(p.price).toLocaleString('id-ID')}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Stamp label={meta.label} color={meta.color} bg={meta.bg} className="text-[10px]" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(p)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
            <span>
              Menampilkan {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} dari {meta.total} produk
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => handlePageChange(1)}
                title="Halaman pertama"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => handlePageChange(meta.current_page - 1)}
                title="Halaman sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="mx-2 min-w-[3ch] text-center">
                {meta.current_page} / {meta.last_page}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => handlePageChange(meta.current_page + 1)}
                title="Halaman selanjutnya"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => handlePageChange(meta.last_page)}
                title="Halaman terakhir"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Ubah produk" : "Tambah produk"}>
        <div className="flex flex-col gap-4">
          <TextField
            label="Nama produk"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <SelectField
            label="Kategori"
            value={form.category_id}
            error={errors.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">— Pilih kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Brand"
            value={form.brand_id}
            error={errors.brand_id}
            onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
          >
            <option value="">— Pilih brand —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Harga (opsional)"
            type="number"
            min="0"
            step="100"
            placeholder="Kosongkan jika gratis/swap murni"
            value={form.price}
            error={errors.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))}
          >
            <option value="available">Tersedia</option>
            <option value="swapped">Sudah ditukar</option>
            <option value="inactive">Nonaktif</option>
          </SelectField>
          <TextareaField
            label="Deskripsi"
            hint="Opsional"
            value={form.description}
            error={errors.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          {editing ? (
            <div className="rounded-md border border-line bg-paper-deep/40 p-3 text-xs text-ink-soft">
              ℹ️ Unggah gambar baru akan menggantikan gambar lama di slot tersebut. Slot kosong akan dikosongkan.
            </div>
          ) : null}
          <ImageUploadField
            label="Gambar Produk (Gambar 1–6)"
            value={form.imageSlots}
            onChange={(slots) => setForm((f) => ({ ...f, imageSlots: slots }))}
            maxSize={6}
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
