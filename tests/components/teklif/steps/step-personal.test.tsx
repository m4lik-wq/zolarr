import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { StepPersonal } from '@/components/teklif/steps/step-personal';
import { useQuoteWizardStore, INITIAL_FORM } from '@/lib/store/quote-wizard';

describe('StepPersonal', () => {
  beforeEach(() => useQuoteWizardStore.setState({ step: 2, form: { ...INITIAL_FORM } }));

  it('shows error if name empty when clicking devam', async () => {
    const user = userEvent.setup();
    render(<StepPersonal />);
    await user.click(screen.getByRole('button', { name: /Devam/i }));
    expect(screen.getByText(/İsim soyisim girin/i)).toBeInTheDocument();
  });

  it('advances to next step on valid input', async () => {
    const user = userEvent.setup();
    render(<StepPersonal />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet Yılmaz');
    await user.selectOptions(screen.getByLabelText('İl *'), 'İstanbul');
    await user.click(screen.getByRole('button', { name: /Devam/i }));
    expect(useQuoteWizardStore.getState().step).toBe(3);
  });
});
