import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '@/components/ui/product-card';
import { PRODUCTS_MOCK } from '@/lib/data/products-mock';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={props.src} alt={props.alt} />;
  },
}));

const sampleProduct = PRODUCTS_MOCK[0]!;

describe('ProductCard', () => {
  it('renders name, price and badges', () => {
    render(<ProductCard product={sampleProduct} />);
    expect(screen.getByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText(/6\.900/)).toBeInTheDocument();
    expect(screen.getByText('Çok Satan')).toBeInTheDocument();
  });

  it('shows "Stokta yok" + "Gelince Haber Ver" when out of stock', () => {
    const outOfStock = { ...sampleProduct, inStock: false, badges: [] as never[] };
    render(<ProductCard product={outOfStock} />);
    expect(screen.getByText(/Stokta yok/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gelince Haber Ver/i })).toBeInTheDocument();
  });

  it('cycles through images via next/prev controls', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={sampleProduct} />);
    const next = screen.getByRole('button', { name: /Sonraki görsel/i });
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('placeholder-panel-1'));
    await user.click(next);
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('placeholder-panel-2'));
  });
});
