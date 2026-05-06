import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const toggleMock = vi.fn();
vi.mock('@/lib/server-actions/favorites', () => ({
  toggleFavoriteAction: (...args: unknown[]) => toggleMock(...args),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { FavoriteButton } from '@/components/account/favorite-button';

describe('FavoriteButton', () => {
  it('shows guest message when no user', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton productId="p1" initialFavorited={false} loggedIn={false} />);
    await user.click(screen.getByRole('button', { name: /Favoriye/i }));
    expect(await screen.findByText(/Giriş yapın/i)).toBeInTheDocument();
  });

  it('toggles state on click when logged in', async () => {
    toggleMock.mockResolvedValueOnce({ ok: true, favorited: true });
    const user = userEvent.setup();
    render(<FavoriteButton productId="p1" initialFavorited={false} loggedIn={true} />);
    await user.click(screen.getByRole('button', { name: /Favoriye Ekle/i }));
    expect(await screen.findByRole('button', { name: /Favoriden Çıkar/i })).toBeInTheDocument();
  });
});
