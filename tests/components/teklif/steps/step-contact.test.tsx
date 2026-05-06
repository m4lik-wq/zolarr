import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/server-actions/submit-quote', () => ({
  submitQuote: vi.fn().mockResolvedValue({ ok: true, quoteNumber: 'ZQT-2026-ABCDE' }),
}));

import { StepContact } from '@/components/teklif/steps/step-contact';
import { useQuoteWizardStore, INITIAL_FORM } from '@/lib/store/quote-wizard';

describe('StepContact', () => {
  beforeEach(() =>
    useQuoteWizardStore.setState({
      step: 6,
      form: { ...INITIAL_FORM, contactName: 'X', city: 'İstanbul', installationLocation: 'roof' },
    })
  );

  it('shows kvkk error if not accepted', async () => {
    const user = userEvent.setup();
    render(<StepContact onSubmitted={vi.fn()} />);
    await user.type(screen.getByLabelText(/Telefon/i), '+905551112233');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.selectOptions(screen.getByLabelText(/Tercih edilen/i), 'morning');
    await user.click(screen.getByRole('button', { name: /Teklifi Gönder/i }));
    expect(await screen.findByText(/KVKK metnini onaylamanız gerekir/i)).toBeInTheDocument();
  });

  it('calls onSubmitted with quote number on success', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    render(<StepContact onSubmitted={onSubmitted} />);
    await user.type(screen.getByLabelText(/Telefon/i), '+905551112233');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.selectOptions(screen.getByLabelText(/Tercih edilen/i), 'morning');
    await user.click(screen.getByLabelText(/KVKK/));
    await user.click(screen.getByRole('button', { name: /Teklifi Gönder/i }));
    await new Promise((r) => setTimeout(r, 50));
    expect(onSubmitted).toHaveBeenCalledWith('ZQT-2026-ABCDE');
  });
});
