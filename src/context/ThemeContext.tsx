import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const THEME_STORAGE_KEY = 'ileys_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
      const legacy = localStorage.getItem('eduspike_theme') as ThemeMode | null;
      if (legacy === 'light' || legacy === 'dark') {
        return legacy;
      }
    } catch {
      // ignore
    }
    return 'light'; // Default to light mode for crisp enterprise feel
  });

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  }, [theme]);

  const applyTheme = useCallback((currentResolved: 'light' | 'dark') => {
    const root = document.documentElement;
    if (currentResolved === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  // Listen to system theme changes if theme === 'system'
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      localStorage.setItem('eduspike_theme', newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        localStorage.setItem('eduspike_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      isDark: resolvedTheme === 'dark',
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
