// scripts/qa/routes.ts
export type RouteAuth = 'public' | 'user' | 'admin';
export type IdType = 'slug' | 'id';

export type SampleTable =
  | 'products'
  | 'projects'
  | 'faqs'
  | 'categories'
  | 'quotes'
  | 'dealer_applications'
  | 'contact_messages'
  | 'profiles'
  | 'suppliers';

export interface RouteSpec {
  path: string;
  slug: string;
  auth: RouteAuth;
  idFrom?: SampleTable;
  /** Default 'id' for admin routes; 'slug' for public dynamic routes. */
  idType?: IdType;
}

export const ROUTES: RouteSpec[] = [
  // Public
  { path: '/', slug: 'home', auth: 'public' },
  { path: '/magaza', slug: 'magaza-list', auth: 'public' },
  { path: '/magaza/[slug]', slug: 'magaza-detail', auth: 'public', idFrom: 'products', idType: 'slug' },
  { path: '/teklif', slug: 'teklif-hub', auth: 'public' },
  { path: '/teklif/al', slug: 'teklif-al', auth: 'public' },
  { path: '/teklif/ver', slug: 'teklif-ver', auth: 'public' },
  { path: '/galeri', slug: 'galeri-list', auth: 'public' },
  { path: '/galeri/[slug]', slug: 'galeri-detail', auth: 'public', idFrom: 'projects', idType: 'slug' },
  { path: '/hakkimizda', slug: 'hakkimizda', auth: 'public' },
  { path: '/iletisim', slug: 'iletisim', auth: 'public' },
  { path: '/sss', slug: 'sss', auth: 'public' },
  { path: '/ayarlar', slug: 'ayarlar', auth: 'public' },
  { path: '/kvkk', slug: 'kvkk', auth: 'public' },
  // Guest-only forms
  { path: '/giris', slug: 'giris', auth: 'public' },
  { path: '/kayit', slug: 'kayit', auth: 'public' },
  { path: '/sifremi-unuttum', slug: 'sifre-unuttum', auth: 'public' },
  // User
  { path: '/hesap', slug: 'hesap', auth: 'user' },
  { path: '/hesap/profil', slug: 'hesap-profil', auth: 'user' },
  { path: '/hesap/teklifler', slug: 'hesap-teklifler', auth: 'user' },
  { path: '/hesap/favoriler', slug: 'hesap-favoriler', auth: 'user' },
  { path: '/hesap/bildirimler', slug: 'hesap-bildirimler', auth: 'user' },
  { path: '/hesap/kvkk', slug: 'hesap-kvkk', auth: 'user' },
  { path: '/hesap/kvkk/sil', slug: 'hesap-kvkk-sil', auth: 'user' },
  { path: '/ayarlar/eposta', slug: 'ayarlar-eposta', auth: 'user' },
  // Admin
  { path: '/admin', slug: 'admin-dashboard', auth: 'admin' },
  { path: '/admin/teklifler', slug: 'admin-teklifler', auth: 'admin' },
  { path: '/admin/teklifler/[id]', slug: 'admin-teklif-detail', auth: 'admin', idFrom: 'quotes' },
  { path: '/admin/bayiler', slug: 'admin-bayiler', auth: 'admin' },
  { path: '/admin/bayiler/[id]', slug: 'admin-bayi-detail', auth: 'admin', idFrom: 'dealer_applications' },
  { path: '/admin/iletisim', slug: 'admin-iletisim', auth: 'admin' },
  { path: '/admin/iletisim/[id]', slug: 'admin-mesaj-detail', auth: 'admin', idFrom: 'contact_messages' },
  { path: '/admin/kullanicilar', slug: 'admin-kullanicilar', auth: 'admin' },
  { path: '/admin/urunler', slug: 'admin-urunler', auth: 'admin' },
  { path: '/admin/urunler/yeni', slug: 'admin-urun-yeni', auth: 'admin' },
  { path: '/admin/urunler/[id]', slug: 'admin-urun-edit', auth: 'admin', idFrom: 'products' },
  { path: '/admin/kategoriler', slug: 'admin-kategoriler', auth: 'admin' },
  { path: '/admin/kategoriler/yeni', slug: 'admin-kategori-yeni', auth: 'admin' },
  { path: '/admin/kategoriler/[id]', slug: 'admin-kategori-edit', auth: 'admin', idFrom: 'categories' },
  { path: '/admin/projeler', slug: 'admin-projeler', auth: 'admin' },
  { path: '/admin/projeler/yeni', slug: 'admin-proje-yeni', auth: 'admin' },
  { path: '/admin/projeler/[id]', slug: 'admin-proje-edit', auth: 'admin', idFrom: 'projects' },
  { path: '/admin/sss', slug: 'admin-sss', auth: 'admin' },
  { path: '/admin/sss/yeni', slug: 'admin-sss-yeni', auth: 'admin' },
  { path: '/admin/sss/[id]', slug: 'admin-sss-edit', auth: 'admin', idFrom: 'faqs' },
  { path: '/admin/tedarikciler', slug: 'admin-tedarikciler', auth: 'admin' },
  { path: '/admin/tedarikciler/yeni', slug: 'admin-tedarikci-yeni', auth: 'admin' },
  { path: '/admin/ai', slug: 'admin-ai', auth: 'admin' },
];
