import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface WizardStepDef {
  num: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface RegistrationWizardProps {
  title?: string;
  subtitle?: string;
  steps: WizardStepDef[];
  currentStep: number;
  onStepChange: (step: number) => void;
  validateStep: (stepNumber: number) => boolean | Promise<boolean>;
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitButtonLabel?: string;
  renderStepContent: (step: number) => React.ReactNode;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  validateStep,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  submitButtonLabel,
  renderStepContent,
}) => {
  const { currentLanguage } = useLanguage();
  const isSomali = currentLanguage === 'so';

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      onStepChange(Math.min(currentStep + 1, steps.length));
    }
  };

  const handleBack = () => {
    onStepChange(Math.max(currentStep - 1, 1));
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep < currentStep) {
      onStepChange(targetStep);
    } else if (targetStep === currentStep + 1) {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        onStepChange(targetStep);
      }
    }
  };

  return (
    <div className="flex flex-col max-h-[85vh] w-full max-w-2xl mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP STEPPER HEADER & PROGRESS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="px-6 pt-2 pb-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        {/* Progress Line */}
        <div className="relative mb-6">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-[#1E3A63] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#122E52] via-[#3B82F6] to-[#F7A914] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleStepClick(step.num)}
                disabled={step.num > currentStep && step.num !== currentStep + 1}
                className={`flex flex-col items-center text-center transition-all group ${
                  step.num < currentStep ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all mb-1.5 shadow-2xs ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] ring-4 ring-[#122E52]/20 dark:ring-[#F7A914]/30 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-[#12233F] text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight block ${
                    isCurrent
                      ? 'text-[#122E52] dark:text-[#F7A914]'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isSomali ? `Tallaabada ${step.num}` : `Step ${step.num}`}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-full font-medium">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DYNAMIC STEP CONTENT CANVAS (SCROLLABLE) */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-200">
        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {renderStepContent(currentStep)}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM ACTIONS & WIZARD NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1E3A63] flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#0B1B32]/70 rounded-b-2xl shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-outline-navy text-xs py-2 px-4 disabled:opacity-50"
        >
          {isSomali ? 'Ka noqo' : 'Cancel'}
        </button>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="btn-outline-navy text-xs py-2 px-4 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isSomali ? 'Dib u noqo' : 'Back'}</span>
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="btn-navy text-xs py-2.5 px-5 disabled:opacity-50"
            >
              <span>{isSomali ? 'Sii wad' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="btn-gold text-xs py-2.5 px-6 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#122E52] border-t-transparent rounded-full animate-spin" />
                  <span>{isSomali ? 'Waa la keydinayaa...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitButtonLabel || (isSomali ? 'Xaqiiji oo Diwaangeli' : 'Submit & Confirm')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
