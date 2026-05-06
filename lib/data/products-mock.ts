export interface MockProduct {
  slug: string;
  name: string;
  category: 'panel' | 'invertor' | 'batarya' | 'kit';
  priceTry: number;
  capacityKwp?: number;
  inStock: boolean;
  images: string[]; // 5 placeholder
  badges: ('Yeni' | 'Kampanya' | 'Çok Satan' | 'Stokta')[];
}

const placeholderImgs = [
  '/images/placeholder-panel-1.svg',
  '/images/placeholder-panel-2.svg',
  '/images/placeholder-panel-3.svg',
  '/images/placeholder-panel-4.svg',
  '/images/placeholder-panel-5.svg',
];

export const PRODUCTS_MOCK: MockProduct[] = [
  { slug: 'monokristal-550w', name: 'Monokristal 550W Panel', category: 'panel', priceTry: 6_900, capacityKwp: 0.55, inStock: true, images: placeholderImgs, badges: ['Çok Satan', 'Stokta'] },
  { slug: 'monokristal-450w', name: 'Monokristal 450W Panel', category: 'panel', priceTry: 5_400, capacityKwp: 0.45, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'invertor-5kw', name: 'Hibrit İnvertör 5kW', category: 'invertor', priceTry: 36_000, inStock: true, images: placeholderImgs, badges: ['Yeni'] },
  { slug: 'invertor-10kw', name: 'On-Grid İnvertör 10kW', category: 'invertor', priceTry: 64_000, inStock: false, images: placeholderImgs, badges: [] },
  { slug: 'batarya-5kwh', name: 'Lityum Batarya 5kWh', category: 'batarya', priceTry: 78_000, inStock: true, images: placeholderImgs, badges: ['Kampanya', 'Stokta'] },
  { slug: 'batarya-10kwh', name: 'Lityum Batarya 10kWh', category: 'batarya', priceTry: 145_000, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'kit-3kwp', name: 'Konut Kit 3kWp Anahtar Teslim', category: 'kit', priceTry: 89_000, capacityKwp: 3, inStock: true, images: placeholderImgs, badges: ['Çok Satan'] },
  { slug: 'kit-5kwp', name: 'Konut Kit 5kWp Anahtar Teslim', category: 'kit', priceTry: 139_000, capacityKwp: 5, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'kit-10kwp', name: 'Ticari Kit 10kWp', category: 'kit', priceTry: 269_000, capacityKwp: 10, inStock: false, images: placeholderImgs, badges: [] },
  { slug: 'panel-tracker', name: 'Tek Eksenli Tracker Sistemi', category: 'kit', priceTry: 42_000, inStock: true, images: placeholderImgs, badges: ['Yeni'] },
  { slug: 'kablo-set', name: 'Solar Kablo + Konnektör Seti', category: 'kit', priceTry: 4_500, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'mc4-konnektor', name: 'MC4 Konnektör (10 Çift)', category: 'kit', priceTry: 850, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
];
