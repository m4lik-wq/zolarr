import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TeklifLanding from '@/app/teklif/page';

describe('TeklifLanding', () => {
  it('renders Teklif Al and Teklif Ver cards', () => {
    render(<TeklifLanding />);
    expect(screen.getByRole('link', { name: /Teklif Al/i })).toHaveAttribute(
      'href',
      '/teklif/al'
    );
    expect(screen.getByRole('link', { name: /Bayi Başvurusu/i })).toHaveAttribute(
      'href',
      '/teklif/ver'
    );
  });
});
