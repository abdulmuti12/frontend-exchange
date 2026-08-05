// Shared API types, mirrored from the Exchange Product API documentation.

export type TransactionStatus = "pending" | "checking" | "approved" | "rejected";
export type FurnitureStatus = "available" | "in_transaction" | "swapped" | "rejected";
export type ProductStatus = "available" | "swapped" | "inactive";
export type AdminStatus = "active" | "inactive";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: Record<string, string[]> | { [key: string]: string };
  status: number;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  status: AdminStatus;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  status: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

export interface ProductImage {
  id: string;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  status: ProductStatus;
  category?: Category | null;
  brand?: Brand | null;
  category_id?: string | null;
  brand_id?: string | null;
  images: string[] | ProductImage[];
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  created_at?: string;
}

export interface Furniture {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  status: FurnitureStatus;
  category_id?: string | null;
  category_text?: string | null;
  brand_id?: string | null;
  brand_text?: string | null;
  category?: Category | null;
  brand?: Brand | null;
  images: string[] | ProductImage[];
}

export interface Transaction {
  id: string;
  user_id: string;
  product_id: string;
  user_furniture_id: string;
  status: TransactionStatus;
  reject_reason?: string | null;
  created_at: string;
  updated_at?: string;
  user?: AppUser;
  product?: Product;
  user_furniture?: Furniture;
  admin?: Admin | null;
}

export interface Notification {
  id: string;
  user_id: string;
  transaction_id?: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  transaction_id: string;
  sender_id: string;
  sender_type: "admin" | "user";
  message: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_user_furnitures: number;
  total_items: number;
  total_transactions: number;
  transactions_by_status: Record<TransactionStatus, number>;
}
