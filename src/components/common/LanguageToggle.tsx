import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'button' | 'dropdown' | 'compact' | 'segmented';
  className?: string;
  showLabels?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'compact',
  className = '',
  showLabels = true,
}) => {
  const { language, setLanguage, toggleLanguage, t, tr } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'so' as const, name: 'Somali', nativeName: 'Af-Soomaali', flag: '🇸🇴' },
  ];

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-[#1E3A63] bg-white dark:bg-[#122E52] hover:bg-slate-50 dark:hover:bg-[#1E3A63] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
          title={`${t.switchLanguage} (${language === 'en' ? 'Af-Soomaali' : 'English'})`}
          aria-expanded={isOpen}
        >
          <span className="text-sm">{language === 'en' ? '🇺🇸' : '🇸🇴'}</span>
          <span className="uppercase text-[11px] font-black tracking-wide text-[#122E52] dark:text-[#F7A914]">
            {language.toUpperCase()}
          </span>
          <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0B1B32] rounded-2xl shadow-xl border border-slate-200 dark:border-[#1E3A63] p-1.5 z-50 animate-scale-up">
            <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-[#1E3A63] mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#F7A914]" />
                <span>{tr('Select Language', 'Dooro Luqadda')}</span>
              </span>
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                  language === lang.code
                    ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#122E52]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <span className="block text-xs font-extrabold">{lang.nativeName}</span>
                    <span className="block text-[10px] text-slate-400 font-medium">{lang.name}</span>
                  </div>
                </div>
                {language === lang.code && <Check className="w-4 h-4 text-[#F7A914]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A63] bg-white dark:bg-[#122E52] text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#3B82F6]" />
          <span>{language === 'en' ? 'English (US)' : 'Af-Soomaali'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0B1B32] rounded-2xl shadow-xl border border-slate-200 dark:border-[#1E3A63] p-1.5 z-50 animate-scale-up">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                  language === lang.code
                    ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#122E52]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {language === lang.code && <Check className="w-4 h-4 text-[#F7A914]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Segmented control variant
  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs ${className}`}
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            language === lang.code
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#122E52] dark:hover:text-[#F7A914]'
          }`}
        >
          <span>{lang.flag}</span>
          {showLabels && <span>{lang.nativeName}</span>}
        </button>
      ))}
    </div>
  );
};
