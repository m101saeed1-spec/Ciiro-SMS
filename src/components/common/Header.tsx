import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from './Sidebar';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Check,
  X
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
  const { currentUser, activeRole, switchRole, logout, activeChildId, setActiveChildId } = useAuth();
  const { globalSearch, setGlobalSearch, notices, students } = useSchoolData();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roles: UserRole[] = ['Admin', 'Teacher', 'Student', 'Parent'];

  // Linked children options for Parent role
  const linkedChildren = currentUser.role === 'Parent' && currentUser.linkedStudentIds
    ? students.filter((s) => currentUser.linkedStudentIds?.includes(s.id))
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left section: Hamburger button & Universal Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar matching image: 'What do you want to find?' */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="What do you want to find?"
            className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl py-2.5 pl-4 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-2xs"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right section: Role switcher, Notifications, Chat, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pills (Desktop & Tablet) */}
        <div className="hidden md:flex items-center bg-slate-100/70 p-1 rounded-2xl border border-slate-200/50">
          <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">Role:</span>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeRole === r
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Parent Child Switcher (If Parent role with multiple children) */}
        {activeRole === 'Parent' && linkedChildren.length > 0 && (
          <div className="flex items-center gap-1.5 bg-purple-50/80 px-3 py-1.5 rounded-2xl border border-purple-200 text-purple-900 text-xs font-medium">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Child:</span>
            <select
              value={activeChildId}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {linkedChildren.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.class})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-full border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notices.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-purple-600 border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-800">School Notices</h4>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
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
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {n.priority}
                      </span>
                      <span className="text-[11px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{n.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{n.content}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  onNavigate('notice');
                  setIsNotifOpen(false);
                }}
                className="w-full mt-2 py-2 text-center text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
              >
                View All Notices
              </button>
            </div>
          )}
        </div>

        {/* Message / Chat Icon */}
        <button
          onClick={() => onNavigate('notice')}
          className="p-2.5 rounded-full border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Profile User Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-full border border-slate-200/80 hover:bg-slate-50 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-purple-700 font-mono font-bold block leading-tight">
                ID: {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-scale-up">
              <div className="p-3 border-b border-slate-100 bg-purple-50/50 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-purple-100/60">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700">
                    {currentUser.role} Account
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
                  </span>
                </div>
              </div>

              {/* Role Selection inside Mobile Dropdown */}
              <div className="p-2 border-b border-slate-100 md:hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                  Switch Active Role:
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold text-left flex items-center justify-between ${
                        activeRole === r ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r}
                      {activeRole === r && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate('account');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors mt-1"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Account Profile</span>
              </button>

              <button
                onClick={() => {
                  onOpenAuthModal();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Sign In / Switch Account</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1 border-t border-slate-100"
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
