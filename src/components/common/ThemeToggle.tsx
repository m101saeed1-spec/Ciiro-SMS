import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { ThemeMode } from '../../types';

interface ThemeToggleProps {
  compact?: boolean;
  id?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, id = 'theme-toggle-btn' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    // If currently dark (or resolved as dark), switch to light, else dark
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (compact) {
    const isDark = resolvedTheme === 'dark';
    return (
      <button
        id={id}
        type="button"
        onClick={handleToggle}
        className="relative p-2.5 rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-purple-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    );
  }

  const modes: Array<{ id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = theme === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setTheme(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
