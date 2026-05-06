import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const signInMock = vi.fn();
vi.mock('@/lib/auth/actions', () => ({
  signInAction: (...args: unknown[]) => signInMock(...args),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import { LoginForm } from '@/components/auth/login-form';

describe('LoginForm', () => {
  it('shows error message when server returns failure', async () => {
    signInMock.mockResolvedValueOnce({ ok: false, error: 'E-posta veya şifre hatalı.' });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/Şifre/i), 'X1abcdef');
    await user.click(screen.getByRole('button', { name: /Giriş Yap/i }));
    expect(await screen.findByText(/E-posta veya şifre hatalı/i)).toBeInTheDocument();
  });
});
