export interface MockBenefit {
  iconName: 'shield-check' | 'zap' | 'wrench' | 'leaf' | 'phone' | 'badge-percent';
  title: string;
  description: string;
}

export const BENEFITS_MOCK: MockBenefit[] = [
  { iconName: 'shield-check', title: 'Tier-1 Panel Kalitesi', description: 'Sadece üretim garantili, dünya çapında akredite üreticilerden panel kullanıyoruz.' },
  { iconName: 'zap', title: 'Hızlı Kurulum', description: 'Konut sistemi 2 günde, ticari 2 haftada kuruluma hazır. Süreç tamamen şeffaf.' },
  { iconName: 'badge-percent', title: '25 Yıl Üretim Garantisi', description: 'Panel performansı 25 yıl boyunca garantili, invertör 5 yıl ücretsiz değişim.' },
  { iconName: 'wrench', title: 'Anahtar Teslim', description: 'Keşiften ruhsata, kurulumdan dağıtım şirketi onayına tüm süreci biz yönetiyoruz.' },
  { iconName: 'leaf', title: 'Esnek Finansman', description: 'Banka kredisi, leasing veya peşin alternatifleri için uygun seçenekler sunuyoruz.' },
  { iconName: 'phone', title: '7/24 Destek Hattı', description: 'Mobil uygulama ile gerçek zamanlı izleme + uzman destek hattı her zaman aktif.' },
];
