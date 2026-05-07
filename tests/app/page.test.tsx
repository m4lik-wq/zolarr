import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '@/app/page';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));
vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), { scrollPrev: vi.fn(), scrollNext: vi.fn() }],
}));
vi.mock('@/lib/db/queries/products', () => ({
  getFeaturedProducts: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/components/home/stock-products', () => ({
  StockProducts: () => (
    <section aria-labelledby="stock-heading">
      <h2 id="stock-heading">Stoktaki ürünler</h2>
    </section>
  ),
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
  ImpactCounter: () => null,
}));
vi.mock('@/components/landing/faq-snippet', () => ({
  FaqSnippet: () => null,
}));

describe('HomePage', () => {
  it('renders all 12 main section landmarks', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: /Faturanızdan kurtulun/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hangi yoldan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Neden Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /4 adımda/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Stoktaki ürünler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bize söyleyin/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Son projeler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sayılarla Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Müşterilerimiz ne diyor/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sık sorulan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Faturanızdan kurtulmak/i })).toBeInTheDocument();
  });
});
