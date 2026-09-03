"use client";

import { MasterDataManager } from "@/components/admin/MasterDataManager";

export default function AdminBrandsPage() {
  return (
    <MasterDataManager
      resource="brands"
      singular="brand"
      eyebrow="Master Data"
      title="Manage brands"
      description="Brands serve as references when users or administrators add items."
    />
  );
}
