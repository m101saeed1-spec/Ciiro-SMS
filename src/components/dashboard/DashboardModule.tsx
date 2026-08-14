import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import { UserAvatar } from '../common/UserAvatar';
import {
  GraduationCap,
  Users,
  Layers,
  BookMarked,
  BookOpen,
  CalendarCheck,
  Award,
  Bell,
  ArrowUpRight,
  Plus,
  MessageSquare,
  Sparkles,
  CreditCard
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DashboardModuleProps {
  onNavigate: (module: NavModule) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { currentUser, activeRole } = useAuth();
  const {
    students,
    teachers,
    classes,
    subjects,
    books,
    notices,
    activities,
    exams,
  } = useSchoolData();

  const { activeChildId } = useAuth();
  const activeChild = students.find((s) => s.id === activeChildId);
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalSubjects = subjects.length;
  const totalBooks = books.length;
  const borrowedBooks = books.filter((b) => b.status === 'Borrowed').length;

  // Chart Demo Data
  const attendanceTrendData = [
    { day: 'Mon', rate: 96 },
    { day: 'Tue', rate: 98 },
    { day: 'Wed', rate: 94 },
    { day: 'Thu', rate: 97 },
    { day: 'Fri', rate: 95 },
    { day: 'Sat', rate: 92 },
  ];

  const gradeDistribution = [
    { grade: 'A+', count: 42, fill: '#7c3aed' },
    { grade: 'A', count: 35, fill: '#8b5cf6' },
    { grade: 'B', count: 22, fill: '#a78bfa' },
    { grade: 'C', count: 12, fill: '#c4b5fd' },
    { grade: 'F', count: 3, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>EduSpike Academic Session 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}! 👋
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-2 leading-relaxed">
            {activeRole === 'Admin' && 'Here is your real-time administrative overview across all departments, teachers, students, and academic analytics.'}
            {activeRole === 'Teacher' && 'Manage your class schedules, track student attendance, assign marks, and post class announcements.'}
            {activeRole === 'Student' && 'Track your academic performance, check library books, exam schedules, and daily announcements.'}
            {activeRole === 'Parent' && `Monitor ${activeChild?.name || 'your child'}'s attendance, view test report cards, and connect with school faculty.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            {activeRole === 'Student' ? (
              <>
                <button
                  onClick={() => onNavigate('timetable')}
                  className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>My Timetable</span>
                </button>
                <button
                  onClick={() => onNavigate('report')}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>My Report Form</span>
                </button>
                <button
                  onClick={() => onNavigate('ranking')}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Exam Ranking</span>
                </button>
                <button
                  onClick={() => onNavigate('fees')}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>My Fees</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('timetable')}
                  className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{activeRole === 'Parent' ? 'My Timetable' : 'Class Timetable'}</span>
                </button>
                <button
                  onClick={() => onNavigate('fees')}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{activeRole === 'Parent' ? 'School Fees' : 'Fee Management'}</span>
                </button>
                <button
                  onClick={() => onNavigate('students')}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Student Directory</span>
                </button>
                {(activeRole === 'Teacher' || activeRole === 'Admin') && (
                  <button
                    onClick={() => onNavigate('chat')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/80 text-white border border-emerald-400/40 font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Teacher Chat</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Statistic Cards Grid */}
      {activeRole === 'Student' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Attendance Rate */}
          <div
            onClick={() => onNavigate('attendance')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                Present
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">98.5%</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">My Attendance Standing</p>
          </div>

          {/* Academic Standing */}
          <div
            onClick={() => onNavigate('ranking')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                Rank #1
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">95.6%</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Term 1 Average Grade</p>
          </div>

          {/* Enrolled Subjects */}
          <div
            onClick={() => onNavigate('subject')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookMarked className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                Class 02
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">5 Subjects</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">My Enrolled Courses</p>
          </div>

          {/* Library Borrowed */}
          <div
            onClick={() => onNavigate('library')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">1 Book</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Borrowed Library Items</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Students */}
          <div
            onClick={() => onNavigate('students')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                +12% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">{totalStudents}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Total Enrolled Students</p>
          </div>

          {/* Total Teachers */}
          <div
            onClick={() => onNavigate('teachers')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">{totalTeachers}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Teaching Faculty</p>
          </div>

          {/* Classes & Sections */}
          <div
            onClick={() => onNavigate('class')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                12 Sections
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">{totalClasses}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Active Academic Classes</p>
          </div>

          {/* Library Books */}
          <div
            onClick={() => onNavigate('library')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                {borrowedBooks} Borrowed
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-4">{totalBooks}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Library Volumes</p>
          </div>
        </div>
      )}

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Weekly Attendance Overview</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Average attendance rate across Class 01 - 05</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1"
            >
              Full Report <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(val: number) => [`${val}%`, 'Attendance Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Exam Performance</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Recent Mid-Term Grade Summary</p>
            </div>
            <button
              onClick={() => onNavigate('exam')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1"
            >
              Exams <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent School Activities</h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Live Feed</span>
          </div>

          <div className="space-y-3.5">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
                <UserAvatar
                  name={act.user}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-purple-700 dark:text-purple-400">{act.user}</span> {act.action}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Notices & Upcoming Events */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Announcements & Notices</h3>
            <button
              onClick={() => onNavigate('notice')}
              className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Notice
            </button>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                onClick={() => onNavigate('notice')}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    notice.priority === 'High'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                  }`}>
                    {notice.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{notice.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2">{notice.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
