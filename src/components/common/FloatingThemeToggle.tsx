import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const FloatingThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`fixed bottom-5 right-5 z-40 ${className}`}>
      <ThemeToggle />
    </div>
  );
};
