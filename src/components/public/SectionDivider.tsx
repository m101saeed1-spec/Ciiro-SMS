import React from 'react';

interface SectionDividerProps {
  className?: string;
  withDot?: boolean;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  className = '',
  withDot = true,
}) => {
  return (
    <div className={`relative w-full max-w-5xl mx-auto my-12 sm:my-20 flex items-center justify-center px-4 ${className}`}>
      {/* Horizontal Gradient Line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-800/80 to-transparent relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F7A914]/30 dark:via-[#F7A914]/40 to-transparent" />
      </div>

      {/* Optional Subtle Central Accent Diamond/Dot */}
      {withDot && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#F7A914] dark:bg-[#F7A914] ring-4 ring-slate-50 dark:ring-[#0B1B32] shadow-xs shadow-[#F7A914]/40" />
        </div>
      )}
    </div>
  );
};
