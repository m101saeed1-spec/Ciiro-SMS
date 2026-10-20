import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Compass,
  ArrowRight,
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  titleEn: string;
  titleSo: string;
  descEn: string;
  descSo: string;
  badgeEn?: string;
  badgeSo?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
  tourKey?: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  steps,
  tourKey = 'ileys_admin_onboarding_tour',
}) => {
  const { tr, isSomali } = useLanguage();
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 100, left: 100 });

  const currentStep = steps[currentStepIdx] || steps[0];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === steps.length - 1;

  // Update target rect and position tooltip
  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Tooltip position calculation
      const tooltipWidth = Math.min(380, window.innerWidth - 32);
      const tooltipHeight = 220;
      const placement = currentStep.placement || 'bottom';

      let top = rect.bottom + 16;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      if (placement === 'top') {
        top = Math.max(16, rect.top - tooltipHeight - 16);
      } else if (placement === 'bottom') {
        top = rect.bottom + 16;
      } else if (placement === 'left') {
        left = Math.max(16, rect.left - tooltipWidth - 16);
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
      } else if (placement === 'right') {
        left = Math.min(window.innerWidth - tooltipWidth - 16, rect.right + 16);
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
      }

      // Boundary safety checks
      if (left < 16) left = 16;
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth - 16;
      }
      if (top + tooltipHeight > window.innerHeight - 16) {
        top = Math.max(16, rect.top - tooltipHeight - 16);
      }

      setTooltipPos({ top, left });
    } else {
      // Element not found - center modal
      setTargetRect(null);
      setTooltipPos({
        top: Math.max(80, window.innerHeight / 2 - 120),
        left: Math.max(16, window.innerWidth / 2 - 190),
      });
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const timer = setTimeout(updatePosition, 250);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, currentStepIdx, updatePosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          handleFinish();
        } else {
          setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
        }
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIdx, isLastStep, steps.length]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleFinish = () => {
    localStorage.setItem(tourKey, 'true');
    setCurrentStepIdx(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* 1. Backdrop SVG Mask with Spotlight Hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background fills the mask (visible backdrop) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black rectangle creates the transparent spotlight cutout */}
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.75)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Target Element Glowing Pulse Ring */}
      {targetRect && (
        <div
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
          className="absolute rounded-2xl border-2 border-[#F7A914] shadow-2xl shadow-[#F7A914]/40 pointer-events-none transition-all duration-300 animate-pulse"
        />
      )}

      {/* 2. Interactive Tooltip Card */}
      <div
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
          maxWidth: '380px',
        }}
        className="absolute w-[calc(100vw-32px)] sm:w-[380px] bg-white dark:bg-slate-900 rounded-3xl border border-[#1E3A63] shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up z-50 transition-all duration-200"
      >
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>
                {currentStep.badgeEn
                  ? tr(currentStep.badgeEn, currentStep.badgeSo || '')
                  : tr('Admin Quick Tour', 'Hagaha Maamulka')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono">
                {currentStepIdx + 1} / {steps.length}
              </span>
              <button
                type="button"
                onClick={handleFinish}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={tr('Exit tour', 'Ka bax')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Animated Horizontal Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#122E52] to-[#3B82F6] transition-all duration-300"
              style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
            {tr(currentStep.titleEn, currentStep.titleSo)}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {tr(currentStep.descEn, currentStep.descSo)}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline cursor-pointer"
          >
            {tr('Skip Tour', 'Ka Gudub')}
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{tr('Back', 'Dib')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="btn-gold"
            >
              <span>{isLastStep ? tr('Finish & Explore', 'Dhammee') : tr('Next Step', 'Ku Xiga')}</span>
              {isLastStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
