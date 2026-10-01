import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from './Sidebar';
import { getRoleDisplayName } from '../../types';
import { UserAvatar } from './UserAvatar';
import { GlobalSearchBar } from './GlobalSearchBar';
import { ThemeToggle } from './ThemeToggle';
import {
  Bell,
  MessageSquare,
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
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (module: NavModule) => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  onOpenAuthModal,
}) => {
  const {
    currentUser,
    activeRole,
    activeSchool,
    schools,
    isSuperAdmin,
    setActiveSchoolId,
    logout,
  } = useAuth();
  const { notices, students, unreadChatCount } = useSchoolData();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);

  const getRoleBadgeStyle = () => {
    switch (activeRole) {
      case 'SuperAdmin':
        return 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'OwnerAdmin':
        return 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Principal':
        return 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Teacher':
        return 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Student':
        return 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'AccountAdmin':
        return 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left section: Hamburger button & Universal Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active School Badge / Super Admin Switcher */}
        {activeSchool && (
          <div className="relative">
            <button
              onClick={() => isSuperAdmin && setIsSchoolMenuOpen(!isSchoolMenuOpen)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all ${
                isSuperAdmin
                  ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100 cursor-pointer'
                  : 'border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
            >
              <img
                src={activeSchool.logo}
                alt={activeSchool.name}
                className="w-5 h-5 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="max-w-[140px] truncate text-slate-900 dark:text-white font-extrabold text-[11px]">
                {activeSchool.name}
              </span>
              <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.2 rounded">
                {activeSchool.code}
              </span>
              {isSuperAdmin && <ChevronDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
            </button>

            {isSuperAdmin && isSchoolMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-scale-up">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch School Tenant
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {schools.map((sch) => (
                    <button
                      key={sch.id}
                      onClick={() => {
                        setActiveSchoolId(sch.id);
                        setIsSchoolMenuOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        sch.id === activeSchool.id
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{sch.name}</span>
                      <span className="text-[10px] font-mono text-purple-600 bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded">
                        {sch.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Universal Global Search Bar */}
        <GlobalSearchBar onNavigate={onNavigate} />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Authenticated Locked Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs bg-slate-50/50 dark:bg-slate-800/50">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">Role:</span>
          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${getRoleBadgeStyle()}`}>
            <Lock className="w-3 h-3" />
            {getRoleDisplayName(activeRole)}
          </span>
        </div>

        {/* Quick Theme Toggle */}
        <ThemeToggle compact={true} id="header-theme-toggle" />

        {/* Quick Gemini AI Assistant Launcher */}
        <button
          type="button"
          onClick={() => onNavigate('gemini')}
          className="relative p-2.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/80 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs"
          title="Open Gemini AI Platform Assistant"
        >
          <Sparkles className="w-4 h-4" />
          <span className="sr-only">Gemini AI</span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-full border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notices.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-purple-600 border-2 border-white dark:border-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">School Notices</h4>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-2 space-y-2.5 max-h-64 overflow-y-auto">
                {notices.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNavigate('notice');
                      setIsNotifOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        {n.priority}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{n.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1 line-clamp-1">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{n.content}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  onNavigate('notice');
                  setIsNotifOpen(false);
                }}
                className="w-full mt-2 py-2 text-center text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors"
              >
                View All Notices
              </button>
            </div>
          )}
        </div>

        {/* Faculty Chat Icon */}
        {(activeRole === 'Teacher' || activeRole === 'OwnerAdmin' || activeRole === 'Principal' || activeRole === 'Admin') && (
          <button
            onClick={() => onNavigate('chat')}
            className="relative p-2.5 rounded-full border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Faculty Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold text-white shadow-xs">
                {unreadChatCount}
              </span>
            )}
          </button>
        )}

        {/* Profile User Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatar}
              size="md"
              status={currentUser.status || 'Active'}
              showStatus={true}
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-mono font-bold block leading-tight">
                ID: {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-scale-up">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/40 rounded-xl mb-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-100/60 dark:border-purple-900/60">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
                  </span>
                </div>
              </div>

              {/* Theme Settings Selector */}
              <div className="px-3 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</span>
                </div>
                <ThemeToggle />
              </div>

              <button
                onClick={() => {
                  onNavigate('account');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors mt-1"
              >
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Account Profile</span>
              </button>

              {(activeRole === 'SuperAdmin' || activeRole === 'OwnerAdmin' || activeRole === 'Admin') && (
                <button
                  onClick={() => {
                    onNavigate('activities' as NavModule);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Activity & Audit Trail</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenAuthModal();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Switch Account / Sign In</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors mt-1 border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

