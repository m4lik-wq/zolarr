import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FaqSearch } from '@/components/sss/faq-search';

describe('FaqSearch', () => {
  it('calls onChange after each keystroke', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FaqSearch value="" onChange={onChange} />);
    await user.type(screen.getByLabelText(/Soru ara/i), 'gar');
    expect(onChange).toHaveBeenCalledWith('g');
    expect(onChange).toHaveBeenCalledWith('a');
    expect(onChange).toHaveBeenCalledWith('r');
  });
});
