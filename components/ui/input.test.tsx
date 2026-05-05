import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('placeholder gösterir', () => {
    render(<Input placeholder="Adınız" />);
    expect(screen.getByPlaceholderText('Adınız')).toBeInTheDocument();
  });

  it('kullanıcı yazdığında değer güncellenir', async () => {
    render(<Input placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test') as HTMLInputElement;
    await userEvent.type(input, 'Mehmet');
    expect(input.value).toBe('Mehmet');
  });

  it('disabled iken yazılamaz', () => {
    render(<Input placeholder="Test" disabled />);
    const input = screen.getByPlaceholderText('Test') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('error prop hata stilini uygular', () => {
    render(<Input placeholder="Test" error />);
    expect(screen.getByPlaceholderText('Test').className).toMatch(/danger/);
  });
});
