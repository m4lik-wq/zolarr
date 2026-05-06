export interface MockStat {
  label: string;
  value: number;
  suffix: string;
}

export const STATS_MOCK: MockStat[] = [
  { label: 'Kurulu Güç', value: 28, suffix: ' MW' },
  { label: 'Mutlu Müşteri', value: 1450, suffix: '+' },
  { label: 'Tamamlanan Proje', value: 320, suffix: '+' },
  { label: 'Yıllık Tasarruf', value: 42, suffix: ' Milyon TL' },
];
