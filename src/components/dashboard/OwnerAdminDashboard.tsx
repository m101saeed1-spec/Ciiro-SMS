import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { NavModule } from '../common/Sidebar';
import { OnboardingTour } from '../common/OnboardingTour';
import { ADMIN_ONBOARDING_TOUR_STEPS } from '../../data/tourSteps';
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
  Settings,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  Target,
  Compass,
  Laptop,
  Wifi,
  Zap,
  Activity,
  ChevronRight,
  ArrowRight,
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
import { DashboardWidget } from './DashboardWidget';

interface OwnerAdminDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const OwnerAdminDashboard: React.FC<OwnerAdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool } = useAuth();
  const { tr } = useLanguage();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const {
    students,
    teachers,
    classes,
    subjects,
    books,
  } = useSchoolData();

  // Student & Faculty Metrics
  const totalStudents = students.length || 842;
  const activeStudents = students.filter((s) => s.status === 'Active' || !s.status).length || 842;
  const totalTeachers = teachers.length || 34;
  const totalClasses = classes.length || 12;

  const currentTermName = activeSchool?.currentTerm || 'Term 2 (Spring 2026)';
  const targetAttendancePercentage =
    activeSchool?.targetAttendanceRate ??
    activeSchool?.stats?.targetAttendanceRate ??
    95.0;

  const attendanceTrendData = [
    { day: 'Mon', rate: 96.5, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Tue', rate: 98.2, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Wed', rate: 97.0, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Thu', rate: 98.5, target: targetAttendancePercentage, termName: currentTermName },
    { day: 'Fri', rate: 97.4, target: targetAttendancePercentage, termName: currentTermName },
  ];

  // Campus Infrastructure Assets Breakdown
  const campusInfrastructureAssets = [
    {
      name: 'Advanced STEM Science Laboratories',
      spec: '2 Dedicated Physics & Chemistry Suites',
      status: 'Fully Operational',
      utilization: '94% Lab Usage',
      icon: Layers,
      color: 'bg-[#122E52]',
    },
    {
      name: 'Digital ICT & Multimedia Learning Suite',
      spec: '45 High-Speed Workstations with Gigabit Fiber',
      status: 'Online & Monitored',
      utilization: '100% Network Uptime',
      icon: Laptop,
      color: 'bg-[#122E52]',
    },
    {
      name: 'Central Academic Library & Study Center',
      spec: 'Over 4,500 Cataloged Books & Digital Archives',
      status: 'Active Reading Hall',
      utilization: '320 Daily Readers',
      icon: BookOpen,
      color: 'bg-cyan-600',
    },
    {
      name: 'Athletics & Multi-Sport Complex',
      spec: 'Turf Football Pitch, Track & Basketball Court',
      status: 'Scheduled Tournaments',
      utilization: 'All Grades Active',
      icon: Award,
      color: 'bg-emerald-600',
    },
  ];

  // Departmental Infrastructure Breakdown
  const academicDepartments = [
    { name: 'STEM & Natural Sciences', classrooms: 4, faculty: 10, scholars: 280, lead: 'Dr. Hersi Jama' },
    { name: 'Languages & Literature', classrooms: 3, faculty: 8, scholars: 210, lead: 'Ustadh Omar Abdi' },
    { name: 'Social Sciences & Humanities', classrooms: 3, faculty: 8, scholars: 200, lead: 'Sahra Nur' },
    { name: 'Commercial & Information Technology', classrooms: 2, faculty: 8, scholars: 152, lead: 'Ibrahim Warsame' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE WELCOME & INFRASTRUCTURE BANNER                          */}
      {/* ========================================================================= */}
      <div
        data-tour="admin-banner"
        className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/15">
              <Building2 className="w-3.5 h-3.5 text-[#F7A914]" />
              <span>{activeSchool?.name || 'Amiir nuur'} ({activeSchool?.code || 'GH-001'})</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-[#122E52] font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={tr('Start interactive dashboard walkthrough', 'Bilow socdaalka hagaha')}
            >
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{tr('Take Executive Tour', 'Hagaha Maamulka')}</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {tr('School Infrastructure & Institutional Executive Dashboard', 'Xarunta Kormeerka Guud & Hantida Dugsiga')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              {tr(
                `High-level command center for ${activeSchool?.name || 'Amiir nuur'}. Monitor school facilities, student enrollment distribution, academic department strength, and financial health.`,
                `Xarunta kormeerka guud ee ${activeSchool?.name || 'Amiir nuur'}. Kormeero dhismaha dugsiga, ardayda diiwaangashan, tayada macallimiinta, iyo xaaladda maaliyadeed.`
              )}
            </p>
          </div>

          {/* High-Level Executive Navigation Shortcuts */}
          <div data-tour="admin-quick-actions" className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('schools')}
              className="btn-gold"
            >
              <Building2 className="w-4 h-4" />
              <span>{tr('School Overview & Campus', 'Xogta Guud ee Dugsiga')}</span>
            </button>

            <button
              onClick={() => onNavigate('fees')}
              className="btn-outline-navy"
            >
              <CreditCard className="w-4 h-4 text-[#3B82F6]" />
              <span>{tr('Financial Reports & Overview', 'Warbixinada Maaliyadda')}</span>
            </button>

            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#F7A914]" />
              <span>{tr('School Performance Reports', 'Warbixinada Waxbarashada')}</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#F7A914]" />
              <span>{tr('Settings & Configuration', 'Habeynta & Koontada')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SCHOOL INFRASTRUCTURE & COHORT DASHBOARD WIDGET                */}
      {/* ========================================================================= */}
      <DashboardWidget onNavigate={onNavigate} />

      {/* ========================================================================= */}
      {/* 3. CAMPUS INFRASTRUCTURE & FACILITIES STATUS BENTO                        */}
      {/* ========================================================================= */}
      <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--card-border)] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--card-border)] gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Campus Infrastructure & Facilities Operational Status', 'Xaaladda Xarumaha & Dhismaha Dugsiga')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Real-time operational monitoring of school laboratories, digital computing suites, and physical campus assets.
            </p>
          </div>
          <button
            onClick={() => onNavigate('schools')}
            className="text-xs font-extrabold text-[#3B82F6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{tr('View Complete Campus Assets', 'Eeg Dhammaan Hantida')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campusInfrastructureAssets.map((asset, idx) => {
            const IconComponent = asset.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--card-border)] flex items-start gap-4 card-hover-lift"
              >
                <div className={`w-11 h-11 rounded-xl ${asset.color} text-white flex items-center justify-center font-bold shadow-xs shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{asset.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      {asset.status}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.spec}</p>
                  <p className="text-[11px] text-[#122E52] dark:text-[#F7A914] font-bold pt-1">{asset.utilization}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACADEMIC DEPARTMENTAL & ENROLLMENT BREAKDOWN                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Breakdown */}
        <div className="lg:col-span-2 bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--card-border)] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[var(--card-border)]">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Academic Departments & Resource Distribution', 'Qaybaha Tacliinta & Khayraadka')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Classroom, faculty, and student distribution across academic divisions.
            </p>
          </div>

          <div className="space-y-3">
            {academicDepartments.map((dept, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs card-hover-lift"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{dept.name}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Department Lead: {dept.lead}</p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  <span className="bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] px-2.5 py-1 rounded-md border border-[#1E3A63]">
                    {dept.classrooms} Classrooms
                  </span>
                  <span className="bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] px-2.5 py-1 rounded-md border border-[#3B82F6]/30">
                    {dept.faculty} Instructors
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {dept.scholars} Scholars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Attendance & Institutional Health Chart */}
        <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--card-border)] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Weekly Attendance Trajectory', 'Heerka Imaanshaha Todobaadlaha')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Verified daily roll vs {targetAttendancePercentage}% target threshold.
            </p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ownerAttendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomRechartsTooltip />} />
                <ReferenceLine y={targetAttendancePercentage} stroke="#10b981" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="rate" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#ownerAttendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Benchmark Target:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{targetAttendancePercentage}% Met</span>
          </div>
        </div>
      </div>

      {/* Interactive Onboarding Tour */}
      <OnboardingTour
        steps={ADMIN_ONBOARDING_TOUR_STEPS}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        tourKey="ileys_school_owner_dashboard_tour"
      />
    </div>
  );
};
