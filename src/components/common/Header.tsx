import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { NavModule } from './Sidebar';
import { getRoleDisplayName } from '../../types';
import { UserAvatar } from './UserAvatar';
import { LanguageToggle } from './LanguageToggle';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Lock,
  X,
  History,
  Sun,
  Moon,
  Sparkles,
  Building2,
  CheckCircle2,
  Globe,
  Fingerprint,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (module: NavModule) => void;
  onOpenAuthModal: () => void;
  onViewPublicWebsite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  onOpenAuthModal,
  onViewPublicWebsite,
}) => {
  const {
    currentUser,
    activeRole,
    activeSchool,
    schools,
    isSuperAdmin,
    setActiveSchoolId,
    logout,
    hasRegisteredBiometrics,
    isBiometricSupported,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notices, students, unreadChatCount } = useSchoolData();
  const { t, tx, tr, isSomali } = useLanguage();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);

  const getRoleBadgeStyle = () => {
    switch (activeRole) {
      case 'SuperAdmin':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'Principal':
        return 'bg-[#EFF6FF] text-[#1E40AF] border-[#DBEAFE]';
      case 'Teacher':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'Student':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#122E52]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E3A63] px-4 lg:px-8 py-3 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left section: Hamburger button & Universal Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl border border-slate-200 dark:border-[#1E3A63] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E3A63] lg:hidden transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>



        {/* Universal Global Search Bar */}
        <div data-tour="global-search" className="flex-1 max-w-md">
        </div>
      </div>

      {/* Right section */}
      <div data-tour="header-controls" className="flex items-center gap-2 sm:gap-3">
        {/* Authenticated Locked Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-[#1E3A63] text-xs font-bold transition-all shadow-2xs bg-slate-50/50 dark:bg-[#0B1B32]/50">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">{t.language === 'so' ? 'Doorka:' : 'Role:'}</span>
          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${getRoleBadgeStyle()}`} style={{ fontSize: '6px' }}>
            <Lock className="w-3 h-3" />
            {tx(getRoleDisplayName(activeRole))}
          </span>
        </div>

        {/* Public Website Switcher Button */}
        {onViewPublicWebsite && (
          <button
            type="button"
            onClick={onViewPublicWebsite}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-[#1E3A63] hover:border-[#3B82F6] text-xs font-bold text-[#122E52] dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A63] transition-all cursor-pointer shadow-2xs"
            title={tr('View Public Website', 'Eeg Websaydhka Guud')}
          >
            <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span style={{ fontSize: '0px' }}>{tr('Public Website', 'Websaydhka Guud')}</span>
          </button>
        )}

        {/* Bilingual Language Switcher */}
        <LanguageToggle variant="compact" />

        {/* Global Light / Dark Theme Toggle Button */}
        <button
          type="button"
          id="header-theme-toggle-btn"
          onClick={toggleTheme}
          className="relative p-2.5 rounded-full border border-slate-200/80 dark:border-[#1E3A63] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E3A63] hover:text-[#F7A914] transition-all cursor-pointer shadow-2xs group"
          title={isDark ? tr('Switch to Light Mode', 'U beddel Qaabka Cad') : tr('Switch to Dark Mode', 'U beddel Qaabka Madow')}
          aria-label="Toggle light/dark theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#F7A914] group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-[#122E52] group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Profile User Dropdown Pill */}
        <div data-tour="profile-menu" className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-full border border-slate-200/80 dark:border-[#1E3A63] hover:bg-slate-50 dark:hover:bg-[#1E3A63] transition-colors"
          >
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatar}
              size="md"
              status={currentUser.status || 'Active'}
              showStatus={true}
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-[#122E52] dark:text-white block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#3B82F6] font-mono font-bold block leading-tight">
                ID: {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#0B1B32] rounded-2xl shadow-xl border border-slate-100 dark:border-[#1E3A63] p-2 z-50 animate-scale-up">
              <div className="p-3 border-b border-slate-100 dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#122E52]/60 rounded-xl mb-2">
                <p className="text-xs font-bold text-[#122E52] dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-[#1E3A63]">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {tx(getRoleDisplayName(currentUser.role))}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#122E52] dark:text-slate-300 bg-white dark:bg-[#0B1B32] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1E3A63]">
                    {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate('account');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F7F9FC] dark:hover:bg-[#122E52] rounded-xl transition-colors mt-1 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#3B82F6]" />
                <span>{tr('Account Profile', 'Xogta Koontada')}</span>
              </button>

              {(activeRole === 'SuperAdmin' || activeRole === 'Principal') && (
                <button
                  onClick={() => {
                    onNavigate('activities' as NavModule);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F7F9FC] dark:hover:bg-[#122E52] rounded-xl transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-[#3B82F6]" />
                  <span>{t.activityAuditLogs}</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenAuthModal();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F7F9FC] dark:hover:bg-[#122E52] rounded-xl transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>{tr('Switch Account / Sign In', 'Beddel Koontada / Soo Gal')}</span>
              </button>

              {onViewPublicWebsite && (
                <button
                  onClick={() => {
                    onViewPublicWebsite();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F7F9FC] dark:hover:bg-[#122E52] rounded-xl transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#3B82F6]" />
                  <span>{tr('Visit Public Website', 'Tag Websaydhka Guud')}</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                  if (onViewPublicWebsite) {
                    onViewPublicWebsite();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors mt-1 border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

