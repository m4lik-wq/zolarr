import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('children içeriğini gösterir', () => {
    render(<Button>Tıkla</Button>);
    expect(screen.getByRole('button', { name: 'Tıkla' })).toBeInTheDocument();
  });

  it('onClick callback çağrılır', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Tıkla</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled iken tıklanamaz', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Tıkla</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('primary variant brand rengini uygular', () => {
    render(<Button variant="primary">Test</Button>);
    expect(screen.getByRole('button').className).toMatch(/brand/);
  });

  it('secondary variant glass efekti uygular', () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button').className).toContain('glass');
  });

  it('asChild ile başka bir element olarak render eder', () => {
    render(<Button asChild><a href="/test">Link</a></Button>);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
