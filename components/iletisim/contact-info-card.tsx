import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

export function ContactInfoCard() {
  return (
    <ul className="space-y-4">
      <li className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <span>{CONTACT.address}</span>
      </li>
      <li className="flex items-start gap-3">
        <Phone className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <a href={`tel:${CONTACT.phone}`} className="hover:underline">
          {CONTACT.phone}
        </a>
      </li>
      <li className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <a href={`mailto:${CONTACT.email}`} className="hover:underline">
          {CONTACT.email}
        </a>
      </li>
      <li className="flex items-start gap-3">
        <MessageCircle className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <a
          href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          WhatsApp ile iletişim
        </a>
      </li>
    </ul>
  );
}
