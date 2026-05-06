export const SITE = {
  name: 'Zolarr',
  tagline: 'Güneşten Geleceğe',
  description: 'Türkiye\'nin güvenilir güneş enerjisi sistemleri firması.',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Anasayfa' },
  { href: '/magaza', label: 'E-Mağaza' },
  { href: '/teklif', label: 'Teklif Al/Ver' },
  { href: '/galeri', label: 'Galeri & Projeler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
] as const;

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/zolarrenerji',
  linkedin: 'https://linkedin.com/company/zolarr',
  twitter: 'https://x.com/zolarr',
  youtube: 'https://youtube.com/@zolarrenerji',
  tiktok: 'https://tiktok.com/@zolarr',
  facebook: 'https://facebook.com/zolarrenerji',
} as const;

export const CONTACT = {
  address: 'Örnek Mah. Güneş Sok. No:42 Beşiktaş/İstanbul',
  phone: '+90 (212) 555 0 555',
  whatsapp: '+905555555555',
  email: 'info@zolarr.com.tr',
  social: {
    instagram: 'https://instagram.com/zolarr',
    linkedin: 'https://linkedin.com/company/zolarr',
    youtube: 'https://youtube.com/@zolarr',
    facebook: 'https://facebook.com/zolarr',
  },
} as const;

export const CALC = {
  ELECTRICITY_UNIT_PRICE: 3.20,
  SYSTEM_EFFICIENCY: 0.85,
  SYSTEM_COST_PER_KWP: 14000,
  INFLATION_FACTOR: 1.05,
} as const;
