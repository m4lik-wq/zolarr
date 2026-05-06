import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

describe('Accordion', () => {
  it('expands and collapses an item', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Soru 1</AccordionTrigger>
          <AccordionContent>Cevap içeriği</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: /Soru 1/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Cevap içeriği')).toBeVisible();
  });
});
