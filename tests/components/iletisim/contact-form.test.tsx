import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/server-actions/submit-contact', () => ({
  submitContact: vi.fn().mockResolvedValue({ ok: true, messageNumber: 'MSG-2026-AAAAA' }),
}));

import { ContactForm } from '@/components/iletisim/contact-form';

describe('ContactForm', () => {
  it('shows error when KVKK is not accepted', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/Mesajınız/i), 'Bu en az on karakter mesaj.');
    await user.click(screen.getByRole('button', { name: /Gönder/i }));
    expect(
      await screen.findByText(/KVKK metnini onaylamanız gerekir/i)
    ).toBeInTheDocument();
  });

  it('shows success state after successful submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/Mesajınız/i), 'Bu en az on karakter mesaj.');
    await user.click(screen.getByLabelText(/KVKK aydınlatma/i));
    await user.click(screen.getByRole('button', { name: /Gönder/i }));
    expect(await screen.findByText(/MSG-2026-AAAAA/i)).toBeInTheDocument();
  });
});
