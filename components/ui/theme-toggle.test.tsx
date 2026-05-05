import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('toggle butonunu render eder', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument();
  });
});
