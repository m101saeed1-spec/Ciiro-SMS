import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import {
  Building2,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  CalendarCheck,
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  Settings,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CustomRechartsTooltip } from './CustomRechartsTooltip';

interface OwnerAdminDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const OwnerAdminDashboard: React.FC<OwnerAdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool } = useAuth();
  const {
    students,
    teachers,
    classes,
    subjects,
    books,
    feeStructures,
    studentFees,
    studentFeeRecords,
    feePayments,
    activities,
  } = useSchoolData();

  // Financial Calculations for this school
  const feesList = studentFees || studentFeeRecords || [];
  const paymentsList = feePayments || [];
  const totalInvoiced = feesList.reduce((acc, r) => acc + (r.totalAmount || (r as any).netAmountDue || 0), 0);
  const totalCollected = paymentsList.reduce((acc, p) => acc + (p.amountPaid || (p as any).amount || 0), 0);
  const totalPending = Math.max(0, totalInvoiced - totalCollected);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

  // Student & Faculty Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active' || !s.status).length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  const currentTermName = activeSchool?.currentTerm || 'Term 1';
  const targetAttendancePercentage =
    activeSchool?.targetAttendanceRate ??
    activeSchool?.stats?.targetAttendanceRate ??
    95.0;

  const attendanceTrendData = [
    { day: 'Mon', rate: 96, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Tue', rate: 98, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Wed', rate: 95, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Thu', rate: 97, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Fri', rate: 96, target: targetAttendancePercentage, termName: currentTermName },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>{activeSchool?.name || 'School Executive Command'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            School Owner Executive Dashboard
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            Welcome, {currentUser.name}. You have complete management authority over {activeSchool?.name} ({activeSchool?.code}), academic faculty, school finances, and operational settings.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('account')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-purple-950" />
              <span>Headteacher & Staff Governance</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>School Finance & Fees</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>School Performance Reports</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>School Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('report')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              {activeStudents} Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalStudents}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Total Enrolled Scholars</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{totalClasses} registered classes</p>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('account')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
              Faculty Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalTeachers}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Teaching Faculty</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subjects.length} academic subjects</p>
          </div>
        </div>

        {/* Total Fee Revenue */}
        <div
          onClick={() => onNavigate('fees')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              {collectionRate}% Collected
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${totalCollected.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Fee Revenue Collected</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              ${totalPending.toLocaleString()} outstanding dues
            </p>
          </div>
        </div>

        {/* Academic Year Status */}
        <div
          onClick={() => onNavigate('settings')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              Operational
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeSchool?.academicYear || '2025-2026'}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Active Academic Session</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Term 1 / Semester 1</p>
          </div>
        </div>
      </div>

      {/* Staff Management Shortcuts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">School Administrative Hierarchy & Governance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              School Owner oversees Headteacher, Accountant, Faculty, and Student Body governance.
            </p>
          </div>
          <button
            onClick={() => onNavigate('account')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Provision Users <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Academic Lead</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Headteacher / Principal</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeSchool?.principalName || 'Dr. Eleanor Vance'}</p>
            <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-purple-200/70 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 text-[10px] font-bold">
              Active Head
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Finance & Fees</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Accountant Admin</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">David Vance (Bursar)</p>
            <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-emerald-200/70 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
              Active Bursar
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Teaching Faculty</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Faculty Instructors</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{totalTeachers} active educators</p>
            <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-blue-200/70 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 text-[10px] font-bold">
              All Rosters Filled
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Learners</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Enrolled Students</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{totalStudents} active learners</p>
            <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
              Academic Body
            </span>
          </div>
        </div>
      </div>

      {/* Attendance & Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Attendance Analytics</h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                  <Target className="w-3 h-3 text-emerald-500" />
                  Target: {targetAttendancePercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Average student attendance across classes ({currentTermName})</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ownerAttendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                <Tooltip
                  content={
                    <CustomRechartsTooltip
                      type="attendance"
                      termTarget={targetAttendancePercentage}
                    />
                  }
                />
                <ReferenceLine
                  y={targetAttendancePercentage}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Term Target: ${targetAttendancePercentage}%`,
                    position: 'top',
                    fill: '#059669',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#ownerAttendanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent School Activities */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent School Operations</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Faculty registrations & administrative updates</p>
            </div>
            <button
              onClick={() => onNavigate('activities')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{act.action}</p>
                  <p className="text-[11px] text-slate-400 truncate">{act.description}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
