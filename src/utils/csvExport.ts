import { Student, Teacher } from '../types';

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
