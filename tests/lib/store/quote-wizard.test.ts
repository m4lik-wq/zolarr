import { describe, it, expect, beforeEach } from 'vitest';
import { useQuoteWizardStore, INITIAL_FORM } from '@/lib/store/quote-wizard';

describe('useQuoteWizardStore', () => {
  beforeEach(() => {
    useQuoteWizardStore.setState({ step: 1, form: { ...INITIAL_FORM } });
  });

  it('starts at step 1', () => {
    expect(useQuoteWizardStore.getState().step).toBe(1);
  });

  it('next advances within bounds', () => {
    useQuoteWizardStore.getState().next();
    expect(useQuoteWizardStore.getState().step).toBe(2);
  });

  it('next does not exceed 7', () => {
    useQuoteWizardStore.setState({ step: 7 });
    useQuoteWizardStore.getState().next();
    expect(useQuoteWizardStore.getState().step).toBe(7);
  });

  it('prev decreases within bounds', () => {
    useQuoteWizardStore.setState({ step: 3 });
    useQuoteWizardStore.getState().prev();
    expect(useQuoteWizardStore.getState().step).toBe(2);
  });

  it('prev does not go below 1', () => {
    useQuoteWizardStore.getState().prev();
    expect(useQuoteWizardStore.getState().step).toBe(1);
  });

  it('setStep clamps to bounds', () => {
    useQuoteWizardStore.getState().setStep(10);
    expect(useQuoteWizardStore.getState().step).toBe(7);
    useQuoteWizardStore.getState().setStep(0);
    expect(useQuoteWizardStore.getState().step).toBe(1);
    useQuoteWizardStore.getState().setStep(4);
    expect(useQuoteWizardStore.getState().step).toBe(4);
  });

  it('updateForm merges partial fields', () => {
    useQuoteWizardStore.getState().updateForm({ contactName: 'Ali' });
    expect(useQuoteWizardStore.getState().form.contactName).toBe('Ali');
  });

  it('addAppliance pushes', () => {
    useQuoteWizardStore.getState().addAppliance({ name: 'Buzdolabı', consumptionKwh: 50 });
    expect(useQuoteWizardStore.getState().form.appliances).toHaveLength(1);
  });

  it('removeAppliance by index', () => {
    useQuoteWizardStore.getState().addAppliance({ name: 'A' });
    useQuoteWizardStore.getState().addAppliance({ name: 'B' });
    useQuoteWizardStore.getState().removeAppliance(0);
    expect(useQuoteWizardStore.getState().form.appliances).toHaveLength(1);
    expect(useQuoteWizardStore.getState().form.appliances[0]!.name).toBe('B');
  });

  it('reset returns to initial', () => {
    useQuoteWizardStore.getState().updateForm({ contactName: 'X' });
    useQuoteWizardStore.setState({ step: 5 });
    useQuoteWizardStore.getState().reset();
    expect(useQuoteWizardStore.getState().step).toBe(1);
    expect(useQuoteWizardStore.getState().form.contactName).toBe('');
  });

  it('hasInProgress returns true if step > 1 or any field touched', () => {
    expect(useQuoteWizardStore.getState().hasInProgress()).toBe(false);
    useQuoteWizardStore.getState().updateForm({ contactName: 'X' });
    expect(useQuoteWizardStore.getState().hasInProgress()).toBe(true);
  });
});
