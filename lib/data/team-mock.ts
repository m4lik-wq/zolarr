export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  photo: string;
}

export const TEAM_MOCK: TeamMember[] = [
  {
    name: 'Eren Arslan',
    title: 'Kurucu & CEO',
    bio: 'İTÜ Elektrik Mühendisliği. 15 yıl yenilenebilir enerji sektörü tecrübesi.',
    photo: '/images/placeholder-team-1.svg',
  },
  {
    name: 'Selin Demir',
    title: 'Teknik Direktör',
    bio: 'ODTÜ Enerji Sistemleri. Türkiye genelinde 50+ MW lik kurulum yönetti.',
    photo: '/images/placeholder-team-2.svg',
  },
  {
    name: 'Burak Çelik',
    title: 'Operasyon Müdürü',
    bio: 'Saha ekiplerinin koordinasyonu, malzeme tedariği ve süreç optimizasyonu.',
    photo: '/images/placeholder-team-3.svg',
  },
  {
    name: 'Aylin Yıldız',
    title: 'Müşteri Deneyimi Lideri',
    bio: 'Talep alma sürecinden bakım sonrası desteğe kadar müşteri yolculuğunu yönetir.',
    photo: '/images/placeholder-team-4.svg',
  },
];
