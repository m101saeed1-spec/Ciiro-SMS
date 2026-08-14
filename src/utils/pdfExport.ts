import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Student,
  Teacher,
  StudentMark,
  StudentFeeRecord,
  FeePayment,
  AttendanceRecord,
  LibraryBook,
  TimetableSlot,
  Notice,
  ActivityLog,
  SchoolClass,
} from '../types';

export interface PDFExportOptions {
  schoolName?: string;
  affiliationNo?: string;
  address?: string;
  contact?: string;
  generatedBy?: string;
  userRole?: string;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  schoolName: 'EDUSPIKE INTERNATIONAL ACADEMY',
  affiliationNo: 'AFF-REG/2026-8891-B',
  address: '104 Harmony Boulevard, Educational Zone, Academic Hills',
  contact: 'Tel: +1 (555) 019-2834 | Email: registrar@eduspike.edu | Web: eduspike.edu',
};

// Helper: Add consistent School Header with Logo Emblem & Document Title
function addHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string,
  options: PDFExportOptions = {}
) {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header banner background
  doc.setFillColor(30, 27, 75); // Deep Indigo/Purple
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Decorative Accent bar
  doc.setFillColor(147, 51, 234); // Purple 600
  doc.rect(0, 32, pageWidth, 2.5, 'F');

  // School Emblem Symbol (Vector drawing)
  doc.setFillColor(147, 51, 234);
  doc.roundedRect(14, 6, 20, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('E', 21, 20);

  // School Name & Subtitles
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(merged.schoolName || 'EDUSPIKE INTERNATIONAL ACADEMY', 38, 13);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(216, 180, 254);
  doc.text(`${merged.affiliationNo} | ${merged.address}`, 38, 19);
  doc.text(merged.contact || '', 38, 25);

  // Document Title Banner below header
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 34.5, pageWidth, 16, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 50.5, pageWidth, 50.5);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), 14, 44.5);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${today} | Ref: DOC-${Date.now().toString().slice(-6)}`, pageWidth - 14, 44.5, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 48.5);
  }
}

// Helper: Add consistent Footer with Page Numbers & Security Stamp
function addFooter(doc: jsPDF, totalPagesExp: string = '{total_pages}') {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Official Document • EduSpike Academic Management System • Confidential', 14, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPagesExp}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }
}

// 1. EXPORT: Student Academic Report Form / Term Grade Card
export function exportStudentReportPDF(
  student: Student,
  marks: StudentMark[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, 'OFFICIAL STUDENT ACADEMIC REPORT FORM', 'Term Evaluation & Performance Transcript', options);

  // Student Profile Summary Box
  const startY = 56;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, 182, 34, 2, 2, 'FD');
  doc.setDrawColor(203, 213, 225);

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', 18, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.name, 45, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('School ID:', 18, startY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.id, 45, startY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Roll Number:', 18, startY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.rollNo, 45, startY + 24);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Class & Section:', 110, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.class} - Section ${student.section}`, 140, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Academic Year:', 110, startY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('2026-2027 (Term 1)', 140, startY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Attendance Rate:', 110, startY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.attendanceRate}% (Satisfactory)`, 140, startY + 24);

  // Table of marks
  const studentMarks = marks.filter((m) => m.studentId === student.id);
  const totalObtained = studentMarks.reduce((acc, m) => acc + m.marksObtained, 0);
  const totalMax = studentMarks.reduce((acc, m) => acc + m.totalMarks, 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0';

  const tableBody = studentMarks.map((m, idx) => [
    idx + 1,
    m.subject,
    m.marksObtained,
    m.totalMarks,
    m.grade,
    m.marksObtained >= 50 ? 'PASS' : 'FAIL',
    m.remarks || 'Commendable effort',
  ]);

  autoTable(doc, {
    startY: startY + 38,
    head: [['#', 'Subject Course', 'Marks Obtained', 'Full Marks', 'Grade', 'Result', 'Instructor Remarks']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217], // Violet 700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 48 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Summary box
  doc.setFillColor(243, 232, 255); // Purple 100
  doc.roundedRect(14, finalY, 182, 18, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(88, 28, 135);
  doc.text(`Total Score: ${totalObtained} / ${totalMax}   |   Overall Percentage: ${percentage}%   |   Final Grade: ${Number(percentage) >= 90 ? 'A+' : Number(percentage) >= 80 ? 'A' : 'B'}`, 20, finalY + 11);

  // Signatures Section
  const sigY = finalY + 38;
  doc.setDrawColor(148, 163, 184);
  doc.line(18, sigY, 68, sigY);
  doc.line(78, sigY, 128, sigY);
  doc.line(138, sigY, 188, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Class Teacher Signature', 43, sigY + 5, { align: 'center' });
  doc.text('Head of Academics', 103, sigY + 5, { align: 'center' });
  doc.text('Principal & Official Seal', 163, sigY + 5, { align: 'center' });

  addFooter(doc);
  doc.save(`Report_Form_${student.name.replace(/\s+/g, '_')}_${student.id}.pdf`);
}

// 2. EXPORT: Official Fee Payment Receipt
export function exportFeeReceiptPDF(
  payment: FeePayment,
  feeRecord?: StudentFeeRecord,
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, 'OFFICIAL SCHOOL FEE PAYMENT RECEIPT', 'Accounts & Bursar Department', options);

  const startY = 56;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, 182, 38, 2, 2, 'FD');
  doc.setDrawColor(203, 213, 225);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Receipt Number:', 18, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.id, 50, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Student Name:', 18, startY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.studentName, 50, startY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Student ID:', 18, startY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.studentId, 50, startY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Class & Section:', 18, startY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${payment.class} ${payment.section ? `- Section ${payment.section}` : ''}`, 50, startY + 32);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Date:', 110, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.paymentDate, 145, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Method:', 110, startY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.paymentMethod, 145, startY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Transaction Ref:', 110, startY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.transactionReference, 145, startY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Status:', 110, startY + 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Emerald 800
  doc.text(payment.status.toUpperCase(), 145, startY + 32);

  // Table of Item Breakdown
  autoTable(doc, {
    startY: startY + 44,
    head: [['Item Description', 'Category', 'Total Fee', 'Amount Paid', 'Remaining Balance']],
    body: [
      [
        payment.title || 'School Academic Fee',
        payment.category || feeRecord?.category || 'Tuition',
        `$${(feeRecord?.totalAmount || payment.amountPaid).toLocaleString()}`,
        `$${payment.amountPaid.toLocaleString()}`,
        `$${(feeRecord?.remainingBalance ?? 0).toLocaleString()}`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 32, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Paid Stamp Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, finalY, 182, 22, 2, 2, 'FD');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(`PAID IN FULL: $${payment.amountPaid.toLocaleString()} USD`, 20, finalY + 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 222, 128);
  doc.text(`Received by: ${payment.receivedBy}`, 140, finalY + 13);

  // Signatures
  const sigY = finalY + 45;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, sigY, 80, sigY);
  doc.line(122, sigY, 182, sigY);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Student / Guardian Signature', 50, sigY + 5, { align: 'center' });
  doc.text('Bursar / Cashier Signature & Stamp', 152, sigY + 5, { align: 'center' });

  addFooter(doc);
  doc.save(`Fee_Receipt_${payment.id}_${payment.studentName.replace(/\s+/g, '_')}.pdf`);
}

// 3. EXPORT: Exam Results & Ranking Sheet
export function exportExamRankingPDF(
  examTitle: string,
  targetClass: string,
  rankings: Array<{
    rank: number;
    studentName: string;
    rollNo: string;
    studentId: string;
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    grade: string;
  }>,
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, `EXAM RANKING & MERIT LIST: ${examTitle}`, `Class: ${targetClass} | Academic Standing`, options);

  const tableBody = rankings.map((r) => [
    r.rank,
    r.studentName,
    r.studentId,
    r.rollNo,
    `${r.totalMarks} / ${r.maxMarks}`,
    `${r.percentage}%`,
    r.grade,
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['Rank', 'Student Name', 'School ID', 'Roll No', 'Score', 'Percentage', 'Grade']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
    },
  });

  addFooter(doc);
  doc.save(`Exam_Ranking_${examTitle.replace(/\s+/g, '_')}_${targetClass}.pdf`);
}

// 4. EXPORT: Attendance Report
export function exportAttendanceReportPDF(
  targetClass: string,
  records: AttendanceRecord[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, `ATTENDANCE REGISTRY REPORT: ${targetClass}`, 'Daily Classroom Attendance Audit Log', options);

  const tableBody = records.map((r, idx) => [
    idx + 1,
    r.date,
    r.studentName,
    r.studentId,
    r.rollNo,
    r.status.toUpperCase(),
    r.remarks || '-',
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Date', 'Student Name', 'School ID', 'Roll No', 'Status', 'Remarks']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
  });

  addFooter(doc);
  doc.save(`Attendance_Report_${targetClass.replace(/\s+/g, '_')}.pdf`);
}

// 5. EXPORT: Student Directory List
export function exportStudentListPDF(
  students: Student[],
  filterLabel: string = 'All Enrolled Students',
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  addHeader(doc, 'OFFICIAL STUDENT ENROLLMENT ROSTER', filterLabel, options);

  const tableBody = students.map((s, idx) => [
    idx + 1,
    s.id,
    s.name,
    s.rollNo,
    `${s.class} - ${s.section}`,
    s.gender,
    s.parentName,
    s.parentPhone,
    `${s.attendanceRate}%`,
    s.status,
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'School ID', 'Student Name', 'Roll No', 'Class', 'Gender', 'Guardian', 'Contact Phone', 'Att Rate', 'Status']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
  });

  addFooter(doc);
  doc.save(`Student_Roster_${Date.now().toString().slice(-4)}.pdf`);
}

// 6. EXPORT: Faculty & Teachers Directory List
export function exportTeacherListPDF(
  teachers: Teacher[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, 'FACULTY & TEACHING STAFF DIRECTORY', 'Academic Department Roster', options);

  const tableBody = teachers.map((t, idx) => [
    idx + 1,
    t.teacherId,
    t.name,
    t.subjects.join(', '),
    t.classesAssigned.join(', '),
    t.email,
    t.phone,
    t.status,
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Staff ID', 'Faculty Name', 'Subjects', 'Assigned Classes', 'Email', 'Phone', 'Status']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
  });

  addFooter(doc);
  doc.save(`Faculty_Directory_${Date.now().toString().slice(-4)}.pdf`);
}

// 7. EXPORT: Timetable Schedule PDF
export function exportTimetablePDF(
  targetClass: string,
  slots: TimetableSlot[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  addHeader(doc, `CLASS TIMETABLE & PERIOD SCHEDULE: ${targetClass}`, 'Weekly Instructional Schedule', options);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const tableBody = slots.map((s, idx) => [
    idx + 1,
    s.day,
    `${s.startTime} - ${s.endTime}`,
    s.type,
    s.subject || '-',
    s.teacherName || '-',
    s.roomNumber || '-',
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Day of Week', 'Time Slot', 'Type', 'Subject Course', 'Instructor', 'Classroom']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
  });

  addFooter(doc);
  doc.save(`Timetable_${targetClass.replace(/\s+/g, '_')}.pdf`);
}

// 8. EXPORT: Library Books Catalog & Borrowing Report
export function exportLibraryReportPDF(
  books: LibraryBook[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, 'LIBRARY CATALOG & CIRCULATION REPORT', 'Resource Inventory & Lending Status', options);

  const tableBody = books.map((b, idx) => [
    idx + 1,
    b.bookId,
    b.name,
    b.writer,
    b.subject,
    b.class,
    `${b.availableCopies} / ${b.totalCopies}`,
    b.status,
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Book ID', 'Title', 'Author', 'Subject', 'Class', 'Copies', 'Status']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
  });

  addFooter(doc);
  doc.save(`Library_Catalog_Report.pdf`);
}

// 9. EXPORT: Activity & Audit Trail Log (Admin Only)
export function exportActivityLogsPDF(
  logs: ActivityLog[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  addHeader(doc, 'SYSTEM AUDIT & SECURITY ACTIVITY LOGS', 'Administrative Compliance & Event Records', options);

  const tableBody = logs.map((l, idx) => [
    idx + 1,
    l.timestamp,
    l.user,
    l.userRole || 'System',
    l.module || l.type,
    l.action,
    l.description || '-',
    l.ipAddress || '192.168.1.10',
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Timestamp', 'User Name', 'Role', 'Module', 'Action', 'Description', 'IP Address']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 27, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 32, fontStyle: 'bold' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 60 },
      6: { cellWidth: 60 },
      7: { cellWidth: 25, halign: 'center' },
    },
  });

  addFooter(doc);
  doc.save(`System_Audit_Logs_${Date.now().toString().slice(-4)}.pdf`);
}

export const exportAuditLogsPDF = exportActivityLogsPDF;

// 10. EXPORT: Official Notice Bulletin
export function exportNoticePDF(
  notice: Notice,
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, 'OFFICIAL SCHOOL NOTICE BULLETIN', `Priority: ${notice.priority.toUpperCase()}`, options);

  const startY = 58;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, 182, 25, 2, 2, 'FD');
  doc.setDrawColor(203, 213, 225);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Title: ${notice.title}`, 20, startY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Posted By: ${notice.postedBy} (${notice.postedByRole})   |   Date: ${notice.date}   |   Audience: ${notice.audience}`, 20, startY + 16);

  // Content body
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const splitContent = doc.splitTextToSize(notice.content, 180);
  doc.text(splitContent, 16, startY + 38);

  // Signoff
  const endY = startY + 38 + splitContent.length * 6 + 20;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized by:', 16, endY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${notice.postedBy}, ${notice.postedByRole}`, 16, endY + 6);
  doc.text('EduSpike International Academy Administration', 16, endY + 11);

  addFooter(doc);
  doc.save(`Notice_${notice.title.slice(0, 20).replace(/\s+/g, '_')}.pdf`);
}
