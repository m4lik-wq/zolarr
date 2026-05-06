import { SectionCard } from './section-card';
import { ContactInfoCard } from '@/components/iletisim/contact-info-card';
import { MapsEmbed } from '@/components/iletisim/maps-embed';

export function ContactInfoSection() {
  return (
    <SectionCard title="İletişim Bilgileri">
      <ContactInfoCard />
      <div className="mt-6">
        <MapsEmbed />
      </div>
    </SectionCard>
  );
}
