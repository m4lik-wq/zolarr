import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PathCards } from '@/components/home/path-cards';

describe('PathCards', () => {
  it('renders three path cards with hrefs', () => {
    render(<PathCards />);
    expect(screen.getByRole('link', { name: /Konutum İçin/i })).toHaveAttribute('href', '/teklif/al?tip=konut');
    expect(screen.getByRole('link', { name: /İşyerim İçin/i })).toHaveAttribute('href', '/teklif/al?tip=ticari');
    expect(screen.getByRole('link', { name: /Tarımım İçin/i })).toHaveAttribute('href', '/teklif/al?tip=tarim');
  });
});
