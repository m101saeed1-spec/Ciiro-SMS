import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { NavModule } from '../common/Sidebar';
import { OnboardingTour } from '../common/OnboardingTour';
import { ADMIN_ONBOARDING_TOUR_STEPS } from '../../data/tourSteps';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Award,
  Bell,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  BarChart2,
  School as SchoolIcon,
  TrendingUp,
  CalendarCheck,
  Target,
  Sparkles,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { CustomRechartsTooltip } from './CustomRechartsTooltip';

interface PrincipalDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool } = useAuth();
  const { tr } = useLanguage();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const {
    students,
    teachers,
    classes,
    subjects,
    exams,
    notices,
    attendance,
  } = useSchoolData();

  const [interactiveWidgetTab, setInteractiveWidgetTab] = useState<'attendance' | 'growth'>('attendance');

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalExams = exams.length;

  const currentTermName = activeSchool?.currentTerm || 'Term 1';
  const targetAttendancePercentage =
    activeSchool?.targetAttendanceRate ??
    activeSchool?.stats?.targetAttendanceRate ??
    95.0;

  // Real-time daily attendance trend
  const dailyAttendanceData = [
    { period: 'Mon', rate: 96.4, target: targetAttendancePercentage, termName: currentTermName },
    { period: 'Tue', rate: 98.1, target: targetAttendancePercentage, termName: currentTermName },
    { period: 'Wed', rate: 95.8, target: targetAttendancePercentage, termName: currentTermName },
    { period: 'Thu', rate: 97.4, target: targetAttendancePercentage, termName: currentTermName },
    { period: 'Fri', rate: 96.2, target: targetAttendancePercentage, termName: currentTermName },
  ];

  // Student performance growth trajectory across exam cycles
  const performanceGrowthData = [
    { assessment: 'Baseline Diagnostic', average: 81.2, topScore: 96, threshold: 50 },
    { assessment: 'Unit Quiz Series', average: 83.5, topScore: 98, threshold: 50 },
    { assessment: 'Mid-Term Exam', average: 86.4, topScore: 100, threshold: 50 },
    { assessment: 'Practical Labs', average: 89.1, topScore: 100, threshold: 50 },
    { assessment: 'Term 1 Finals', average: 87.8, topScore: 100, threshold: 50 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Principal Academic Header */}
      <div
        data-tour="admin-banner"
        className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] border border-[#1E3A63] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <SchoolIcon className="w-3.5 h-3.5" />
              <span>Academic Leadership</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="btn-gold"
              title={tr('Start interactive dashboard walkthrough', 'Bilow socdaalka hagaha')}
            >
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{tr('Take Admin Tour', 'Hagaha Maamulka')}</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Principal Academic Overview
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            Welcome, Principal {currentUser.name}. Supervising educational curriculum, student attendance roll, faculty performance, and official bulletins for {activeSchool?.name}.
          </p>

          <div data-tour="admin-quick-actions" className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('notice')}
              className="btn-gold"
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast Bulletin</span>
            </button>
            <button
              onClick={() => onNavigate('classes')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Class Sections ({totalClasses})</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Daily Attendance Roll</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div data-tour="admin-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes */}
        <div
          onClick={() => onNavigate('classes')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 px-2.5 py-1 rounded-lg">
              Active Sections
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalClasses}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Classes & Sections</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subjects.length} active courses</p>
          </div>
        </div>

        {/* Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-lg">
              On Duty
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalTeachers}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Teaching Faculty</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">All certified instructors</p>
          </div>
        </div>

        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              96.8% Avg
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalStudents}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Enrolled Scholars</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Attendance compliance high</p>
          </div>
        </div>

        {/* Exams Scheduled */}
        <div
          onClick={() => onNavigate('exams')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg">
              Term 1
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalExams}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Exams & Assessments</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Mid-term results pending</p>
          </div>
        </div>
      </div>

      {/* Interactive Principal Quick Insights Widget (Recharts) */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> High-Level Executive Telemetry
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {interactiveWidgetTab === 'attendance'
                ? 'Daily Attendance Rate Progression (Mon – Fri)'
                : 'Student Performance Growth Across Evaluation Cycles'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setInteractiveWidgetTab('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  interactiveWidgetTab === 'attendance'
                    ? 'bg-white dark:bg-slate-900 text-[#3B82F6] dark:text-[#60A5FA] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Daily Attendance</span>
              </button>
              <button
                type="button"
                onClick={() => setInteractiveWidgetTab('growth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  interactiveWidgetTab === 'growth'
                    ? 'bg-white dark:bg-slate-900 text-[#3B82F6] dark:text-[#60A5FA] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Performance Growth</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {interactiveWidgetTab === 'attendance' ? (
              <AreaChart data={dailyAttendanceData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="principalAttendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/70 dark:text-slate-800" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomRechartsTooltip type="attendance" termTarget={targetAttendancePercentage} />} />
                <ReferenceLine
                  y={targetAttendancePercentage}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: `Goal: ${targetAttendancePercentage}%`, position: 'insideTopRight', fill: '#059669', fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Attendance Rate"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#principalAttendanceGrad)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={performanceGrowthData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/70 dark:text-slate-800" />
                <XAxis dataKey="assessment" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomRechartsTooltip type="exam" />} />
                <ReferenceLine y={75} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Honors (75%)', position: 'insideTopLeft', fill: '#6366f1', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Cohort Mean Score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="topScore"
                  name="Distinction Ceiling"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#10b981', r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Section Breakdown & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Class Divisions</h3>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage Classes <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {cls.name} (Grade {cls.grade} - Section {cls.section})
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Room: {cls.room || 'Main Wing'} • Teacher: {cls.classTeacher || 'Assigned Staff'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#3B82F6] dark:text-[#60A5FA]">
                    {cls.studentCount || 28} Students
                  </span>
                  <span className="block text-[10px] text-slate-400">Capacity: {cls.capacity || 35}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Bulletins */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">School Notices & Bulletins</h3>
            </div>
            <button
              onClick={() => onNavigate('notice')}
              className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Post Notice <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                onClick={() => onNavigate('notice')}
                className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-[#122E52]/5 dark:hover:bg-[#122E52]/20 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      notice.priority === 'High'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]'
                    }`}
                  >
                    {notice.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400">{notice.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{notice.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Onboarding Tour for School Administrators */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        steps={ADMIN_ONBOARDING_TOUR_STEPS}
        tourKey="ileys_principal_tour_seen"
      />
    </div>
  );
};
