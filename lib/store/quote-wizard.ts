'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Appliance, InstallationLocation } from '@/lib/validation/quote-schema';

export interface WizardForm {
  contactName: string;
  city: string;
  district: string;
  installationLocation: InstallationLocation | '';
  locationNotes: string;
  appliances: Appliance[];
  description: string;
  contactPhone: string;
  contactEmail: string;
  contactTimePreference: 'morning' | 'afternoon' | 'evening' | 'any' | '';
  kvkkAccepted: boolean;
}

export const INITIAL_FORM: WizardForm = {
  contactName: '',
  city: '',
  district: '',
  installationLocation: '',
  locationNotes: '',
  appliances: [],
  description: '',
  contactPhone: '',
  contactEmail: '',
  contactTimePreference: '',
  kvkkAccepted: false,
};

interface State {
  step: number;
  form: WizardForm;
  next: () => void;
  prev: () => void;
  setStep: (n: number) => void;
  updateForm: (patch: Partial<WizardForm>) => void;
  addAppliance: (a: Appliance) => void;
  removeAppliance: (idx: number) => void;
  reset: () => void;
  hasInProgress: () => boolean;
}

const noopStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useQuoteWizardStore = create<State>()(
  persist(
    (set, get) => ({
      step: 1,
      form: { ...INITIAL_FORM },
      next: () => set((s) => ({ step: Math.min(7, s.step + 1) })),
      prev: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
      setStep: (n) => set(() => ({ step: Math.max(1, Math.min(7, n)) })),
      updateForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
      addAppliance: (a) =>
        set((s) => ({ form: { ...s.form, appliances: [...s.form.appliances, a] } })),
      removeAppliance: (idx) =>
        set((s) => ({
          form: { ...s.form, appliances: s.form.appliances.filter((_, i) => i !== idx) },
        })),
      reset: () => set({ step: 1, form: { ...INITIAL_FORM } }),
      hasInProgress: () => {
        const { step, form } = get();
        if (step > 1) return true;
        return Object.entries(form).some(([k, v]) => {
          if (k === 'appliances') return (v as Appliance[]).length > 0;
          if (typeof v === 'boolean') return v;
          return typeof v === 'string' && v.length > 0;
        });
      },
    }),
    {
      name: 'zolarr-quote-wizard',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage
      ),
    }
  )
);
