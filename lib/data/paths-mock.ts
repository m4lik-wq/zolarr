export interface MockPath {
  slug: 'konut' | 'isyeri' | 'tarim';
  title: string;
  description: string;
  iconName: 'home' | 'building-2' | 'sprout';
  href: string;
}

export const PATHS_MOCK: MockPath[] = [
  { slug: 'konut', title: 'Konutum İçin', description: 'Çatınıza özel sistem, faturanızı sıfıra indirelim.', iconName: 'home', href: '/teklif/al?tip=konut' },
  { slug: 'isyeri', title: 'İşyerim İçin', description: 'Ticari ve endüstriyel sistemler, KDV avantajı dahil.', iconName: 'building-2', href: '/teklif/al?tip=ticari' },
  { slug: 'tarim', title: 'Tarımım İçin', description: 'Pompaj ve sulama için güvenilir off-grid çözümler.', iconName: 'sprout', href: '/teklif/al?tip=tarim' },
];
