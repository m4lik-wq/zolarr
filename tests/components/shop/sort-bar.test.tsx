import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SortBar } from '@/components/shop/sort-bar';

describe('SortBar', () => {
  it('emits change on search submit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortBar value={{ q: '', sort: 'recommended', view: 'grid' }} onChange={onChange} />);
    await user.type(screen.getByPlaceholderText(/Ürün ara/i), 'panel');
    await user.click(screen.getByRole('button', { name: /^Ara$/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ q: 'panel' }));
  });

  it('emits change on sort select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortBar value={{ q: '', sort: 'recommended', view: 'grid' }} onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText(/Sıralama/i), 'price_asc');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sort: 'price_asc' }));
  });
});
