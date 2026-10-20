import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import { SectionDivider } from './SectionDivider';
import { AnimatedTypewriter } from '../common/AnimatedTypewriter';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  CreditCard,
  CalendarDays,
  FileText,
  DollarSign,
  Award,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Layers,
  Search,
  Download,
  KeyRound,
  UserCheck,
  Check,
  X,
  Lock,
  Compass,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Tag,
} from 'lucide-react';

interface FeaturesPageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

type FeatureTabKey =
  | 'students'
  | 'teachers'
  | 'attendance'
  | 'exams'
  | 'timetable'
  | 'announcements'
  | 'fees'
  | 'reports'
  | 'roles'
  | 'access';

type RoleDemoKey = 'teacher' | 'headteacher' | 'accountant' | 'owner' | 'student';

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();

  // Active tour tab
  const [activeTab, setActiveTab] = useState<FeatureTabKey>('students');

  // Interactive Attendance Demo State
  const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent' | 'Excused'>>({
    'std-1': 'Present',
    'std-2': 'Present',
    'std-3': 'Absent',
    'std-4': 'Present',
    'std-5': 'Present',
  });
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);

  // Interactive Role Selector State
  const [selectedRoleDemo, setSelectedRoleDemo] = useState<RoleDemoKey>('teacher');

  // Interactive 4-Digit ID test state
  const [testedId, setTestedId] = useState('2001');

  // Interactive Fee Class drilldown state
  const [selectedFeeClass, setSelectedFeeClass] = useState<'Class 01' | 'Class 02' | 'Class 04'>('Class 04');
  const [feePaidStatus, setFeePaidStatus] = useState<Record<string, boolean>>({
    'f-1': true,
    'f-2': true,
    'f-3': false,
    'f-4': true,
  });

  const toggleFeeStatus = (id: string) => {
    setFeePaidStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSetStudentAttendance = (id: string, status: 'Present' | 'Absent' | 'Excused') => {
    setAttendanceState((prev) => ({ ...prev, [id]: status }));
    setAttendanceSubmitted(false);
  };

  const navTabs: { id: FeatureTabKey; labelEn: string; labelSo: string; icon: any }[] = [
    { id: 'students', labelEn: 'Student Management', labelSo: 'Ardayda', icon: GraduationCap },
    { id: 'teachers', labelEn: 'Teacher Management', labelSo: 'Macallimiinta', icon: Users },
    { id: 'attendance', labelEn: 'Attendance Engine', labelSo: 'Xaadiriska', icon: CalendarCheck },
    { id: 'exams', labelEn: 'Academic Results', labelSo: 'Natiijooyinka', icon: Award },
    { id: 'timetable', labelEn: 'Timetable Matrix', labelSo: 'Jadwalka', icon: CalendarDays },
    { id: 'announcements', labelEn: 'Announcements', labelSo: 'Ogeysiisyada', icon: Bell },
    { id: 'fees', labelEn: 'Accountant Fees', labelSo: 'Kharashaadka', icon: DollarSign },
    { id: 'reports', labelEn: 'Reports & Analytics', labelSo: 'Warbixinnada', icon: FileText },
    { id: 'roles', labelEn: 'Role-Based Access', labelSo: 'Doorka & Xogta', icon: UserCheck },
    { id: 'access', labelEn: 'Access & 4-Digit ID', labelSo: '4-God Ileys ID', icon: KeyRound },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 space-y-16 font-sans animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER: Product Education                                    */}
      {/* ========================================================================= */}
      <div className="text-center max-w-3xl mx-auto space-y-5 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1E3A63] bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#F7A914]" />
          <span>{tr('Interactive Product Documentation', 'Dheehitaanka Astaamaha Nidaamka')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {tr('Connected tools for', 'Agabka casriga ah ee')}{' '}
          <span className="bg-gradient-to-r from-[#122E52] via-[#3B82F6] to-[#F7A914] bg-clip-text text-transparent">
            <AnimatedTypewriter
              words={[
                tr('student admissions.', 'diiwaangelinta ardayda.'),
                tr('1-click attendance.', 'xaadiriska 1-guji ah.'),
                tr('single school fees ledger.', 'diiwaanka lacagta.'),
                tr('automated GPA rankings.', 'buundooyinka & GPA-da.'),
              ]}
              typingSpeed={70}
              deletingSpeed={40}
              pauseDuration={2200}
            />
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {tr(
            'Explore how Ileys helps schools manage people, academics, attendance, finances, communication, and information through one connected platform.',
            'Baadh sida Ileys uga caawiso dugsiyada maareynta dadka, waxbarashada, xaadiriska, maaliyadda, ogeysiisyada, iyo xogta oo dhan hal madal oo mideysan.'
          )}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('pricing')}
            className="btn-gold"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{tr('View Pro Pricing ($25/mo · 4 Billing Options)', 'Eeg Qiimaha Pro ($25/mo · 4 Xilli)')}</span>
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="btn-outline-navy"
          >
            {tr('Get Started with Ileys', 'Ku Bilow Ileys')}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE FEATURE NAVIGATION BAR                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#122E52] text-white shadow-md font-extrabold scale-102 ring-2 ring-[#F7A914]/40'
                  : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-[#3B82F6] dark:hover:text-[#F7A914] hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tr(tab.labelEn, tab.labelSo)}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC PRODUCT UI CANVAS                                              */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* TAB 1: STUDENT MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Student Dossiers & 4-Step Registration Wizard', 'Xogta Ardayda & Diiwaangelinta 4-Tallaabo')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Authorized Roles: Headteacher & School Owner', 'Doorka Xaqiijiyay: Maamulaha & Mulkiilaha')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold self-start">
                842 Students Active
              </span>
            </div>

            {/* Workflow Step Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {tr('4-Step Registration Workflow', 'Tallaabooyinka Diiwaangelinta')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#122E52] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Personal Info</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#122E52] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Guardian Contact</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#122E52] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Class Placement</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-600 text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px]">4</span>
                  <span>Auto #1001 ID</span>
                </div>
              </div>
            </div>

            {/* Realistic Student Dossier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#122E52] text-white font-bold text-xs flex items-center justify-center">
                      FA
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Farah Abdi Ali</h4>
                      <span className="text-slate-500 text-[11px]">Class 04A • Section 1</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                    ID: 1001
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div><span className="text-slate-400">Guardian:</span> <span className="text-slate-700 dark:text-slate-200 font-semibold">Abdi Ali</span></div>
                  <div><span className="text-slate-400">Contact:</span> <span className="text-slate-700 dark:text-slate-200 font-semibold">0615551234</span></div>
                  <div><span className="text-slate-400">Fee Status:</span> <span className="text-emerald-600 font-semibold">Cleared</span></div>
                  <div><span className="text-slate-400">Attendance:</span> <span className="text-slate-700 dark:text-slate-200 font-semibold">99.2%</span></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      ZH
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Zahra Hassan Nur</h4>
                      <span className="text-slate-500 text-[11px]">Class 04A • Section 1</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                    ID: 1002
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div><span className="text-slate-400">Guardian:</span> <span className="text-slate-700 dark:text-slate-200 font-semibold">Hassan Nur</span></div>
                  <div><span className="text-slate-400">Contact:</span> <span className="text-slate-700 dark:text-slate-200 font-semibold">0615555678</span></div>
                  <div><span className="text-slate-400">Fee Status:</span> <span className="text-emerald-600 font-semibold">Cleared</span></div>
                  <div><span className="text-slate-400">Attendance:</span> <span className="text-slate-700 dark:text-slate-200 font-semibold">98.5%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEACHER MANAGEMENT */}
        {activeTab === 'teachers' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Teacher Allocations & Classroom Governance', 'Qaybinta Macallimiinta & Maamulka Fasallada')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Authorized Roles: Headteacher assigns class teachers and teaching subjects', 'Doorka: Maamulaha ayaa qoondeeya macallimiinta')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start">
                34 Faculty Members
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#122E52] text-white font-bold flex items-center justify-center">
                      AM
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Ahmed Mohamed</h4>
                      <span className="text-slate-500 text-[11px]">Senior Mathematics & Physics</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                    ID: 2001
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <p><span className="text-slate-400">Class Teacher of:</span> <strong className="text-[#3B82F6] dark:text-[#F7A914]">Class 04A</strong></p>
                  <p><span className="text-slate-400">Teaching Classes:</span> Class 01, Class 02, Class 04</p>
                  <p><span className="text-slate-400">Assigned Subjects:</span> Mathematics, Physics</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center">
                      KA
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Khadija Ali</h4>
                      <span className="text-slate-500 text-[11px]">Science & Biology Lead</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                    ID: 2002
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <p><span className="text-slate-400">Class Teacher of:</span> <strong className="text-teal-600 dark:text-teal-400">Class 02B</strong></p>
                  <p><span className="text-slate-400">Teaching Classes:</span> Class 02, Class 03</p>
                  <p><span className="text-slate-400">Assigned Subjects:</span> Biology, Chemistry</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ATTENDANCE ENGINE (Interactive Demo) */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('1-Click Classroom Attendance Engine (Interactive Demo)', 'Xaadiriska Fasalka ee 1-Guji ah (Tijaabo)')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Workflow: Teacher → Select Own Class → Mark Students → Save/Submit', 'Dhaqdhaqaaqa: Macallinka → Fasalkiisa → Xaadiris → Keydi')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start">
                Class 04A (32 Students)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {tr('Interactive Roll Call: Click buttons to toggle attendance status', 'Guji badhamada si aad u beddesho xaadiriska')}
              </span>

              <div className="space-y-2 text-xs">
                {[
                  { id: 'std-1', name: 'Farah Abdi Ali', roll: 'AH-041' },
                  { id: 'std-2', name: 'Zahra Hassan Nur', roll: 'AH-042' },
                  { id: 'std-3', name: 'Khadar Jama Warsame', roll: 'AH-043' },
                  { id: 'std-4', name: 'Ayan Mohamud Shire', roll: 'AH-044' },
                  { id: 'std-5', name: 'Mustafe Ismail Dahir', roll: 'AH-045' },
                ].map((std) => {
                  const status = attendanceState[std.id] || 'Present';
                  return (
                    <div
                      key={std.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{std.name}</span>
                        <span className="text-[10px] text-slate-500">{std.roll}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(std.id, 'Present')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {tr('Present', 'Jooga')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(std.id, 'Absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            status === 'Absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {tr('Absent', 'Ma Joogo')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(std.id, 'Excused')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            status === 'Excused'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {tr('Excused', 'Fasax')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">
                  {tr('Only Class Teachers can take and submit attendance for their assigned classes.', 'Macallinka fasalka u xilsaaran keliya ayaa qaadi kara xaadiriska.')}
                </span>
                <button
                  type="button"
                  onClick={() => setAttendanceSubmitted(true)}
                  className="btn-navy"
                >
                  {attendanceSubmitted ? tr('✓ Saved to Principal Feed', '✓ Waa La Keydiyay') : tr('Save & Submit Roll Call', 'Keydi Xaadiriska')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMIC RESULTS */}
        {activeTab === 'exams' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Academic Results & Automated GPA Class Ranking', 'Natiijooyinka Imtixaanaadka & Kaalmaha')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Subject Marks Recording $\\rightarrow$ Automated GPA Calculation $\\rightarrow$ Class Ranking $\\rightarrow$ Report Cards', 'Dhibcaha $\\rightarrow$ Buundooyinka $\\rightarrow$ Kaalmaha $\\rightarrow$ Shahaadada')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold self-start">
                Term 2 Grading Period
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Mathematics</th>
                    <th className="py-3 px-4">Physics</th>
                    <th className="py-3 px-4">Average %</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-[#3B82F6]">1st</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Zahra Hassan Nur</td>
                    <td className="py-3 px-4 text-slate-500">Class 04A</td>
                    <td className="py-3 px-4">98/100</td>
                    <td className="py-3 px-4">95/100</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">96.5%</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">Grade A</span></td>
                    <td className="py-3 px-4"><span className="text-[#3B82F6] font-bold cursor-pointer hover:underline">Print Card</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-blue-600">2nd</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Farah Abdi Ali</td>
                    <td className="py-3 px-4 text-slate-500">Class 04A</td>
                    <td className="py-3 px-4">94/100</td>
                    <td className="py-3 px-4">92/100</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">93.0%</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">Grade A</span></td>
                    <td className="py-3 px-4"><span className="text-[#3B82F6] font-bold cursor-pointer hover:underline">Print Card</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TIMETABLE MATRIX */}
        {activeTab === 'timetable' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Conflict-Free Weekly Timetable Matrix', 'Jadwalka Xiisadaha ee Isku-dheellitiran')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Class & Teacher Schedules managed by the School Principal', 'Jadwalka fasallada iyo macallimiinta oo maamuluhu hago')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold self-start">
                Class 04A Schedule
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-xs text-center">
              {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'].map((day) => (
                <div key={day} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">{day}</span>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                    <strong className="text-[#3B82F6] dark:text-[#F7A914] block">Mathematics</strong>
                    <span className="text-slate-500 block">08:00 - 08:45</span>
                    <span className="text-[10px] text-slate-400">Teacher: Ahmed</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                    <strong className="text-teal-600 dark:text-teal-400 block">Physics</strong>
                    <span className="text-slate-500 block">08:50 - 09:35</span>
                    <span className="text-[10px] text-slate-400">Teacher: Ahmed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Official Notice Board & School Bulletin Dispatch', 'Guddiga Ogeysiisyada & Faafinta Warbixinta')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('School Administrators author announcements with audience targeting (All, Staff, Students)', 'Maamulka ayaa soo saara ogeysiisyada')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold self-start">
                Admin Exclusive Publishing
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA] text-sm">
                    Term 2 Final Examination Timetable Released
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FEF3C7] dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] font-bold text-[10px]">
                    Audience: All School
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  All faculty and students are notified that final examinations will commence on Saturday next week.
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Published by: Headteacher Office • Al-Hikma School</span>
                  <span className="text-[#3B82F6] font-bold cursor-pointer hover:underline">Download Official PDF Bulletin</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACCOUNTANT FEES (Single Unified Experience) */}
        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Unified Accountant Fees Experience', 'Xisaabaadka Kharashka ee Mideysan')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Consolidated 3-Card Summary: Total Invoiced vs Total Paid vs Remaining Balance', '3 Kaadh oo Kooban: Wadarta, La Bixiyay, iyo Haraaga')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start">
                Zero Discrepancy Ledger
              </span>
            </div>

            {/* The 3 Core Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] space-y-1">
                <span className="text-[10px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block">
                  {tr('Total Amount Invoiced', 'Wadarta Kharashka')}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-sans">$57,450.00</span>
                <span className="text-[11px] text-slate-500 block">842 Students Billed</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  {tr('Total Amount Paid', 'Wadarta La Bixiyay')}
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">$48,250.00</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">84.0% Collection Rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                  {tr('Remaining Balance', 'Haraaga Dhiman')}
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans">$9,200.00</span>
                <span className="text-[11px] text-amber-600 font-semibold block">16.0% Pending</span>
              </div>
            </div>

            {/* Class Drilldown Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {tr('Class Financial Drilldown (Click to toggle Paid / Unpaid):', 'Liiska Lacag-bixinta ee Fasalka:')}
                </span>
                <div className="flex gap-1.5">
                  {(['Class 01', 'Class 02', 'Class 04'] as const).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedFeeClass(cls)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedFeeClass === cls
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { id: 'f-1', name: 'Farah Abdi Ali', fee: '$65.00', parent: 'Abdi Ali (0615551234)' },
                  { id: 'f-2', name: 'Zahra Hassan Nur', fee: '$65.00', parent: 'Hassan Nur (0615555678)' },
                  { id: 'f-3', name: 'Khadar Jama Warsame', fee: '$65.00', parent: 'Jama Warsame (0615559999)' },
                  { id: 'f-4', name: 'Ayan Mohamud Shire', fee: '$65.00', parent: 'Mohamud Shire (0615550000)' },
                ].map((item) => {
                  const isPaid = feePaidStatus[item.id] !== false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleFeeStatus(item.id)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-500">Parent: {item.parent} • Amount: {item.fee}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Paid (Receipt #R-041)</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Unpaid</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Institutional Reports & Analyzed Data Visualizations', 'Warbixinnada & Falanqaynta Xogta Dugsiga')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Comprehensive metrics covering attendance velocity, academic progress, and fee collection', 'Falanqayn qoto dheer oo ku saabsan xaadiriska, buundooyinka iyo xisaabaadka')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold self-start">
                Live Data Analytics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[#3B82F6] font-bold block">Attendance Trends</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">98.4% Average</h4>
                <p className="text-slate-500 text-[11px]">Consistent across all 12 class sections</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-emerald-600 font-bold block">Academic Pass Rate</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">94.8% Pass</h4>
                <p className="text-slate-500 text-[11px]">Term 2 Midterm Examinations</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-blue-600 font-bold block">Fee Clearance Rate</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">84.0% Collected</h4>
                <p className="text-slate-500 text-[11px]">$48,250 of $57,450 reconciled</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ROLE-BASED ACCESS SIMULATOR */}
        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('Role-Based Access Control (The 5 Canonical Roles)', 'Xakamaynta Doorka ee 5-ta Qaybood')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Strictly isolated toolsets: School Owner, Headteacher, Teacher, Accountant, Student (No Parent/Librarian)', 'Doorka: Mulkiilaha, Maamulaha, Macallinka, Xisaabiyaha, Ardayga')}
                </p>
              </div>
            </div>

            {/* Role Picker Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'teacher', label: 'Teacher (#2001)' },
                { id: 'headteacher', label: 'Headteacher (#4001)' },
                { id: 'accountant', label: 'Accountant (#3001)' },
                { id: 'owner', label: 'School Owner (#5001)' },
                { id: 'student', label: 'Student (#1001)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoleDemo(r.id as RoleDemoKey)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRoleDemo === r.id
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Role Demo Details */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-[#F7A914] uppercase tracking-wider">
                  Active Workspace View: {selectedRoleDemo.toUpperCase()}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">Verified RBAC Access</span>
              </div>

              {selectedRoleDemo === 'teacher' && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  Teachers only access their designated classrooms. They take 1-click attendance, record subject examination marks, and view class timetables. They cannot modify school finances or register new staff.
                </p>
              )}
              {selectedRoleDemo === 'headteacher' && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Headteacher oversees the entire institution: creating teachers and students, assigning classroom teachers, managing the master timetable, and publishing school announcements.
                </p>
              )}
              {selectedRoleDemo === 'accountant' && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  Accountants operate the Single Unified Fees Ledger: managing Total Invoiced, Collected, and Remaining metrics, logging tuition payments, and issuing official printable receipts.
                </p>
              )}
              {selectedRoleDemo === 'owner' && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  School Owners view high-level institutional health KPIs, multi-campus student enrollment velocity, net collection rates, and staff-to-student ratios.
                </p>
              )}
              {selectedRoleDemo === 'student' && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  Students access their personal student portal: viewing their registered subjects, class schedule, fee clearance status, and downloading official term progress report cards.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: ACCESS SYSTEM & 4-DIGIT ILEYS ID */}
        {activeTab === 'access' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {tr('The Ileys Access System & 4-Digit ID Architecture', 'Hab-maamulka Gelitaanka & 4-God Ileys ID')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Detailed 6-Step Workflow: How users authenticate and enter their school workspace', '6-da Tallaabo ee Gelitaanka')}
                </p>
              </div>
            </div>

            {/* 6-Step Sequential Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-[10px]">1</span>
                <h4 className="font-bold text-slate-900 dark:text-white">Sign In Personal Account</h4>
                <p className="text-slate-500 text-[11px]">User authenticates their personal email/password or Google SSO.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-[10px]">2</span>
                <h4 className="font-bold text-slate-900 dark:text-white">Welcome Screen</h4>
                <p className="text-slate-500 text-[11px]">System initiates 3-step school workspace entry verification.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-[10px]">3</span>
                <h4 className="font-bold text-slate-900 dark:text-white">Select School</h4>
                <p className="text-slate-500 text-[11px]">Select authorized institution (e.g. Al-Hikma School, Ileys Academy).</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-[10px]">4</span>
                <h4 className="font-bold text-slate-900 dark:text-white">Select Role</h4>
                <p className="text-slate-500 text-[11px]">Choose designated role (Teacher, Headteacher, Accountant, Owner, Student).</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#122E52]/10 dark:bg-[#122E52]/40 border border-[#1E3A63] space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white font-bold flex items-center justify-center text-[10px]">5</span>
                <h4 className="font-bold text-[#12233F] dark:text-white">Enter 4-Digit Ileys ID</h4>
                <p className="text-[#3B82F6] dark:text-[#60A5FA] text-[11px]">
                  Provide your role identifier (Student 1001, Teacher 2001, Accountant 3001, Principal 4001, Owner 5001).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">6</span>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Enter School Workspace</h4>
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                  Backend verifies relationship and opens your dedicated role dashboard.
                </p>
              </div>
            </div>

            {/* Platform Owner Direct Workflow */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#F7A914] shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Platform Owner Direct Stream</h4>
                  <p className="text-slate-400 text-[11px]">
                    Global Platform Owners are recognized automatically on Sign In, bypassing school, role, and 4-digit ID selection.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('signin')}
                className="px-4 py-2 rounded-full bg-white text-slate-900 font-bold text-xs shrink-0 cursor-pointer"
              >
                {tr('Test in Sign In', 'Tijaabi Gelitaanka')}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. CALL TO ACTION SECTION                                                 */}
      {/* ========================================================================= */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white text-center space-y-5">
        <h3 className="text-2xl sm:text-3xl font-black text-white">
          {tr('Experience these connected capabilities in your school.', 'Ku tijaabi dhammaan astaamahan dugsigaaga.')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          {tr(
            'Create your verified school account or explore our predictable pricing plan.',
            'Sameyso koontada dugsigaaga ama baadh qorshayaashayada hufan.'
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('signup')}
            className="btn-gold"
          >
            {tr('Get Started with Ileys', 'Ku Bilow Ileys')}
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className="btn-outline-navy text-white border-white/40 hover:border-white"
          >
            {tr('View Pricing Plan', 'Eeg Qiimaha')}
          </button>
        </div>
      </div>

    </div>
  );
};
