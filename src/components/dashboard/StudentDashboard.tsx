import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CalendarCheck,
  Award,
  CalendarDays,
  CreditCard,
  Download,
  Bell,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  BookMarked,
  Trophy,
  ChevronRight,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool } = useAuth();
  const {
    students,
    subjects,
    attendance,
    exams,
    marks,
    studentMarks,
    timetables,
    notices,
    downloadFiles,
    books,
    studentFees,
    studentFeeRecords,
  } = useSchoolData();

  // Scope: Authenticated Student's own records
  const myStudentProfile = (students || []).find((s) => s.id === currentUser.schoolId || s.id === currentUser.studentId) || {
    id: currentUser.schoolId || currentUser.studentId || 'STU-2026-0125',
    name: currentUser.name,
    class: 'Class 01',
    rollNo: '12',
    email: currentUser.email,
    attendanceRate: 98.4,
  };

  const myClass = myStudentProfile.class || 'Class 01';

  // My subjects
  const mySubjects = (subjects || []).filter((sub) => sub.class === myClass || !sub.class);

  // My timetable slots for today
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const myScheduleToday = (timetables || []).filter(
    (t) => (t.class === myClass || t.class === 'All') && (t.day === todayName || t.day === 'Monday')
  );

  // My attendance records
  const myAttendanceRecords = (attendance || []).filter((a) => a.studentId === myStudentProfile.id);
  const totalDaysRecorded = myAttendanceRecords.length || 20;
  const presentDays = myAttendanceRecords.filter((a) => a.status === 'Present').length || 19;
  const attendanceRate = Math.round((presentDays / totalDaysRecorded) * 100);

  // My marks / grades
  const allMarks = marks || studentMarks || [];
  const myMarks = allMarks.filter((m) => m.studentId === myStudentProfile.id);
  const averageScore = myMarks.length > 0
    ? Math.round(myMarks.reduce((acc, m) => acc + (m.marksObtained || (m as any).score || 0), 0) / myMarks.length)
    : 92;

  // My fee status
  const allFees = studentFees || studentFeeRecords || [];
  const myFeeRecord = allFees.find((f) => f.studentId === myStudentProfile.id);

  // Student specific bulletins
  const studentNotices = (notices || []).filter(
    (n) => n.targetAudience === 'All' || n.targetAudience === 'Students' || n.targetClass === myClass
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Student Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Learning Portal • {activeSchool?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hello, {currentUser.name}! 🚀
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            Enrolled in <span className="font-bold text-amber-300">{myClass}</span> (Roll No. #{myStudentProfile.rollNo}). Keep up the great work! Access your AI Study Buddy, check today's classes, and review upcoming exam results.
          </p>

          {/* Student Quick Action Chips */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('studybuddy')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-900 fill-amber-300" />
              <span>Launch AI Study Buddy</span>
            </button>
            <button
              onClick={() => onNavigate('timetable')}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>My Class Timetable</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>My Report Card</span>
            </button>
            <button
              onClick={() => onNavigate('downloads')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/30 text-white border border-white/20 font-semibold text-xs hover:bg-purple-500/50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Syllabus & Homework</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Personal Learning KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA / Average Grade */}
        <div
          onClick={() => onNavigate('exam')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg">
              Rank: Top 5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{averageScore}%</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Average Grade Score</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Overall Mid-Term Standing</p>
          </div>
        </div>

        {/* My Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              {presentDays}/{totalDaysRecorded} Days
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{attendanceRate}%</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Attendance Record</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Regular roll presence</p>
          </div>
        </div>

        {/* My Enrolled Subjects */}
        <div
          onClick={() => onNavigate('subject')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BookMarked className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg">
              {myClass}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{mySubjects.length}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Enrolled Courses</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Active curriculum subjects</p>
          </div>
        </div>

        {/* Tuition Fee Invoice */}
        <div
          onClick={() => onNavigate('fees')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
              myFeeRecord?.status === 'Paid'
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                : 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
            }`}>
              {myFeeRecord?.status || 'Paid'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${myFeeRecord?.balanceRemaining || 0}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Fee Balance Due</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Term tuition status</p>
          </div>
        </div>
      </div>

      {/* 3. Student Schedule & Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Class Schedule</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Timetable for {todayName} • {myClass}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                Full Week <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myScheduleToday.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No classes scheduled for today. Check your full timetable.
                  </p>
                </div>
              ) : (
                myScheduleToday.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs">
                        <span>{slot.startTime?.slice(0, 5) || '09:00'}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {slot.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Instructor: {slot.teacherName || 'Faculty Instructor'}</span>
                          <span>•</span>
                          <span>Room {slot.room || '102'}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {myScheduleToday.length} lessons today
            </span>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View Full Timetable
            </button>
          </div>
        </div>

        {/* Student School Notices */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Student Bulletins
                </h3>
              </div>
              <button
                onClick={() => onNavigate('notice')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {studentNotices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onNavigate('notice')}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                      {notice.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">{notice.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {studentNotices.length} Active Bulletins
            </span>
            <button
              onClick={() => onNavigate('notice')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              Open Notice Board <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
