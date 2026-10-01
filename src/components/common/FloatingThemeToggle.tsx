import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface FloatingThemeToggleProps {
  className?: string;
}

export const FloatingThemeToggle: React.FC<FloatingThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div
      className={`fixed bottom-6 left-6 lg:left-72 z-30 transition-transform duration-200 ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-black/40 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-purple-500/10 hover:ring-purple-500/30"
      >
        {isDark ? (
          <div className="w-6 h-6 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center transition-transform group-hover:rotate-45">
            <Sun className="w-4 h-4 fill-amber-400" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-xl bg-purple-600/15 text-purple-600 flex items-center justify-center transition-transform group-hover:-rotate-12">
            <Moon className="w-4 h-4 fill-purple-600" />
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none">
            Theme
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* Subtle status indicator dot */}
        <span
          className={`w-2 h-2 rounded-full ${
            isDark ? 'bg-amber-400 shadow-amber-400/50' : 'bg-purple-600 shadow-purple-600/50'
          } shadow-xs`}
        />
      </button>
    </div>
  );
};
