import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  FileText,
  Printer,
  Download,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  Star,
  Lock,
} from 'lucide-react';

export const ReportFormModule: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const { students, marks, exams, subjects, addToast } = useSchoolData();
  const reportRef = useRef<HTMLDivElement>(null);

  const [selectedTerm, setSelectedTerm] = useState<string>('Mid-Term');

  // Identify target student
  const student = students.find((s) => s.id === currentUser.studentId) || {
    id: currentUser.studentId || 'STU-2026-0125',
    schoolId: currentUser.schoolId || 'STU-2026-0125',
    rollNo: '12',
    name: currentUser.name || 'Sarah Jenkins',
    class: 'Class 02',
    section: 'A',
    gender: 'Female',
    dob: '2016-04-12',
    parentName: 'Robert Jenkins',
    attendanceRate: 98.5,
  };

  // Student marks
  const studentMarks = marks.filter((m) => m.studentId === student.id);

  // Subject table data for report card
  const reportSubjects = [
    { code: 'MTH-201', name: 'Mathematics', passMarks: 40, fullMarks: 100, obtained: 98, grade: 'A+', remarks: 'Exceptional mathematical and logic skills' },
    { code: 'ENG-201', name: 'English Language', passMarks: 40, fullMarks: 100, obtained: 94, grade: 'A+', remarks: 'Fluent reading comprehension and grammar' },
    { code: 'SCI-201', name: 'General Science', passMarks: 40, fullMarks: 100, obtained: 95, grade: 'A+', remarks: 'Strong analytical curiosity in experiments' },
    { code: 'ART-201', name: 'Creative Arts', passMarks: 40, fullMarks: 100, obtained: 96, grade: 'A+', remarks: 'High creativity and meticulous craft work' },
    { code: 'SOC-201', name: 'Social Studies', passMarks: 40, fullMarks: 100, obtained: 92, grade: 'A+', remarks: 'Thorough understanding of community topics' },
  ];

  const totalFullMarks = reportSubjects.reduce((acc, s) => acc + s.fullMarks, 0);
  const totalObtained = reportSubjects.reduce((acc, s) => acc + s.obtained, 0);
  const overallPercentage = Number(((totalObtained / totalFullMarks) * 100).toFixed(1));

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    addToast({
      title: 'Report Form Generated',
      message: `Official Academic Report for ${student.name} prepared for download.`,
      type: 'success',
    });
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Top Controls Banner (Hidden during print) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold border border-[#1E3A63] dark:border-[#1E3A63] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Official Report Form
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Academic Year 2026-2027</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Student Academic Report Form — {student.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Form
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-md dark:shadow-none transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Report Form Document */}
      <div
        ref={reportRef}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black"
      >
        {/* Institutional Header */}
        <div className="border-b-2 border-[#1E3A63] pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#122E52] text-[#F7A914] flex items-center justify-center font-black text-2xl shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  EDUSPIKE INTERNATIONAL ACADEMY
                </h2>
                <p className="text-xs font-semibold text-[#122E52] dark:text-[#F7A914] uppercase tracking-widest mt-0.5">
                  Excellence in Academic & Character Leadership
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  450 Academic Boulevard, Silicon Campus • Tel: +1 (800) 555-0199 • affiliation #EA-88902
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0 bg-[#EFF6FF] dark:bg-[#1E3A63] p-3 rounded-2xl border border-[#1E3A63] dark:border-[#1E3A63]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA] block">
                Official Report Card
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-0.5">
                Term 1 Examination
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">2026 - 2027</span>
            </div>
          </div>
        </div>

        {/* Student Identification Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Student Name</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">{student.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Student ID</span>
            <span className="font-mono font-bold text-[#122E52] dark:text-[#F7A914] text-sm mt-0.5 block">{student.id}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Class & Section</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">{student.class} - {student.section}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Roll Number</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">#{student.rollNo}</span>
          </div>
        </div>

        {/* Academic Marks & Performance Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              I. Scholastic Academic Performance
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Standard Grading Scale (A+: 90-100)</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 text-center">Pass Marks</th>
                  <th className="py-3 px-4 text-center">Max Marks</th>
                  <th className="py-3 px-4 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportSubjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{sub.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{sub.code}</td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">{sub.passMarks}</td>
                    <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-200 font-medium">{sub.fullMarks}</td>
                    <td className="py-3 px-4 text-center font-black text-[#122E52] dark:text-[#F7A914] text-sm">
                      {sub.obtained}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-black text-[11px]">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 italic text-[11px]">{sub.remarks}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-[#122E52]/20 font-bold text-slate-800 dark:text-slate-100 border-t-2 border-[#1E3A63] text-xs">
                  <td colSpan={3} className="py-3 px-4 font-black uppercase text-[#12233F] dark:text-white">
                    Grand Total
                  </td>
                  <td className="py-3 px-4 text-center font-black">{totalFullMarks}</td>
                  <td className="py-3 px-4 text-center font-black text-[#122E52] dark:text-[#F7A914] text-sm">
                    {totalObtained}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-emerald-700 dark:text-emerald-400">A+</td>
                  <td className="py-3 px-4 text-[#122E52] dark:text-[#F7A914] font-bold">
                    Result: <span className="text-emerald-700 dark:text-emerald-400">PASSED WITH HONORS</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Aggregated Score & Attendance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Aggregate Percentage</span>
            <span className="text-2xl font-black text-[#122E52] dark:text-[#F7A914] mt-1 block">{overallPercentage}%</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">Distinction Standing</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Class Position / Rank</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">Rank #1</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">Out of 32 Students</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Attendance Record</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{student.attendanceRate}%</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">59 of 60 Session Days</span>
          </div>
        </div>

        {/* Co-Scholastic & Behavior Assessment */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-3">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
            II. Co-Scholastic & Behavioral Assessment
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-200">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Punctuality</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Excellent (A)</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Class Discipline</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Exemplary (A+)</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Peer Collaboration</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Outstanding (A+)</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Homework Diligence</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Consistent (A)</span>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63]">
            <span className="font-bold text-[#12233F] dark:text-slate-200 block mb-1">Class Teacher Remarks:</span>
            <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "{student.name} demonstrates extraordinary aptitude, high enthusiasm for problem-solving, and courteous classroom demeanor. A pleasure to instruct."
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 border border-[#3B82F6]/20">
            <span className="font-bold text-[#122E52] dark:text-[#60A5FA] block mb-1">Principal's Recommendation:</span>
            <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "Commended for highest scholastic achievement. Admitted to the Academic Honors Roll for Term 1."
            </p>
          </div>
        </div>

        {/* Signatures & Seal Verification */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 dark:text-slate-300">
          <div>
            <div className="h-10 flex items-end justify-center">
              <span className="font-serif italic font-bold text-slate-800 dark:text-slate-100 text-sm">Eleanor Vance</span>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1.5 font-bold">Class Teacher Signature</div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#1E3A63] flex items-center justify-center text-[9px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase">
              SEAL
            </div>
            <div className="pt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">Institutional Seal</div>
          </div>

          <div>
            <div className="h-10 flex items-end justify-center">
              <span className="font-serif italic font-bold text-slate-800 dark:text-slate-100 text-sm">Dr. Marcus Sterling</span>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1.5 font-bold">Principal Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};
