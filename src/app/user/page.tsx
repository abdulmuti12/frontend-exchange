"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { apiFor } from "@/lib/api";
import { firstImage, resolveImage } from "@/lib/utils";
import type { Brand, Category, Paginated, Product } from "@/lib/types";
import { Spinner, EmptyState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 9;

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 });

  useEffect(() => {
    apiFor("user")
      .get("/user/brands")
      .then(({ data }) => setBrands(data.data))
      .catch(() => {});
    apiFor("user")
      .get("/user/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    const params: Record<string, string | number> = { per_page: PAGE_SIZE };
    if (search) params.search = search;
    if (categoryId) params.category_id = categoryId;
    if (brandId) params.brand_id = brandId;
    if (page > 1) params.page = page;
    apiFor("user")
      .get("/user/products", { params })
      .then(({ data }) => {
        const paginated = data.data as Paginated<Product>;
        setProducts(paginated.items);
        setMeta(paginated.meta);
      })
      .catch(() => {
        setProducts([]);
        setMeta({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 });
      })
      .finally(() => setLoading(false));
  }

  // Reset to page 1 when filters change (debounced)
  useEffect(() => {
    setPage(1);
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, brandId]);

  // Reload when page changes (after the first page is already loaded)
  useEffect(() => {
    if (page > 1 || meta.current_page > 1) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handlePageChange(target: number) {
    if (target < 1 || target > meta.last_page) return;
    setPage(target);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-teak">Catalog</p>
          <h1 className="text-2xl text-ink sm:text-3xl">Explore Available Items</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">Select an item you want to swap with one of your furniture.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name..."
            className="w-full rounded-sm border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teak"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-sm border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-teak"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="rounded-sm border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-teak"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try changing keywords or search filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              // Try image1 first, then fall back to images table
              let img: string | null = null;
              if (p.image1) {
                img = resolveImage(p.image1);
              }
              if (!img && p.images?.length) {
                img = firstImage(p.images);
              }
              return (
                <Link
                  key={p.id}
                  href={`/user/products/${p.id}`}
                  className="group overflow-hidden rounded-md border border-line bg-surface transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-paper-deep">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-mono text-xs text-ink-soft">
                        Tanpa gambar
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-base text-ink">{p.name}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {p.brand?.name ?? "Unknown brand"} · {p.category?.name ?? "No category"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm text-ink-soft">
              <span>
                Showing {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} dari {meta.total} products
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.current_page <= 1}
                  onClick={() => handlePageChange(1)}
                  title="First page"
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.current_page <= 1}
                  onClick={() => handlePageChange(meta.current_page - 1)}
                  title="Previous page"
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
                  title="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => handlePageChange(meta.last_page)}
                  title="Last page"
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
