import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  CheckCircle2,
  Printer,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface QuickExportItem {
  id: string;
  label: string;
  description?: string;
  format: 'csv' | 'pdf';
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void | Promise<void>;
  isPopular?: boolean;
}

export interface QuickExportMenuProps {
  label?: string;
  subtitle?: string;
  items: QuickExportItem[];
  align?: 'left' | 'right';
  variant?: 'gold' | 'navy' | 'outline' | 'compact';
  className?: string;
  badgeText?: string;
  disabled?: boolean;
}

export const QuickExportMenu: React.FC<QuickExportMenuProps> = ({
  label,
  subtitle,
  items,
  align = 'right',
  variant = 'outline',
  className = '',
  badgeText,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { tr, isSomali } = useLanguage();

  const displayLabel = label || tr('Quick Export', 'Dhoofin Degdeg ah');

  // Close menu on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = async (item: QuickExportItem) => {
    try {
      setDownloadingId(item.id);
      await item.onClick();
      // Brief success feedback before closing
      setTimeout(() => {
        setDownloadingId(null);
        setIsOpen(false);
      }, 400);
    } catch (err) {
      setDownloadingId(null);
      console.error('Quick Export Error:', err);
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'gold':
        return 'btn-gold text-xs py-2 px-3.5';
      case 'navy':
        return 'btn-navy text-xs py-2 px-3.5';
      case 'compact':
        return 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-xl border border-slate-200 dark:border-[#1E3A63] bg-white dark:bg-[#122E52] hover:bg-slate-50 dark:hover:bg-[#1E3A63] text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer';
      case 'outline':
      default:
        return 'btn-outline-navy text-xs py-2 px-3.5 shadow-2xs';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${getButtonClass()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={tr('Download formatted CSV or PDF reports', 'Soo dejiso warbixinnada CSV ama PDF')}
      >
        <Download className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#F7A914]" />
        <span>{displayLabel}</span>
        {badgeText && (
          <span className="ml-1 px-1.5 py-0.2 rounded-md bg-[#3B82F6]/15 dark:bg-[#F7A914]/20 text-[#3B82F6] dark:text-[#F7A914] text-[10px] font-mono font-extrabold uppercase">
            {badgeText}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-72 sm:w-80 bg-white dark:bg-[#0B1B32] rounded-2xl shadow-xl border border-slate-200 dark:border-[#1E3A63] p-2 z-50 animate-scale-up`}
          role="menu"
        >
          {/* Header Banner */}
          <div className="p-2.5 border-b border-slate-100 dark:border-[#1E3A63] mb-1.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#122E52] dark:text-[#F7A914] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F7A914]" />
                <span>{tr('Instant Data Downloads', 'Soo Dejinta Xogta')}</span>
              </span>
              {subtitle && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">
                  {subtitle}
                </p>
              )}
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#122E52] text-slate-600 dark:text-slate-300 font-bold">
              {items.length} {tr('Formats', 'Nooc')}
            </span>
          </div>

          {/* Export Items List */}
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => {
              const isDownloading = downloadingId === item.id;
              const isCSV = item.format === 'csv';
              const IconComponent = item.icon || (isCSV ? FileSpreadsheet : FileText);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  disabled={isDownloading}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#122E52]/80 transition-all flex items-start gap-3 cursor-pointer group border border-transparent hover:border-slate-200/60 dark:hover:border-[#1E3A63]"
                  role="menuitem"
                >
                  {/* Format Badge Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isCSV
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                    }`}
                  >
                    {isDownloading ? (
                      <div
                        className={`w-4 h-4 border-2 rounded-full animate-spin ${
                          isCSV ? 'border-emerald-600 border-t-transparent' : 'border-rose-600 border-t-transparent'
                        }`}
                      />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#3B82F6] dark:group-hover:text-[#F7A914] transition-colors truncate">
                        {item.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${
                          isCSV
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {item.format.toUpperCase()}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    {typeof item.count === 'number' && (
                      <span className="inline-block mt-1 text-[10px] text-slate-400 font-semibold">
                        {item.count} {isSomali ? 'diiwaanno la helay' : 'records available'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Tip Footer */}
          <div className="mt-1.5 pt-2 border-t border-slate-100 dark:border-[#1E3A63] px-2.5 py-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{tr('Instant UTF-8 & Vector PDF', 'Soo dejin degdeg ah oo sugan')}</span>
            <span className="font-mono text-[#3B82F6] font-bold">Ileys OS</span>
          </div>
        </div>
      )}
    </div>
  );
};
