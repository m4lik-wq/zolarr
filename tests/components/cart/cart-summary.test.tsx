import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartSummary } from '@/components/cart/cart-summary';
import { useCartStore } from '@/lib/store/cart';

describe('CartSummary', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [
        { productId: 'p1', slug: 'a', name: 'A', priceTry: 1000, image: '', qty: 2 },
        { productId: 'p2', slug: 'b', name: 'B', priceTry: 500, image: '', qty: 1 },
      ],
    });
  });

  it('shows correct subtotal and shipping', () => {
    render(<CartSummary />);
    expect(screen.getByText(/2\.500/)).toBeInTheDocument(); // subtotal
    expect(screen.getByText(/250/)).toBeInTheDocument(); // shipping
    expect(screen.getByText(/2\.750/)).toBeInTheDocument(); // total
  });

  it('shows free shipping above threshold', () => {
    useCartStore.setState({
      items: [{ productId: 'p1', slug: 'a', name: 'A', priceTry: 6000, image: '', qty: 1 }],
    });
    render(<CartSummary />);
    expect(screen.getByText(/Ücretsiz/)).toBeInTheDocument();
  });
});
