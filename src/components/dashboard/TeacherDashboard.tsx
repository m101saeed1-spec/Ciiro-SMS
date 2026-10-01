import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  CalendarDays,
  MessageSquare,
  Sparkles,
  FilePlus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Bell,
  Layers,
  BookMarked,
  UserCheck,
  UserX,
  Plus,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool, isClassTeacher, classTeacherOf } = useAuth();
  const {
    students,
    classes,
    subjects,
    attendance,
    exams,
    marks,
    studentMarks,
    timetables,
    notices,
    downloadFiles,
    unreadChatCount,
  } = useSchoolData();

  // Scope: Teacher's assigned classes and subjects
  const teacherClasses = currentUser.assignedClasses && currentUser.assignedClasses.length > 0
    ? currentUser.assignedClasses
    : ['Class 01', 'Class 02'];
  const teacherSubjects = currentUser.assignedSubjects && currentUser.assignedSubjects.length > 0
    ? currentUser.assignedSubjects
    : ['Mathematics', 'Physics'];

  const officialClassTeacherClasses = currentUser.classTeacherOf && currentUser.classTeacherOf.length > 0
    ? currentUser.classTeacherOf
    : [];

  const [selectedClass, setSelectedClass] = useState<string>(
    officialClassTeacherClasses[0] || teacherClasses[0] || 'Class 01'
  );

  // Filter students in teacher's assigned classes
  const myClassStudents = (students || []).filter((s) => teacherClasses.includes(s.class));
  const selectedClassStudents = (students || []).filter((s) => s.class === selectedClass);

  // Today's teaching schedule from timetable
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const myTimetableToday = timetables.filter(
    (t) =>
      (t.teacherId === currentUser.schoolId ||
        t.teacherId === currentUser.teacherId ||
        t.teacherName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        teacherSubjects.includes(t.subject)) &&
      (t.day === todayName || t.day === 'Monday')
  );

  // Recent attendance for selected class
  const classAttendanceRecords = attendance.filter((a) => a.class === selectedClass);
  const totalClassRoll = selectedClassStudents.length;
  const presentCount = classAttendanceRecords.filter((a) => a.status === 'Present').length;
  const attendancePercentage = totalClassRoll > 0 ? Math.round((presentCount / totalClassRoll) * 100) : 95;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Teacher Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
            <span>Teacher Workspace • {activeSchool?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {currentUser.name}! 📚
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            {isClassTeacher ? (
              <>
                Designated <span className="font-bold text-amber-300">Class Teacher</span> for <span className="font-bold text-emerald-300">{officialClassTeacherClasses.join(', ')}</span>. Authorized to register students, manage parents, record official attendance roll calls, and submit term examination marks.
              </>
            ) : (
              <>
                Subject Teacher for <span className="font-bold text-amber-300">{teacherSubjects.join(', ')}</span> across <span className="font-bold text-amber-300">{teacherClasses.join(', ')}</span>. Create assignments, share academic resources, and collaborate with faculty.
              </>
            )}
          </p>

          {/* Quick Action Buttons for Teacher */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isClassTeacher ? `Take Attendance (${officialClassTeacherClasses[0] || 'Class'})` : 'View Attendance'}</span>
            </button>
            <button
              onClick={() => onNavigate('exam')}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{isClassTeacher ? 'Enter Official Marks' : 'View Exam Results'}</span>
            </button>
            <button
              onClick={() => onNavigate('downloads')}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Post Assignment</span>
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer relative"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Faculty Chat</span>
              {unreadChatCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Class Teacher Responsibility Card (When Appointed) */}
      {isClassTeacher && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Official Class Teacher
                </span>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  {officialClassTeacherClasses.join(', ')}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                Class Operational Authority Active
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
                As the assigned Class Teacher, you hold direct responsibility for student enrollment, parent accounts, daily roll-call attendance, and official term grade submission for your class.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigate('students')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Enroll Student
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-xs font-bold transition-all"
            >
              Roll Call
            </button>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Cards for Assigned Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Classes */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg">
              {teacherClasses.length} Assigned
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {teacherClasses.length}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">My Assigned Classes</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {teacherClasses.join(', ')}
            </p>
          </div>
        </div>

        {/* Card 2: My Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg">
              Class Rosters
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {myClassStudents.length}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Authorized Students</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Enrolled across your assigned classes
            </p>
          </div>
        </div>

        {/* Card 3: Teaching Subjects */}
        <div
          onClick={() => onNavigate('subject')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <BookMarked className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg">
              Curriculum
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {teacherSubjects.length}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Assigned Subjects</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {teacherSubjects.join(' • ')}
            </p>
          </div>
        </div>

        {/* Card 4: Class Attendance Roll */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              Today's Roll
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {attendancePercentage}%
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Class Attendance</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {selectedClass} roll status
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Row: Today's Teaching Schedule & Class Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Class Schedule</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Teaching timetable periods for {todayName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Full Timetable <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myTimetableToday.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No teaching periods scheduled for today. Check full weekly schedule.
                  </p>
                </div>
              ) : (
                myTimetableToday.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs">
                        <span>{slot.startTime?.slice(0, 5) || '09:00'}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {slot.subject} • <span className="text-blue-600 dark:text-blue-400">{slot.class}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Room: {slot.room || 'Room 102'}</span>
                          <span>•</span>
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('attendance')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Take Roll</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {myTimetableToday.length} periods today
            </span>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage Weekly Slots
            </button>
          </div>
        </div>

        {/* Selected Class Quick Roster */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Student Roster</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Select an assigned class
                </p>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-none"
              >
                {teacherClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedClassStudents.slice(0, 6).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{student.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Roll: #{student.rollNo} • ID: {student.id}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {student.attendanceRate || 98}% Att.
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Total {selectedClassStudents.length} students in {selectedClass}
            </span>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              Full Roster <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
