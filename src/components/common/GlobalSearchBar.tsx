import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { GlobalSearchResult } from '../../types';
import { NavModule } from './Sidebar';
import {
  Search,
  X,
  GraduationCap,
  Users,
  Layers,
  BookMarked,
  BookOpen,
  Award,
  Bell,
  CreditCard,
  CalendarDays,
  User,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
} from 'lucide-react';

interface GlobalSearchBarProps {
  onNavigate: (module: NavModule) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onNavigate }) => {
  const { currentUser, getAuthHeaders, activeRole } = useAuth();
  const { globalSearch, setGlobalSearch } = useSchoolData();

  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results with backend RLS enforcement
  useEffect(() => {
    if (!globalSearch || globalSearch.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(globalSearch.trim())}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Error fetching global search:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [globalSearch, getAuthHeaders]);

  const handleSelectResult = (result: GlobalSearchResult) => {
    setIsOpen(false);
    setGlobalSearch('');
    onNavigate(result.targetModule as NavModule);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectResult(results[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Students':
        return <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Teachers':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Classes':
        return <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Subjects':
        return <BookMarked className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Books':
        return <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Exams':
        return <Award className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'Notices':
        return <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'Fees':
        return <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'Timetable':
        return <CalendarDays className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  // Group results by category
  const groupedResults: Record<string, GlobalSearchResult[]> = {};
  results.forEach((item) => {
    if (!groupedResults[item.category]) {
      groupedResults[item.category] = [];
    }
    groupedResults[item.category].push(item);
  });

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Bar */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={globalSearch}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search students, classes, books, notices..."
          className="w-full bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl py-2.5 pl-10 pr-20 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all shadow-2xs"
        />

        {/* Search Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        {/* Clear & Shortcut Badges */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {globalSearch && (
            <button
              onClick={() => {
                setGlobalSearch('');
                setResults([]);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Real-Time Dropdown Suggestions Modal */}
      {isOpen && (globalSearch.trim().length >= 2 || results.length > 0) && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-scale-up max-h-[440px] overflow-y-auto">
          {/* Header Info */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              Role Filtered Results ({activeRole})
            </span>
            <span>{results.length} found</span>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              Searching directory...
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No authorized records found matching &ldquo;{globalSearch}&rdquo;
            </div>
          ) : (
            <div className="py-1 space-y-3">
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <div className="px-3 pt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {category}
                  </div>
                  {items.map((item) => {
                    const globalIdx = results.findIndex((r) => r.id === item.id);
                    const isSelected = selectedIndex === globalIdx;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Keyboard instructions footer */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/40 rounded-b-xl">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Press Enter to jump to section
            </span>
            <span>Use ↑ ↓ to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
};
