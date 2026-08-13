import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Exam, StudentMark } from '../../types';
import { Modal } from '../common/Modal';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Sparkles,
  Search
} from 'lucide-react';

export const ExamModule: React.FC = () => {
  const { activeRole, activeChildId, currentUser } = useAuth();
  const { exams, marks, students, addExam, addOrUpdateMark, globalSearch } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'exams' | 'marks' | 'analytics'>('exams');
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);

  const defaultStudentId = currentUser.role === 'Student'
    ? currentUser.studentId
    : (activeChildId || 'STU-0021');

  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(defaultStudentId);

  useEffect(() => {
    setSelectedStudentReport(defaultStudentId);
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
    studentId: students[0]?.id || 'STU-0021',
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Examination & Grades</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule examinations, enter marks, generate official report cards & view analytics
          </p>
        </div>
        {(activeRole === 'Admin' || activeRole === 'Teacher') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMarkModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs hover:bg-purple-100 transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Enter Student Marks</span>
            </button>
            <button
              onClick={() => setIsAddExamModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-2xs w-full sm:w-auto inline-flex gap-1">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'exams'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Exam Schedules
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'marks'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Student Report Cards
        </button>
      </div>

      {/* Exam Schedules */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                    {ex.term}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ex.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {ex.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800">{ex.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dates: {ex.startDate} to {ex.endDate}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Participating Classes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ex.classes.map((cls, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('marks')}
                className="w-full mt-6 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors"
              >
                View Grade Reports
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Student Report Cards Tab */}
      {activeTab === 'marks' && (
        <div className={`grid grid-cols-1 ${activeRole === 'Admin' || activeRole === 'Teacher' ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Student Selector (Admin / Teacher Only) */}
          {(activeRole === 'Admin' || activeRole === 'Teacher') && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Select Student</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {students.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentReport(st.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                      selectedStudentReport === st.id
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <img src={st.avatar} alt={st.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{st.name}</p>
                      <p className="text-[10px] text-slate-400">Roll: #{st.rollNo} • {st.class}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Card Preview */}
          <div className={`${activeRole === 'Admin' || activeRole === 'Teacher' ? 'lg:col-span-2' : 'w-full'} bg-white p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-6`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">EduSpike Official Report Card</h2>
                  <p className="text-xs text-slate-400">Mid-Term Academic Examination 2026</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Student Name</span>
                <span className="font-bold text-slate-800">{reportStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Roll Number</span>
                <span className="font-bold text-slate-800">#{reportStudent.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Class & Section</span>
                <span className="font-bold text-purple-700">{reportStudent.class} ({reportStudent.section})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Attendance Rate</span>
                <span className="font-bold text-emerald-700">{reportStudent.attendanceRate}%</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5">Marks Obtained</th>
                    <th className="py-2.5">Total Marks</th>
                    <th className="py-2.5">Grade</th>
                    <th className="py-2.5">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reportStudentMarks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No marks entered for this student yet. Click "Enter Student Marks" above to record grades.
                      </td>
                    </tr>
                  ) : (
                    reportStudentMarks.map((m) => (
                      <tr key={m.id}>
                        <td className="py-3 font-bold text-slate-800">{m.subject}</td>
                        <td className="py-3 font-semibold text-purple-700">{m.marksObtained}</td>
                        <td className="py-3 text-slate-500">{m.totalMarks}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded font-black text-xs bg-purple-100 text-purple-800">
                            {m.grade}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{m.remarks || 'Satisfactory'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      <Modal isOpen={isAddExamModalOpen} onClose={() => setIsAddExamModalOpen(false)} title="Create Examination Schedule">
        <form onSubmit={handleCreateExam} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              placeholder="e.g. Final Annual Examination 2026"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
          >
            Schedule Exam
          </button>
        </form>
      </Modal>

      {/* Enter Student Marks Modal */}
      <Modal isOpen={isMarkModalOpen} onClose={() => setIsMarkModalOpen(false)} title="Enter Student Grade / Mark">
        <form onSubmit={handleSaveMark} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
            <select
              value={markForm.studentId}
              onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (#{st.rollNo} - {st.class})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={markForm.subject}
                onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Literature">Literature</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marks Obtained</label>
              <input
                type="number"
                required
                max={100}
                value={markForm.marksObtained}
                onChange={(e) => setMarkForm({ ...markForm, marksObtained: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Remarks</label>
            <input
              type="text"
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
              placeholder="e.g. Excellent understanding of algebra"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
          >
            Save Grade Entry
          </button>
        </form>
      </Modal>
    </div>
  );
};
