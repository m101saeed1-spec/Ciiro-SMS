export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Parent';

export interface UserProfile {
  id: string;
  schoolId: string; // e.g., "ADM-2026-0001", "TCH-2026-0007", "STU-2026-0125", "PAR-2026-0042"
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  designation?: string;
  joinDate?: string;
  bio?: string;
  address?: string;
  studentId?: string; // For students
  teacherId?: string; // For teachers
  parentId?: string; // For parents
  linkedStudentIds?: string[]; // For parents with 1 or more children
  assignedClasses?: string[]; // For teachers
  assignedSubjects?: string[]; // For teachers
}

export interface Student {
  id: string; // Unique Student School ID e.g. STU-2026-0125
  schoolId?: string;
  rollNo: string;
  name: string;
  avatar: string;
  email: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  bloodGroup: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentId?: string;
  status: 'Active' | 'Graduated' | 'Suspended';
  enrollmentDate: string;
  attendanceRate: number; // e.g. 96.5%
}

export interface Teacher {
  id: string;
  teacherId: string; // Teacher School ID e.g. TCH-2026-0007
  schoolId?: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  subjects: string[];
  classesAssigned: string[];
  qualification: string;
  joiningDate: string;
  gender: 'Male' | 'Female' | 'Other';
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface LibraryBook {
  id: string;
  bookId: string; // e.g., #0011
  name: string;
  writer: string;
  subject: string;
  class: string;
  publishDate: string;
  coverImage?: string;
  status: 'Available' | 'Borrowed';
  borrowerName?: string;
  borrowerRole?: UserRole;
  dueDate?: string;
  totalCopies: number;
  availableCopies: number;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. Class 01, Class 02
  code: string;
  sections: string[]; // e.g. ['A', 'B', 'C']
  classTeacher: string; // Teacher Name
  classTeacherId: string;
  totalStudents: number;
  capacity: number;
  roomNumber: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'Theory' | 'Practical' | 'Both';
  classes: string[]; // e.g. ['01', '02', '03']
  teachers: string[]; // Teacher Names
  passMarks: number;
  totalMarks: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  class: string;
  section: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface Exam {
  id: string;
  title: string; // e.g. Mid-Term Examination 2026
  term: 'First Term' | 'Mid-Term' | 'Final Exam';
  startDate: string;
  endDate: string;
  classes: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface ExamSchedule {
  id: string;
  examId: string;
  subject: string;
  class: string;
  date: string;
  time: string;
  duration: string; // e.g. '2 Hours'
  fullMarks: number;
  passMarks: number;
}

export interface StudentMark {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  class: string;
  section: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string; // A+, A, B, C, F
  remarks?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedByRole: string;
  date: string;
  audience: 'All' | 'Teachers' | 'Students' | 'Parents';
  priority: 'High' | 'Medium' | 'Low';
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'book' | 'student' | 'teacher' | 'notice' | 'attendance' | 'exam';
}
