import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Sparkles
} from 'lucide-react';

export type NavModule =
  | 'home'
  | 'students'
  | 'teachers'
  | 'library'
  | 'account'
  | 'class'
  | 'subject'
  | 'attendance'
  | 'exam'
  | 'notice';

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
  const allNavItems = [
    { id: 'home', label: 'Home', icon: Home, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['Admin', 'Teacher', 'Parent'] },
    { id: 'teachers', label: 'Teachers', icon: Users, roles: ['Admin', 'Teacher'] },
    { id: 'library', label: 'Library', icon: BookOpen, roles: ['Admin', 'Teacher', 'Student'] },
    { id: 'account', label: 'Account', icon: User, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
    { id: 'class', label: 'Classes', icon: Layers, roles: ['Admin', 'Teacher'] },
    { id: 'subject', label: 'Subjects', icon: BookMarked, roles: ['Admin', 'Teacher', 'Student'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
    { id: 'exam', label: 'Exams & Grades', icon: Award, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
    { id: 'notice', label: 'Notices', icon: Bell, roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
  ];

  const { activeRole } = useAuth();
  const navItems = allNavItems.filter((item) => item.roles.includes(activeRole));

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
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-50">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-800">
                sp<span className="text-purple-600">!</span>k
              </span>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block -mt-1">
                EduSpike
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as NavModule)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Quick Card */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/60 text-center">
          <p className="text-xs font-semibold text-purple-900">Academic Term 2026</p>
          <p className="text-[11px] text-purple-600 mt-0.5">EduSpike System Active</p>
        </div>
      </aside>
    </>
  );
};
