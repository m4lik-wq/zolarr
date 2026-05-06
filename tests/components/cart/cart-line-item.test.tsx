import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartLineItem } from '@/components/cart/cart-line-item';
import { useCartStore } from '@/lib/store/cart';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={props.src} alt={props.alt} />;
  },
}));

const mockItem = {
  productId: 'p1',
  slug: 'panel',
  name: 'Panel',
  priceTry: 1000,
  image: '/img.svg',
  qty: 2,
};

describe('CartLineItem', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [mockItem] });
  });

  it('renders name, qty and line total', () => {
    render(<CartLineItem item={mockItem} />);
    expect(screen.getByText('Panel')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/2\.000/)).toBeInTheDocument();
  });

  it('increments qty via plus button', async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={mockItem} />);
    await user.click(screen.getByRole('button', { name: /Arttır/i }));
    expect(useCartStore.getState().items[0]!.qty).toBe(3);
  });

  it('removes item via trash button', async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={mockItem} />);
    await user.click(screen.getByRole('button', { name: /Sil/i }));
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
