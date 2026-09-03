"use client";

import { MasterDataManager } from "@/components/admin/MasterDataManager";

export default function AdminCategoriesPage() {
  return (
    <MasterDataManager
      resource="categories"
      singular="kategori"
      eyebrow="Master Data"
      title="Manage categories"
      description="Categories help users filter their own catalog and furniture."
    />
  );
}
