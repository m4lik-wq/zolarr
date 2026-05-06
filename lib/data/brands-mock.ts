export interface Brand {
  name: string;
  logo: string;
  category: 'panel' | 'invertor';
}

export const BRANDS_MOCK: Brand[] = [
  { name: 'Longi', logo: '/images/placeholder-brand-1.svg', category: 'panel' },
  { name: 'Trina Solar', logo: '/images/placeholder-brand-2.svg', category: 'panel' },
  { name: 'Canadian Solar', logo: '/images/placeholder-brand-3.svg', category: 'panel' },
  { name: 'REC', logo: '/images/placeholder-brand-4.svg', category: 'panel' },
  { name: 'Huawei', logo: '/images/placeholder-brand-5.svg', category: 'invertor' },
  { name: 'SMA', logo: '/images/placeholder-brand-6.svg', category: 'invertor' },
  { name: 'Solis', logo: '/images/placeholder-brand-7.svg', category: 'invertor' },
  { name: 'Growatt', logo: '/images/placeholder-brand-8.svg', category: 'invertor' },
];
