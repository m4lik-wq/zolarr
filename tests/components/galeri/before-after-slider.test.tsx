import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BeforeAfterSlider } from '@/components/galeri/before-after-slider';

describe('BeforeAfterSlider', () => {
  it('renders both before and after images', () => {
    render(<BeforeAfterSlider before="/b.svg" after="/a.svg" alt="Test" />);
    const imgs = screen.getAllByAltText(/Test/i);
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute('src', '/b.svg');
    expect(imgs[1]).toHaveAttribute('src', '/a.svg');
  });

  it('renders the divider handle with role slider', () => {
    render(<BeforeAfterSlider before="/b.svg" after="/a.svg" alt="X" />);
    const handle = screen.getByRole('slider');
    expect(handle).toHaveAttribute('aria-label', expect.stringMatching(/Önce.*sonra/i));
  });
});
