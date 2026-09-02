import { clsx, type ClassValue } from "clsx";
import { API_BASE_URL } from "./api";
import type { ProductImage, TransactionStatus, FurnitureStatus, ProductStatus } from "./types";

type ImageSource = {
  images?: string[] | ProductImage[];
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
};

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Resolve a possibly-relative storage path to an absolute URL. */
export function resolveImage(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  try {
    return new URL(url, API_BASE_URL).toString();
  } catch {
    return null;
  }
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

export function firstImageFromSource(source?: ImageSource): string | null {
  const fromImages = firstImage(source?.images);
  if (fromImages) return fromImages;

  const fields = [source?.image1, source?.image2, source?.image3, source?.image4, source?.image5, source?.image6];
  for (const raw of fields) {
    if (raw) {
      const resolved = resolveImage(raw);
      if (resolved) return resolved;
    }
  }
  return null;
}

export function firstStaticImage(product: ImageSource): string | null {
  return firstImageFromSource(product);
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
  pending: { label: "Pending", color: "var(--brass)", bg: "var(--brass-soft)" },
  checking: { label: "Checking", color: "var(--denim)", bg: "var(--denim-soft)" },
  approved: { label: "Approved", color: "var(--moss)", bg: "var(--moss-soft)" },
  rejected: { label: "Rejected", color: "var(--rust)", bg: "var(--rust-soft)" },
};

export const FURNITURE_STATUS_META: Record<FurnitureStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "var(--moss)", bg: "var(--moss-soft)" },
  in_transaction: { label: "In Transaction", color: "var(--denim)", bg: "var(--denim-soft)" },
  swapped: { label: "Swapped", color: "var(--ink-soft)", bg: "var(--paper-deep)" },
  rejected: { label: "Rejected", color: "var(--rust)", bg: "var(--rust-soft)" },
};

export const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "var(--moss)", bg: "var(--moss-soft)" },
  swapped: { label: "Swapped", color: "var(--ink-soft)", bg: "var(--paper-deep)" },
  inactive: { label: "Inactive", color: "var(--rust)", bg: "var(--rust-soft)" },
};
