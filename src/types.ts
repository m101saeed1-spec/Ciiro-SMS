export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Parent';

export interface UserProfile {
  id: string;
  schoolId: string; // e.g., "ADM-2026-0001", "TCH-2026-0007", "STU-2026-0125", "PAR-2026-0042"
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  status?: 'Active' | 'Disabled';
  roleAssignedBy?: string;
  roleAssignedAt?: string;
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

export interface RoleAuditLog {
  id: string;
  userId: string;
  userName: string;
  userSchoolId: string;
  previousRole: UserRole;
  newRole: UserRole;
  changedByAdminId: string;
  changedByAdminName: string;
  changedByAdminSchoolId: string;
  timestamp: string;
  reason: string;
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
  designation?: string;
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

export type FeeCategory =
  | 'Tuition'
  | 'Laboratory'
  | 'Sports'
  | 'Library'
  | 'Admission'
  | 'Development'
  | 'Exam'
  | 'Other';

export interface FeeStructure {
  id: string;
  name: string;
  category: FeeCategory;
  class: string;
  academicYear: string;
  term: 'Term 1' | 'Term 2' | 'Term 3' | 'Annual' | 'Semester 1' | 'Semester 2';
  amount: number;
  dueDate: string;
  description?: string;
}

export interface StudentFeeRecord {
  id: string;
  feeStructureId?: string;
  studentId: string; // School ID e.g. STU-2026-0125
  studentName: string;
  rollNo: string;
  class: string;
  section: string;
  title: string;
  category: FeeCategory;
  totalAmount: number;
  paidAmount: number;
  discountAmount?: number;
  remainingBalance: number;
  dueDate: string;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  academicYear: string;
  term: string;
}

export interface FeePayment {
  id: string; // Receipt No e.g. REC-2026-0089
  feeRecordId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  class: string;
  section?: string;
  title: string;
  category?: FeeCategory;
  amountPaid: number;
  paymentDate: string; // YYYY-MM-DD HH:mm
  paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Online Gateway' | 'Cheque';
  transactionReference: string;
  receivedBy: string;
  status: 'Completed' | 'Reversed' | 'Refunded';
  reversalReason?: string;
  reversedBy?: string;
  reversedAt?: string;
  notes?: string;
}

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  class: string; // e.g. Class 01, Class 02, Class 08
  section: string; // e.g. A, B
  day: TimetableDay;
  startTime: string; // e.g. '08:00'
  endTime: string; // e.g. '08:45'
  type: 'Subject' | 'Break' | 'Assembly' | 'Sports';
  subject?: string;
  teacherId?: string; // e.g. TCH-2026-0007
  teacherName?: string;
  roomNumber?: string;
  notes?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ActivityLogModule =
  | 'Authentication'
  | 'Security'
  | 'Students'
  | 'Teachers'
  | 'Classes'
  | 'Subjects'
  | 'Attendance'
  | 'Exams'
  | 'Fees'
  | 'Library'
  | 'Timetable'
  | 'Notices'
  | 'Chat'
  | 'Profile'
  | 'Reports'
  | 'Export';

export type ActivityLogSeverity = 'info' | 'success' | 'warning' | 'security' | 'danger';

export interface ActivityLog {
  id: string;
  user: string;
  userName?: string;
  userId?: string;
  userSchoolId?: string;
  userRole?: UserRole;
  action: string;
  details?: string;
  description?: string;
  module?: ActivityLogModule | string;
  type: 'book' | 'student' | 'teacher' | 'notice' | 'attendance' | 'exam' | 'fee' | 'timetable' | 'chat' | 'auth' | 'security' | 'pdf' | 'profile' | 'class' | 'subject';
  severity?: ActivityLogSeverity;
  ipAddress?: string;
  deviceInfo?: string;
  timestamp: string;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Students' | 'Teachers' | 'Classes' | 'Subjects' | 'Books' | 'Exams' | 'Notices' | 'Fees' | 'Timetable';
  targetModule: 'students' | 'teachers' | 'class' | 'subject' | 'library' | 'exam' | 'notice' | 'fees' | 'timetable' | 'profile' | 'report';
  recordId?: string;
  badge?: string;
}

export type ChatGroupType = 'AllTeachers' | 'Department' | 'Subject' | 'ClassTeacher' | 'Custom';

export interface ChatMember {
  teacherId: string; // TCH ID or ADM ID
  teacherName: string;
  avatar: string;
  role: 'Admin' | 'Teacher';
  designation?: string;
  groupRole: 'owner' | 'moderator' | 'member';
  joinedAt: string;
  isMuted?: boolean;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'Admin' | 'Teacher';
  senderDesignation?: string;
  content: string;
  timestamp: string;
  isAnnouncement?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  attachments?: {
    id?: string;
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image' | string;
    url?: string;
  }[];
  reactions?: Record<string, string[]>; // e.g. { "👍": ["Alexander Wright"] }
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  type: ChatGroupType;
  department?: string;
  subject?: string;
  targetClass?: string;
  iconName?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  members: ChatMember[];
  isMutedForCurrentUser?: boolean;
  unreadCount?: number;
  lastMessage?: {
    senderName: string;
    content: string;
    timestamp: string;
    isAnnouncement?: boolean;
  };
}
