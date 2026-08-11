"use client";

import { MasterDataManager } from "@/components/admin/MasterDataManager";

export default function AdminBrandsPage() {
  return (
    <MasterDataManager
      resource="brands"
      singular="brand"
      eyebrow="Master Data"
      title="Kelola brand"
      description="Brand digunakan sebagai referensi saat pengguna maupun admin menambahkan barang."
    />
  );
}
