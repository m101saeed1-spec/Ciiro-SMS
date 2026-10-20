import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Exam, StudentMark } from '../../types';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Sparkles,
  Search,
  AlertCircle,
  XCircle,
  TrendingUp,
  BarChart2,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight,
  User,
  Check,
} from 'lucide-react';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#3B82F6', // Ileys Blue
  English: '#3b82f6',     // Blue
  Physics: '#10b981',     // Emerald
  Chemistry: '#f59e0b',   // Amber
  Biology: '#06b6d4',     // Cyan
  Literature: '#ec4899',  // Pink
};

export const ExamModule: React.FC = () => {
  const { activeRole, currentUser, canPerformClassOperations } = useAuth();
  const { exams, marks, students, addExam, addOrUpdateMark } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'exams' | 'marks' | 'analytics'>('exams');
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [examRestrictionError, setExamRestrictionError] = useState<string | null>(null);

  const defaultStudentId = currentUser.role === 'Student'
    ? currentUser.studentId
    : (students[0]?.id || 'STU-2026-0125');

  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(defaultStudentId);
  const [selectedTrendStudentId, setSelectedTrendStudentId] = useState<string>(defaultStudentId || 'STU-2026-0125');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [showClassBenchmark, setShowClassBenchmark] = useState<boolean>(true);

  useEffect(() => {
    setSelectedStudentReport(defaultStudentId);
    if (defaultStudentId) {
      setSelectedTrendStudentId(defaultStudentId);
    }
  }, [defaultStudentId]);

  // New Exam Form
  const [examForm, setExamForm] = useState({
    title: '',
    term: 'Mid-Term' as 'First Term' | 'Mid-Term' | 'Final Exam',
    startDate: '2026-09-15',
    endDate: '2026-09-25',
  });

  // Enter Mark Form
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    examId: exams[0]?.id || 'ex-1',
    studentId: students[0]?.id || 'STU-2026-0125',
    subject: 'Mathematics',
    marksObtained: 85,
    totalMarks: 100,
    remarks: 'Great problem solving',
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({
      title: examForm.title,
      term: examForm.term,
      startDate: examForm.startDate,
      endDate: examForm.endDate,
      classes: ['Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05'],
      status: 'Upcoming',
    });
    setIsAddExamModalOpen(false);
    setExamForm({
      title: '',
      term: 'Mid-Term',
      startDate: '2026-09-15',
      endDate: '2026-09-25',
    });
  };

  const handleSaveMark = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === markForm.studentId);
    if (!student) return;

    const perm = canPerformClassOperations(student.class, 'marks');
    if (!perm.allowed) {
      setExamRestrictionError(
        perm.reason ||
          `Access restricted: Mark recording for ${student.class} is managed exclusively by the assigned Class Teacher. If this assignment needs to change, please contact the Principal.`
      );
      setIsMarkModalOpen(false);
      return;
    }

    setExamRestrictionError(null);
    const percentage = (markForm.marksObtained / markForm.totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';

    addOrUpdateMark({
      examId: markForm.examId,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      class: student.class,
      section: student.section,
      subject: markForm.subject,
      marksObtained: Number(markForm.marksObtained),
      totalMarks: Number(markForm.totalMarks),
      grade,
      remarks: markForm.remarks,
    });
    setIsMarkModalOpen(false);
  };

  const reportStudent = students.find((s) => s.id === selectedStudentReport) || students[0];
  const reportStudentMarks = marks.filter((m) => m.studentId === reportStudent.id);

  // Selected student for Trend Analysis
  const trendStudent = students.find((s) => s.id === selectedTrendStudentId) || students[0];
  const trendStudentMarks = useMemo(() => {
    return marks.filter((m) => m.studentId === trendStudent?.id);
  }, [marks, trendStudent]);

  // Available subjects for this student
  const studentSubjects = useMemo(() => {
    const set = new Set<string>();
    trendStudentMarks.forEach((m) => set.add(m.subject));
    return Array.from(set);
  }, [trendStudentMarks]);

  // Prepare chronological line chart trend data across semester
  const trendChartData = useMemo(() => {
    // Sort exams by startDate
    const sortedExams = [...exams].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return sortedExams
      .map((ex) => {
        const studentMarksForExam = marks.filter(
          (m) => m.examId === ex.id && m.studentId === trendStudent?.id
        );
        const allMarksForExam = marks.filter((m) => m.examId === ex.id);

        const classAverage =
          allMarksForExam.length > 0
            ? Number(
                (
                  allMarksForExam.reduce(
                    (acc, curr) => acc + (curr.marksObtained / curr.totalMarks) * 100,
                    0
                  ) / allMarksForExam.length
                ).toFixed(1)
              )
            : null;

        // Label for X-Axis
        const shortName = ex.title
          .replace('2026', '')
          .replace('Semester', '')
          .replace('Examination', 'Exam')
          .trim();

        const dataPoint: Record<string, any> = {
          examId: ex.id,
          examName: shortName || ex.term,
          fullTitle: ex.title,
          term: ex.term,
          startDate: ex.startDate,
          status: ex.status,
          classAverage,
        };

        let totalMarksSum = 0;
        let subjectsEvaluated = 0;

        studentMarksForExam.forEach((m) => {
          const pct = Number(((m.marksObtained / m.totalMarks) * 100).toFixed(1));
          dataPoint[m.subject] = pct;
          totalMarksSum += pct;
          subjectsEvaluated += 1;
        });

        dataPoint.overallAverage =
          subjectsEvaluated > 0
            ? Number((totalMarksSum / subjectsEvaluated).toFixed(1))
            : null;

        return dataPoint;
      })
      .filter((dp) => dp.overallAverage !== null || dp.classAverage !== null);
  }, [exams, marks, trendStudent]);

  // Analytics summary metrics
  const analyticsSummary = useMemo(() => {
    if (trendChartData.length === 0) {
      return { currentAvg: 0, delta: 0, bestSubject: 'N/A', totalExams: 0 };
    }

    const firstPoint = trendChartData[0];
    const latestPoint = trendChartData[trendChartData.length - 1];
    const currentAvg = latestPoint?.overallAverage || 0;
    const initialAvg = firstPoint?.overallAverage || 0;
    const delta = Number((currentAvg - initialAvg).toFixed(1));

    // Best subject by average score
    const subjectScores: Record<string, { total: number; count: number }> = {};
    trendStudentMarks.forEach((m) => {
      const pct = (m.marksObtained / m.totalMarks) * 100;
      if (!subjectScores[m.subject]) subjectScores[m.subject] = { total: 0, count: 0 };
      subjectScores[m.subject].total += pct;
      subjectScores[m.subject].count += 1;
    });

    let bestSubject = 'N/A';
    let highestScore = -1;
    Object.entries(subjectScores).forEach(([sub, data]) => {
      const avg = data.total / data.count;
      if (avg > highestScore) {
        highestScore = avg;
        bestSubject = `${sub} (${avg.toFixed(0)}%)`;
      }
    });

    return {
      currentAvg,
      delta,
      bestSubject,
      totalExams: trendChartData.length,
    };
  }, [trendChartData, trendStudentMarks]);

  // Custom Tooltip for Recharts Line Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-2 min-w-[200px] backdrop-blur-xs">
          <div className="border-b border-slate-700 pb-1.5">
            <p className="font-bold text-slate-100 text-sm">{data.fullTitle || label}</p>
            <p className="text-[10px] text-[#F7A914] font-medium">
              Term: {data.term} • Date: {data.startDate}
            </p>
          </div>

          <div className="space-y-1 pt-1">
            {payload.map((entry: any, index: number) => {
              if (entry.value === null || entry.value === undefined) return null;
              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 font-medium">{entry.name}:</span>
                  </div>
                  <span className="font-bold text-white">
                    {entry.value}%
                  </span>
                </div>
              );
            })}
          </div>

          {data.overallAverage && (
            <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-semibold">Semester GPA:</span>
              <span className="font-black text-emerald-400">{data.overallAverage}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold border border-[#1E3A63] flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {activeRole === 'Student' ? 'My Academic Performance' : 'Examination & Grades'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeRole === 'Student' ? 'My Results & Academic Trends' : 'Examination & Academic Grades'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeRole === 'Student'
              ? 'View semester grade trends, subject progression charts, exam timetables, and verified report cards.'
              : 'Schedule examinations, enter marks, visualize semester grade trends & generate report cards'}
          </p>
        </div>
        {(activeRole === 'Admin' || activeRole === 'Teacher' || activeRole === 'Principal') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMarkModalOpen(true)}
              className="btn-outline-navy text-xs py-2 px-3.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#3B82F6]" />
              <span>Enter Student Marks</span>
            </button>
            <button
              onClick={() => setIsAddExamModalOpen(true)}
              className="btn-gold text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </button>
          </div>
        )}
      </div>

      {/* Restriction Alert */}
      {examRestrictionError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-100">Grade Recording Authority Required</p>
              <p className="mt-0.5 leading-relaxed">{examRestrictionError}</p>
            </div>
          </div>
          <button
            onClick={() => setExamRestrictionError(null)}
            className="text-amber-700 dark:text-amber-300 hover:text-amber-900 p-1 rounded-lg"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs w-full sm:w-auto inline-flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'exams'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Exam Schedules</span>
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'marks'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Student Report Cards</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Grade Trends & Analytics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXAM SCHEDULES */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] font-bold text-[10px] border border-[#1E3A63]">
                      {ex.term}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ex.status === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ex.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Dates: {ex.startDate} to {ex.endDate}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                      Participating Classes
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ex.classes.map((cls, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('marks')}
                    className="flex-1 py-2 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] font-bold text-xs hover:bg-[#EFF6FF] dark:hover:bg-[#0B1B32] border border-[#1E3A63] dark:border-[#1E3A63] transition-colors text-center cursor-pointer"
                  >
                    View Report Cards
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="View Grade Trends Line Chart"
                  >
                    <TrendingUp className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT REPORT CARDS */}
      {/* ========================================================================= */}
      {activeTab === 'marks' && (
        <div className={`grid grid-cols-1 ${activeRole !== 'Student' ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Student Selector (Admin / Teacher / Principal) */}
          {activeRole !== 'Student' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Student</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                  {students.length} Pupils
                </span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {students.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentReport(st.id);
                      setSelectedTrendStudentId(st.id);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                      selectedStudentReport === st.id
                        ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] border-[#1E3A63] ring-2 ring-[#F7A914]/20'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <UserAvatar name={st.name} avatarUrl={st.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        Roll: #{st.rollNo} • {st.class} ({st.section})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Card Preview */}
          <div className={`${activeRole !== 'Student' ? 'lg:col-span-2' : 'w-full'} bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#122E52] text-white flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">EduSpike Official Report Card</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">2026 Academic Term Examination Portfolio</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTrendStudentId(reportStudent.id);
                    setActiveTab('analytics');
                  }}
                  className="p-2 rounded-xl border border-[#1E3A63] bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] hover:bg-[#EFF6FF] dark:hover:bg-[#0B1B32] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
                  <span>View Grade Trends</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Student Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{reportStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Roll Number</span>
                <span className="font-bold text-slate-900 dark:text-white">#{reportStudent.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Class & Section</span>
                <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA]">{reportStudent.class} ({reportStudent.section})</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Attendance Rate</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{reportStudent.attendanceRate}%</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5">Marks Obtained</th>
                    <th className="py-2.5">Total Marks</th>
                    <th className="py-2.5">Percentage</th>
                    <th className="py-2.5">Grade</th>
                    <th className="py-2.5">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                  {reportStudentMarks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        No marks entered for this student yet. Click "Enter Student Marks" above to record grades.
                      </td>
                    </tr>
                  ) : (
                    reportStudentMarks.map((m) => {
                      const pct = ((m.marksObtained / m.totalMarks) * 100).toFixed(0);
                      return (
                        <tr key={m.id}>
                          <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: SUBJECT_COLORS[m.subject] || '#122E52' }}
                            />
                            {m.subject}
                          </td>
                          <td className="py-3 font-semibold text-[#3B82F6] dark:text-[#60A5FA]">{m.marksObtained}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400">{m.totalMarks}</td>
                          <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{pct}%</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] border border-[#1E3A63]">
                              {m.grade}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400">{m.remarks || 'Satisfactory progress'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GRADE TRENDS & ANALYTICS (RECHARTS LINE CHART VISUALIZATION) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Controls & Metrics Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Student Selector Card (for Faculty/Admin) */}
            {activeRole !== 'Student' ? (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
                      Active Student
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                      {trendStudent?.class}
                    </span>
                  </div>
                  <select
                    value={selectedTrendStudentId}
                    onChange={(e) => setSelectedTrendStudentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id} className="dark:bg-slate-800">
                        {st.name} (#{st.rollNo} • {st.class})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Enrolled: Class {trendStudent?.class}</span>
                  <span className="font-semibold text-[#3B82F6] dark:text-[#60A5FA]">Roll #{trendStudent?.rollNo}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{trendStudent?.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Roll #{trendStudent?.rollNo} • {trendStudent?.class} ({trendStudent?.section})
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active Semester Student
                  </span>
                </div>
              </div>
            )}

            {/* Metric 1: Semester Current Average */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Current Semester Avg
                </span>
                <span className="p-2 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914]">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {analyticsSummary.currentAvg > 0 ? `${analyticsSummary.currentAvg}%` : 'N/A'}
                </p>
                <p className="text-xs text-[#3B82F6] dark:text-[#60A5FA] font-semibold mt-0.5">
                  {analyticsSummary.currentAvg >= 90
                    ? 'Grade A+ (Distinction)'
                    : analyticsSummary.currentAvg >= 80
                    ? 'Grade A (Excellent)'
                    : analyticsSummary.currentAvg >= 70
                    ? 'Grade B (Good)'
                    : 'Passing Standards'}
                </p>
              </div>
            </div>

            {/* Metric 2: Semester Delta / Net Improvement */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Semester Trend
                </span>
                <span className={`p-2 rounded-xl ${
                  analyticsSummary.delta >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className={`text-2xl font-black ${
                  analyticsSummary.delta >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {analyticsSummary.delta >= 0 ? `+${analyticsSummary.delta}%` : `${analyticsSummary.delta}%`}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Improvement from Baseline Test
                </p>
              </div>
            </div>

            {/* Metric 3: Highest Scoring Subject */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Top Subject & Tests
                </span>
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-lg font-black text-slate-900 dark:text-white truncate">
                  {analyticsSummary.bestSubject}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {analyticsSummary.totalExams} Consecutive Assessments
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Line Chart Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
            {/* Chart Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Student Semester Grade Trajectory</span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                    Recharts Multi-Line Visualization
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tracking score percentages across consecutive semester terms with subject decomposition and class benchmarks.
                </p>
              </div>

              {/* Subject Filter Pills and Benchmark Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Subject Filter Chips */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setSelectedSubjectFilter('All')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedSubjectFilter === 'All'
                        ? 'bg-white dark:bg-slate-900 text-[#3B82F6] dark:text-[#60A5FA] shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Subjects
                  </button>
                  {studentSubjects.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubjectFilter(sub)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedSubjectFilter === sub
                          ? 'bg-white dark:bg-slate-900 text-[#3B82F6] dark:text-[#60A5FA] shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* Benchmark Toggle Button */}
                <button
                  onClick={() => setShowClassBenchmark(!showClassBenchmark)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    showClassBenchmark
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Toggle Class Benchmark Comparison Line"
                >
                  <span className={`w-2 h-2 rounded-full ${showClassBenchmark ? 'bg-[#3B82F6]' : 'bg-slate-400'}`} />
                  <span>Class Benchmark</span>
                </button>
              </div>
            </div>

            {/* Recharts Line Chart Container */}
            <div className="w-full h-[380px] sm:h-[420px] pt-2">
              {trendChartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <TrendingUp className="w-12 h-12 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No exam data available for this student yet.</p>
                  <p className="text-xs">Record grades in the "Enter Student Marks" dialog to visualize trends.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                    <XAxis
                      dataKey="examName"
                      stroke="#94a3b8"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[50, 100]}
                      ticks={[50, 60, 70, 80, 90, 100]}
                      stroke="#94a3b8"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(val) => `${val}%`}
                      dx={-5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 600 }}
                    />

                    {/* Standard Accreditation Reference Line */}
                    <ReferenceLine
                      y={60}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Min Passing (60%)',
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideBottomRight',
                        fontWeight: 'bold',
                      }}
                    />

                    {/* Distinction Benchmark Reference Line */}
                    <ReferenceLine
                      y={85}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Distinction Honor (85%)',
                        fill: '#10b981',
                        fontSize: 10,
                        position: 'insideTopRight',
                        fontWeight: 'bold',
                      }}
                    />

                    {/* Class Benchmark Comparison Line */}
                    {showClassBenchmark && (
                      <Line
                        type="monotone"
                        dataKey="classAverage"
                        name="Class Benchmark Average"
                        stroke="#64748b"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ r: 4, stroke: '#64748b', strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    )}

                    {/* Overall Student Average Line */}
                    {(selectedSubjectFilter === 'All' || selectedSubjectFilter === 'Average') && (
                      <Line
                        type="monotone"
                        dataKey="overallAverage"
                        name="Student Overall GPA Average"
                        stroke="#a855f7"
                        strokeWidth={3.5}
                        dot={{ r: 5, stroke: '#9333ea', strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 7, stroke: '#7e22ce', strokeWidth: 2 }}
                      />
                    )}

                    {/* Subject-specific lines */}
                    {studentSubjects.map((subject) => {
                      if (selectedSubjectFilter !== 'All' && selectedSubjectFilter !== subject) {
                        return null;
                      }

                      const color = SUBJECT_COLORS[subject] || '#8b5cf6';
                      return (
                        <Line
                          key={subject}
                          type="monotone"
                          dataKey={subject}
                          name={subject}
                          stroke={color}
                          strokeWidth={selectedSubjectFilter === subject ? 3.5 : 2}
                          dot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#fff' }}
                          activeDot={{ r: 6 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Assessment Progress Timeline Table */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Evaluation Sequence Breakdown - {trendStudent?.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5">Assessment Title</th>
                      <th className="py-2.5">Term</th>
                      <th className="py-2.5">Date</th>
                      {studentSubjects.map((sub) => (
                        <th key={sub} className="py-2.5">{sub}</th>
                      ))}
                      <th className="py-2.5">Overall GPA</th>
                      <th className="py-2.5">Class Bench</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                    {trendChartData.map((dp) => (
                      <tr key={dp.examId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {dp.fullTitle}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {dp.term}
                        </td>
                        <td className="py-3 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                          {dp.startDate}
                        </td>
                        {studentSubjects.map((sub) => {
                          const val = dp[sub];
                          return (
                            <td key={sub} className="py-3 font-semibold">
                              {val !== undefined && val !== null ? (
                                <span className={val >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}>
                                  {val}%
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3 font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                          {dp.overallAverage ? `${dp.overallAverage}%` : '-'}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {dp.classAverage ? `${dp.classAverage}%` : '-'}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Evaluated
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add Exam Modal */}
      {/* ========================================================================= */}
      <Modal isOpen={isAddExamModalOpen} onClose={() => setIsAddExamModalOpen(false)} title="Create Examination Schedule">
        <form onSubmit={handleCreateExam} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              placeholder="e.g. Final Annual Examination 2026"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                required
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-gold w-full mt-2 text-xs py-2.5"
          >
            Schedule Exam
          </button>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: Enter Student Marks Modal */}
      {/* ========================================================================= */}
      <Modal isOpen={isMarkModalOpen} onClose={() => setIsMarkModalOpen(false)} title="Enter Student Grade / Mark">
        <form onSubmit={handleSaveMark} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
            <select
              value={markForm.studentId}
              onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6] cursor-pointer"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id} className="dark:bg-slate-800">
                  {st.name} (#{st.rollNo} - {st.class})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <select
                value={markForm.subject}
                onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6] cursor-pointer"
              >
                <option value="Mathematics" className="dark:bg-slate-800">Mathematics</option>
                <option value="English" className="dark:bg-slate-800">English</option>
                <option value="Physics" className="dark:bg-slate-800">Physics</option>
                <option value="Chemistry" className="dark:bg-slate-800">Chemistry</option>
                <option value="Literature" className="dark:bg-slate-800">Literature</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Marks Obtained</label>
              <input
                type="number"
                required
                max={100}
                value={markForm.marksObtained}
                onChange={(e) => setMarkForm({ ...markForm, marksObtained: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher Remarks</label>
            <input
              type="text"
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
              placeholder="e.g. Excellent understanding of algebra"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:border-[#3B82F6]"
            />
          </div>

          <button
            type="submit"
            className="btn-gold w-full mt-2 text-xs py-2.5"
          >
            Save Grade Entry
          </button>
        </form>
      </Modal>
    </div>
  );
};
