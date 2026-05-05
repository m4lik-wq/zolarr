import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from './header';
import { NAV_LINKS } from '@/lib/constants';

describe('Header', () => {
  function renderWithProvider(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  }

  it('logo gösterir', () => {
    renderWithProvider(<Header />);
    expect(screen.getByText('Zolarr')).toBeInTheDocument();
  });

  it('tüm navigasyon bağlantılarını gösterir', () => {
    renderWithProvider(<Header />);
    NAV_LINKS.forEach((link) => {
      const elements = screen.getAllByText(link.label);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('tema değiştirici butonu gösterir', () => {
    renderWithProvider(<Header />);
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument();
  });

  it('sepet ikonu gösterir', () => {
    renderWithProvider(<Header />);
    expect(screen.getByRole('link', { name: /sepet/i })).toBeInTheDocument();
  });
});
