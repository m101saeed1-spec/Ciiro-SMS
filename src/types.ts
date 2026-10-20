export type UserRole =
  | 'SuperAdmin'
  | 'OwnerAdmin'
  | 'Principal'
  | 'Teacher'
  | 'Student'
  | 'AccountAdmin'
  | 'Admin';

/**
 * Returns canonical, consistent display name for user roles per platform specs:
 * 1. Owner Platform (SuperAdmin)
 * 2. School Owner (OwnerAdmin / Admin)
 * 3. Headteacher (Principal)
 * 4. Teacher
 * 5. Student
 * 6. Accountant (AccountAdmin)
 */
export function getRoleDisplayName(role: UserRole | string): string {
  switch (role) {
    case 'SuperAdmin':
      return 'Owner Platform';
    case 'OwnerAdmin':
    case 'Admin':
      return 'School Owner';
    case 'Principal':
      return 'Headteacher';
    case 'Teacher':
      return 'Teacher';
    case 'Student':
      return 'Student';
    case 'AccountAdmin':
      return 'Accountant';
    default:
      return role;
  }
}

export type SubscriptionPlan = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type ProBillingCycle = 'monthly' | '3month' | '6month' | 'yearly';

export interface PreviousPrincipal {
  id: string;
  name: string;
  email: string;
  appointedAt: string;
  replacedAt: string;
  replacedBy: string; // Owner Admin name or ID
  reason?: string;
}

export interface SchoolMembership {
  id: string; // e.g. "mem-1", "mem-2"
  userId: string; // references UserProfile.id
  schoolId: string; // references School.id e.g. "school-1"
  schoolName: string;
  schoolCode: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  designation?: string;
  joinedAt: string;
  permissions?: string[];
}

export interface School {
  id: string; // e.g., "school-1", "school-2"
  name: string;
  code: string; // e.g., "EDUSPIKE", "OAKRIDGE"
  logo: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  academicYear: string; // e.g., "2025-2026"
  status: 'Active' | 'Inactive' | 'Archived';
  subscriptionPlan?: SubscriptionPlan;
  principalName: string;
  principalId?: string;
  principalEmail?: string;
  ownerAdminEmail: string;
  ownerAdmins?: string[]; // Multiple Owner Admins supported
  previousPrincipals?: PreviousPrincipal[];
  createdAt: string;
  description?: string;
  motto?: string;
  currentTerm?: string; // e.g., "Term 1 (Fall 2026)"
  targetAttendanceRate?: number; // Target attendance percentage for current term (e.g., 95.0)
  stats?: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalBooks: number;
    averageAttendanceRate?: number;
    targetAttendanceRate?: number;
  };
}

export interface PlatformPlan {
  id: string;
  name: SubscriptionPlan;
  priceMonthly: number;
  priceAnnually: number;
  maxStudents: number;
  maxTeachers: number;
  features: string[];
  isPopular?: boolean;
}

export interface PlatformStats {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalPrincipals: number;
  totalOwnerAdmins: number;
  totalAccountManagers: number;
  totalAdmins: number;
  totalClasses: number;
  totalBooks: number;
  platformUsage: {
    activeSessionsToday: number;
    dailyLogins: number;
    messagesSentToday: number;
    filesStoredMb: number;
  };
  recentSchoolRegistrations: School[];
}

export interface ClassTeacherAssignmentHistory {
  id?: string;
  teacherId: string;
  teacherName: string;
  assignedAt: string;
  assignedBy: string; // Principal name/ID
  replacedAt?: string;
  replacedBy?: string;
  reason?: string;
  status?: 'Active' | 'Replaced' | 'Archived';
}

export interface ClassTeacherAssignment {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  teacherId: string; // Teacher ID
  teacherName: string;
  assignedAt: string;
  assignedBy: string; // Principal ID
  status: 'Active' | 'Replaced' | 'Archived';
  history?: ClassTeacherAssignmentHistory[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  ileysId?: string; // 4-digit numeric Ileys ID e.g. "1001", "2001", "3001", "4001", "5001"
  schoolId: string; // Identification number e.g., "SUP-2026-0001", "ADM-2026-0001", "PRP-2026-0001", "TCH-2026-0007", "STU-2026-0125"
  tenantSchoolId?: string; // Current or primary School Database ID e.g., "school-1", "school-2", "platform"
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
  assignedClasses?: string[]; // For subject teachers (all classes taught)
  classTeacherOf?: string[]; // SPECIFIC classes where this teacher is the designated Class Teacher
  isClassTeacher?: boolean;
  assignedSubjects?: string[]; // For teachers
  memberships?: SchoolMembership[];
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
  ileysId?: string; // 4-digit Ileys ID e.g. 1001
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
  status: 'Active' | 'Graduated' | 'Suspended';
  enrollmentDate: string;
  attendanceRate: number; // e.g. 96.5%
  bio?: string;
}

export interface Teacher {
  id: string;
  ileysId?: string; // 4-digit Ileys ID e.g. 2001
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

export type BookCategory =
  | 'General Knowledge'
  | 'Business & Entrepreneurship'
  | 'Technology & Computing'
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Literature'
  | 'Personal Development'
  | 'Leadership'
  | 'Economics'
  | 'Health & Wellness'
  | 'Religion & Philosophy'
  | 'Languages'
  | 'Arts & Culture'
  | 'Reference'
  | 'Other';

export const BOOK_CATEGORIES: BookCategory[] = [
  'General Knowledge',
  'Business & Entrepreneurship',
  'Technology & Computing',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Personal Development',
  'Leadership',
  'Economics',
  'Health & Wellness',
  'Religion & Philosophy',
  'Languages',
  'Arts & Culture',
  'Reference',
  'Other',
];

export interface LibraryBook {
  id: string;
  bookId: string; // e.g., #0011
  schoolId?: string;
  name: string;
  writer: string;
  category: BookCategory | string;
  language?: string; // e.g. "English", "French", "Spanish", "Arabic", "German"
  isbn?: string;
  publisher?: string;
  edition?: string;
  pages?: number;
  description?: string;
  publishDate: string;
  coverImage?: string;
  status: 'Available' | 'Borrowed';
  borrowerName?: string;
  borrowerRole?: UserRole;
  dueDate?: string;
  totalCopies: number;
  availableCopies: number;
  isFavorite?: boolean;
  subject?: string;
  class?: string;
  tags?: string[];
  rating?: number;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileData?: string;
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export type SyllabusTerm = 'Term 1' | 'Term 2' | 'Term 3' | 'Annual' | 'Semester 1' | 'Semester 2';

export interface SyllabusItem {
  id: string;
  schoolId?: string;
  title: string;
  class: string; // e.g. "Class 01", "Class 02", "Class 08"
  subject: string;
  term: SyllabusTerm;
  academicYear: string; // e.g. "2025-2026", "2026-2027"
  description?: string;
  topicsCount?: number;
  topics?: string[];
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | string;
  fileData?: string;
  fileUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByRole?: string;
  accessLevel?: 'All' | 'Teachers' | 'Students' | 'ClassOnly';
}

export type LearningResourceType =
  | 'Notes'
  | 'Past Paper'
  | 'Worksheet'
  | 'Assignment'
  | 'Study Guide'
  | 'Reference Material';

export interface LearningResource {
  id: string;
  schoolId?: string;
  title: string;
  resourceType: LearningResourceType;
  class: string; // e.g. "Class 02", "Class 08"
  subject: string;
  topic?: string;
  term?: string;
  academicYear?: string;
  description?: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'txt' | string;
  fileData?: string;
  fileUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByRole?: string;
  downloadsCount?: number;
  accessLevel?: 'All' | 'Teachers' | 'Students';
}

export interface SchoolClass {
  id: string;
  schoolId?: string;
  name: string; // e.g. Class 01, Class 02
  code: string;
  sections: string[]; // e.g. ['A', 'B', 'C']
  classTeacher: string; // Teacher Name
  classTeacherId: string;
  totalStudents: number;
  capacity: number;
  roomNumber: string;
  assignmentHistory?: ClassTeacherAssignmentHistory[];
}

export interface Subject {
  id: string;
  schoolId?: string;
  name: string;
  code: string;
  type: 'Theory' | 'Practical' | 'Both';
  classes: string[]; // e.g. ['01', '02', '03']
  teachers: string[]; // Teacher Names
  passMarks: number;
  totalMarks: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Permission' | 'Late';

export interface AttendanceRecord {
  id: string;
  schoolId?: string;
  date: string; // YYYY-MM-DD
  class: string;
  section: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy?: string;
}

export interface Exam {
  id: string;
  schoolId?: string;
  title: string; // e.g. Mid-Term Examination 2026
  term: 'First Term' | 'Mid-Term' | 'Final Exam';
  startDate: string;
  endDate: string;
  classes: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface ExamSchedule {
  id: string;
  schoolId?: string;
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
  schoolId?: string;
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
  schoolId?: string;
  title: string;
  content: string;
  postedBy: string;
  postedByRole: string;
  date: string;
  audience: 'All' | 'Teachers' | 'Students';
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
  schoolId?: string;
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
  schoolId?: string;
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
  schoolId?: string;
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
  schoolId?: string;
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
  | 'Schools'
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
  | 'Upload'
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
  schoolId?: string; // Tenant School ID e.g. 'school-1', 'school-2'
  schoolName?: string;
  resource?: string; // e.g. 'Student', 'Teacher', 'School', 'Book', 'Attendance', 'Exam', 'Chat', 'File'
  action: string;
  details?: string;
  description?: string;
  module?: ActivityLogModule | string;
  type: 'book' | 'student' | 'teacher' | 'notice' | 'attendance' | 'exam' | 'fee' | 'timetable' | 'chat' | 'auth' | 'security' | 'pdf' | 'profile' | 'class' | 'subject' | 'school' | 'upload';
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
  teacherId: string; // TCH ID, ADM ID
  teacherName: string;
  avatar: string;
  role: 'SuperAdmin' | 'Admin' | 'Teacher';
  designation?: string;
  groupRole: 'owner' | 'moderator' | 'member';
  joinedAt: string;
  isMuted?: boolean;
}

export interface ChatAttachment {
  id?: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'image' | 'txt' | 'zip' | string;
  url?: string;
  fileData?: string;
  mimeType?: string;
}

export interface ChatReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'SuperAdmin' | 'Admin' | 'Teacher';
  authorDesignation?: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  editedAt?: string;
  attachments?: ChatAttachment[];
  reactions?: Record<string, string[]>; // e.g. { "👍": ["Ahmed Hassan"], "❤️": ["Salmaan Fitah"] }
}

export interface ChatMessage {
  id: string;
  schoolId?: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'SuperAdmin' | 'Admin' | 'Teacher';
  senderDesignation?: string;
  content: string;
  timestamp: string;
  isAnnouncement?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  attachments?: ChatAttachment[];
  reactions?: Record<string, string[]>; // e.g. { "👍": ["Alexander Wright", "Fatima Ali"], "❤️": ["Salmaan Fitah"] }
  replies?: ChatReply[];
  replyCount?: number;
}

export interface ChatGroup {
  id: string;
  schoolId?: string;
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

export interface StudySummary {
  id: string;
  title: string;
  subject: string;
  gradeLevel?: string;
  originalNotes: string;
  summary: string;
  keyConcepts: string[];
  definitions: { term: string; explanation: string }[];
  formulasOrRules?: string[];
  mnemonics?: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
}

export interface StudyQuiz {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  questions: QuizQuestion[];
  createdAt: string;
  sourceNotes?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: Record<string, number>;
  completedAt: string;
  timeSpentSeconds: number;
}

export type SchoolEventType = 'exam' | 'holiday' | 'academic' | 'sports' | 'meeting' | 'cultural';

export interface SchoolCalendarEvent {
  id: string;
  title: string;
  type: SchoolEventType;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time?: string;
  location?: string;
  description?: string;
  targetAudience?: 'All' | 'Students' | 'Teachers' | 'Parents';
  schoolId?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed';
}

// ==========================================
// CONTEXTUAL PERMISSION & ERROR HELPERS
// ==========================================

export interface PermissionCheckResult {
  allowed: boolean;
  code?: 'ALLOWED' | 'UNAUTHORIZED' | 'PRINCIPAL_EXISTS' | 'CLASS_TEACHER_RESTRICTED' | 'SUPER_ADMIN_RESTRICTED' | 'OUTSIDE_TENANT';
  message?: string;
  assignedTeacherName?: string;
  currentPrincipalName?: string;
}

/**
 * Generates the mandatory polite error message when a school already has an active Principal.
 */
export function getPrincipalAlreadyRegisteredMessage(
  ownerName: string,
  currentPrincipalName: string,
  schoolName: string
): string {
  return `Principal already registered: Dear ${ownerName}, ${currentPrincipalName} is currently registered as the Principal of ${schoolName}. To appoint another Principal, please either Replace Current Principal or Remove the Current Principal first. The current Principal will remain active until the replacement is confirmed.`;
}

/**
 * Generates the mandatory polite error message when an unauthorized user attempts to perform restricted Class Teacher operations.
 */
export function getClassTeacherRestrictedMessage(
  classTeacherName: string,
  actionDescription: string = 'manage student registration, parent registration, attendance, and official class results'
): string {
  return `Access restricted: This class is currently assigned to ${classTeacherName}. Only the assigned Class Teacher can ${actionDescription}. If this assignment needs to change, please contact the Principal.`;
}

/**
 * Generates the mandatory Super Admin restriction message for school operational tasks.
 */
export function getSuperAdminRestrictedMessage(actionName: string = 'perform school operations'): string {
  return `Access restricted: Platform Super Administrators provide oversight and tenant management, but cannot directly ${actionName}. School operations must be conducted by the school's authorized Principal, Class Teachers, or Staff.`;
}


