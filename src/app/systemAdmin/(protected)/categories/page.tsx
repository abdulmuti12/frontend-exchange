"use client";

import { MasterDataManager } from "@/components/admin/MasterDataManager";

export default function AdminCategoriesPage() {
  return (
    <MasterDataManager
      resource="categories"
      singular="kategori"
      eyebrow="Master Data"
      title="Manage categories"
      description="Kategori membantu pengguna menyaring katalog dan furnitur mereka sendiri."
    />
  );
}
