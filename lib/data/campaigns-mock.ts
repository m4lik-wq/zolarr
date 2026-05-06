export interface MockCampaign {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: 'Kampanyaya Git' | 'İncele';
  href: string;
}

export const CAMPAIGNS_MOCK: MockCampaign[] = [
  { slug: 'bahar-3kwp', title: 'Bahar Kampanyası: 3kWp Sistem', subtitle: '%15 indirim + ücretsiz keşif', badge: 'Kampanya', cta: 'Kampanyaya Git', href: '/magaza/kampanya/bahar-3kwp' },
  { slug: 'tarim-paketi', title: 'Tarım Sulama Paketi', subtitle: 'Pompa + panel set', badge: 'Yeni', cta: 'İncele', href: '/magaza/kampanya/tarim-paketi' },
  { slug: 'ticari-10kwp', title: 'Ticari 10kWp Çözüm', subtitle: 'KOBİ\'ler için', badge: 'Popüler', cta: 'Kampanyaya Git', href: '/magaza/kampanya/ticari-10kwp' },
  { slug: 'batarya-yaz', title: 'Batarya Yaz İndirimi', subtitle: '5kWh batarya %20 indirim', badge: 'Kampanya', cta: 'Kampanyaya Git', href: '/magaza/kampanya/batarya-yaz' },
];
