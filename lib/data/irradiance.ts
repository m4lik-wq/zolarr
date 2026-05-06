// Yıllık ortalama global yatay güneşlenme (kWh/m²/yıl).
// Kaynak: PVGIS / GEPA verilerinin yaklaşık ortalaması — şablon değerlerdir,
// gerçek mühendislik için müşteri konumu PVGIS ile yeniden hesaplanmalıdır.

export interface IrradianceRow {
  province: string;
  kWhPerM2Year: number;
}

export const IRRADIANCE: IrradianceRow[] = [
  { province: 'Adana', kWhPerM2Year: 1700 },
  { province: 'Ankara', kWhPerM2Year: 1500 },
  { province: 'Antalya', kWhPerM2Year: 1750 },
  { province: 'Aydın', kWhPerM2Year: 1700 },
  { province: 'Balıkesir', kWhPerM2Year: 1500 },
  { province: 'Bursa', kWhPerM2Year: 1450 },
  { province: 'Denizli', kWhPerM2Year: 1650 },
  { province: 'Diyarbakır', kWhPerM2Year: 1700 },
  { province: 'Eskişehir', kWhPerM2Year: 1500 },
  { province: 'Gaziantep', kWhPerM2Year: 1700 },
  { province: 'Hatay', kWhPerM2Year: 1700 },
  { province: 'İstanbul', kWhPerM2Year: 1450 },
  { province: 'İzmir', kWhPerM2Year: 1700 },
  { province: 'Kayseri', kWhPerM2Year: 1600 },
  { province: 'Kocaeli', kWhPerM2Year: 1400 },
  { province: 'Konya', kWhPerM2Year: 1700 },
  { province: 'Manisa', kWhPerM2Year: 1700 },
  { province: 'Mersin', kWhPerM2Year: 1750 },
  { province: 'Muğla', kWhPerM2Year: 1700 },
  { province: 'Sakarya', kWhPerM2Year: 1400 },
  { province: 'Samsun', kWhPerM2Year: 1300 },
  { province: 'Şanlıurfa', kWhPerM2Year: 1750 },
  { province: 'Tekirdağ', kWhPerM2Year: 1450 },
  { province: 'Trabzon', kWhPerM2Year: 1250 },
  { province: 'Van', kWhPerM2Year: 1700 },
];

export const DEFAULT_IRRADIANCE = 1500;

export function findIrradiance(province: string): number {
  const row = IRRADIANCE.find((r) => r.province.toLocaleLowerCase('tr-TR') === province.toLocaleLowerCase('tr-TR'));
  return row?.kWhPerM2Year ?? DEFAULT_IRRADIANCE;
}
