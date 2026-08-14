import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { UserAvatar } from './UserAvatar';
import { getInitials } from '../../utils/avatarUtils';
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
} from 'lucide-react';

export type NavModule =
  | 'home'
  | 'students'
  | 'teachers'
  | 'chat'
  | 'fees'
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
  | 'activities';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
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
  const { currentUser, activeRole } = useAuth();
  const { unreadChatCount } = useSchoolData();

  // Dedicated Student Navigation Menu
  const studentNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'subject', label: 'My Subjects', icon: BookMarked },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'exam', label: 'My Results', icon: Award },
    { id: 'ranking', label: 'Exam Ranking', icon: Trophy },
    { id: 'timetable', label: 'My Timetable', icon: CalendarDays },
    { id: 'report', label: 'My Report Form', icon: FileText },
    { id: 'fees', label: 'My Fees', icon: CreditCard },
    { id: 'notice', label: 'Notices', icon: Bell },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'downloads', label: 'Download Center', icon: Download },
    { id: 'account', label: 'Account Settings', icon: Settings },
  ];

  // Standard Faculty & Administrative Navigation
  const staffAndParentNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'teachers', label: 'Teachers', icon: Users, roles: ['Admin', 'Teacher'] },
    {
      id: 'chat',
      label: 'Teacher Chat',
      icon: MessageSquare,
      roles: ['Admin', 'Teacher'],
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
    { id: 'fees', label: 'School Fees', icon: CreditCard, roles: ['Admin', 'Parent'] },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'library', label: 'Library', icon: BookOpen, roles: ['Admin', 'Teacher'] },
    { id: 'class', label: 'Classes', icon: Layers, roles: ['Admin', 'Teacher'] },
    { id: 'subject', label: 'Subjects', icon: BookMarked, roles: ['Admin', 'Teacher'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'exam', label: 'Exams & Grades', icon: Award, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'ranking', label: 'Exam Ranking', icon: Trophy, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'report', label: 'Report Forms', icon: FileText, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'notice', label: 'Notices', icon: Bell, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'activities', label: 'Audit Logs', icon: History, roles: ['Admin'] },
    { id: 'account', label: 'Account & Security', icon: ShieldCheck, roles: ['Admin', 'Teacher', 'Parent'] },
  ];

  const navItems = activeRole === 'Student'
    ? studentNavItems
    : staffAndParentNavItems.filter((item) => item.roles?.includes(activeRole));

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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as NavModule)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
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
            onClick={() => handleNavClick('account')}
            className="w-full flex items-center gap-3 text-left group"
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
                  {currentUser.role}
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

