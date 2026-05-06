export interface MockProject {
  slug: string;
  title: string;
  location: string;
  capacityKwp: number;
  type: 'Konut' | 'Ticari' | 'Tarım';
  coverImage: string;
}

export const PROJECTS_MOCK: MockProject[] = [
  { slug: 'antalya-villa', title: 'Antalya Villa', location: 'Antalya / Konyaaltı', capacityKwp: 12, type: 'Konut', coverImage: '/images/placeholder-project-1.svg' },
  { slug: 'konya-fabrika', title: 'Konya Mobilya Fabrikası', location: 'Konya / Selçuklu', capacityKwp: 250, type: 'Ticari', coverImage: '/images/placeholder-project-2.svg' },
  { slug: 'aydin-sera', title: 'Aydın Sera Sulama', location: 'Aydın / Söke', capacityKwp: 30, type: 'Tarım', coverImage: '/images/placeholder-project-3.svg' },
  { slug: 'istanbul-cati', title: 'İstanbul Çatı GES', location: 'İstanbul / Beykoz', capacityKwp: 15, type: 'Konut', coverImage: '/images/placeholder-project-4.svg' },
  { slug: 'kayseri-otel', title: 'Kayseri Termal Otel', location: 'Kayseri / Kocasinan', capacityKwp: 180, type: 'Ticari', coverImage: '/images/placeholder-project-5.svg' },
  { slug: 'sanliurfa-pompa', title: 'Şanlıurfa Tarımsal Pompaj', location: 'Şanlıurfa / Harran', capacityKwp: 50, type: 'Tarım', coverImage: '/images/placeholder-project-6.svg' },
];
