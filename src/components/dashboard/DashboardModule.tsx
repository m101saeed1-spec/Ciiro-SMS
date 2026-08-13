import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
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
  Plus
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
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>View Student Directory</span>
            </button>
            <button
              onClick={() => onNavigate('library')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Library Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              +12% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4">{totalStudents}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Total Enrolled Students</p>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Active
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4">{totalTeachers}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Teaching Faculty</p>
        </div>

        {/* Classes & Sections */}
        <div
          onClick={() => onNavigate('class')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              12 Sections
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4">{totalClasses}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Active Academic Classes</p>
        </div>

        {/* Library Books */}
        <div
          onClick={() => onNavigate('library')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {borrowedBooks} Borrowed
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4">{totalBooks}</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Library Volumes</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Weekly Attendance Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Average attendance rate across Class 01 - 05</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val: number) => [`${val}%`, 'Attendance Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Exam Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recent Mid-Term Grade Summary</p>
            </div>
            <button
              onClick={() => onNavigate('exam')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Exams <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
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
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent School Activities</h3>
            <span className="text-xs font-semibold text-slate-400">Live Feed</span>
          </div>

          <div className="space-y-3.5">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  {act.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    <span className="font-bold text-purple-700">{act.user}</span> {act.action}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Notices & Upcoming Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Announcements & Notices</h3>
            <button
              onClick={() => onNavigate('notice')}
              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Notice
            </button>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                onClick={() => onNavigate('notice')}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    notice.priority === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {notice.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400">{notice.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-2">{notice.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
