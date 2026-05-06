import type { Metadata } from 'next';
import { WizardShell } from '@/components/teklif/wizard-shell';

export const metadata: Metadata = {
  title: 'Teklif Al | Zolarr',
  description: '7 kısa adımda güneş enerjisi sisteminiz için kişiye özel teklif alın.',
};

export default function TeklifAlPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <WizardShell />
    </div>
  );
}
