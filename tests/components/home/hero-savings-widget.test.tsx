import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { HeroSavingsWidget } from '@/components/home/hero-savings-widget';

describe('HeroSavingsWidget', () => {
  it('computes estimate when user fills bill and selects city', async () => {
    const user = userEvent.setup();
    render(<HeroSavingsWidget />);
    await user.type(screen.getByLabelText(/Aylık fatura/i), '800');
    await user.selectOptions(screen.getByLabelText(/Şehir/i), 'İstanbul');
    await user.click(screen.getByRole('button', { name: /Hesapla/i }));
    expect(await screen.findByText(/Tahmini sistem.*kWp/i)).toBeInTheDocument();
    expect(screen.getByText(/Yıllık tasarruf/i)).toBeInTheDocument();
    expect(screen.getByText(/Geri ödeme/i)).toBeInTheDocument();
  });

  it('shows validation error for empty bill', async () => {
    const user = userEvent.setup();
    render(<HeroSavingsWidget />);
    await user.click(screen.getByRole('button', { name: /Hesapla/i }));
    expect(await screen.findByText(/Aylık faturanızı/)).toBeInTheDocument();
  });
});
