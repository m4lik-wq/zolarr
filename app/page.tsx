import { Hero } from '@/components/landing/hero';
import { TrustStrip } from '@/components/landing/trust-strip';
import { HowItWorks } from '@/components/landing/how-it-works';
import { CampaignBanner } from '@/components/landing/campaign-banner';
import { FeaturedProducts } from '@/components/landing/featured-products';
import { CustomerStories } from '@/components/landing/customer-stories';
import { ProductSlider } from '@/components/home/product-slider';
import { PathCards } from '@/components/home/path-cards';
import { WhyZolarr } from '@/components/home/why-zolarr';
import { ProcessTimeline } from '@/components/home/process-timeline';
import { StockProducts } from '@/components/home/stock-products';
import { QuotePreview } from '@/components/home/quote-preview';
import { RecentProjects } from '@/components/home/recent-projects';
import { StatsCounters } from '@/components/home/stats-counters';
import { Testimonials } from '@/components/home/testimonials';
import { FaqAccordion } from '@/components/home/faq-accordion';
import { CtaNewsletter } from '@/components/home/cta-newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <CampaignBanner />
      <FeaturedProducts />
      <CustomerStories />
      <ProductSlider />
      <PathCards />
      <WhyZolarr />
      <ProcessTimeline />
      <StockProducts />
      <QuotePreview />
      <RecentProjects />
      <StatsCounters />
      <Testimonials />
      <FaqAccordion />
      <CtaNewsletter />
    </>
  );
}
