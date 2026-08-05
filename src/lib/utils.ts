import { clsx, type ClassValue } from "clsx";
import { API_BASE_URL } from "./api";
import type { ProductImage, TransactionStatus, FurnitureStatus, ProductStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Resolve a possibly-relative storage path (`/storage/..`) to an absolute URL. */
export function resolveImage(url?: string | null): string | null {
  if (!url) return null;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");

  // Always re-anchor the URL to the API origin so the browser fetches from
  // the same host/port the API is actually served from. The API sometimes
  // returns an absolute URL with a different (or no) port — using that
  // directly would 404. We extract just the path component and rebuild.
  let path: string;
  try {
    // Absolute URL? Take only its pathname + search so the new origin wins.
    path = new URL(url, "http://placeholder").pathname + new URL(url, "http://placeholder").search;
  } catch {
    return null;
  }
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function firstImage(images: string[] | ProductImage[] | undefined): string | null {
  if (images && images.length > 0) {
    const first = images[0];
    const raw = typeof first === "string" ? first : first.image_url;
    const resolved = resolveImage(raw);
    if (resolved) return resolved;
  }
  return null;
}

export function firstStaticImage(product: {
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  images?: string[] | ProductImage[];
}): string | null {
  const fields = [product.image1, product.image2, product.image3, product.image4, product.image5, product.image6];
  for (const raw of fields) {
    if (raw) {
      const resolved = resolveImage(raw);
      if (resolved) return resolved;
    }
  }
  return firstImage(product.images);
}

export function imageList(images: string[] | ProductImage[] | undefined): string[] {
  if (!images) return [];
  return images.map((img) => resolveImage(typeof img === "string" ? img : img.image_url)).filter(Boolean) as string[];
}

export function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export const TRANSACTION_STATUS_META: Record<
  TransactionStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Menunggu", color: "var(--brass)", bg: "var(--brass-soft)" },
  checking: { label: "Diperiksa", color: "var(--denim)", bg: "var(--denim-soft)" },
  approved: { label: "Disetujui", color: "var(--moss)", bg: "var(--moss-soft)" },
  rejected: { label: "Ditolak", color: "var(--rust)", bg: "var(--rust-soft)" },
};

export const FURNITURE_STATUS_META: Record<FurnitureStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Tersedia", color: "var(--moss)", bg: "var(--moss-soft)" },
  in_transaction: { label: "Dalam Transaksi", color: "var(--denim)", bg: "var(--denim-soft)" },
  swapped: { label: "Sudah Ditukar", color: "var(--ink-soft)", bg: "var(--paper-deep)" },
  rejected: { label: "Ditolak", color: "var(--rust)", bg: "var(--rust-soft)" },
};

export const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Tersedia", color: "var(--moss)", bg: "var(--moss-soft)" },
  swapped: { label: "Sudah Ditukar", color: "var(--ink-soft)", bg: "var(--paper-deep)" },
  inactive: { label: "Nonaktif", color: "var(--rust)", bg: "var(--rust-soft)" },
};
