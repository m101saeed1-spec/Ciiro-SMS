import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { AttendanceRecord } from '../../types';
import { exportAttendanceReportPDF } from '../../utils/pdfExport';
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
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AttendanceModule: React.FC = () => {
  const { activeRole, activeChildId, currentUser } = useAuth();
  const { students, attendance, markAttendanceBatch } = useSchoolData();

  const [selectedClass, setSelectedClass] = useState<string>('Class 02');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter students by selected class & section
  const classStudents = students.filter(
    (s) => s.class === selectedClass && s.section === selectedSection
  );

  // Local attendance state for marking current sheet
  const [currentStatuses, setCurrentStatuses] = useState<{
    [studentId: string]: 'Present' | 'Absent' | 'Late';
  }>(() => {
    const initial: { [id: string]: 'Present' | 'Absent' | 'Late' } = {};
    students.forEach((s) => {
      initial[s.id] = 'Present';
    });
    return initial;
  });

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setCurrentStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent' | 'Late') => {
    const updated: { [id: string]: 'Present' | 'Absent' | 'Late' } = {};
    classStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setCurrentStatuses((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveAttendance = () => {
    const records: Omit<AttendanceRecord, 'id'>[] = classStudents.map((st) => ({
      date: selectedDate,
      class: selectedClass,
      section: selectedSection,
      studentId: st.id,
      studentName: st.name,
      rollNo: st.rollNo,
      status: currentStatuses[st.id] || 'Present',
    }));

    markAttendanceBatch(records);
  };

  // Analytics summary for chart
  const attendanceChartData = [
    { class: 'Class 01', present: 96, absent: 4 },
    { class: 'Class 02', present: 98, absent: 2 },
    { class: 'Class 03', present: 94, absent: 6 },
    { class: 'Class 04', present: 92, absent: 8 },
    { class: 'Class 05', present: 95, absent: 5 },
  ];

  const isStudentOrParent = activeRole === 'Student' || activeRole === 'Parent';
  const targetStudentId = currentUser.role === 'Student' ? currentUser.studentId : activeChildId;
  const targetStudent = students.find((s) => s.id === targetStudentId);

  // Student/Parent attendance history
  const myAttendanceRecords = attendance.filter((a) => a.studentId === targetStudentId);

  if (isStudentOrParent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance Record - {targetStudent?.name || 'Student'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal academic attendance log & history (Class {targetStudent?.class || '02'})
          </p>
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Attendance Rate</span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <UserCheck className="w-5 h-5" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">
              {targetStudent?.attendanceRate || 98.0}%
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Excellent Standing</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Days Present</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">
              {myAttendanceRecords.filter((r) => r.status === 'Present').length + 42} Days
            </p>
            <p className="text-xs text-slate-400 mt-1">Current Academic Term</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Absences Logged</span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <XCircle className="w-5 h-5" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">
              {myAttendanceRecords.filter((r) => r.status === 'Absent').length} Days
            </p>
            <p className="text-xs text-slate-400 mt-1">Total Term Absences</p>
          </div>
        </div>

        {/* Individual Attendance Records Log */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Daily Attendance History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filtered specifically for {targetStudent?.name}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/50 border-b border-purple-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 pl-6">Date</th>
                  <th className="py-3.5 px-4">Class & Sec</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {myAttendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-400">
                      No specific attendance logs found for this term.
                    </td>
                  </tr>
                ) : (
                  myAttendanceRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 pl-6 font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>{rec.date}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold">
                          {rec.class} ({rec.section})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.status === 'Late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {rec.status === 'Present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {rec.status === 'Late' && <Clock className="w-3.5 h-3.5" />}
                          {rec.status === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance Tracker</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Mark daily attendance for classes, track attendance percentages, and generate reports
        </p>
      </div>

      {/* Filter and Class Sheet Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="Class 01">Class 01</option>
              <option value="Class 02">Class 02</option>
              <option value="Class 03">Class 03</option>
              <option value="Class 04">Class 04</option>
              <option value="Class 05">Class 05</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              const currentRecords = classStudents.map((st) => ({
                id: `att-${st.id}-${selectedDate}`,
                studentId: st.id,
                studentName: st.name,
                rollNo: st.rollNo,
                class: selectedClass,
                section: selectedSection,
                date: selectedDate,
                status: currentStatuses[st.id] || 'Present',
              }));
              exportAttendanceReportPDF(`${selectedClass} (${selectedSection}) - ${selectedDate}`, currentRecords);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md shadow-purple-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Sheet
          </button>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Attendance Sheet for {selectedClass} - {selectedSection}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Date: {selectedDate}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
            {classStudents.length} Students List
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 pl-6">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">
                    No students enrolled in {selectedClass} - {selectedSection}.
                  </td>
                </tr>
              ) : (
                classStudents.map((st) => {
                  const status = currentStatuses[st.id] || 'Present';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 pl-6 font-bold text-slate-800">#{st.rollNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-800">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex bg-slate-100 p-1 rounded-2xl gap-1">
                          <button
                            onClick={() => handleStatusChange(st.id, 'Present')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              status === 'Present'
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(st.id, 'Late')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              status === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(st.id, 'Absent')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              status === 'Absent'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Analytics Visual Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <h3 className="text-base font-bold text-slate-800 mb-4">Class Attendance Percentages (%)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="class" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="present" fill="#7c3aed" radius={[8, 8, 0, 0]} name="Present %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
