'use client';

import * as React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = RadixAccordion.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Item>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Item
    ref={ref}
    className={cn('border-b border-[var(--color-border-glass)]', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      ref={ref}
      className={cn(
        'group flex w-full items-center justify-between py-5 text-left font-display text-lg font-medium transition-colors hover:text-[var(--color-brand)] data-[state=open]:text-[var(--color-brand)]',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Content>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className="overflow-hidden text-[var(--color-text-muted)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-5 pr-8 leading-relaxed', className)}>{children}</div>
  </RadixAccordion.Content>
));
AccordionContent.displayName = 'AccordionContent';
