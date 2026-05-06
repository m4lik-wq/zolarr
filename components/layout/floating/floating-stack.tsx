import { AiMount } from '@/components/ai/ai-mount';
import { WhatsAppButton } from './whatsapp-button';
import { MobileCta } from './mobile-cta';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { Toaster } from '@/components/ui/toaster';

export function FloatingStack() {
  return (
    <>
      <AiMount />
      <WhatsAppButton />
      <MobileCta />
      <CookieBanner />
      <Toaster />
    </>
  );
}
