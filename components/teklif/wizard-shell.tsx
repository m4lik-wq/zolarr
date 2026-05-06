'use client';

import * as React from 'react';
import { Stepper } from './stepper';
import { ResumePrompt } from './resume-prompt';
import { StepIntro } from './steps/step-intro';
import { StepPersonal } from './steps/step-personal';
import { StepLocation } from './steps/step-location';
import { StepAppliances } from './steps/step-appliances';
import { StepDescription } from './steps/step-description';
import { StepContact } from './steps/step-contact';
import { StepSuccess } from './steps/step-success';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';

export function WizardShell() {
  const { step, hasInProgress, reset, setStep } = useQuoteWizardStore();
  const [hydrated, setHydrated] = React.useState(false);
  const [resumeOpen, setResumeOpen] = React.useState(false);
  const [quoteNumber, setQuoteNumber] = React.useState<string | null>(null);

  React.useEffect(() => {
    setHydrated(true);
    if (hasInProgress() && step > 1) setResumeOpen(true);
  }, [hasInProgress, step]);

  if (!hydrated) {
    return <div className="h-[60vh] animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />;
  }

  if (quoteNumber) {
    return <StepSuccess quoteNumber={quoteNumber} />;
  }

  return (
    <>
      <ResumePrompt
        open={resumeOpen}
        onResume={() => setResumeOpen(false)}
        onReset={() => {
          reset();
          setResumeOpen(false);
        }}
      />
      <Stepper current={Math.min(step, 7)} total={7} className="mb-8" />
      <div>
        {step === 1 && <StepIntro />}
        {step === 2 && <StepPersonal />}
        {step === 3 && <StepLocation />}
        {step === 4 && <StepAppliances />}
        {step === 5 && <StepDescription />}
        {step === 6 && (
          <StepContact
            onSubmitted={(n) => {
              setQuoteNumber(n);
              setStep(7);
            }}
          />
        )}
      </div>
    </>
  );
}
