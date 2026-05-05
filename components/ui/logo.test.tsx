import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('Zolarr metnini gösterir', () => {
    render(<Logo />);
    expect(screen.getByText('Zolarr')).toBeInTheDocument();
  });

  it('aria-label ile erişilebilir', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: /zolarr logo/i })).toBeInTheDocument();
  });

  it('showText=false ile metin gizlenebilir', () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText('Zolarr')).not.toBeInTheDocument();
  });
});
