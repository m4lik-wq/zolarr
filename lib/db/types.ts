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

export interface Project {
  id: string;
  slug: string;
  title: string;
  type: 'konut' | 'ticari' | 'tarim';
  location: string;
  capacityKwp: number;
  coverImage: string;
  description: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  galleryImages: string[];
  productSlugs: string[];
  customerQuote: string | null;
  customerName: string | null;
  annualSavingsTry: number | null;
  completionDate: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'genel' | 'teknik' | 'fiyat' | 'kurulum' | 'garanti';
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  messageNumber: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'moderator' | 'assistant' | 'admin';
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  address: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  userId: string;
  productId: string;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  userId: string;
  productId: string;
  email: string;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

export interface UserQuote {
  id: string;
  quoteNumber: string;
  city: string;
  installationLocation: string;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  estimatedKwp: number | null;
  estimatedSavingsTry: number | null;
  createdAt: string;
}
