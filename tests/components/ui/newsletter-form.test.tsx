import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NewsletterForm } from '@/components/ui/newsletter-form';

describe('NewsletterForm', () => {
  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    await user.type(screen.getByLabelText(/E-posta/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /Abone ol/i }));
    expect(await screen.findByText(/Geçerli bir e-posta/)).toBeInTheDocument();
  });

  it('calls onSubmit and shows success on valid email', async () => {
    const user = userEvent.setup();
    const handler = vi.fn().mockResolvedValue(undefined);
    render(<NewsletterForm onSubscribe={handler} />);
    await user.type(screen.getByLabelText(/E-posta/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /Abone ol/i }));
    expect(handler).toHaveBeenCalledWith('test@example.com');
    expect(await screen.findByText(/Aboneliğiniz alındı/)).toBeInTheDocument();
  });
});
