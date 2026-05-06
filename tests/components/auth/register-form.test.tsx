import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const signUpMock = vi.fn();
vi.mock('@/lib/auth/actions', () => ({
  signUpAction: (...args: unknown[]) => signUpMock(...args),
}));

import { RegisterForm } from '@/components/auth/register-form';

describe('RegisterForm', () => {
  it('shows password mismatch error', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^Şifre$/i), 'X1abcdef');
    await user.type(screen.getByLabelText(/Şifre Tekrar/i), 'different1');
    await user.click(screen.getByLabelText(/KVKK/i));
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/i }));
    expect(await screen.findByText(/Şifreler eşleşmiyor/i)).toBeInTheDocument();
  });

  it('shows success state after server returns ok', async () => {
    signUpMock.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^Şifre$/i), 'X1abcdef');
    await user.type(screen.getByLabelText(/Şifre Tekrar/i), 'X1abcdef');
    await user.click(screen.getByLabelText(/KVKK/i));
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/i }));
    expect(await screen.findByText(/E-postanıza onay bağlantısı/i)).toBeInTheDocument();
  });
});
