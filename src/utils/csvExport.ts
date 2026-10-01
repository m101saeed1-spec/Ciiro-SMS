import { Student, Teacher, AttendanceRecord } from '../types';

/**
 * Helper to escape individual CSV cell values according to RFC 4180
 */
function escapeCSVValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains quotes, commas, or newlines, escape internal quotes and wrap in quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Universal CSV download trigger with UTF-8 BOM support
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const headerLine = headers.map(escapeCSVValue).join(',');
  const rowLines = rows.map((row) => row.map(escapeCSVValue).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export full or filtered student directory as CSV
 */
export function exportStudentsCSV(students: Student[], filenameSuffix?: string): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanSuffix = filenameSuffix ? `_${filenameSuffix.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const filename = `Students_Directory_${dateStr}${cleanSuffix}.csv`;

  const headers = [
    'Student ID',
    'Roll Number',
    'Full Name',
    'Email',
    'Class',
    'Section',
    'Gender',
    'Date of Birth',
    'Blood Group',
    'Attendance Rate (%)',
    'Status',
    'Enrollment Date',
    'Parent/Guardian Name',
    'Parent Phone',
    'Parent Email',
  ];

  const rows = students.map((s) => [
    s.id,
    s.rollNo,
    s.name,
    s.email,
    s.class,
    s.section,
    s.gender,
    s.dob,
    s.bloodGroup,
    s.attendanceRate,
    s.status,
    s.enrollmentDate,
    s.parentName,
    s.parentPhone,
    s.parentEmail,
  ]);

  downloadCSV(filename, headers, rows);
}

/**
 * Export full or filtered teacher directory as CSV
 */
export function exportTeachersCSV(teachers: Teacher[], filenameSuffix?: string): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanSuffix = filenameSuffix ? `_${filenameSuffix.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const filename = `Teachers_Directory_${dateStr}${cleanSuffix}.csv`;

  const headers = [
    'Teacher ID',
    'Full Name',
    'Designation',
    'Email',
    'Phone',
    'Assigned Subjects',
    'Assigned Classes',
    'Qualification',
    'Gender',
    'Status',
    'Joining Date',
  ];

  const rows = teachers.map((t) => [
    t.teacherId || t.id,
    t.name,
    t.designation || 'Faculty Instructor',
    t.email,
    t.phone,
    t.subjects?.join('; ') || '',
    t.classesAssigned?.join('; ') || '',
    t.qualification,
    t.gender,
    t.status,
    t.joiningDate,
  ]);

  downloadCSV(filename, headers, rows);
}

export interface AttendanceCSVExportOptions {
  schoolName?: string;
  className?: string;
  dateRangeLabel?: string;
  generatedBy?: string;
}

/**
 * Export student attendance records as offline CSV report with metrics summary
 */
export function exportAttendanceCSV(
  records: AttendanceRecord[],
  options: AttendanceCSVExportOptions = {}
): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const classPart = options.className && options.className !== 'All' 
    ? `_${options.className.replace(/[^a-zA-Z0-9_-]/g, '_')}` 
    : '_All_Classes';
  const filename = `Attendance_Report${classPart}_${dateStr}.csv`;

  const headers = [
    'Date',
    'Class',
    'Section',
    'School ID',
    'Roll Number',
    'Student Name',
    'Attendance Status',
    'Recorded By',
    'Remarks',
  ];

  const rows: (string | number | null | undefined)[][] = records.map((r) => [
    r.date,
    r.class,
    r.section || 'A',
    r.studentId,
    r.rollNo,
    r.studentName,
    r.status,
    r.recordedBy || 'Class Teacher',
    r.remarks || '',
  ]);

  // Statistical calculations for administrative offline audit
  const total = records.length;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const permission = records.filter((r) => r.status === 'Permission' || r.status === 'Late').length;
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  // Append empty row and comprehensive summary metadata
  rows.push(['', '', '', '', '', '', '', '', '']);
  rows.push(['--- ATTENDANCE REPORT SUMMARY ---', '', '', '', '', '', '', '', '']);
  if (options.schoolName) {
    rows.push(['Institution', options.schoolName, '', '', '', '', '', '', '']);
  }
  if (options.dateRangeLabel) {
    rows.push(['Period / Date Range', options.dateRangeLabel, '', '', '', '', '', '', '']);
  }
  if (options.className) {
    rows.push(['Class Scope', options.className, '', '', '', '', '', '', '']);
  }
  rows.push(['Total Attendance Records', String(total), '', '', '', '', '', '', '']);
  rows.push(['Present Total', String(present), '', '', '', '', '', '', '']);
  rows.push(['Absent Total', String(absent), '', '', '', '', '', '', '']);
  rows.push(['Permission / Late Total', String(permission), '', '', '', '', '', '', '']);
  rows.push(['Attendance Percentage', `${rate}%`, '', '', '', '', '', '', '']);
  if (options.generatedBy) {
    rows.push(['Generated By', options.generatedBy, '', '', '', '', '', '', '']);
  }
  rows.push(['Generated Timestamp', new Date().toLocaleString(), '', '', '', '', '', '', '']);

  downloadCSV(filename, headers, rows);
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileType: string;
  size: string;
  date: string;
}

/**
 * Export document manifest as CSV
 */
export function exportDocumentsCSV(docs: DocumentItem[], schoolName?: string): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Academic_Documents_Manifest_${dateStr}.csv`;
  const headers = [
    'Document ID',
    'Document Title',
    'Category',
    'File Format',
    'File Size',
    'Issue Date',
    'Verification Status',
    'Issuing Institution',
  ];
  const rows = docs.map((d) => [
    d.id,
    d.title,
    d.category,
    d.fileType,
    d.size,
    d.date,
    'Certified & Digitally Signed',
    schoolName || 'EduSpike Academy',
  ]);
  downloadCSV(filename, headers, rows);
}

