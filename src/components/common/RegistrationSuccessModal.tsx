import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, Info, Check } from 'lucide-react';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  name: string;
  role: string;
  ileysId: string;
  schoolName: string;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  name,
  role,
  ileysId,
  schoolName,
}) => {
  const { tr } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-scale-up">
        {/* Animated Green Checkmark Header (Screen 14) */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            {/* Confetti dot accents */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F7A914] animate-ping" />
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="absolute top-1/2 -right-3 w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {title || `${role} ${tr('Created Successfully!', 'Si Guul Leh Ayaa Loo Abuuray!')}`}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr('The school identity record has been provisioned.', 'Diiwaanka aqoonsiga dugsiga si guul leh ayaa loo keydiyay.')}
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-4 sm:p-5 text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{tr('Name:', 'Magaca:')}</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{name}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-[#1E3A63] pb-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{tr('Role:', 'Doorka:')}</span>
            <span className="font-extrabold text-[#3B82F6] dark:text-[#60A5FA]">{role}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-[#1E3A63] pb-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{tr('Ileys ID:', 'Ileys ID-ga:')}</span>
            <span className="font-mono font-black text-base text-[#12233F] dark:text-[#F7A914] bg-white dark:bg-[#12233F] px-2.5 py-0.5 rounded border border-[#F7A914]/40 text-[#122E52] dark:text-[#F7A914]">
              {ileysId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{tr('School:', 'Dugsiga:')}</span>
            <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{schoolName}</span>
          </div>
        </div>

        {/* Informational Callout (Screen 14 from Blueprint) */}
        <div className="p-3.5 rounded-2xl bg-[#EFF6FF] dark:bg-[#122E52]/40 border border-[#3B82F6]/30 text-[#1E40AF] dark:text-blue-300 text-xs text-left flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#3B82F6]" />
          <span className="leading-snug">
            {tr(
              'This 4-digit Ileys ID is used to identify the user’s school account after authentication.',
              '4-ta god ee Ileys ID waxaa loo isticmaalaa in lagu aqoonsado koontada dugsiga ee isticmaalaha ka dib markuu soo galo.'
            )}
          </span>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-gold w-full py-3.5 text-sm"
        >
          {tr('Done', 'Dhammee')}
        </button>
      </div>
    </div>
  );
};
