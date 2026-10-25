import React from 'react';

export type StatusType =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'paid'
  | 'unpaid'
  | 'partial'
  | 'pending'
  | 'overdue'
  | 'pass'
  | 'fail'
  | 'distinction'
  | 'credit'
  | 'active'
  | 'inactive'
  | 'approved'
  | 'rejected'
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'custom';

interface StatusBadgeProps {
  status: string | StatusType;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const normalizeStatus = (val: string): string => {
    return val.toLowerCase().trim();
  };

  const key = normalizeStatus(String(status));
  const displayText = label || status;

  // Theme-aware color styles satisfying WCAG 2.2 AA contrast in both light and dark modes
  let badgeStyles = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';

  if (['present', 'paid', 'pass', 'distinction', 'active', 'approved', 'completed'].includes(key)) {
    badgeStyles = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80';
  } else if (['absent', 'unpaid', 'fail', 'overdue', 'rejected', 'inactive'].includes(key)) {
    badgeStyles = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80';
  } else if (['late', 'partial', 'pending', 'excused', 'credit', 'upcoming', 'ongoing'].includes(key)) {
    badgeStyles = 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide transition-colors ${badgeStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full currentColor opacity-80" />
      <span>{displayText}</span>
    </span>
  );
};
