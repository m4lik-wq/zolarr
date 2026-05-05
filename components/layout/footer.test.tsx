import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './footer';

describe('Footer', () => {
  it('Zolarr metni footer\'da görünür', () => {
    render(<Footer />);
    expect(screen.getAllByText(/zolarr/i).length).toBeGreaterThan(0);
  });

  it('telif hakkı bilgisi gösterir', () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('sosyal medya bağlantıları içerir', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
  });

  it('iletişim bilgilerini gösterir', () => {
    render(<Footer />);
    expect(screen.getByText(/info@zolarr/i)).toBeInTheDocument();
  });
});
