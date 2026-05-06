import { Eye, ShieldCheck, Sparkles, Sprout } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CompanyValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const VALUES_MOCK: CompanyValue[] = [
  {
    icon: Eye,
    title: 'Şeffaflık',
    description:
      'Teklif aşamasından devreye almaya kadar her adımı yazılı belgelendiriyoruz.',
  },
  {
    icon: ShieldCheck,
    title: 'Kalite',
    description:
      'Sadece TS EN sertifikalı malzeme; üretici garantisi haricinde kendi işçilik garantimizi sunuyoruz.',
  },
  {
    icon: Sparkles,
    title: 'Hız',
    description:
      'Konutta 2-4 iş günü içinde sistemi devreye alıyoruz; bürokratik süreçleri biz yönetiyoruz.',
  },
  {
    icon: Sprout,
    title: 'Sürdürülebilirlik',
    description:
      'Eski panel takip programıyla ekonomik ömrünü doldurmuş ekipmanları geri dönüştürüyoruz.',
  },
];
