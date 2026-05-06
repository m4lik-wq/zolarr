export interface MockProcessStep {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  iconName: 'search' | 'file-text' | 'hammer' | 'activity';
}

export const PROCESS_MOCK: MockProcessStep[] = [
  { number: 1, title: 'Keşif & Analiz', description: 'Konumunuzu, çatınızı ve faturanızı inceleriz. Ücretsiz yerinde ya da uzaktan keşif.', iconName: 'search' },
  { number: 2, title: 'Detaylı Teklif', description: 'Sistem boyutu, geri ödeme süresi ve finansman seçeneklerini şeffaf raporla sunarız.', iconName: 'file-text' },
  { number: 3, title: 'Profesyonel Kurulum', description: 'Sertifikalı ekibimiz panelleri ve invertörü 1–2 günde kurar, dağıtım şirketi onayını alır.', iconName: 'hammer' },
  { number: 4, title: 'İzleme & Bakım', description: 'Mobil uygulama ile üretimi anlık izleyin; yıllık ücretsiz bakım garantisi ile gönül rahatlığı.', iconName: 'activity' },
];
