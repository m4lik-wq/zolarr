import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '@/app/page';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));
vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), { scrollPrev: vi.fn(), scrollNext: vi.fn() }],
}));
vi.mock('@/components/landing/campaign-banner', () => ({
  CampaignBanner: () => null,
}));
vi.mock('@/components/landing/featured-products', () => ({
  FeaturedProducts: () => null,
}));
vi.mock('@/components/landing/customer-stories', () => ({
  CustomerStories: () => null,
}));
vi.mock('@/components/landing/impact-counter', () => ({
  ImpactCounter: () => (
    <section>
      <h2>Sayılarla Zolarr</h2>
    </section>
  ),
}));
vi.mock('@/components/landing/faq-snippet', () => ({
  FaqSnippet: () => (
    <section>
      <h2>Sıkça merak edilenler</h2>
    </section>
  ),
}));

describe('HomePage', () => {
  it('renders the editorial landing flow headings', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Faturanızdan kurtulun/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Çatınızdaki sistem/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sayılarla Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sıkça merak/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bugün başlayın/i })).toBeInTheDocument();
  });
});
