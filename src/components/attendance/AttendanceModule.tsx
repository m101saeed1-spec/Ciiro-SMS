import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { AttendanceRecord, AttendanceStatus, SchoolClass, Student } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { exportAttendanceReportPDF } from '../../utils/pdfExport';
import { downloadCSV, exportAttendanceCSV } from '../../utils/csvExport';
import { StudentAttendanceDashboard } from './StudentAttendanceDashboard';
import { Modal } from '../common/Modal';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Save,
  BarChart2,
  Calendar,
  UserCheck,
  Download,
  Users,
  Layers,
  ArrowLeft,
  Search,
  Eye,
  Check,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Award,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  List,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { activeRole, currentUser, activeSchool, canPerformClassOperations, isClassTeacherOf } = useAuth();
  const { students, classes, attendance, markAttendanceBatch } = useSchoolData();

  // Navigation State: 'classes' (Overview) | 'class-sheet' (Selected Class Attendance)
  const [activeView, setActiveView] = useState<'classes' | 'class-sheet'>('classes');
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [restrictionError, setRestrictionError] = useState<string | null>(null);

  // Offline Reports Generator Modal State
  const [isOfflineReportModalOpen, setIsOfflineReportModalOpen] = useState(false);
  const [reportClassFilter, setReportClassFilter] = useState<string>('All');
  const [reportSectionFilter, setReportSectionFilter] = useState<string>('All');
  const [reportDatePreset, setReportDatePreset] = useState<'today' | 'last7' | 'thisMonth' | 'all' | 'custom'>('all');
  const [reportStartDate, setReportStartDate] = useState<string>('2026-08-01');
  const [reportEndDate, setReportEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('All');

  // Sheet Controls
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');

  // Selected student for Student Attendance Dashboard
  const [viewingStudentDashboard, setViewingStudentDashboard] = useState<Student | null>(null);

  // Student remarks popup or inline state
  const [remarksState, setRemarksState] = useState<{ [studentId: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Teacher vs Admin Class Filtering (Role-Based Access)
  const accessibleClasses = useMemo(() => {
    if (activeRole === 'Admin') {
      return classes;
    }
    if (activeRole === 'Teacher') {
      const assigned = currentUser.assignedClasses || [];
      const teacherFiltered = classes.filter(
        (c) => assigned.includes(c.name) || c.classTeacher === currentUser.name || assigned.includes(c.id)
      );
      return teacherFiltered.length > 0 ? teacherFiltered : classes.slice(0, 3); // Fallback to accessible classes
    }
    return classes;
  }, [classes, activeRole, currentUser]);

  // Students belonging to the currently selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.class === selectedClass.name);
  }, [students, selectedClass]);

  // Filtered class students by section and search query
  const filteredClassStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const matchesSection = selectedSection === 'All' || s.section === selectedSection;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [classStudents, selectedSection, searchQuery]);

  // Local state for marking attendance for the selected date & class
  const [currentStatuses, setCurrentStatuses] = useState<{
    [studentId: string]: AttendanceStatus;
  }>({});

  // Synchronize existing attendance records for the selected class and date
  useEffect(() => {
    if (!selectedClass) return;

    const existingRecords = attendance.filter(
      (a) => a.class === selectedClass.name && a.date === selectedDate
    );

    const statusMap: { [studentId: string]: AttendanceStatus } = {};
    const remarksMap: { [studentId: string]: string } = {};

    classStudents.forEach((st) => {
      const match = existingRecords.find((r) => r.studentId === st.id);
      if (match) {
        statusMap[st.id] = match.status;
        if (match.remarks) remarksMap[st.id] = match.remarks;
      } else {
        // Default to Present for ease of roll call
        statusMap[st.id] = 'Present';
      }
    });

    setCurrentStatuses(statusMap);
    setRemarksState(remarksMap);
    setSaveSuccessMessage(null);
  }, [selectedClass, selectedDate, attendance, classStudents]);

  // Handlers for status toggle
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setCurrentStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: string, text: string) => {
    setRemarksState((prev) => ({ ...prev, [studentId]: text }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: { [id: string]: AttendanceStatus } = {};
    filteredClassStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setCurrentStatuses((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;

    // Check Class Teacher authorization
    const perm = canPerformClassOperations(selectedClass.name, 'attendance');
    if (!perm.allowed) {
      setRestrictionError(
        perm.reason ||
          `Access restricted: Attendance for ${selectedClass.name} is managed exclusively by the assigned Class Teacher, ${selectedClass.classTeacher}. If this assignment needs to change, please contact the Principal.`
      );
      return;
    }

    setRestrictionError(null);
    setIsSaving(true);

    const records: Omit<AttendanceRecord, 'id'>[] = filteredClassStudents.map((st) => ({
      date: selectedDate,
      class: selectedClass.name,
      section: st.section,
      studentId: st.id,
      studentName: st.name,
      rollNo: st.rollNo,
      status: currentStatuses[st.id] || 'Present',
      remarks: remarksState[st.id] || undefined,
      recordedBy: currentUser.name || 'Class Teacher',
    }));

    await markAttendanceBatch(records);
    setIsSaving(false);
    setSaveSuccessMessage(`Attendance successfully recorded for ${records.length} students on ${selectedDate}.`);

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
  };

  // Class selection handler
  const handleSelectClass = (cls: SchoolClass) => {
    setSelectedClass(cls);
    setSelectedSection('All');
    setSearchQuery('');
    setRestrictionError(null);
    setActiveView('class-sheet');
  };

  // Export handlers
  const handleExportSheetPDF = () => {
    if (!selectedClass) return;
    const currentRecords: AttendanceRecord[] = filteredClassStudents.map((st) => ({
      id: `att-export-${st.id}`,
      date: selectedDate,
      class: selectedClass.name,
      section: st.section,
      studentId: st.id,
      studentName: st.name,
      rollNo: st.rollNo,
      status: currentStatuses[st.id] || 'Present',
      remarks: remarksState[st.id],
      recordedBy: currentUser.name || 'Class Teacher',
    }));
    exportAttendanceReportPDF(
      `${selectedClass.name} (Date: ${selectedDate})`,
      currentRecords,
      {
        schoolName: activeSchool?.name,
        dateRangeLabel: selectedDate,
        className: selectedClass.name,
        generatedBy: `${currentUser.name} (${activeRole})`,
      }
    );
  };

  const handleExportSheetCSV = () => {
    if (!selectedClass) return;
    const currentRecords: AttendanceRecord[] = filteredClassStudents.map((st) => ({
      id: `att-export-${st.id}`,
      date: selectedDate,
      class: selectedClass.name,
      section: st.section,
      studentId: st.id,
      studentName: st.name,
      rollNo: st.rollNo,
      status: currentStatuses[st.id] || 'Present',
      remarks: remarksState[st.id],
      recordedBy: currentUser.name || 'Class Teacher',
    }));
    exportAttendanceCSV(currentRecords, {
      schoolName: activeSchool?.name,
      className: selectedClass.name,
      dateRangeLabel: selectedDate,
      generatedBy: `${currentUser.name} (${activeRole})`,
    });
  };

  // Offline report filtered records calculation
  const offlineReportRecords = useMemo(() => {
    return attendance.filter((rec) => {
      if (reportClassFilter !== 'All' && rec.class !== reportClassFilter) {
        return false;
      }
      if (reportSectionFilter !== 'All' && rec.section !== reportSectionFilter) {
        return false;
      }
      if (reportStatusFilter !== 'All' && rec.status !== reportStatusFilter) {
        return false;
      }
      if (reportDatePreset === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (rec.date !== todayStr) return false;
      } else if (reportDatePreset === 'last7') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const last7Str = d.toISOString().split('T')[0];
        if (rec.date < last7Str) return false;
      } else if (reportDatePreset === 'thisMonth') {
        const m = new Date().toISOString().slice(0, 7);
        if (!rec.date.startsWith(m)) return false;
      } else if (reportDatePreset === 'custom') {
        if (reportStartDate && rec.date < reportStartDate) return false;
        if (reportEndDate && rec.date > reportEndDate) return false;
      }
      return true;
    });
  }, [
    attendance,
    reportClassFilter,
    reportSectionFilter,
    reportStatusFilter,
    reportDatePreset,
    reportStartDate,
    reportEndDate,
  ]);

  const offlineReportStats = useMemo(() => {
    const total = offlineReportRecords.length;
    const present = offlineReportRecords.filter((r) => r.status === 'Present').length;
    const absent = offlineReportRecords.filter((r) => r.status === 'Absent').length;
    const permission = offlineReportRecords.filter(
      (r) => r.status === 'Permission' || r.status === 'Late'
    ).length;
    const rate = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;
    return { total, present, absent, permission, rate };
  }, [offlineReportRecords]);

  const handleDownloadOfflineCSV = () => {
    const rangeLabel =
      reportDatePreset === 'today'
        ? `Today (${new Date().toISOString().split('T')[0]})`
        : reportDatePreset === 'last7'
        ? 'Last 7 Days'
        : reportDatePreset === 'thisMonth'
        ? 'Current Month'
        : reportDatePreset === 'custom'
        ? `${reportStartDate} to ${reportEndDate}`
        : 'Full Academic Term';

    exportAttendanceCSV(offlineReportRecords, {
      schoolName: activeSchool?.name,
      className: reportClassFilter,
      dateRangeLabel: rangeLabel,
      generatedBy: `${currentUser.name} (${activeRole})`,
    });
  };

  const handleDownloadOfflinePDF = () => {
    const rangeLabel =
      reportDatePreset === 'today'
        ? `Today (${new Date().toISOString().split('T')[0]})`
        : reportDatePreset === 'last7'
        ? 'Last 7 Days'
        : reportDatePreset === 'thisMonth'
        ? 'Current Month'
        : reportDatePreset === 'custom'
        ? `${reportStartDate} to ${reportEndDate}`
        : 'Full Academic Term';

    const targetLabel =
      reportClassFilter === 'All' ? 'All Classes Academy Audit' : reportClassFilter;

    exportAttendanceReportPDF(targetLabel, offlineReportRecords, {
      schoolName: activeSchool?.name,
      dateRangeLabel: rangeLabel,
      generatedBy: `${currentUser.name} (${activeRole})`,
    });
  };

  // Student Direct View
  const isStudent = activeRole === 'Student';
  const targetStudentId = currentUser.role === 'Student' ? currentUser.studentId : undefined;
  const targetStudent = students.find((s) => s.id === targetStudentId) || students[0];

  if (isStudent) {
    return (
      <div className="animate-fade-in space-y-6">
        <StudentAttendanceDashboard
          student={targetStudent}
          attendanceRecords={attendance}
          allStudents={students}
          isStandalone={true}
        />
      </div>
    );
  }

  // Active Sheet Summary Stats
  const sheetStats = useMemo(() => {
    const total = filteredClassStudents.length;
    const present = filteredClassStudents.filter((s) => (currentStatuses[s.id] || 'Present') === 'Present').length;
    const absent = filteredClassStudents.filter((s) => currentStatuses[s.id] === 'Absent').length;
    const permission = filteredClassStudents.filter((s) => currentStatuses[s.id] === 'Permission' || currentStatuses[s.id] === 'Late').length;
    const rate = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;
    return { total, present, absent, permission, rate };
  }, [filteredClassStudents, currentStatuses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* VIEW 1: MY CLASSES / ALL CLASSES SELECTION SCREEN */}
      {activeView === 'classes' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <CalendarCheck className="w-6 h-6" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeRole === 'Teacher' ? 'My Classes - Daily Attendance' : 'School Attendance Directory'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a class to mark daily roll call, manage excuse permissions, or inspect student attendance dashboards.
              </p>
            </div>

            {/* Date Selector for Overview & Offline Report Generator Button */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Roll Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setReportClassFilter('All');
                  setIsOfflineReportModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
                title="Generate CSV or PDF Offline Reports"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Offline Reports</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar for Faculty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {activeRole === 'Teacher' ? 'Assigned Classes' : 'Active Classes'}
                </span>
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Layers className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {accessibleClasses.length} Classes
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {activeRole === 'Teacher' ? 'Your teaching assignments' : 'Full academy roster'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Enrolled Students
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {students.length} Students
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Active in 2026 Academic Term
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Overall Academy Attendance
                </span>
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                96.8%
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                Satisfies National Accreditation
              </p>
            </div>
          </div>

          {/* Classes Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Select Class for Attendance</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {accessibleClasses.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {accessibleClasses.map((cls) => {
                const enrolledInClass = students.filter((s) => s.class === cls.name);
                const classTotalStudents = enrolledInClass.length;

                // Check attendance for selected date
                const dateRecords = attendance.filter(
                  (a) => a.class === cls.name && a.date === selectedDate
                );
                const isMarked = dateRecords.length > 0;
                const presentCount = dateRecords.filter((r) => r.status === 'Present').length;

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/60 dark:hover:border-purple-500/60 p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-100 dark:border-purple-900">
                            {cls.code || 'CLS'}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {cls.roomNumber || 'Room 101'}
                          </span>
                        </div>

                        {/* Status for selected date */}
                        {isMarked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Marked ({presentCount}/{classTotalStudents})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Pending Today</span>
                          </span>
                        )}
                      </div>

                      {/* Class Name */}
                      <div className="mt-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Class Teacher: {cls.classTeacher || 'Assigned Faculty'}
                        </p>
                      </div>

                      {/* Student Count & Progress Bar */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Enrolled Students</span>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {classTotalStudents} / {cls.capacity || 40}
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{
                              width: `${Math.min(100, (classTotalStudents / (cls.capacity || 40)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>Sections:</span>
                        {(cls.sections || ['A']).map((sec) => (
                          <span
                            key={sec}
                            className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                      >
                        <span>Take Attendance</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CLASS ATTENDANCE SHEET & STUDENT ATTENDANCE CARDS */}
      {activeView === 'class-sheet' && selectedClass && (
        <div className="space-y-6">
          {/* Breadcrumb & Navigation Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('classes')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                title="Back to Class List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Attendance
                  </span>
                  <span className="text-slate-400">&gt;</span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedClass.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {selectedClass.code || 'CLS'} • {selectedClass.roomNumber || 'Room 101'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Class Teacher: {selectedClass.classTeacher || 'Assigned Faculty'} | Total Enrolled: {classStudents.length}
                </p>
              </div>
            </div>

            {/* Quick Export & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setReportClassFilter(selectedClass.name);
                  setIsOfflineReportModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-2xs transition-colors cursor-pointer"
                title="Open Offline Report Generator with custom filters"
              >
                <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Offline Report Options</span>
              </button>
              <button
                onClick={handleExportSheetCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportSheetPDF}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Print PDF Sheet</span>
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Restriction / Polite Guidance Banner */}
          {restrictionError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">Class Teacher Assignment Required</p>
                  <p className="mt-0.5 leading-relaxed">{restrictionError}</p>
                </div>
              </div>
              <button
                onClick={() => setRestrictionError(null)}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 p-1 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Read-Only Notice if not designated class teacher */}
          {!canPerformClassOperations(selectedClass.name, 'attendance').allowed && !restrictionError && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  Read-Only Roll View
                </span>
                <p>
                  Class Teacher: <span className="font-bold text-slate-900 dark:text-white">{selectedClass.classTeacher || 'Assigned Faculty'}</span>. Official roll updates are restricted to the designated Class Teacher.
                </p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{saveSuccessMessage}</span>
              </div>
              <button
                onClick={() => setSaveSuccessMessage(null)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Control Bar: Date Selector, Section Filter, Search, View Mode */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Controls: Date + Section */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Section Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Section:</span>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="All">All Sections</option>
                    {(selectedClass.sections || ['A', 'B']).map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Right Controls: Batch Mark All & Layout Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleMarkAll('Present')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
                <button
                  onClick={() => handleMarkAll('Absent')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark All Absent</span>
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setDisplayMode('cards')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      displayMode === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      displayMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Dense Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Stats Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total in Sheet:</span>
                <span className="font-bold text-sm">{sheetStats.total}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold flex items-center justify-between border border-emerald-100 dark:border-emerald-900/50">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Present:
                </span>
                <span className="font-bold text-sm">{sheetStats.present}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-semibold flex items-center justify-between border border-rose-100 dark:border-rose-900/50">
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5" /> Absent:
                </span>
                <span className="font-bold text-sm">{sheetStats.absent}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-semibold flex items-center justify-between border border-amber-100 dark:border-amber-900/50">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Permission:
                </span>
                <span className="font-bold text-sm">{sheetStats.permission}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 font-semibold flex items-center justify-between border border-purple-100 dark:border-purple-900/50 col-span-2 sm:col-span-1">
                <span className="text-purple-600 dark:text-purple-400">Daily Rate:</span>
                <span className="font-bold text-sm">{sheetStats.rate}%</span>
              </div>
            </div>
          </div>

          {/* STUDENT ATTENDANCE CARDS GRID (Display Mode: Cards) */}
          {displayMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClassStudents.map((student) => {
                const currentStatus = currentStatuses[student.id] || 'Present';
                const currentRemarks = remarksState[student.id] || '';

                return (
                  <div
                    key={student.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-2xs transition-all duration-150 flex flex-col justify-between ${
                      currentStatus === 'Present'
                        ? 'border-emerald-200/80 dark:border-emerald-900/50'
                        : currentStatus === 'Absent'
                        ? 'border-rose-200/80 dark:border-rose-900/50'
                        : 'border-amber-200/80 dark:border-amber-900/50'
                    }`}
                  >
                    <div>
                      {/* Card Header: Avatar, Name, ID, Section, View Button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={student.name}
                            avatarUrl={student.avatar}
                            size="lg"
                            className="border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {student.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="font-mono">{student.id}</span>
                              <span>•</span>
                              <span>Roll #{student.rollNo}</span>
                            </div>
                          </div>
                        </div>

                        {/* Section & View Dashboard Button */}
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Sec {student.section}
                          </span>
                          <button
                            onClick={() => setViewingStudentDashboard(student)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 transition-colors"
                            title="View Student Attendance Dashboard"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 3 Interactive Attendance Status Buttons: Present | Absent | Permission */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {/* Present Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs scale-100 ring-2 ring-emerald-400/40'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        {/* Absent Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Absent')}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow-xs scale-100 ring-2 ring-rose-400/40'
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        {/* Permission Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Permission')}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            currentStatus === 'Permission' || currentStatus === 'Late'
                              ? 'bg-amber-500 text-white shadow-xs scale-100 ring-2 ring-amber-400/40'
                              : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 dark:bg-slate-800/80 dark:hover:bg-amber-950/40 dark:text-slate-300 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Permission</span>
                        </button>
                      </div>
                    </div>

                    {/* Remarks Input */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. Doctor excuse, traffic)..."
                        value={currentRemarks}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DENSE TABLE VIEW (Display Mode: Table) */}
          {displayMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">School ID</th>
                      <th className="py-3 px-4">Roll #</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4 text-center">Attendance Status</th>
                      <th className="py-3 px-4">Remarks / Excuse</th>
                      <th className="py-3 px-4 text-center">Dashboard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredClassStudents.map((student) => {
                      const currentStatus = currentStatuses[student.id] || 'Present';
                      const currentRemarks = remarksState[student.id] || '';

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar
                                name={student.name}
                                avatarUrl={student.avatar}
                                size="sm"
                              />
                              <span className="font-bold text-slate-900 dark:text-white">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">{student.id}</td>
                          <td className="py-3 px-4">#{student.rollNo}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                              {student.section}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Absent')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Permission')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'Permission' || currentStatus === 'Late'
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                Permission
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Notes..."
                              value={currentRemarks}
                              onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 w-44"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setViewingStudentDashboard(student)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
                              title="View Student Dashboard"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredClassStudents.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                No students found in {selectedClass.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try clearing your search query or selecting a different section.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STUDENT ATTENDANCE DASHBOARD MODAL */}
      {viewingStudentDashboard && (
        <Modal
          isOpen={true}
          onClose={() => setViewingStudentDashboard(null)}
          title={`Student Attendance Analytics - ${viewingStudentDashboard.name}`}
          maxWidth="2xl"
        >
          <StudentAttendanceDashboard
            student={viewingStudentDashboard}
            attendanceRecords={attendance}
            allStudents={students}
            onClose={() => setViewingStudentDashboard(null)}
          />
        </Modal>
      )}

      {/* OFFLINE ATTENDANCE REPORT GENERATOR MODAL */}
      {isOfflineReportModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsOfflineReportModalOpen(false)}
          title="Attendance Offline Report Generator"
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Offline Report Export Engine</p>
                <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  Export high-fidelity CSV and PDF attendance logs for administrative review, offline archival, and government or accreditation auditing.
                </p>
              </div>
            </div>

            {/* Filter Configuration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              {/* Class Scope */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class Scope
                </label>
                <select
                  value={reportClassFilter}
                  onChange={(e) => setReportClassFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="All">All Academy Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.classTeacher || 'Teacher'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section
                </label>
                <select
                  value={reportSectionFilter}
                  onChange={(e) => setReportSectionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              {/* Date Preset */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time Period
                </label>
                <select
                  value={reportDatePreset}
                  onChange={(e) => setReportDatePreset(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="all">Full Academic Term</option>
                  <option value="today">Today Only</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="thisMonth">Current Month</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Status
                </label>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="All">All Statuses (Present, Absent, Excused)</option>
                  <option value="Present">Present Only</option>
                  <option value="Absent">Absent Only</option>
                  <option value="Permission">Excused / Permission Only</option>
                </select>
              </div>

              {/* Custom Date Pickers if selected */}
              {reportDatePreset === 'custom' && (
                <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Statistics Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Matched Logs</span>
                <span className="text-lg font-black">{offlineReportStats.total}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Present Count</span>
                <span className="text-lg font-black">{offlineReportStats.present}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <span className="block text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Absent Count</span>
                <span className="text-lg font-black">{offlineReportStats.absent}</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <span className="block text-[11px] text-purple-600 dark:text-purple-400 font-semibold">Attendance Rate</span>
                <span className="text-lg font-black">{offlineReportStats.rate}%</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ready to generate offline report for {offlineReportRecords.length} records.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadOfflineCSV}
                  disabled={offlineReportRecords.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadOfflinePDF}
                  disabled={offlineReportRecords.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
