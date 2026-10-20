import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
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
  Fingerprint,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool, isBiometricSupported, hasRegisteredBiometrics } = useAuth();
  const { t, tr, tx } = useLanguage();
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

  // Student specific bulletins (strictly read-only for students)
  const studentNotices = (notices || []).filter(
    (n) => n.audience === 'All' || n.audience === 'Students' || (n as any).targetAudience === 'All' || (n as any).targetAudience === 'Students'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Student Hero Banner */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] border border-[#1E3A63] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>{tr('Student Learning Portal', 'Bogga Waxbarashada Ardayga')} • {activeSchool?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {tr('Hello', 'Kusoo dhowaw')}, {currentUser.name}! 🚀
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            {tr('Enrolled in', 'Ku jira fasalka')}{' '}
            <span className="font-bold text-amber-300">{myClass}</span> ({tr('Roll No.', 'Lambarka')} #{myStudentProfile.rollNo}).{' '}
            {tr(
              'Keep up the great work! Access your AI Study Buddy, check today\'s classes, and review upcoming exam results.',
              'Sii wad dadaalka! Isticmaal Kaaliyaha Waxbarashada, eeg jadwalka maanta, iyo natiijooyinka imtixaannada.'
            )}
          </p>

          {/* Student Quick Action Chips */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('studybuddy')}
              className="btn-gold"
            >
              <Sparkles className="w-4 h-4 text-[#122E52] fill-[#F7A914]" />
              <span>{tr('Launch AI Study Buddy', 'Fur Kaaliyaha Waxbarashada')}</span>
            </button>
            <button
              onClick={() => onNavigate('timetable')}
              className="btn-outline-navy"
            >
              <CalendarDays className="w-4 h-4" />
              <span>{tr('My Class Timetable', 'Jadwalka Fasalkayga')}</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="btn-navy"
            >
              <Award className="w-4 h-4" />
              <span>{tr('My Report Card', 'Warqadda Natiijada')}</span>
            </button>
            <button
              onClick={() => onNavigate('downloads')}
              className="btn-navy"
            >
              <Download className="w-4 h-4" />
              <span>{tr('Syllabus & Homework', 'Manhajka & Shaqada Guriga')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Biometric Quick Access Layer Banner */}
      {isBiometricSupported && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              hasRegisteredBiometrics
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-50 dark:bg-blue-950/60 text-[#3B82F6]'
            }`}>
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {tr('Student Biometric Quick Access', 'Galitaanka Degdegga ah ee Faraha')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hasRegisteredBiometrics
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {hasRegisteredBiometrics ? tr('Passkey Active', 'Faraha Shaqeynaya') : tr('Available', 'La heli karo')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {hasRegisteredBiometrics
                  ? tr('Your device passkey is active for instant 1-touch login to Study Buddy and learning modules.', 'Farahaagu waa diyaar si aad degdeg ugu furto casharrada iyo Kaaliyaha.')
                  : tr('Enable your device fingerprint/face sensor for password-free learning access.', 'Kici faraha ama wajiga si aad ugu gasho adoon gelin furaha sirta ah.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="btn-outline-navy text-xs py-1.5 px-3 self-end sm:self-auto cursor-pointer"
          >
            {hasRegisteredBiometrics ? tr('Manage', 'Maamul') : tr('Enable', 'Kici')}
          </button>
        </div>
      )}

      {/* 2. Personal Learning KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA / Average Grade */}
        <div
          onClick={() => onNavigate('exam')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-lg">
              {tr('Rank: Top 5%', 'Heerka: 5% Ugu Sarreeya')}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{averageScore}%</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{tr('Average Grade Score', 'Celceliska Dhibcaha')}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{tr('Overall Mid-Term Standing', 'Heerka Imtixaanka')} </p>
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
              {presentDays}/{totalDaysRecorded} {tr('Days', 'Maalmood')}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{attendanceRate}%</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{tr('Attendance Record', 'Imaanshaha')}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{tr('Regular roll presence', 'Imaanshaha joogtada ah')}</p>
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
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{tr('Enrolled Courses', 'Maadooyinka')}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{tr('Active curriculum subjects', 'Maadooyinka manhajka')}</p>
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
              {myFeeRecord?.status === 'Paid' ? tr('Paid', 'Waa La Bixiyey') : tr('Pending', 'Waa La Sugayaa')}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${myFeeRecord?.balanceRemaining || 0}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{tr('Fee Balance Due', 'Haraaga Kharashka')}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{tr('Term tuition status', 'Xaaladda lacag bixinta')}</p>
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
                <div className="w-9 h-9 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{tr("Today's Class Schedule", 'Jadwalka Fasalka ee Maanta')}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {tr('Timetable for', 'Jadwalka')} {todayName} • {myClass}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {tr('Full Week', 'Toddobaadka Dhan')} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myScheduleToday.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {tr('No classes scheduled for today. Check your full timetable.', 'Ma jiraan fasallo maanta loo qorsheeyey.')}
                  </p>
                </div>
              ) : (
                myScheduleToday.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-[#122E52]/5 dark:hover:bg-[#122E52]/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#122E52] text-[#F7A914] flex flex-col items-center justify-center font-bold text-xs shadow-xs">
                        <span>{slot.startTime?.slice(0, 5) || '09:00'}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {slot.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{tr('Instructor', 'Macallinka')}: {slot.teacherName || 'Faculty Instructor'}</span>
                          <span>•</span>
                          <span>{tr('Room', 'Qolka')} {slot.room || '102'}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-3 py-1 rounded-xl">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {tr(`${myScheduleToday.length} lessons today`, `${myScheduleToday.length} cashar maanta`)}
            </span>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline"
            >
              {tr('View Full Timetable', 'Eeg Jadwalka Oo Dhan')}
            </button>
          </div>
        </div>

        {/* Student School Notices (Read-Only Bulletin View) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {tr('Student Bulletins', 'Ogeysiisyada Ardayda')}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('notice')}
                className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline"
              >
                {tr('All Notices', 'Dhammaan Ogeysiisyada')}
              </button>
            </div>

            <div className="space-y-3">
              {studentNotices.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {tr('No announcements posted yet.', 'Weli wax ogeysiis ah lama soo dhigin.')}
                </div>
              ) : (
                studentNotices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => onNavigate('notice')}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#1E3A63] hover:bg-[#122E52]/10 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914]">
                        {tx(notice.priority)}
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
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {tr(`${studentNotices.length} Active Bulletins`, `${studentNotices.length} Ogeysiis oo Yaalla`)}
            </span>
            <button
              onClick={() => onNavigate('notice')}
              className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {tr('Open Notice Board', 'Fur Sabuuradda Ogeysiisyada')} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
