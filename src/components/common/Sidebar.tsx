import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { UserAvatar } from './UserAvatar';
import { getInitials } from '../../utils/avatarUtils';
import { getRoleDisplayName } from '../../types';
import {
  Home,
  GraduationCap,
  Users,
  BookOpen,
  User,
  Layers,
  BookMarked,
  CalendarCheck,
  Award,
  Bell,
  X,
  Sparkles,
  CreditCard,
  CalendarDays,
  MessageSquare,
  Trophy,
  FileText,
  Download,
  Settings,
  ShieldCheck,
  Lock,
  History,
  Building2,
  DollarSign,
  Receipt,
  Clock,
  BarChart3,
  UserCheck,
} from 'lucide-react';

export type NavModule =
  | 'home'
  | 'schools'
  | 'headteachers'
  | 'headteacher'
  | 'students'
  | 'teachers'
  | 'chat'
  | 'fees'
  | 'fee-structure'
  | 'fee-invoices'
  | 'fee-payments'
  | 'fee-receipts'
  | 'fee-outstanding'
  | 'timetable'
  | 'library'
  | 'account'
  | 'class'
  | 'subject'
  | 'attendance'
  | 'exam'
  | 'notice'
  | 'profile'
  | 'ranking'
  | 'report'
  | 'downloads'
  | 'studybuddy'
  | 'gemini'
  | 'activities'
  | 'settings';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, activeRole, isSuperAdmin } = useAuth();
  const { unreadChatCount } = useSchoolData();

  // 1. OWNER PLATFORM NAVIGATION
  const platformOwnerNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'schools', label: 'Schools', icon: Building2 },
    { id: 'headteachers', label: 'Headteachers', icon: UserCheck },
    { id: 'account', label: 'Platform Users', icon: ShieldCheck },
    { id: 'ranking', label: 'Analytics', icon: BarChart3 },
    { id: 'report', label: 'Reports', icon: FileText },
    { id: 'activities', label: 'Activity / Audit Logs', icon: History },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  // 2. SCHOOL OWNER NAVIGATION
  const schoolOwnerNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'schools', label: 'School Overview', icon: Building2 },
    { id: 'account', label: 'Headteacher Management', icon: UserCheck },
    { id: 'fees', label: 'Financial Overview', icon: CreditCard },
    { id: 'report', label: 'School Performance Reports', icon: FileText },
    { id: 'notice', label: 'Announcements', icon: Bell },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  // 3. HEADTEACHER NAVIGATION
  const headteacherNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'class', label: 'Classes', icon: Layers },
    { id: 'subject', label: 'Subjects', icon: BookMarked },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'exam', label: 'Exams & Results', icon: Award },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'notice', label: 'Announcements', icon: Bell },
    { id: 'fees', label: 'Accounts / Fees', icon: CreditCard },
    { id: 'report', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // 4. TEACHER NAVIGATION
  const teacherNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'class', label: 'My Classes', icon: Layers },
    { id: 'students', label: 'My Students', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'exam', label: 'Exams & Results', icon: Award },
    { id: 'timetable', label: 'My Timetable', icon: CalendarDays },
    { id: 'notice', label: 'Announcements', icon: Bell },
  ];

  // 5. STUDENT NAVIGATION
  const studentNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'class', label: 'My Class', icon: Layers },
    { id: 'subject', label: 'My Subjects', icon: BookMarked },
    { id: 'teachers', label: 'My Teachers', icon: Users },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'exam', label: 'My Results', icon: Award },
    { id: 'timetable', label: 'My Timetable', icon: CalendarDays },
    { id: 'fees', label: 'My Fees', icon: CreditCard },
    { id: 'notice', label: 'Announcements', icon: Bell },
  ];

  // 6. ACCOUNTANT NAVIGATION
  const accountantNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students / Financial Records', icon: GraduationCap },
    { id: 'fee-structure', label: 'Fee Structure', icon: Layers },
    { id: 'fee-invoices', label: 'Fees', icon: CreditCard },
    { id: 'fee-payments', label: 'Payments', icon: DollarSign },
    { id: 'fee-receipts', label: 'Receipts', icon: Receipt },
    { id: 'fee-outstanding', label: 'Outstanding Fees', icon: Clock },
    { id: 'report', label: 'Financial Reports', icon: FileText },
  ];

  // Select navigation structure tailored strictly to active role (6 Canonical Roles)
  const getNavItemsForRole = (): NavItem[] => {
    switch (activeRole) {
      case 'SuperAdmin':
        return platformOwnerNavItems;
      case 'OwnerAdmin':
      case 'Admin':
        return schoolOwnerNavItems;
      case 'Principal':
        return headteacherNavItems;
      case 'Teacher':
        return teacherNavItems;
      case 'Student':
        return studentNavItems;
      case 'AccountAdmin':
        return accountantNavItems;
      default:
        return headteacherNavItems;
    }
  };

  const navItems = getNavItemsForRole();

  const isItemActive = (itemId: string): boolean => {
    if (activeModule === itemId) return true;
    if (itemId === 'settings' && activeModule === 'account') return true;
    if (itemId === 'account' && activeModule === 'settings') return true;
    if (itemId === 'fees' && activeModule.startsWith('fee-')) return true;
    if (itemId === 'schools' && activeModule === 'schools') return true;
    return false;
  };

  const handleNavClick = (id: NavModule) => {
    onSelectModule(id);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                sp<span className="text-purple-600 dark:text-purple-400">!</span>k
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block -mt-1">
                EduSpike
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Workspace Banner Indicator */}
        <div className="px-5 pt-3.5 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Workspace
            </span>
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              {getRoleDisplayName(activeRole)}
            </span>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);
            return (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => handleNavClick(item.id as NavModule)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    active ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile Badge Card */}
        <div className="p-3 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition-colors">
          <button
            onClick={() => handleNavClick('settings')}
            className="w-full flex items-center gap-3 text-left group cursor-pointer"
          >
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatar}
              size="sm"
              rounded="full"
              ring="ring-2 ring-purple-100 dark:ring-purple-900"
              status={currentUser.status || 'Active'}
              showStatus={true}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-400">
                  {currentUser.name}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/60 px-1 py-0.2 rounded leading-none">
                  [{getInitials(currentUser.name)}]
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {getRoleDisplayName(currentUser.role)}
                </span>
              </div>
            </div>
            <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
