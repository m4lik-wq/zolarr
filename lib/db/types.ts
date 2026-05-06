export type ProductTag =
  | 'kargo_bedava'
  | 'tercih_edilen'
  | 'yeni'
  | 'cok_satan'
  | 'premium'
  | 'kampanyada'
  | '5_yil_garantili';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand: string | null;
  sku: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  track_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  power_w: number | null;
  power_kwp: number | null;
  current_a: number | null;
  voltage_v: number | null;
  specs: Record<string, unknown>;
  images: string[];
  videos: string[];
  pdfs: string[];
  tags: string[];
  warranty_years: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface Database {
  public: {
    Tables: {
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
    };
  };
}
