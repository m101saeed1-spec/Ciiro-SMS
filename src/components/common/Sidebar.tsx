import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import { getInitials } from '../../utils/avatarUtils';
import { getRoleDisplayName } from '../../types';
import { IleysBrandLogo } from './IleysBrandLogo';
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
  FileCheck,
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
  | 'assessments'
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
  const { t, tr } = useLanguage();

  const platformOwnerNavItems: NavItem[] = [
    { id: 'home', label: t.dashboard, icon: Home },
    { id: 'schools', label: t.schools, icon: Building2 },
    { id: 'ranking', label: t.analytics, icon: BarChart3 },
    { id: 'report', label: t.reports, icon: FileText },
    { id: 'activities', label: t.activityAuditLogs, icon: History },
    { id: 'settings', label: t.platformSettings, icon: Settings },
  ];

  // 2. PRINCIPAL NAVIGATION (School Administration)
  const headteacherNavItems: NavItem[] = [
    { id: 'home', label: t.dashboard, icon: Home },
    { id: 'students', label: t.students, icon: GraduationCap },
    { id: 'teachers', label: t.teachers, icon: Users },
    { id: 'class', label: t.classes, icon: Layers },
    { id: 'subject', label: t.subjects, icon: BookMarked },
    { id: 'attendance', label: t.attendance, icon: CalendarCheck },
    { id: 'exam', label: t.examsResults, icon: Award },
    { id: 'assessments', label: tr('Assessments', 'Imtixaanaadka'), icon: FileCheck },
    { id: 'timetable', label: t.timetable, icon: CalendarDays },
    { id: 'notice', label: t.announcements, icon: Bell },
    { id: 'fees', label: t.accountsFees, icon: CreditCard },
    { id: 'report', label: t.reports, icon: FileText },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  // 3. TEACHER NAVIGATION (Classrooms, Timetable & Salary Records)
  const teacherNavItems: NavItem[] = [
    { id: 'home', label: t.dashboard, icon: Home },
    { id: 'class', label: t.myClasses, icon: Layers },
    { id: 'students', label: t.myStudents, icon: GraduationCap },
    { id: 'attendance', label: t.attendance, icon: CalendarCheck },
    { id: 'exam', label: t.examsResults, icon: Award },
    { id: 'assessments', label: tr('Assessments', 'Imtixaanaadka'), icon: FileCheck },
    { id: 'timetable', label: t.myTimetable, icon: CalendarDays },
    { id: 'fees', label: 'Teacher Payments', icon: CreditCard },
    { id: 'notice', label: t.announcements, icon: Bell },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  // 4. STUDENT NAVIGATION (Academic Records & Fees)
  const studentNavItems: NavItem[] = [
    { id: 'home', label: t.dashboard, icon: Home },
    { id: 'class', label: t.myClass, icon: Layers },
    { id: 'subject', label: t.mySubjects, icon: BookMarked },
    { id: 'teachers', label: t.myTeachers, icon: Users },
    { id: 'attendance', label: t.myAttendance, icon: CalendarCheck },
    { id: 'exam', label: t.myResults, icon: Award },
    { id: 'assessments', label: tr('Assessments', 'Imtixaanaadka'), icon: FileCheck },
    { id: 'timetable', label: t.myTimetable, icon: CalendarDays },
    { id: 'fees', label: t.myFees, icon: CreditCard },
    { id: 'notice', label: t.announcements, icon: Bell },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  // Pick canonical navigation set based on user's active role
  const getNavItems = (): NavItem[] => {
    switch (activeRole) {
      case 'SuperAdmin':
        return platformOwnerNavItems;
      case 'Principal':
        return headteacherNavItems;
      case 'Teacher':
        return teacherNavItems;
      case 'Student':
        return studentNavItems;
      default:
        return headteacherNavItems;
    }
  };

  const navItems = getNavItems();

  const isItemActive = (itemId: string): boolean => {
    if (activeModule === itemId) return true;
    if (itemId === 'headteachers' && (activeModule === 'headteacher' || activeModule === 'headteachers')) return true;
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
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1B32]/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Dark Navy Premium Enterprise Sidebar */}
      <aside
        data-tour="sidebar-nav"
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#122E52] text-white border-r border-[#1E3A63] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E3A63]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <IleysBrandLogo size="md" variant="light" />
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E3A63] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Workspace Banner Indicator */}
        <div className="px-5 pt-3.5 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0B1B32]/60 border border-[#1E3A63] text-[11px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Workspace
            </span>
            <span className="font-extrabold text-[#F7A914]">
              {getRoleDisplayName(activeRole)}
            </span>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);
            return (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => handleNavClick(item.id as NavModule)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 relative cursor-pointer ${
                  active
                    ? 'bg-[#1E3A63] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-[#183B68] hover:text-white'
                }`}
              >
                {/* Gold Vertical Active Indicator Pill */}
                {active && (
                  <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#F7A914]" />
                )}

                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    active ? 'text-[#F7A914]' : 'text-slate-400'
                  }`}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className="bg-[#F7A914] text-[#12233F] text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="p-3 m-3 rounded-2xl bg-[#0B1B32]/70 border border-[#1E3A63] hover:bg-[#0B1B32] transition-colors">
          <button
            onClick={() => handleNavClick('settings')}
            className="w-full flex items-center gap-3 text-left group cursor-pointer"
          >
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatar}
              size="sm"
              rounded="full"
              ring="ring-2 ring-[#F7A914]/50"
              status={currentUser.status || 'Active'}
              showStatus={true}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate group-hover:text-[#F7A914] transition-colors">
                  {currentUser.name}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-[#F7A914] bg-[#1E3A63] px-1 py-0.2 rounded leading-none">
                  [{getInitials(currentUser.name)}]
                </span>
                <span className="text-[10px] font-semibold text-slate-300 truncate">
                  {getRoleDisplayName(currentUser.role)}
                </span>
              </div>
            </div>
            <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
