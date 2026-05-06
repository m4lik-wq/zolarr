import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/lib/store/cart';

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('adds an item with default qty=1', () => {
    useCartStore.getState().addItem({
      productId: 'p1',
      slug: 'mono-550',
      name: 'Panel',
      priceTry: 6900,
      image: '/img.svg',
    });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]!.qty).toBe(1);
  });

  it('increments qty when adding existing item', () => {
    const item = {
      productId: 'p1',
      slug: 'mono-550',
      name: 'Panel',
      priceTry: 6900,
      image: '/img.svg',
    };
    useCartStore.getState().addItem(item, 2);
    useCartStore.getState().addItem(item, 1);
    expect(useCartStore.getState().items[0]!.qty).toBe(3);
  });

  it('setQty replaces value', () => {
    useCartStore.getState().addItem({
      productId: 'p1',
      slug: 'mono-550',
      name: 'Panel',
      priceTry: 6900,
      image: '/img.svg',
    });
    useCartStore.getState().setQty('p1', 5);
    expect(useCartStore.getState().items[0]!.qty).toBe(5);
  });

  it('removeItem deletes line', () => {
    useCartStore.getState().addItem({
      productId: 'p1',
      slug: 'mono-550',
      name: 'Panel',
      priceTry: 6900,
      image: '/img.svg',
    });
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('subtotal sums line totals', () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'p1', slug: 'a', name: 'A', priceTry: 1000, image: '' },
        2
      );
    useCartStore
      .getState()
      .addItem(
        { productId: 'p2', slug: 'b', name: 'B', priceTry: 500, image: '' },
        3
      );
    expect(useCartStore.getState().subtotal()).toBe(1000 * 2 + 500 * 3);
  });

  it('totalCount sums quantities', () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'p1', slug: 'a', name: 'A', priceTry: 1000, image: '' },
        2
      );
    useCartStore
      .getState()
      .addItem(
        { productId: 'p2', slug: 'b', name: 'B', priceTry: 500, image: '' },
        3
      );
    expect(useCartStore.getState().totalCount()).toBe(5);
  });
});
