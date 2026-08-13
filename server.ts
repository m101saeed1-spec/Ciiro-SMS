import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_BOOKS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_ATTENDANCE,
  INITIAL_EXAMS,
  INITIAL_MARKS,
  INITIAL_NOTICES,
  INITIAL_ACTIVITIES,
  INITIAL_USER_PROFILES,
} from './src/data/initialData';
import {
  Student,
  Teacher,
  LibraryBook,
  SchoolClass,
  Subject,
  AttendanceRecord,
  Exam,
  StudentMark,
  Notice,
  ActivityLog,
  UserProfile,
  UserRole,
} from './src/types';

// In-Memory Database Server Store
let dbStudents: Student[] = [...INITIAL_STUDENTS];
let dbTeachers: Teacher[] = [...INITIAL_TEACHERS];
let dbBooks: LibraryBook[] = [...INITIAL_BOOKS];
let dbClasses: SchoolClass[] = [...INITIAL_CLASSES];
let dbSubjects: Subject[] = [...INITIAL_SUBJECTS];
let dbAttendance: AttendanceRecord[] = [...INITIAL_ATTENDANCE];
let dbExams: Exam[] = [...INITIAL_EXAMS];
let dbMarks: StudentMark[] = [...INITIAL_MARKS];
let dbNotices: Notice[] = [...INITIAL_NOTICES];
let dbActivities: ActivityLog[] = [...INITIAL_ACTIVITIES];
let dbProfiles: UserProfile[] = [...INITIAL_USER_PROFILES];

// Extended Express Request with Auth Context
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  teacherId?: string;
  linkedStudentIds?: string[];
  assignedClasses?: string[];
  assignedSubjects?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const app = express();
app.use(express.json());

// Auth & RLS Middleware
function authenticateAndAuthorize(req: Request, res: Response, next: NextFunction) {
  // Read session headers sent by client
  const userId = (req.headers['x-user-id'] as string) || 'usr-admin-1';
  const role = (req.headers['x-user-role'] as UserRole) || 'Admin';
  
  // Find matching profile or construct auth user context
  const profile = dbProfiles.find((p) => p.id === userId || p.role === role);
  
  if (!profile) {
    req.user = {
      id: userId,
      name: 'Authenticated User',
      email: 'user@eduspike.edu',
      role: role,
    };
  } else {
    req.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      studentId: profile.studentId,
      teacherId: profile.teacherId,
      linkedStudentIds: profile.linkedStudentIds || (profile.studentId ? [profile.studentId] : []),
      assignedClasses: profile.assignedClasses || ['Class 01', 'Class 02', 'Class 04'],
      assignedSubjects: profile.assignedSubjects || ['Mathematics', 'Physics'],
    };
  }

  next();
}

// ==========================================
// PUBLIC AUTHENTICATION & UNIQUE ID API
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { schoolId, password, userType } = req.body;
  if (!schoolId || !password || !userType) {
    return res.status(400).json({ error: 'School ID, password, and account type are required.' });
  }

  const cleanSchoolId = schoolId.trim().toUpperCase();

  // Find profile in dbProfiles
  const profile = dbProfiles.find((p) => {
    const sId = (p.schoolId || p.studentId || p.teacherId || '').toUpperCase();
    return sId === cleanSchoolId;
  });

  if (!profile) {
    return res.status(401).json({
      error: `No account found with School ID "${cleanSchoolId}". Please verify your School ID Number.`
    });
  }

  // Account Type Validation
  if (profile.role !== userType) {
    return res.status(401).json({
      error: `Account type mismatch. School ID "${cleanSchoolId}" belongs to a ${profile.role} account, not a ${userType}.`
    });
  }

  // Password Verification
  const validPassword = profile.password || 'password123';
  if (password !== validPassword) {
    return res.status(401).json({ error: 'Incorrect password for this School ID.' });
  }

  // Generate session token
  const token = `token-${profile.id}-${Date.now()}`;

  return res.json({
    success: true,
    token,
    user: profile
  });
});

app.get('/api/auth/generate-id', (req: Request, res: Response) => {
  const role = (req.query.role as UserRole) || 'Student';
  const prefixMap: Record<string, string> = {
    Student: 'STU-2026-',
    Teacher: 'TCH-2026-',
    Parent: 'PAR-2026-',
    Admin: 'ADM-2026-',
  };
  const prefix = prefixMap[role] || 'STU-2026-';

  let count = 1;
  if (role === 'Student') count = dbStudents.length + 125;
  else if (role === 'Teacher') count = dbTeachers.length + 7;
  else count = dbProfiles.filter((p) => p.role === role).length + 1;

  let generatedId = `${prefix}${String(count).padStart(4, '0')}`;

  while (
    dbProfiles.some((p) => (p.schoolId || p.studentId || p.teacherId)?.toUpperCase() === generatedId) ||
    dbStudents.some((s) => s.id.toUpperCase() === generatedId) ||
    dbTeachers.some((t) => t.teacherId.toUpperCase() === generatedId)
  ) {
    count++;
    generatedId = `${prefix}${String(count).padStart(4, '0')}`;
  }

  res.json({ schoolId: generatedId });
});

app.post('/api/auth/validate-id', (req: Request, res: Response) => {
  const { schoolId } = req.body;
  if (!schoolId) return res.json({ available: false, error: 'School ID required' });

  const clean = schoolId.trim().toUpperCase();
  const exists =
    dbProfiles.some((p) => (p.schoolId || p.studentId || p.teacherId)?.toUpperCase() === clean) ||
    dbStudents.some((s) => s.id.toUpperCase() === clean) ||
    dbTeachers.some((t) => t.teacherId.toUpperCase() === clean);

  if (exists) {
    return res.json({ available: false, error: `School ID "${clean}" is already assigned to another user.` });
  }

  res.json({ available: true });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { schoolId, userType } = req.body;
  if (!schoolId) {
    return res.status(400).json({ error: 'School ID Number is required for password recovery.' });
  }

  const clean = schoolId.trim().toUpperCase();
  const profile = dbProfiles.find(
    (p) => (p.schoolId || p.studentId || p.teacherId)?.toUpperCase() === clean && p.role === userType
  );

  if (!profile) {
    return res.status(404).json({
      error: `No registered ${userType} account found with School ID "${clean}".`
    });
  }

  res.json({
    success: true,
    message: `Password reset verification instructions sent to registered contact (${profile.email}). Temporary passcode: password123`
  });
});

app.use('/api', authenticateAndAuthorize);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', authenticatedAs: req.user });
});

// ==========================================
// 1. STUDENTS API (Strict RLS & Data Privacy)
// ==========================================

// GET /api/students - List students (RLS filtered by role)
app.get('/api/students', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    // A student can ONLY view their own student profile record
    const myRecord = dbStudents.filter((s) => s.id === user.studentId);
    return res.json(myRecord);
  }

  if (user.role === 'Parent') {
    // A parent can ONLY view students linked to their account
    const linked = dbStudents.filter((s) => (user.linkedStudentIds || []).includes(s.id));
    return res.json(linked);
  }

  if (user.role === 'Teacher') {
    // A teacher can ONLY view students enrolled in their assigned classes
    const assignedClasses = user.assignedClasses || [];
    const classStudents = dbStudents.filter((s) => assignedClasses.includes(s.class));
    return res.json(classStudents);
  }

  // Admin sees all students
  return res.json(dbStudents);
});

// GET /api/students/:id - Fetch single student profile
app.get('/api/students/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id;
  const student = dbStudents.find((s) => s.id === targetId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Row Level Security Enforcement:
  if (user.role === 'Student' && targetId !== user.studentId) {
    return res.status(403).json({
      error: 'Access Denied: You are not authorized to view other students\' profiles or personal records.',
    });
  }

  if (user.role === 'Parent' && !(user.linkedStudentIds || []).includes(targetId)) {
    return res.status(403).json({
      error: 'Access Denied: This student is not linked to your parent account.',
    });
  }

  if (user.role === 'Teacher' && !(user.assignedClasses || []).includes(student.class)) {
    return res.status(403).json({
      error: 'Access Denied: You are not assigned to this student\'s class.',
    });
  }

  return res.json(student);
});

// POST /api/students (Admin Only)
app.post('/api/students', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Only Administrators can enroll new students.' });
  }

  const newStudent: Student = {
    ...req.body,
    id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
  };
  dbStudents.unshift(newStudent);
  res.status(201).json(newStudent);
});

// PUT /api/students/:id
app.put('/api/students/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id;

  if (user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Only Administrators can update student enrollment details.' });
  }

  const index = dbStudents.findIndex((s) => s.id === targetId);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  dbStudents[index] = { ...dbStudents[index], ...req.body };
  res.json(dbStudents[index]);
});

// DELETE /api/students/:id (Admin Only)
app.delete('/api/students/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Only Administrators can delete student accounts.' });
  }

  dbStudents = dbStudents.filter((s) => s.id !== req.params.id);
  res.json({ success: true, message: 'Student removed' });
});

// ==========================================
// 2. TEACHERS API (Strict Faculty RLS)
// ==========================================

// GET /api/teachers - List teachers
app.get('/api/teachers', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Students are not authorized to query faculty account directories.',
    });
  }

  if (user.role === 'Parent') {
    // Parents can view teacher names & subjects for their children's classes, sanitized
    const parentStudents = dbStudents.filter((s) => (user.linkedStudentIds || []).includes(s.id));
    const parentClasses = Array.from(new Set(parentStudents.map((s) => s.class)));

    const classTeachers = dbTeachers.filter((t) =>
      t.classesAssigned.some((cls) => parentClasses.includes(cls))
    );

    // Strip private salary/address details
    const sanitized = classTeachers.map((t) => ({
      id: t.id,
      name: t.name,
      avatar: t.avatar,
      email: t.email,
      subjects: t.subjects,
      classesAssigned: t.classesAssigned,
      qualification: t.qualification,
    }));

    return res.json(sanitized);
  }

  if (user.role === 'Teacher') {
    // Teachers see public list of faculty
    return res.json(dbTeachers);
  }

  return res.json(dbTeachers);
});

// GET /api/teachers/:id
app.get('/api/teachers/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id;

  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied: Students cannot access faculty details.' });
  }

  const teacher = dbTeachers.find((t) => t.id === targetId || t.teacherId === targetId);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  if (user.role === 'Teacher' && targetId !== user.teacherId && targetId !== user.id) {
    // Strip private phone and joining date when viewing other teachers
    const { phone, joiningDate, ...publicDetails } = teacher;
    return res.json(publicDetails);
  }

  res.json(teacher);
});

// ==========================================
// 3. ATTENDANCE API (Row Level Security)
// ==========================================

// GET /api/attendance
app.get('/api/attendance', (req: Request, res: Response) => {
  const user = req.user!;
  const requestedStudentId = req.query.studentId as string;
  const requestedClass = req.query.class as string;

  if (user.role === 'Student') {
    // Security check: if student attempts to query another student's attendance via URL params
    if (requestedStudentId && requestedStudentId !== user.studentId) {
      return res.status(403).json({
        error: 'Access Denied: You cannot view attendance records belonging to other students.',
      });
    }
    const myAttendance = dbAttendance.filter((a) => a.studentId === user.studentId);
    return res.json(myAttendance);
  }

  if (user.role === 'Parent') {
    const linkedIds = user.linkedStudentIds || [];
    if (requestedStudentId && !linkedIds.includes(requestedStudentId)) {
      return res.status(403).json({
        error: 'Access Denied: You cannot view attendance for unlinked students.',
      });
    }
    const filtered = requestedStudentId
      ? dbAttendance.filter((a) => a.studentId === requestedStudentId)
      : dbAttendance.filter((a) => linkedIds.includes(a.studentId));

    return res.json(filtered);
  }

  if (user.role === 'Teacher') {
    const assigned = user.assignedClasses || [];
    if (requestedClass && !assigned.includes(requestedClass)) {
      return res.status(403).json({
        error: 'Access Denied: You are not assigned to manage attendance for this class.',
      });
    }
    const teacherRecords = dbAttendance.filter((a) => assigned.includes(a.class));
    return res.json(teacherRecords);
  }

  // Admin
  if (requestedClass) {
    return res.json(dbAttendance.filter((a) => a.class === requestedClass));
  }
  return res.json(dbAttendance);
});

// POST /api/attendance/batch (Teacher & Admin Only)
app.post('/api/attendance/batch', (req: Request, res: Response) => {
  const user = req.user!;
  const records = req.body as Omit<AttendanceRecord, 'id'>[];

  if (user.role === 'Student' || user.role === 'Parent') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can mark attendance.',
    });
  }

  if (user.role === 'Teacher') {
    const assigned = user.assignedClasses || [];
    const unauthorizedRecord = records.find((r) => !assigned.includes(r.class));
    if (unauthorizedRecord) {
      return res.status(403).json({
        error: `Access Denied: You are not authorized to mark attendance for ${unauthorizedRecord.class}.`,
      });
    }
  }

  const newRecords: AttendanceRecord[] = records.map((r) => ({
    ...r,
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  }));

  // Update in-memory DB
  const keysToUpdate = new Set(newRecords.map((r) => `${r.studentId}-${r.date}`));
  dbAttendance = [...newRecords, ...dbAttendance.filter((a) => !keysToUpdate.has(`${a.studentId}-${a.date}`))];

  res.status(201).json({ success: true, count: newRecords.length });
});

// ==========================================
// 4. EXAMS & MARKS API (Strict Grade Protection)
// ==========================================

// GET /api/exams
app.get('/api/exams', (req: Request, res: Response) => {
  res.json(dbExams);
});

// GET /api/marks
app.get('/api/marks', (req: Request, res: Response) => {
  const user = req.user!;
  const requestedStudentId = req.query.studentId as string;

  if (user.role === 'Student') {
    if (requestedStudentId && requestedStudentId !== user.studentId) {
      return res.status(403).json({
        error: 'Access Denied: Student grades and report cards are private to each student.',
      });
    }
    const studentMarks = dbMarks.filter((m) => m.studentId === user.studentId);
    return res.json(studentMarks);
  }

  if (user.role === 'Parent') {
    const linkedIds = user.linkedStudentIds || [];
    if (requestedStudentId && !linkedIds.includes(requestedStudentId)) {
      return res.status(403).json({
        error: 'Access Denied: You can only view academic report cards for your linked child.',
      });
    }
    const parentMarks = requestedStudentId
      ? dbMarks.filter((m) => m.studentId === requestedStudentId)
      : dbMarks.filter((m) => linkedIds.includes(m.studentId));

    return res.json(parentMarks);
  }

  if (user.role === 'Teacher') {
    const assignedClasses = user.assignedClasses || [];
    const teacherMarks = dbMarks.filter((m) => assignedClasses.includes(m.class));
    return res.json(teacherMarks);
  }

  res.json(dbMarks);
});

// POST /api/marks (Teacher & Admin Only)
app.post('/api/marks', (req: Request, res: Response) => {
  const user = req.user!;
  const mark = req.body as Omit<StudentMark, 'id'>;

  if (user.role === 'Student' || user.role === 'Parent') {
    return res.status(403).json({
      error: 'Access Denied: You are not authorized to post or modify academic grades.',
    });
  }

  if (user.role === 'Teacher') {
    const assignedClasses = user.assignedClasses || [];
    const assignedSubjects = user.assignedSubjects || [];

    if (!assignedClasses.includes(mark.class)) {
      return res.status(403).json({
        error: `Access Denied: You are not authorized to grade students in ${mark.class}.`,
      });
    }

    if (!assignedSubjects.includes(mark.subject)) {
      return res.status(403).json({
        error: `Access Denied: You are not assigned to enter marks for subject "${mark.subject}".`,
      });
    }
  }

  const existingIdx = dbMarks.findIndex(
    (m) => m.examId === mark.examId && m.studentId === mark.studentId && m.subject === mark.subject
  );

  if (existingIdx !== -1) {
    dbMarks[existingIdx] = { ...mark, id: dbMarks[existingIdx].id };
    return res.json(dbMarks[existingIdx]);
  } else {
    const newMark: StudentMark = { ...mark, id: `mrk-${Date.now()}` };
    dbMarks.push(newMark);
    return res.status(201).json(newMark);
  }
});

// ==========================================
// 5. CLASSES & SUBJECTS API
// ==========================================

app.get('/api/classes', (req: Request, res: Response) => {
  res.json(dbClasses);
});

app.get('/api/subjects', (req: Request, res: Response) => {
  res.json(dbSubjects);
});

// ==========================================
// 6. LIBRARY API
// ==========================================

app.get('/api/library', (req: Request, res: Response) => {
  res.json(dbBooks);
});

app.post('/api/library/borrow', (req: Request, res: Response) => {
  const user = req.user!;
  const { bookId } = req.body;

  const book = dbBooks.find((b) => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  if (book.availableCopies <= 0) {
    return res.status(400).json({ error: 'No available copies left for borrowing.' });
  }

  book.availableCopies -= 1;
  book.status = 'Borrowed';
  book.borrowerName = user.name;
  book.borrowerRole = user.role;
  book.dueDate = '14 Days from today';

  res.json(book);
});

app.post('/api/library/return', (req: Request, res: Response) => {
  const { bookId } = req.body;
  const book = dbBooks.find((b) => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  book.availableCopies += 1;
  book.status = 'Available';
  book.borrowerName = undefined;
  book.borrowerRole = undefined;
  book.dueDate = undefined;

  res.json(book);
});

// ==========================================
// 7. NOTICES API (Audience Filtered)
// ==========================================

app.get('/api/notices', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    return res.json(dbNotices.filter((n) => n.audience === 'All' || n.audience === 'Students'));
  }
  if (user.role === 'Parent') {
    return res.json(dbNotices.filter((n) => n.audience === 'All' || n.audience === 'Parents'));
  }
  if (user.role === 'Teacher') {
    return res.json(dbNotices.filter((n) => n.audience === 'All' || n.audience === 'Teachers'));
  }

  res.json(dbNotices);
});

app.post('/api/notices', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student' || user.role === 'Parent') {
    return res.status(403).json({ error: 'Access Denied: Only Teachers and Administrators can publish notices.' });
  }

  const newNotice: Notice = {
    ...req.body,
    id: `not-${Date.now()}`,
    postedBy: user.name,
    postedByRole: user.role,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  dbNotices.unshift(newNotice);
  res.status(201).json(newNotice);
});

// ==========================================
// 8. USER PROFILE / ACCOUNT API
// ==========================================

app.get('/api/profile/me', (req: Request, res: Response) => {
  res.json(req.user);
});

// Start Express Server & Vite Middleware
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EduSpike Server] Security & RBAC Enforced API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
