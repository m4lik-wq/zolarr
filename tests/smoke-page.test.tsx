import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import HomePage from '@/app/page';

describe('Anasayfa Smoke Test', () => {
  it('hata atmadan render eder', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    expect(screen.getByText(/Güneşten Geleceğe/i)).toBeInTheDocument();
  });

  it('CTA butonlarını gösterir', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    expect(screen.getByRole('link', { name: /ücretsiz teklif al/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mağazayı keşfet/i })).toBeInTheDocument();
  });
});
