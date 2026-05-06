import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stepper } from '@/components/teklif/stepper';

describe('Stepper', () => {
  it('marks completed and current steps', () => {
    render(<Stepper current={3} total={7} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(7);
    expect(steps[0]).toHaveAttribute('data-state', 'done');
    expect(steps[1]).toHaveAttribute('data-state', 'done');
    expect(steps[2]).toHaveAttribute('data-state', 'current');
    expect(steps[3]).toHaveAttribute('data-state', 'todo');
  });
});
