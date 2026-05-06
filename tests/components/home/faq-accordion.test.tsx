import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from '@/components/home/faq-accordion';

describe('FaqAccordion', () => {
  it('renders 5 questions and reveals answer on click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion />);
    const triggers = screen.getAllByRole('button');
    expect(triggers.length).toBe(5);
    await user.click(triggers[0]!);
    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
  });
});
