import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/galeri/galeri-grid-client', () => ({
  GaleriGridClient: () => <div data-testid="grid">grid</div>,
}));
vi.mock('@/lib/db/queries/projects', () => ({
  listProjects: vi.fn().mockResolvedValue([]),
}));

import GaleriPage from '@/app/galeri/page';

describe('GaleriPage', () => {
  it('renders header and grid client', async () => {
    const ui = await GaleriPage();
    render(ui);
    expect(screen.getByText(/Tamamlanan Projeler/i)).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });
});
