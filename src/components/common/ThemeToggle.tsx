import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
  id?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  compact = false,
  className = '',
  id,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F7A914] ${
        compact
          ? 'p-1.5 border border-[#E2E8F0] dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#0B1B32] hover:bg-white dark:hover:bg-[#122E52]'
          : 'p-2 border border-[#E2E8F0] dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#0B1B32] hover:bg-white dark:hover:bg-[#122E52] shadow-2xs hover:scale-105 active:scale-95'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#F7A914] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#122E52] transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
