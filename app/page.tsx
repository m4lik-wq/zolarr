import { Hero } from '@/components/landing/hero';
import { TrustStrip } from '@/components/landing/trust-strip';
import { HowItWorks } from '@/components/landing/how-it-works';
import { CampaignBanner } from '@/components/landing/campaign-banner';
import { FeaturedProducts } from '@/components/landing/featured-products';
import { CustomerStories } from '@/components/landing/customer-stories';
import { ImpactCounter } from '@/components/landing/impact-counter';
import { FaqSnippet } from '@/components/landing/faq-snippet';
import { FinalCta } from '@/components/landing/final-cta';
import { StickyCta } from '@/components/landing/sticky-cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <CampaignBanner />
      <FeaturedProducts />
      <CustomerStories />
      <ImpactCounter />
      <FaqSnippet />
      <FinalCta />
      <StickyCta />
    </>
  );
}
