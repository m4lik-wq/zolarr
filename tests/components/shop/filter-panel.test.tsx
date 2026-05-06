import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterPanel } from '@/components/shop/filter-panel';

describe('FilterPanel', () => {
  it('emits price range and stock toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel value={{ minPrice: '', maxPrice: '', tags: [], inStock: false }} onChange={onChange} />);
    await user.type(screen.getByLabelText(/Min fiyat/i), '100');
    await user.type(screen.getByLabelText(/Max fiyat/i), '5000');
    await user.click(screen.getByLabelText(/Sadece stoktakiler/i));
    await user.click(screen.getByRole('button', { name: /Filtreyi uygula/i }));
    expect(onChange).toHaveBeenCalledWith({ minPrice: '100', maxPrice: '5000', tags: [], inStock: true });
  });

  it('toggles tag chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel value={{ minPrice: '', maxPrice: '', tags: [], inStock: false }} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Kargo Bedava/i }));
    await user.click(screen.getByRole('button', { name: /Filtreyi uygula/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tags: ['kargo_bedava'] }));
  });
});
