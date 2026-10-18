export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  short: string;
  image: string;
  /** Category-specific attribute exposed as an extra filter */
  filterKey: string;
}

export interface Brand {
  slug: string;
  name: string;
  imageUrl: string;
  imagePath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Variant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  model: string;
  category: CategorySlug;
  /** Price in LKR cents (integer minor units) */
  priceCents: number;
  compareAtCents?: number | undefined;
  stock: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
  attributes: Record<string, string>;
  compatibility?: string[] | undefined;
  variants?: Variant[] | undefined;
  isNew?: boolean | undefined;
  featured?: boolean | undefined;
  /** Visibility controls (independent) */
  showPrice?: boolean | undefined;
  showQuantity?: boolean | undefined;
  showAvailability?: boolean | undefined;
  createdAt: string;
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export interface ProductQuery {
  q?: string;
  category?: CategorySlug;
  brands?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  attr?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}
