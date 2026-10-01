import { Teacher, Student } from '../types';
import { downloadCSV } from './csvExport';

/**
 * Universal RFC 4180 compliant CSV parser
 * Handles quoted cells, escaped quotes (""), commas within cells, and cross-platform line breaks.
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim(); // Remove UTF-8 BOM if present
  if (!cleanText) return { headers: [], rows: [] };

  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++; // Skip \n
        currentLine.push(currentField.trim());
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else if (char === '\n') {
        currentLine.push(currentField.trim());
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push trailing field and line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const rawHeaders = lines[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    // Skip empty lines
    if (line.length === 0 || (line.length === 1 && line[0] === '')) continue;

    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, index) => {
      rowObj[header] = line[index] !== undefined ? line[index].trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

/**
 * Downloads a standard Teacher CSV Import Template with example data
 */
export function downloadTeacherImportTemplate(): void {
  const headers = [
    'Teacher ID',
    'Full Name',
    'Email',
    'Phone',
    'Gender',
    'Qualification',
    'Subjects',
    'Classes Assigned',
  ];

  const rows = [
    [
      'TCH-2026-0091',
      'Dr. Marcus Vance',
      'marcus.vance@eduspike.edu',
      '+1 (555) 345-6789',
      'Male',
      'Ph.D Mathematics',
      'Mathematics, Physics',
      'Class 01, Class 02',
    ],
    [
      'TCH-2026-0092',
      'Elena Rostova',
      'elena.rostova@eduspike.edu',
      '+1 (555) 887-1234',
      'Female',
      'M.A. English Literature',
      'English, Literature',
      'Class 03, Class 04',
    ],
  ];

  downloadCSV('Teachers_Import_Template.csv', headers, rows);
}

/**
 * Downloads a standard Student CSV Import Template with example data
 */
export function downloadStudentImportTemplate(): void {
  const headers = [
    'Roll Number',
    'Full Name',
    'Email',
    'Class',
    'Section',
    'Gender',
    'Date of Birth (YYYY-MM-DD)',
    'Blood Group',
    'Parent Name',
    'Parent Phone',
    'Parent Email',
  ];

  const rows = [
    [
      '202491',
      'Lucas Bennett',
      'lucas.bennett@eduspike.edu',
      'Class 01',
      'A',
      'Male',
      '2015-05-12',
      'O+',
      'Robert Bennett',
      '+1 (555) 234-5678',
      'robert.bennett@example.com',
    ],
    [
      '202492',
      'Maya Lin',
      'maya.lin@eduspike.edu',
      'Class 02',
      'B',
      'Female',
      '2016-08-20',
      'A+',
      'Grace Lin',
      '+1 (555) 876-5432',
      'grace.lin@example.com',
    ],
  ];

  downloadCSV('Students_Import_Template.csv', headers, rows);
}

export interface TeacherValidationResult {
  rowNumber: number;
  raw: Record<string, string>;
  isValid: boolean;
  errors: string[];
  data?: Omit<Teacher, 'id'>;
}

export function validateTeacherRows(
  rows: Record<string, string>[],
  existingTeachers: Teacher[]
): TeacherValidationResult[] {
  const existingTeacherIds = new Set(existingTeachers.map((t) => t.teacherId.toUpperCase()));
  const existingEmails = new Set(existingTeachers.map((t) => t.email.toLowerCase()));
  const batchTeacherIds = new Set<string>();
  const batchEmails = new Set<string>();

  return rows.map((row, idx) => {
    const rowNumber = idx + 2; // +1 for 0-index, +1 for header line
    const errors: string[] = [];

    // Header case-insensitive lookup
    const getVal = (keys: string[]) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase());
        if (foundKey && row[foundKey] !== undefined) return row[foundKey].trim();
      }
      return '';
    };

    const teacherId = getVal(['Teacher ID', 'TeacherID', 'ID', 'School ID']);
    const name = getVal(['Full Name', 'Name', 'Teacher Name']);
    const email = getVal(['Email', 'Email Address']);
    const phone = getVal(['Phone', 'Phone Number', 'Contact']);
    const genderRaw = getVal(['Gender', 'Sex']);
    const qualification = getVal(['Qualification', 'Degree', 'Education']);
    const subjectsRaw = getVal(['Subjects', 'Subject', 'Assigned Subjects']);
    const classesRaw = getVal(['Classes Assigned', 'Classes', 'Assigned Classes', 'Class']);

    if (!name) {
      errors.push('Full Name is required.');
    }

    let cleanId = teacherId.toUpperCase();
    if (!cleanId) {
      // Auto-generate if omitted
      cleanId = `TCH-2026-${String(900 + idx).padStart(4, '0')}`;
    }

    if (existingTeacherIds.has(cleanId)) {
      errors.push(`Teacher ID "${cleanId}" is already registered in the school system.`);
    } else if (batchTeacherIds.has(cleanId)) {
      errors.push(`Duplicate Teacher ID "${cleanId}" within this CSV file.`);
    } else {
      batchTeacherIds.add(cleanId);
    }

    const cleanEmail = email || (name ? `${name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu` : '');
    if (cleanEmail) {
      if (existingEmails.has(cleanEmail.toLowerCase())) {
        errors.push(`Email "${cleanEmail}" is already registered.`);
      } else if (batchEmails.has(cleanEmail.toLowerCase())) {
        errors.push(`Duplicate email "${cleanEmail}" in CSV.`);
      } else {
        batchEmails.add(cleanEmail.toLowerCase());
      }
    }

    const gender: 'Male' | 'Female' | 'Other' =
      genderRaw.toLowerCase().startsWith('m')
        ? 'Male'
        : genderRaw.toLowerCase().startsWith('f')
        ? 'Female'
        : 'Female';

    const subjects = subjectsRaw
      ? subjectsRaw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
      : ['General Sciences'];

    const classesAssigned = classesRaw
      ? classesRaw.split(/[,;|]/).map((c) => c.trim()).filter(Boolean)
      : ['Class 01'];

    const isValid = errors.length === 0;

    let data: Omit<Teacher, 'id'> | undefined;
    if (isValid) {
      data = {
        teacherId: cleanId,
        name,
        avatar:
          gender === 'Male'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        email: cleanEmail,
        phone: phone || '+1 (555) 000-8899',
        subjects,
        classesAssigned,
        qualification: qualification || 'B.Ed / M.Sc',
        joiningDate: new Date().toISOString().split('T')[0],
        gender,
        status: 'Active',
      };
    }

    return {
      rowNumber,
      raw: row,
      isValid,
      errors,
      data,
    };
  });
}

export interface StudentValidationResult {
  rowNumber: number;
  raw: Record<string, string>;
  isValid: boolean;
  errors: string[];
  data?: Omit<Student, 'id'>;
}

export function validateStudentRows(
  rows: Record<string, string>[],
  existingStudents: Student[],
  availableClasses: string[] = ['Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05']
): StudentValidationResult[] {
  const existingRollNos = new Set(existingStudents.map((s) => `${s.class}-${s.rollNo}`));
  const batchRollNos = new Set<string>();

  return rows.map((row, idx) => {
    const rowNumber = idx + 2;
    const errors: string[] = [];

    const getVal = (keys: string[]) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase());
        if (foundKey && row[foundKey] !== undefined) return row[foundKey].trim();
      }
      return '';
    };

    const rollNo = getVal(['Roll Number', 'RollNo', 'Roll No', 'Roll', 'Student Roll']);
    const name = getVal(['Full Name', 'Name', 'Student Name']);
    const email = getVal(['Email', 'Student Email', 'Email Address']);
    let cls = getVal(['Class', 'Grade']);
    const section = getVal(['Section']) || 'A';
    const genderRaw = getVal(['Gender', 'Sex']);
    const dob = getVal(['Date of Birth (YYYY-MM-DD)', 'Date of Birth', 'DOB', 'Birth Date']) || '2016-05-12';
    const bloodGroup = getVal(['Blood Group', 'Blood Type']) || 'A+';
    const parentName = getVal(['Parent Name', 'Guardian Name', 'Parent/Guardian Name']) || 'Parent / Guardian';
    const parentPhone = getVal(['Parent Phone', 'Guardian Phone', 'Emergency Phone']) || '+1 (555) 000-1122';
    const parentEmail = getVal(['Parent Email', 'Guardian Email']) || '';

    if (!name) {
      errors.push('Student Full Name is required.');
    }

    if (!cls) {
      errors.push('Class assignment is required (e.g. Class 01).');
    } else {
      // Normalize class format (e.g. "1" -> "Class 01", "Class 1" -> "Class 01")
      if (/^\d+$/.test(cls)) {
        cls = `Class ${cls.padStart(2, '0')}`;
      } else if (/^class\s*\d+$/i.test(cls)) {
        const num = cls.replace(/\D/g, '');
        cls = `Class ${num.padStart(2, '0')}`;
      }
    }

    const cleanRollNo = rollNo || String(202400 + existingStudents.length + idx + 1);
    const classRollKey = `${cls}-${cleanRollNo}`;

    if (existingRollNos.has(classRollKey)) {
      errors.push(`Roll #${cleanRollNo} already exists in ${cls}.`);
    } else if (batchRollNos.has(classRollKey)) {
      errors.push(`Duplicate Roll #${cleanRollNo} in ${cls} within this CSV.`);
    } else {
      batchRollNos.add(classRollKey);
    }

    const gender: 'Male' | 'Female' | 'Other' =
      genderRaw.toLowerCase().startsWith('m')
        ? 'Male'
        : genderRaw.toLowerCase().startsWith('f')
        ? 'Female'
        : 'Female';

    const cleanEmail =
      email || (name ? `${name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu` : '');

    const isValid = errors.length === 0;

    let data: Omit<Student, 'id'> | undefined;
    if (isValid) {
      data = {
        rollNo: cleanRollNo,
        name,
        avatar:
          gender === 'Male'
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        email: cleanEmail,
        class: cls,
        section: section.toUpperCase(),
        gender,
        dob,
        bloodGroup,
        parentName,
        parentPhone,
        parentEmail,
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        attendanceRate: 98.0,
      };
    }

    return {
      rowNumber,
      raw: row,
      isValid,
      errors,
      data,
    };
  });
}
