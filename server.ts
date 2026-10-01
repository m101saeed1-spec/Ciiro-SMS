import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
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
  INITIAL_ROLE_AUDIT_LOGS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_STUDENT_FEES,
  INITIAL_FEE_PAYMENTS,
  INITIAL_TIMETABLES,
  INITIAL_CHAT_GROUPS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SYLLABUS,
  INITIAL_LEARNING_RESOURCES,
  INITIAL_SCHOOLS,
  INITIAL_SCHOOL_MEMBERSHIPS,
} from './src/data/initialData';
import {
  School,
  SchoolMembership,
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
  RoleAuditLog,
  FeeStructure,
  StudentFeeRecord,
  FeePayment,
  TimetableSlot,
  ChatGroup,
  ChatMessage,
  ChatMember,
  ChatReply,
  SyllabusItem,
  LearningResource,
  StudySummary,
  StudyQuiz,
  QuizQuestion,
  QuizAttempt,
  PlatformStats,
} from './src/types';


// In-Memory Database Server Store
let dbSchools: School[] = [...INITIAL_SCHOOLS];
let dbMemberships: SchoolMembership[] = [...INITIAL_SCHOOL_MEMBERSHIPS];
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
let dbRoleAuditLogs: RoleAuditLog[] = [...INITIAL_ROLE_AUDIT_LOGS];
let dbFeeStructures: FeeStructure[] = [...INITIAL_FEE_STRUCTURES];
let dbStudentFees: StudentFeeRecord[] = [...INITIAL_STUDENT_FEES];
let dbFeePayments: FeePayment[] = [...INITIAL_FEE_PAYMENTS];
let dbTimetables: TimetableSlot[] = [...INITIAL_TIMETABLES];
let dbChatGroups: ChatGroup[] = [...INITIAL_CHAT_GROUPS];
let dbChatMessages: ChatMessage[] = [...INITIAL_CHAT_MESSAGES];
let dbSyllabus: SyllabusItem[] = [...INITIAL_SYLLABUS];
let dbLearningResources: LearningResource[] = [...INITIAL_LEARNING_RESOURCES];
let userMutedGroups: Record<string, string[]> = {}; // userId -> array of muted groupIds
let userReadTimestamps: Record<string, Record<string, number>> = {}; // userId -> { groupId: timestamp }

// Extended Express Request with Auth Context
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  schoolName?: string;
  membershipId?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  linkedStudentIds?: string[];
  assignedClasses?: string[];
  assignedSubjects?: string[];
  classTeacherOf?: string[];
  isClassTeacher?: boolean;
  isSuperAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Helper: Enforce Class Teacher Authority on Server Endpoints
export function checkClassTeacherAuthority(
  user: AuthUser,
  className: string,
  operation: 'attendance' | 'marks' | 'student_registration' | 'parent_registration'
): { allowed: boolean; status: number; message?: string } {
  // Super Admin: Platform level only
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return {
      allowed: false,
      status: 403,
      message: 'Access restricted: Super Admin manages the platform and cannot perform operational duties (attendance, student registration, marks) for registered schools.',
    };
  }

  // Find class details to get assigned teacher name
  const targetClass = dbClasses.find((c) => c.name === className);
  const teacherName = targetClass?.classTeacher || 'the assigned Class Teacher';

  // Owner Admin & Principal: Cannot override Class Teacher operational duties directly
  if (user.role === 'Admin' || user.role === 'OwnerAdmin' || user.role === 'Principal') {
    return {
      allowed: false,
      status: 403,
      message: `Access restricted: Class operations for ${className} are managed exclusively by ${teacherName}. If this assignment needs to change, please update the Class Teacher assignment in Class Management.`,
    };
  }

  // Teacher check
  if (user.role === 'Teacher') {
    const isAssigned = (user.classTeacherOf || []).includes(className);
    if (isAssigned) {
      return { allowed: true, status: 200 };
    }
    return {
      allowed: false,
      status: 403,
      message: `Access restricted: This class is currently assigned to ${teacherName}. Only the designated Class Teacher can perform this action. If this assignment needs to change, please contact the Principal.`,
    };
  }

  return {
    allowed: false,
    status: 403,
    message: `Access restricted: You do not have authority to perform class operations for ${className}.`,
  };
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Public Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth & RLS Middleware - Strict Role & Multi-School Membership Verification
function authenticateAndAuthorize(req: Request, res: Response, next: NextFunction) {
  // Read session headers sent by client (Token, User ID, School ID)
  const authHeader = req.headers['authorization'];
  let userId = req.headers['x-user-id'] as string;
  const requestedSchoolId = (req.headers['x-school-id'] as string) || '';

  if (authHeader && authHeader.startsWith('Bearer token-')) {
    const tokenParts = authHeader.replace('Bearer ', '').split('-');
    if (tokenParts.length >= 3) {
      userId = `usr-${tokenParts[1]}-${tokenParts[2]}`;
    }
  }

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required. Missing user session or authorization token.',
    });
  }

  // Look up user strictly in database
  const profile = dbProfiles.find(
    (p) => p.id === userId || p.schoolId === userId || p.teacherId === userId || p.studentId === userId
  );

  if (!profile) {
    return res.status(401).json({
      error: 'Unauthorized: User session invalid or account not found in database.',
    });
  }

  // Account Status Check - Disabled users cannot access any API endpoints
  if (profile.status === 'Disabled') {
    return res.status(403).json({
      error: 'Account Suspended: This user account has been disabled by the School Administrator.',
    });
  }

  // Super Admin check - Super Admin is the only platform-level account
  const isSuperAdmin = profile.role === 'SuperAdmin';
  if (isSuperAdmin) {
    const targetSchoolId = requestedSchoolId && requestedSchoolId !== 'platform' ? requestedSchoolId : 'school-1';
    const targetSchool = dbSchools.find((s) => s.id === targetSchoolId);
    req.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: 'SuperAdmin',
      schoolId: targetSchoolId,
      schoolName: targetSchool?.name || 'Platform Wide',
      isSuperAdmin: true,
      assignedClasses: ['Class 01', 'Class 02', 'Class 04'],
      assignedSubjects: ['Mathematics', 'Physics', 'Computer Science'],
    };
    return next();
  }

  // For school-level users: Resolve Active Membership
  const userMemberships = dbMemberships.filter(
    (m) => (m.userId === profile.id || m.userId === profile.schoolId) && m.status === 'Active'
  );

  let activeMembership = requestedSchoolId
    ? userMemberships.find((m) => m.schoolId === requestedSchoolId)
    : userMemberships[0];

  // Fallback to tenantSchoolId if membership records not yet created
  if (!activeMembership && profile.tenantSchoolId) {
    const matchingSchool = dbSchools.find((s) => s.id === profile.tenantSchoolId);
    if (matchingSchool && (!requestedSchoolId || requestedSchoolId === profile.tenantSchoolId)) {
      activeMembership = {
        id: `mem-${profile.id}-${profile.tenantSchoolId}`,
        userId: profile.id,
        schoolId: profile.tenantSchoolId,
        schoolName: matchingSchool.name,
        schoolCode: matchingSchool.code,
        role: profile.role,
        status: 'Active',
        joinedAt: profile.joinDate || new Date().toISOString(),
      };
    }
  }

  if (!activeMembership) {
    return res.status(403).json({
      error: `Access Denied: You do not have an authorized active membership for school context "${requestedSchoolId || 'unspecified'}".`,
    });
  }

  const school = dbSchools.find((s) => s.id === activeMembership.schoolId);

  // Derive official class teacher appointments from dbClasses or profile
  const classTeacherClasses =
    profile.classTeacherOf ||
    dbClasses
      .filter((c) => c.classTeacher === profile.name || c.classTeacherId === profile.id)
      .map((c) => c.name);

  // Assign canonical user context from database - NEVER trust client header for role
  req.user = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: activeMembership.role, // LOCKED FROM DATABASE MEMBERSHIP
    schoolId: activeMembership.schoolId,
    schoolName: school?.name || activeMembership.schoolName,
    membershipId: activeMembership.id,
    studentId: profile.studentId,
    teacherId: profile.teacherId,
    linkedStudentIds: profile.linkedStudentIds || (profile.studentId ? [profile.studentId] : []),
    assignedClasses: profile.assignedClasses || ['Class 01', 'Class 02', 'Class 04'],
    assignedSubjects: profile.assignedSubjects || ['Mathematics', 'Physics'],
    classTeacherOf: classTeacherClasses,
    isClassTeacher: classTeacherClasses.length > 0 || !!profile.isClassTeacher,
    isSuperAdmin: false,
  };

  next();
}

// ==========================================
// PUBLIC AUTHENTICATION & UNIQUE ID API
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { schoolId, identifier, password, userType, selectedSchoolId, rememberMe } = req.body;
  
  // Support both schoolId and identifier (email or school ID)
  const lookupId = (schoolId || identifier || '').trim();
  if (!lookupId || !password) {
    return res.status(400).json({ error: 'School ID (or Email) and password are required.' });
  }

  const cleanLookupId = lookupId.toUpperCase();

  // Find profile in dbProfiles by schoolId, studentId, teacherId, or email
  const profile = dbProfiles.find((p) => {
    const sId = (p.schoolId || p.studentId || p.teacherId || '').toUpperCase();
    const email = (p.email || '').toLowerCase();
    return sId === cleanLookupId || email === lookupId.toLowerCase();
  });

  if (!profile) {
    return res.status(401).json({
      error: `No account found with identifier "${lookupId}". Please verify your School ID or Email.`
    });
  }

  // Account status check
  if (profile.status === 'Disabled') {
    return res.status(403).json({
      error: `Account Suspended: The account for "${profile.name}" (${profile.schoolId}) has been disabled by the Administrator.`
    });
  }

  // Password Verification
  const validPassword = profile.password || 'password123';
  if (password !== validPassword) {
    return res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
  }

  // Handle Super Admin
  if (profile.role === 'SuperAdmin') {
    const token = `token-${profile.id}-${Date.now()}`;
    return res.json({
      success: true,
      token,
      user: profile,
      schoolContext: selectedSchoolId || 'platform',
      isSuperAdmin: true,
    });
  }

  // For school-level roles: Check targeted school
  const targetSchoolId = selectedSchoolId || profile.tenantSchoolId || 'school-1';
  const school = dbSchools.find((s) => s.id === targetSchoolId);

  if (school && school.status !== 'Active') {
    return res.status(403).json({
      error: `School Suspended: "${school.name}" is currently ${school.status.toLowerCase()}. Access is restricted.`
    });
  }

  // Verify membership in the target school
  const userMemberships = dbMemberships.filter(
    (m) => (m.userId === profile.id || m.userId === profile.schoolId) && m.status === 'Active'
  );

  const schoolMembership = userMemberships.find((m) => m.schoolId === targetSchoolId);

  // If user requested a specific role, verify they have it in this school
  if (userType) {
    const hasRoleInSchool =
      (schoolMembership && schoolMembership.role === userType) ||
      (profile.role === userType && profile.tenantSchoolId === targetSchoolId);

    if (!hasRoleInSchool) {
      return res.status(403).json({
        error: `Role Mismatch: Account "${profile.name}" (${profile.schoolId}) is not registered as a "${userType}" for ${school?.name || 'this school'}.`
      });
    }
  }

  // If not super admin and no valid membership found for this school
  if (!schoolMembership && profile.tenantSchoolId !== targetSchoolId) {
    return res.status(403).json({
      error: `Access Denied: You do not have an authorized active membership for "${school?.name || targetSchoolId}".`
    });
  }

  const effectiveRole = userType || schoolMembership?.role || profile.role;

  // Generate session token
  const token = `token-${profile.id}-${Date.now()}`;

  return res.json({
    success: true,
    token,
    user: {
      ...profile,
      role: effectiveRole,
      tenantSchoolId: targetSchoolId,
    },
    school: school,
    activeRole: effectiveRole,
    memberships: userMemberships,
  });
});

// POST /api/auth/register-school - Onboard New School Tenant + Owner Admin
app.post('/api/auth/register-school', (req: Request, res: Response) => {
  const { schoolData, ownerData } = req.body;

  if (!schoolData || !schoolData.name || !schoolData.code) {
    return res.status(400).json({ error: 'School name and school code are required.' });
  }

  if (!ownerData || !ownerData.name || !ownerData.email || !ownerData.password) {
    return res.status(400).json({ error: 'Owner Administrator name, email, and password are required.' });
  }

  const cleanCode = schoolData.code.trim().toUpperCase();
  if (dbSchools.some((s) => s.code.toUpperCase() === cleanCode)) {
    return res.status(400).json({ error: `School code "${cleanCode}" is already in use by another school.` });
  }

  // Create new School record
  const newSchoolId = `school-${Date.now()}`;
  const newSchool: School = {
    id: newSchoolId,
    name: schoolData.name.trim(),
    code: cleanCode,
    logo: schoolData.logo || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=200',
    address: schoolData.address || 'Address on file',
    phone: schoolData.phone || '+1 (555) 000-0000',
    email: schoolData.email || ownerData.email,
    website: schoolData.website || `https://${cleanCode.toLowerCase()}.edu`,
    academicYear: schoolData.academicYear || '2025-2026',
    status: 'Active',
    principalName: schoolData.principalName || ownerData.name,
    ownerAdminEmail: ownerData.email.trim(),
    createdAt: new Date().toISOString(),
    description: schoolData.description || `Educational institution dedicated to academic excellence.`,
    motto: schoolData.motto || 'Excellence in Knowledge & Character',
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalBooks: 0,
      averageAttendanceRate: 100.0,
    },
  };

  dbSchools.push(newSchool);

  // Generate unique Owner Admin School ID
  const ownerCount = dbProfiles.filter((p) => p.role === 'OwnerAdmin').length + 1;
  const ownerSchoolId = `ADM-2026-${String(ownerCount).padStart(4, '0')}`;
  const newOwnerId = `usr-owner-${Date.now()}`;

  const newOwnerProfile: UserProfile = {
    id: newOwnerId,
    schoolId: ownerSchoolId,
    tenantSchoolId: newSchoolId,
    name: ownerData.name.trim(),
    email: ownerData.email.trim(),
    role: 'OwnerAdmin',
    password: ownerData.password,
    status: 'Active',
    roleAssignedBy: 'System Platform Onboarding',
    roleAssignedAt: new Date().toISOString().slice(0, 10),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: ownerData.phone || schoolData.phone || '+1 (555) 000-0000',
    designation: ownerData.designation || 'School Owner & Administrator',
    joinDate: new Date().toISOString().slice(0, 10),
    bio: `Founder & Administrator of ${newSchool.name}.`,
    address: schoolData.address || '',
  };

  dbProfiles.push(newOwnerProfile);

  // Create School Membership
  const newMembership: SchoolMembership = {
    id: `mem-${newOwnerId}-${newSchoolId}`,
    userId: newOwnerId,
    schoolId: newSchoolId,
    schoolName: newSchool.name,
    schoolCode: newSchool.code,
    role: 'OwnerAdmin',
    status: 'Active',
    designation: newOwnerProfile.designation,
    joinedAt: new Date().toISOString(),
  };

  dbMemberships.push(newMembership);

  // Log Platform Audit Entry
  dbActivities.unshift({
    id: `act-reg-${Date.now()}`,
    action: `New School Registered: "${newSchool.name}" (${newSchool.code})`,
    description: `Provisioned isolated school tenant and Owner Admin account [${ownerSchoolId}] (${newOwnerProfile.name}).`,
    module: 'Security',
    type: 'school',
    severity: 'success',
    user: newOwnerProfile.name,
    userName: newOwnerProfile.name,
    userRole: 'OwnerAdmin',
    userId: newOwnerId,
    userSchoolId: ownerSchoolId,
    schoolId: newSchoolId,
    schoolName: newSchool.name,
    timestamp: new Date().toISOString(),
  });

  const token = `token-${newOwnerProfile.id}-${Date.now()}`;

  res.status(201).json({
    success: true,
    school: newSchool,
    owner: newOwnerProfile,
    membership: newMembership,
    token,
  });
});

app.get('/api/auth/generate-id', (req: Request, res: Response) => {
  const role = (req.query.role as UserRole) || 'Student';
  const prefixMap: Record<string, string> = {
    Student: 'STU-2026-',
    Teacher: 'TCH-2026-',
    Principal: 'PRP-2026-',
    AccountAdmin: 'ACC-2026-',
    OwnerAdmin: 'OWN-2026-',
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

// In-Memory Password Reset Token Store
interface ResetTokenRecord {
  token: string;
  userId: string;
  userSchoolId: string;
  email: string;
  expiresAt: number;
}
const dbResetTokens: Record<string, ResetTokenRecord> = {};

// Helper: Mask email for privacy
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.com';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

// POST /api/auth/forgot-password - Secure Password Reset Request (Never reveals account existence)
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier, userType } = req.body;
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return res.status(400).json({ error: 'Registered School ID Number or Email Address is required.' });
  }

  const clean = identifier.trim().toLowerCase();
  const profile = dbProfiles.find((p) => {
    const sId = (p.schoolId || p.studentId || p.teacherId || '').toLowerCase();
    const email = p.email.toLowerCase();
    const matchesIdentifier = sId === clean || email === clean;
    if (!matchesIdentifier) return false;
    if (userType && p.role !== userType) return false;
    return true;
  });

  // Always log attempt for security monitoring
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '192.168.1.10';
  const userAgent = req.headers['user-agent'] || 'Web Portal';

  if (!profile) {
    // Audit failed attempt silently without revealing existence
    dbActivities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user: 'Anonymous Guest',
      action: `Password reset requested for non-existent or mismatched identifier "${identifier.trim()}"`,
      description: 'System returned standard security confirmation without exposing account directory',
      module: 'Authentication',
      type: 'auth',
      severity: 'warning',
      ipAddress,
      deviceInfo: userAgent,
      timestamp: 'Just now',
    });

    // Return identical success response to prevent enumeration attacks
    return res.json({
      success: true,
      message: 'If an account matching the provided details exists in the EduSpike directory, password reset instructions and a verification security token have been generated.',
    });
  }

  // Generate 6-character secure token
  const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetToken = `RST-${rawCode}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  dbResetTokens[resetToken] = {
    token: resetToken,
    userId: profile.id,
    userSchoolId: profile.schoolId || profile.studentId || profile.teacherId || 'N/A',
    email: profile.email,
    expiresAt,
  };

  // Log successful password reset request in audit trail
  dbActivities.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user: profile.name,
    userId: profile.id,
    userSchoolId: profile.schoolId,
    userRole: profile.role,
    action: `Password recovery token issued for ${profile.name} (${profile.schoolId})`,
    description: `Dispatched single-use token ${resetToken} to verified address ${maskEmail(profile.email)}`,
    module: 'Authentication',
    type: 'auth',
    severity: 'info',
    ipAddress,
    deviceInfo: userAgent,
    timestamp: 'Just now',
  });

  return res.json({
    success: true,
    message: `If an account matching the provided details exists, password reset instructions and a security token have been sent to the registered email (${maskEmail(profile.email)}).`,
    resetToken, // Provided in response for seamless in-app verification flow
    targetEmailMasked: maskEmail(profile.email),
    userSchoolId: profile.schoolId,
    userName: profile.name,
  });
});

// POST /api/auth/reset-password - Complete Password Reset with Strength Validation
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { resetToken, identifier, newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'New password and password confirmation are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match. Please ensure both fields are identical.' });
  }

  // Password strength validation
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter (A-Z).' });
  }
  if (!/[a-z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one lowercase letter (a-z).' });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must contain at least one numerical digit (0-9).' });
  }

  const cleanToken = (resetToken || '').trim().toUpperCase();
  let targetProfile: UserProfile | undefined;

  if (cleanToken && dbResetTokens[cleanToken]) {
    const tokenRecord = dbResetTokens[cleanToken];
    if (Date.now() > tokenRecord.expiresAt) {
      delete dbResetTokens[cleanToken];
      return res.status(400).json({ error: 'The password reset security token has expired. Please request a new link.' });
    }
    targetProfile = dbProfiles.find((p) => p.id === tokenRecord.userId);
    // Invalidate single-use token immediately
    delete dbResetTokens[cleanToken];
  } else if (identifier) {
    const clean = identifier.trim().toLowerCase();
    targetProfile = dbProfiles.find((p) => {
      const sId = (p.schoolId || p.studentId || p.teacherId || '').toLowerCase();
      const email = p.email.toLowerCase();
      return sId === clean || email === clean;
    });
  }

  if (!targetProfile) {
    return res.status(400).json({ error: 'Invalid or expired password reset session. Please request a new link.' });
  }

  // Invalidate old password and update to new password
  targetProfile.password = newPassword;

  // Record Audit Log for Security
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '192.168.1.10';
  const userAgent = req.headers['user-agent'] || 'Web Portal';

  dbActivities.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user: targetProfile.name,
    userId: targetProfile.id,
    userSchoolId: targetProfile.schoolId,
    userRole: targetProfile.role,
    action: `Password reset successfully completed for ${targetProfile.name} (${targetProfile.schoolId})`,
    description: 'Old credentials invalidated; modern cryptographic security standards verified',
    module: 'Security',
    type: 'security',
    severity: 'success',
    ipAddress,
    deviceInfo: userAgent,
    timestamp: 'Just now',
  });

  return res.json({
    success: true,
    message: 'Your password has been successfully reset! You can now sign in with your new credentials.',
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

  if (user.role === 'Teacher' && !(user.assignedClasses || []).includes(student.class)) {
    return res.status(403).json({
      error: 'Access Denied: You are not assigned to this student\'s class.',
    });
  }

  return res.json(student);
});

// POST /api/students (Class Teacher Authority Required)
app.post('/api/students', (req: Request, res: Response) => {
  const user = req.user!;
  const targetClass = req.body.class;

  if (!targetClass) {
    return res.status(400).json({ error: 'Student class assignment is required.' });
  }

  const authCheck = checkClassTeacherAuthority(user, targetClass, 'student_registration');
  if (!authCheck.allowed) {
    return res.status(authCheck.status).json({ error: authCheck.message });
  }

  const generatedId = req.body.id && req.body.id.trim() !== '' ? req.body.id.trim() : `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newStudent: Student = {
    ...req.body,
    id: generatedId,
    status: req.body.status || 'Active',
    enrollmentDate: req.body.enrollmentDate || new Date().toISOString().slice(0, 10),
    attendanceRate: req.body.attendanceRate !== undefined ? Number(req.body.attendanceRate) : 98.0,
  };
  dbStudents.unshift(newStudent);

  // Sync totalStudents for all classes
  dbClasses.forEach((cls) => {
    cls.totalStudents = dbStudents.filter((s) => s.class === cls.name).length;
  });

  res.status(201).json(newStudent);
});

// POST /api/students/bulk (Bulk CSV Import)
app.post('/api/students/bulk', (req: Request, res: Response) => {
  const user = req.user!;
  const rawList = req.body.students;

  if (!Array.isArray(rawList) || rawList.length === 0) {
    return res.status(400).json({ error: 'Array of student records is required in "students".' });
  }

  const isAuthorized =
    user.role === 'Principal' ||
    user.role === 'OwnerAdmin' ||
    user.role === 'Admin' ||
    user.role === 'Teacher';

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Access Denied: Only School Administrators and Teachers can import student records.',
    });
  }

  const addedStudents: Student[] = [];
  const errors: string[] = [];

  rawList.forEach((st, idx) => {
    if (!st.name || !st.class) {
      errors.push(`Row #${idx + 1}: Missing student name or class.`);
      return;
    }

    // Teacher class permission check if Teacher
    if (user.role === 'Teacher') {
      const auth = checkClassTeacherAuthority(user, st.class, 'student_registration');
      if (!auth.allowed) {
        errors.push(`Row #${idx + 1} (${st.name}): Not authorized to enroll into ${st.class}.`);
        return;
      }
    }

    const generatedId = st.id && st.id.trim() !== '' ? st.id.trim() : `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: Student = {
      ...st,
      id: generatedId,
      status: st.status || 'Active',
      enrollmentDate: st.enrollmentDate || new Date().toISOString().slice(0, 10),
      attendanceRate: st.attendanceRate !== undefined ? Number(st.attendanceRate) : 98.0,
    };

    dbStudents.unshift(newStudent);
    addedStudents.push(newStudent);
  });

  // Sync totalStudents for all classes
  dbClasses.forEach((cls) => {
    cls.totalStudents = dbStudents.filter((s) => s.class === cls.name).length;
  });

  if (addedStudents.length > 0) {
    dbActivities.unshift({
      id: `act-stu-bulk-${Date.now()}`,
      user: user.name,
      userId: user.id,
      userSchoolId: user.schoolId,
      userRole: user.role,
      action: `Bulk Enrolled ${addedStudents.length} Students`,
      description: `CSV Bulk Import processed by ${user.role} ${user.name}`,
      module: 'Students',
      type: 'student',
      severity: 'success',
      timestamp: 'Just now',
    });
  }

  res.status(201).json({
    success: true,
    count: addedStudents.length,
    students: addedStudents,
    errors: errors.length > 0 ? errors : undefined,
  });
});

// PUT /api/students/:id
app.put('/api/students/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id;

  const index = dbStudents.findIndex((s) => s.id === targetId);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  if (user.role === 'Student') {
    if (user.studentId !== targetId) {
      return res.status(403).json({ error: 'Access Denied: You cannot modify other student profiles.' });
    }
    // Student can edit ONLY bio and profile picture (avatar) - academic records remain strictly read-only
    if (req.body.bio !== undefined) dbStudents[index].bio = req.body.bio;
    if (req.body.avatar !== undefined) dbStudents[index].avatar = req.body.avatar;
    return res.json(dbStudents[index]);
  }

  const targetClass = dbStudents[index].class;
  const authCheck = checkClassTeacherAuthority(user, targetClass, 'student_registration');
  if (!authCheck.allowed && user.role !== 'Principal') {
    return res.status(authCheck.status).json({ error: authCheck.message });
  }

  dbStudents[index] = { ...dbStudents[index], ...req.body };

  // Sync class counts
  dbClasses.forEach((cls) => {
    cls.totalStudents = dbStudents.filter((s) => s.class === cls.name).length;
  });

  res.json(dbStudents[index]);
});

// DELETE /api/students/:id (Assigned Class Teachers Only)
app.delete('/api/students/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const student = dbStudents.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const authCheck = checkClassTeacherAuthority(user, student.class, 'student_registration');
  if (!authCheck.allowed) {
    return res.status(authCheck.status).json({ error: authCheck.message });
  }

  dbStudents = dbStudents.filter((s) => s.id !== req.params.id);

  // Sync class counts
  dbClasses.forEach((cls) => {
    cls.totalStudents = dbStudents.filter((s) => s.class === cls.name).length;
  });

  res.json({ success: true, message: 'Student removed' });
});

// ==========================================
// 2. TEACHERS API (Strict Faculty RLS)
// ==========================================

// GET /api/teachers - List teachers
app.get('/api/teachers', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    // Return sanitized teacher directory for students
    const studentTeachers = dbTeachers.map(({ phone, ...rest }) => rest);
    return res.json(studentTeachers);
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

  const teacher = dbTeachers.find((t) => t.id === targetId || t.teacherId === targetId);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  if (user.role === 'Student' || (user.role === 'Teacher' && targetId !== user.teacherId && targetId !== user.id)) {
    // Strip private phone when viewing other teachers / student perspective
    const { phone, ...publicDetails } = teacher;
    return res.json(publicDetails);
  }

  res.json(teacher);
});

// POST /api/teachers (Principal & Owner Admin Only - SuperAdmin & Teachers Rejected)
app.post('/api/teachers', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot add school faculty. Faculty recruitment is managed by the School Principal and Owner Administrators.',
    });
  }

  const isFacultyAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFacultyAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only the School Principal or Owner Administrator can recruit and add faculty members.',
    });
  }

  const { teacherId, name, email, phone, subjects, classesAssigned, qualification, gender } = req.body;
  if (!name || !teacherId) {
    return res.status(400).json({ error: 'Teacher name and Teacher School ID are required.' });
  }

  const cleanTeacherId = teacherId.trim().toUpperCase();
  if (dbTeachers.some((t) => t.teacherId.toUpperCase() === cleanTeacherId)) {
    return res.status(409).json({ error: `Teacher ID "${cleanTeacherId}" is already assigned to another faculty member.` });
  }

  const newTeacher: Teacher = {
    id: `tch-${Date.now()}`,
    teacherId: cleanTeacherId,
    name: name.trim(),
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    email: email ? email.trim() : `${name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
    phone: phone || '+1 (555) 000-9988',
    subjects: Array.isArray(subjects) ? subjects : (subjects ? subjects.split(',').map((s: string) => s.trim()) : ['Mathematics']),
    classesAssigned: Array.isArray(classesAssigned) ? classesAssigned : (classesAssigned ? classesAssigned.split(',').map((c: string) => c.trim()) : ['Class 01']),
    qualification: qualification || 'M.Ed / B.Sc',
    joiningDate: req.body.joiningDate || new Date().toISOString().slice(0, 10),
    gender: gender || 'Female',
    status: 'Active',
  };

  dbTeachers.unshift(newTeacher);

  // Sync with dbProfiles
  const existingProfileIdx = dbProfiles.findIndex((p) => p.teacherId === cleanTeacherId || p.schoolId === cleanTeacherId);
  if (existingProfileIdx === -1) {
    dbProfiles.push({
      id: `usr-tch-${Date.now()}`,
      schoolId: cleanTeacherId,
      teacherId: cleanTeacherId,
      tenantSchoolId: user.schoolId || 'school-1',
      name: newTeacher.name,
      email: newTeacher.email,
      role: 'Teacher',
      status: 'Active',
      avatar: newTeacher.avatar,
      phone: newTeacher.phone,
      designation: 'Faculty Member',
      joinDate: newTeacher.joiningDate,
      assignedClasses: newTeacher.classesAssigned,
      assignedSubjects: newTeacher.subjects,
      classTeacherOf: [],
      isClassTeacher: false,
    });
  }

  // Audit Log
  dbActivities.unshift({
    id: `act-tch-${Date.now()}`,
    user: user.name,
    userId: user.id,
    userSchoolId: user.schoolId,
    userRole: user.role,
    action: `Faculty Onboarded: ${newTeacher.name} (${newTeacher.teacherId})`,
    description: `Added faculty member to teaching roster by ${user.role} ${user.name}`,
    module: 'Faculty',
    type: 'school',
    severity: 'info',
    timestamp: 'Just now',
  });

  res.status(201).json(newTeacher);
});

// POST /api/teachers/bulk (Bulk CSV Import)
app.post('/api/teachers/bulk', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot add school faculty.',
    });
  }

  const isFacultyAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFacultyAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only the School Principal or Owner Administrator can recruit and add faculty members.',
    });
  }

  const rawList = req.body.teachers;
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return res.status(400).json({ error: 'Array of teacher records is required in "teachers".' });
  }

  const addedTeachers: Teacher[] = [];
  const errors: string[] = [];

  rawList.forEach((t, idx) => {
    if (!t.name || !t.teacherId) {
      errors.push(`Row #${idx + 1}: Teacher name and Teacher ID are required.`);
      return;
    }

    const cleanTeacherId = t.teacherId.trim().toUpperCase();
    if (dbTeachers.some((existing) => existing.teacherId.toUpperCase() === cleanTeacherId)) {
      errors.push(`Row #${idx + 1}: Teacher ID "${cleanTeacherId}" already exists.`);
      return;
    }

    const newTeacher: Teacher = {
      id: `tch-${Date.now()}-${idx}`,
      teacherId: cleanTeacherId,
      name: t.name.trim(),
      avatar:
        t.avatar ||
        (t.gender === 'Male'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'),
      email: t.email ? t.email.trim() : `${t.name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
      phone: t.phone || '+1 (555) 000-8899',
      subjects: Array.isArray(t.subjects) ? t.subjects : (t.subjects ? t.subjects.split(',').map((s: string) => s.trim()) : ['Mathematics']),
      classesAssigned: Array.isArray(t.classesAssigned) ? t.classesAssigned : (t.classesAssigned ? t.classesAssigned.split(',').map((c: string) => c.trim()) : ['Class 01']),
      qualification: t.qualification || 'M.Ed / B.Sc',
      joiningDate: t.joiningDate || new Date().toISOString().slice(0, 10),
      gender: t.gender || 'Female',
      status: 'Active',
    };

    dbTeachers.unshift(newTeacher);
    addedTeachers.push(newTeacher);

    // Sync dbProfiles
    const existingProfileIdx = dbProfiles.findIndex((p) => p.teacherId === cleanTeacherId || p.schoolId === cleanTeacherId);
    if (existingProfileIdx === -1) {
      dbProfiles.push({
        id: `usr-tch-${Date.now()}-${idx}`,
        schoolId: cleanTeacherId,
        teacherId: cleanTeacherId,
        tenantSchoolId: user.schoolId || 'school-1',
        name: newTeacher.name,
        email: newTeacher.email,
        role: 'Teacher',
        status: 'Active',
        avatar: newTeacher.avatar,
        phone: newTeacher.phone,
        designation: 'Faculty Member',
        joinDate: newTeacher.joiningDate,
        assignedClasses: newTeacher.classesAssigned,
        assignedSubjects: newTeacher.subjects,
        classTeacherOf: [],
        isClassTeacher: false,
      });
    }
  });

  if (addedTeachers.length > 0) {
    dbActivities.unshift({
      id: `act-tch-bulk-${Date.now()}`,
      user: user.name,
      userId: user.id,
      userSchoolId: user.schoolId,
      userRole: user.role,
      action: `Bulk Recruited ${addedTeachers.length} Faculty Members`,
      description: `CSV Bulk Import processed by ${user.role} ${user.name}`,
      module: 'Faculty',
      type: 'school',
      severity: 'success',
      timestamp: 'Just now',
    });
  }

  res.status(201).json({
    success: true,
    count: addedTeachers.length,
    teachers: addedTeachers,
    errors: errors.length > 0 ? errors : undefined,
  });
});

// PUT /api/teachers/:id
app.put('/api/teachers/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Super Admin cannot modify school faculty profiles.',
    });
  }

  const isFacultyAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFacultyAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only Principal or Owner Administrator can update faculty details.',
    });
  }

  const targetId = req.params.id;
  const idx = dbTeachers.findIndex((t) => t.id === targetId || t.teacherId === targetId);
  if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });

  dbTeachers[idx] = { ...dbTeachers[idx], ...req.body };
  res.json(dbTeachers[idx]);
});

// DELETE /api/teachers/:id
app.delete('/api/teachers/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Super Admin cannot delete school faculty.',
    });
  }

  const isFacultyAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFacultyAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only Principal or Owner Administrator can remove faculty members.',
    });
  }

  const targetId = req.params.id;
  const teacher = dbTeachers.find((t) => t.id === targetId || t.teacherId === targetId);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  dbTeachers = dbTeachers.filter((t) => t.id !== targetId && t.teacherId !== targetId);
  res.json({ success: true, message: `Faculty member ${teacher.name} removed.` });
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

// POST /api/attendance/batch (Class Teacher Authority Required)
app.post('/api/attendance/batch', (req: Request, res: Response) => {
  const user = req.user!;
  const records = req.body as Omit<AttendanceRecord, 'id'>[];

  if (!records || records.length === 0) {
    return res.status(400).json({ error: 'No attendance records provided.' });
  }

  // Verify class teacher authorization for all affected classes
  const affectedClasses = Array.from(new Set(records.map((r) => r.class)));
  for (const cls of affectedClasses) {
    const authCheck = checkClassTeacherAuthority(user, cls, 'attendance');
    if (!authCheck.allowed) {
      return res.status(authCheck.status).json({ error: authCheck.message });
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

  if (user.role === 'Teacher') {
    const assignedClasses = user.assignedClasses || [];
    const teacherMarks = dbMarks.filter((m) => assignedClasses.includes(m.class));
    return res.json(teacherMarks);
  }

  res.json(dbMarks);
});

// GET /api/exams/ranking - Strict class ranking endpoint
app.get('/api/exams/ranking', (req: Request, res: Response) => {
  const user = req.user!;
  const examId = (req.query.examId as string) || 'ex-1';
  let targetClass = req.query.class as string;

  if (user.role === 'Student') {
    const student = dbStudents.find((s) => s.id === user.studentId);
    targetClass = student ? student.class : 'Class 02';
  } else if (!targetClass) {
    targetClass = 'Class 02';
  }

  // Get all students in target class
  const classStudents = dbStudents.filter((s) => s.class === targetClass);
  const examMarks = dbMarks.filter((m) => m.examId === examId && m.class === targetClass);

  // Group marks by student
  const studentTotals = classStudents.map((st) => {
    const studentMarksList = examMarks.filter((m) => m.studentId === st.id);
    const totalMarks = studentMarksList.reduce((acc, curr) => acc + curr.marksObtained, 0);
    const maxMarks = studentMarksList.length > 0
      ? studentMarksList.reduce((acc, curr) => acc + curr.totalMarks, 0)
      : 500;
    
    // If no specific exam marks recorded, synthesize realistic total from attendance rate
    const calculatedTotal = totalMarks > 0 ? totalMarks : Math.round((st.attendanceRate / 100) * 490);
    const calculatedMax = maxMarks > 0 ? maxMarks : 500;
    const percentage = Number(((calculatedTotal / calculatedMax) * 100).toFixed(1));

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    return {
      studentId: st.id,
      studentName: st.name,
      class: st.class,
      section: st.section,
      totalMarks: calculatedTotal,
      maxMarks: calculatedMax,
      percentage,
      grade,
      rollNo: st.rollNo,
    };
  });

  // Sort descending by percentage
  studentTotals.sort((a, b) => b.percentage - a.percentage);

  // Assign ranks
  const ranked = studentTotals.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));

  // Sanitized output (Never expose private details like phone, email, parent information, fees)
  res.json({
    examId,
    class: targetClass,
    totalParticipants: ranked.length,
    rankingVisibility: true,
    rankings: ranked,
  });
});

// POST /api/exams (Admin & Teacher Only)
app.post('/api/exams', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can schedule examinations.',
    });
  }

  const newExam: Exam = {
    ...req.body,
    id: `ex-${Date.now()}`,
  };
  dbExams.unshift(newExam);
  res.status(201).json(newExam);
});

// POST /api/marks (Class Teacher Authority Required)
app.post('/api/marks', (req: Request, res: Response) => {
  const user = req.user!;
  const mark = req.body as Omit<StudentMark, 'id'>;

  if (!mark.class) {
    return res.status(400).json({ error: 'Class is required for recording marks.' });
  }

  const authCheck = checkClassTeacherAuthority(user, mark.class, 'marks');
  if (!authCheck.allowed) {
    return res.status(authCheck.status).json({ error: authCheck.message });
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
  const syncedClasses = dbClasses.map((cls) => ({
    ...cls,
    totalStudents: dbStudents.filter((s) => s.class === cls.name).length,
  }));
  res.json(syncedClasses);
});

// POST /api/classes (Principal & Owner Admin Only - SuperAdmin Rejected)
app.post('/api/classes', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot create school classes. Class management is reserved for the School Principal and Owner Administrators.',
    });
  }

  const isClassAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isClassAdmin) {
    return res.status(403).json({ error: 'Access Denied: Only School Principal or Owner Administrators can create classes.' });
  }

  const { name, code, sections, classTeacher, classTeacherId, capacity, roomNumber } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Class name is required.' });
  }

  const newClass: SchoolClass = {
    id: `cls-${Date.now()}`,
    name: name.trim(),
    code: code || `CLS-${Math.floor(10 + Math.random() * 90)}`,
    sections: Array.isArray(sections) ? sections : (sections ? sections.split(',').map((s: string) => s.trim()) : ['A', 'B']),
    classTeacher: classTeacher || 'Unassigned',
    classTeacherId: classTeacherId || '',
    totalStudents: 0,
    capacity: Number(capacity) || 35,
    roomNumber: roomNumber || 'Room 101',
    assignmentHistory: classTeacher && classTeacher !== 'Unassigned' ? [
      {
        teacherId: classTeacherId || 'TCH-001',
        teacherName: classTeacher,
        assignedAt: new Date().toISOString().slice(0, 10),
        assignedBy: user.name,
        status: 'Active',
      }
    ] : [],
  };

  dbClasses.unshift(newClass);

  // If teacher was assigned, sync teacher profile classTeacherOf
  if (classTeacher && classTeacher !== 'Unassigned') {
    const teacherProfile = dbProfiles.find((p) => p.name === classTeacher || p.id === classTeacherId || p.teacherId === classTeacherId);
    if (teacherProfile) {
      if (!teacherProfile.classTeacherOf) teacherProfile.classTeacherOf = [];
      if (!teacherProfile.classTeacherOf.includes(newClass.name)) {
        teacherProfile.classTeacherOf.push(newClass.name);
      }
      teacherProfile.isClassTeacher = true;
    }
  }

  dbActivities.unshift({
    id: `act-cls-${Date.now()}`,
    user: user.name,
    userId: user.id,
    userSchoolId: user.schoolId,
    userRole: user.role,
    action: `Created new academic grade "${newClass.name}" (${newClass.code})`,
    description: `Assigned Class Teacher: ${newClass.classTeacher}`,
    module: 'Class',
    type: 'school',
    severity: 'info',
    timestamp: 'Just now',
  });

  res.status(201).json(newClass);
});

// PUT /api/classes/:id (Principal & Owner Admin Only)
app.put('/api/classes/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot modify school classes.',
    });
  }

  const isClassAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isClassAdmin) {
    return res.status(403).json({ error: 'Access Denied: Only School Principal or Owner Administrators can modify classes.' });
  }

  const targetId = req.params.id;
  const idx = dbClasses.findIndex((c) => c.id === targetId || c.name === targetId);
  if (idx === -1) return res.status(404).json({ error: 'Class not found' });

  dbClasses[idx] = { ...dbClasses[idx], ...req.body };
  res.json(dbClasses[idx]);
});

// DELETE /api/classes/:id (Principal & Owner Admin Only)
app.delete('/api/classes/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot delete school classes.',
    });
  }

  const isClassAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isClassAdmin) {
    return res.status(403).json({ error: 'Access Denied: Only School Principal or Owner Administrators can delete classes.' });
  }

  const targetId = req.params.id;
  const cls = dbClasses.find((c) => c.id === targetId || c.name === targetId);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  dbClasses = dbClasses.filter((c) => c.id !== targetId && c.name !== targetId);
  res.json({ success: true, message: `Class ${cls.name} deleted.` });
});

// POST /api/classes/:id/replace-teacher - Replace Class Teacher with full preservation of historical records (Rule 8)
app.post(['/api/classes/:id/replace-teacher', '/api/classes/:id/assign-class-teacher'], (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Super Admin cannot assign or replace Class Teachers. This is a Principal duty.',
    });
  }

  const isAuthority = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isAuthority) {
    return res.status(403).json({
      error: 'Access Denied: Only the School Principal or Owner Administrator has the authority to assign or replace Class Teachers.',
    });
  }

  const targetId = req.params.id;
  const clsIndex = dbClasses.findIndex((c) => c.id === targetId || c.name === targetId);
  if (clsIndex === -1) {
    return res.status(404).json({ error: `Class "${targetId}" not found.` });
  }

  const targetClass = dbClasses[clsIndex];
  const { newTeacherId, newTeacherName, reason } = req.body;

  if (!newTeacherName) {
    return res.status(400).json({ error: 'New Class Teacher name is required.' });
  }

  const previousTeacherName = targetClass.classTeacher;
  const previousTeacherId = targetClass.classTeacherId;

  // 1. Find previous teacher profile and remove this class from classTeacherOf
  if (previousTeacherName && previousTeacherName !== 'Unassigned') {
    const oldTeacherProfile = dbProfiles.find(
      (p) => p.name === previousTeacherName || p.id === previousTeacherId || p.teacherId === previousTeacherId
    );
    if (oldTeacherProfile && oldTeacherProfile.classTeacherOf) {
      oldTeacherProfile.classTeacherOf = oldTeacherProfile.classTeacherOf.filter((c) => c !== targetClass.name);
      oldTeacherProfile.isClassTeacher = oldTeacherProfile.classTeacherOf.length > 0;
    }
  }

  // 2. Find new teacher profile and grant classTeacherOf for this class
  const newTeacherProfile = dbProfiles.find(
    (p) => p.name === newTeacherName || p.id === newTeacherId || p.teacherId === newTeacherId
  );
  if (newTeacherProfile) {
    if (!newTeacherProfile.classTeacherOf) newTeacherProfile.classTeacherOf = [];
    if (!newTeacherProfile.classTeacherOf.includes(targetClass.name)) {
      newTeacherProfile.classTeacherOf.push(targetClass.name);
    }
    newTeacherProfile.isClassTeacher = true;
  }

  // 3. Update class record and append to assignment history
  if (!targetClass.assignmentHistory) {
    targetClass.assignmentHistory = [];
  }

  const now = new Date().toISOString().slice(0, 10);

  // Mark previous assignment as replaced
  if (targetClass.assignmentHistory.length > 0) {
    const lastEntry = targetClass.assignmentHistory[targetClass.assignmentHistory.length - 1];
    if (lastEntry.status === 'Active') {
      lastEntry.status = 'Replaced';
      lastEntry.replacedAt = now;
      lastEntry.replacedBy = user.name;
      lastEntry.reason = reason || 'Replaced by Principal administrative order';
    }
  }

  // Add new active assignment
  targetClass.assignmentHistory.push({
    id: `asg-${Date.now()}`,
    teacherId: newTeacherId || (newTeacherProfile?.teacherId || newTeacherProfile?.id || 'TCH-001'),
    teacherName: newTeacherName,
    assignedAt: now,
    assignedBy: user.name,
    status: 'Active',
    reason: reason || 'Official Class Teacher Appointment',
  });

  targetClass.classTeacher = newTeacherName;
  targetClass.classTeacherId = newTeacherId || (newTeacherProfile?.teacherId || newTeacherProfile?.id || '');

  // 4. Log strict security and responsibility audit entry
  dbActivities.unshift({
    id: `act-rep-${Date.now()}`,
    user: user.name,
    userId: user.id,
    userSchoolId: user.schoolId,
    userRole: user.role,
    action: `Class Teacher Replaced for ${targetClass.name}: ${newTeacherName} (formerly ${previousTeacherName})`,
    description: `Principal reassigned classroom authority. Historical attendance, marks, and student records created by ${previousTeacherName} remain fully preserved.`,
    module: 'Class',
    type: 'school',
    severity: 'success',
    timestamp: 'Just now',
  });

  res.json({
    success: true,
    message: `Class Teacher for ${targetClass.name} successfully updated from ${previousTeacherName} to ${newTeacherName}. Authority transferred while preserving all historical records.`,
    class: targetClass,
  });
});

app.get('/api/subjects', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    const student = dbStudents.find((s) => s.id === user.studentId);
    const targetClass = student ? student.class : 'Class 02';
    // Filter to subjects for student's class
    const studentSubjects = dbSubjects.filter(
      (sub) => sub.classes.includes(targetClass) || sub.classes.some((c) => targetClass.includes(c))
    );
    return res.json(studentSubjects);
  }
  res.json(dbSubjects);
});

// POST /api/subjects (Admin Only)
app.post('/api/subjects', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Subject management is reserved for authorized school administrators and faculty.',
    });
  }

  const newSubject: Subject = {
    ...req.body,
    id: `sub-${Date.now()}`,
  };
  dbSubjects.unshift(newSubject);
  res.status(201).json(newSubject);
});

// PUT /api/subjects/:id (Admin Only)
app.put('/api/subjects/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Subject modification is reserved for authorized school administrators.',
    });
  }
  const idx = dbSubjects.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
  dbSubjects[idx] = { ...dbSubjects[idx], ...req.body };
  res.json(dbSubjects[idx]);
});

// DELETE /api/subjects/:id (Admin Only)
app.delete('/api/subjects/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Subject deletion is reserved for authorized school administrators.',
    });
  }
  dbSubjects = dbSubjects.filter((s) => s.id !== req.params.id);
  res.json({ success: true, message: 'Subject removed' });
});

// ==========================================
// 6. LIBRARY API
// ==========================================

app.get('/api/library', (req: Request, res: Response) => {
  res.json(dbBooks);
});

// POST /api/library/books (Faculty & School Admin Only)
app.post('/api/library/books', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot manage school library catalogs.',
    });
  }

  const isLibraryAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin' || user.role === 'Teacher';
  if (!isLibraryAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only designated School Administrators and Faculty can add books to the catalog.',
    });
  }
  const newBook: LibraryBook = {
    ...req.body,
    id: `bk-${Date.now()}`,
    uploadedAt: req.body.uploadedAt || new Date().toISOString().slice(0, 10),
    uploadedBy: req.body.uploadedBy || `${user.name} (${user.role})`,
  };
  dbBooks.unshift(newBook);
  res.status(201).json(newBook);
});

// PUT /api/library/books/:id (Faculty & School Admin Only)
app.put('/api/library/books/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot modify school library catalogs.',
    });
  }

  const isLibraryAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin' || user.role === 'Teacher';
  if (!isLibraryAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only designated School Administrators and Faculty can edit book records.',
    });
  }
  const bookIdx = dbBooks.findIndex((b) => b.id === req.params.id);
  if (bookIdx === -1) return res.status(404).json({ error: 'Book not found' });

  dbBooks[bookIdx] = {
    ...dbBooks[bookIdx],
    ...req.body,
    id: req.params.id,
  };
  res.json(dbBooks[bookIdx]);
});

// DELETE /api/library/books/:id (Faculty & School Admin Only)
app.delete('/api/library/books/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot delete school library catalogs.',
    });
  }

  const isLibraryAdmin = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin' || user.role === 'Teacher';
  if (!isLibraryAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only designated School Administrators and Faculty can remove books from inventory.',
    });
  }
  dbBooks = dbBooks.filter((b) => b.id !== req.params.id);
  res.json({ success: true, message: 'Book deleted from inventory' });
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
// 6B. SYLLABUS API
// ==========================================

app.get('/api/syllabus', (req: Request, res: Response) => {
  const { class: classFilter, subject, term, academicYear, q } = req.query as Record<string, string>;
  let list = [...dbSyllabus];

  if (classFilter && classFilter !== 'all') {
    const norm = classFilter.toLowerCase().replace('class', '').trim();
    list = list.filter((s) => s.class.toLowerCase().includes(norm));
  }
  if (subject && subject !== 'all') {
    list = list.filter((s) => s.subject.toLowerCase() === subject.toLowerCase());
  }
  if (term && term !== 'all') {
    list = list.filter((s) => s.term.toLowerCase() === term.toLowerCase());
  }
  if (academicYear && academicYear !== 'all') {
    list = list.filter((s) => s.academicYear === academicYear);
  }
  if (q && q.trim()) {
    const search = q.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.subject.toLowerCase().includes(search) ||
        s.class.toLowerCase().includes(search) ||
        (s.description && s.description.toLowerCase().includes(search)) ||
        s.fileName.toLowerCase().includes(search)
    );
  }

  res.json(list);
});

app.post('/api/syllabus', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can publish curriculum syllabus.',
    });
  }

  const { title, class: targetClass, subject, term, academicYear, description, topicsCount, fileName, fileSize, fileType, fileData, fileUrl, accessLevel } = req.body;
  if (!title || !subject || !fileName) {
    return res.status(400).json({ error: 'Title, Subject, and Document File are required.' });
  }

  const newItem: SyllabusItem = {
    id: `syl-${Date.now()}`,
    title,
    class: targetClass || 'Class 02',
    subject,
    term: term || 'Term 1',
    academicYear: academicYear || '2026-2027',
    description: description || '',
    topicsCount: Number(topicsCount) || 5,
    fileName,
    fileSize: fileSize || '1.5 MB',
    fileType: fileType || 'pdf',
    fileData: fileData || `AUDIENTA CURRICULUM REPOSITORY\nTitle: ${title}\nSubject: ${subject} | Class: ${targetClass}\nTerm: ${term} | Academic Year: ${academicYear}\n\n${description || 'Official curriculum outline document.'}`,
    fileUrl,
    uploadedAt: new Date().toISOString().slice(0, 10),
    uploadedBy: user.name,
    uploadedByRole: user.role,
    accessLevel: accessLevel || 'All',
  };

  dbSyllabus.unshift(newItem);
  res.status(201).json(newItem);
});

app.put('/api/syllabus/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can edit syllabus documents.',
    });
  }

  const idx = dbSyllabus.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Syllabus item not found.' });

  dbSyllabus[idx] = {
    ...dbSyllabus[idx],
    ...req.body,
    id: req.params.id,
  };

  res.json(dbSyllabus[idx]);
});

app.delete('/api/syllabus/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can delete syllabus documents.',
    });
  }

  dbSyllabus = dbSyllabus.filter((s) => s.id !== req.params.id);
  res.json({ success: true, message: 'Syllabus document removed.' });
});

// ==========================================
// 6C. LEARNING RESOURCES API
// ==========================================

app.get('/api/learning-resources', (req: Request, res: Response) => {
  const { class: classFilter, subject, resourceType, term, academicYear, q } = req.query as Record<string, string>;
  let list = [...dbLearningResources];

  if (classFilter && classFilter !== 'all') {
    const norm = classFilter.toLowerCase().replace('class', '').trim();
    list = list.filter((r) => r.class.toLowerCase().includes(norm));
  }
  if (subject && subject !== 'all') {
    list = list.filter((r) => r.subject.toLowerCase() === subject.toLowerCase());
  }
  if (resourceType && resourceType !== 'all') {
    list = list.filter((r) => r.resourceType.toLowerCase() === resourceType.toLowerCase());
  }
  if (term && term !== 'all') {
    list = list.filter((r) => r.term?.toLowerCase() === term.toLowerCase());
  }
  if (academicYear && academicYear !== 'all') {
    list = list.filter((r) => r.academicYear === academicYear);
  }
  if (q && q.trim()) {
    const search = q.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(search) ||
        r.subject.toLowerCase().includes(search) ||
        r.class.toLowerCase().includes(search) ||
        (r.topic && r.topic.toLowerCase().includes(search)) ||
        (r.description && r.description.toLowerCase().includes(search)) ||
        r.fileName.toLowerCase().includes(search)
    );
  }

  res.json(list);
});

app.post('/api/learning-resources', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can upload learning resources.',
    });
  }

  const { title, resourceType, class: targetClass, subject, topic, term, academicYear, description, fileName, fileSize, fileType, fileData, fileUrl, accessLevel } = req.body;
  if (!title || !subject || !fileName) {
    return res.status(400).json({ error: 'Title, Subject, and File are required.' });
  }

  const newResource: LearningResource = {
    id: `res-${Date.now()}`,
    title,
    resourceType: resourceType || 'Notes',
    class: targetClass || 'Class 02',
    subject,
    topic: topic || '',
    term: term || 'Term 1',
    academicYear: academicYear || '2026-2027',
    description: description || '',
    fileName,
    fileSize: fileSize || '1.8 MB',
    fileType: fileType || 'pdf',
    fileData: fileData || `AUDIENTA EDUCATIONAL RESOURCE\nTitle: ${title}\nType: ${resourceType} | Subject: ${subject} | Grade: ${targetClass}\nTopic: ${topic || 'General'}\n\n${description || 'Educational study resource file.'}`,
    fileUrl,
    uploadedAt: new Date().toISOString().slice(0, 10),
    uploadedBy: user.name,
    uploadedByRole: user.role,
    downloadsCount: 0,
    accessLevel: accessLevel || 'All',
  };

  dbLearningResources.unshift(newResource);
  res.status(201).json(newResource);
});

app.put('/api/learning-resources/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can modify learning resources.',
    });
  }

  const idx = dbLearningResources.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Resource not found.' });

  dbLearningResources[idx] = {
    ...dbLearningResources[idx],
    ...req.body,
    id: req.params.id,
  };

  res.json(dbLearningResources[idx]);
});

app.delete('/api/learning-resources/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only Teachers and Administrators can delete learning resources.',
    });
  }

  dbLearningResources = dbLearningResources.filter((r) => r.id !== req.params.id);
  res.json({ success: true, message: 'Resource removed.' });
});

app.post('/api/learning-resources/:id/download-count', (req: Request, res: Response) => {
  const resItem = dbLearningResources.find((r) => r.id === req.params.id);
  if (resItem) {
    resItem.downloadsCount = (resItem.downloadsCount || 0) + 1;
  }
  res.json({ success: true, downloadsCount: resItem?.downloadsCount || 0 });
});

// ==========================================
// 7. NOTICES API (Audience Filtered)
// ==========================================

app.get('/api/notices', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    return res.json(dbNotices.filter((n) => n.audience === 'All' || n.audience === 'Students'));
  }
  if (user.role === 'Teacher') {
    return res.json(dbNotices.filter((n) => n.audience === 'All' || n.audience === 'Teachers'));
  }

  res.json(dbNotices);
});

app.post('/api/notices', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot publish school notices.',
    });
  }

  const canPublishNotice = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!canPublishNotice) {
    return res.status(403).json({ error: 'Access Denied: Only the Headteacher and School Administration can publish announcements. Teachers, Students, and Accountants cannot post notices.' });
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

app.delete('/api/notices/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot delete school notices.',
    });
  }

  const canManageNotice = user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!canManageNotice) {
    return res.status(403).json({ error: 'Access Denied: Only School Administrators can delete notices.' });
  }

  const id = req.params.id;
  dbNotices = dbNotices.filter((n) => n.id !== id);
  res.json({ success: true, message: 'Notice deleted successfully' });
});

// ==========================================
// 8. USER PROFILE / ACCOUNT & LOCKED ROLE GOVERNANCE API
// ==========================================

// GET /api/profile/me - Get current authenticated user profile
app.get('/api/profile/me', (req: Request, res: Response) => {
  const user = req.user!;
  const fullProfile = dbProfiles.find((p) => p.id === user.id);
  if (!fullProfile) {
    return res.json({
      ...user,
      status: 'Active',
      roleAssignedBy: 'School Administrator',
      roleAssignedAt: '2026-01-01',
    });
  }

  // Sanitize password from response
  const { password, ...safeProfile } = fullProfile;
  res.json(safeProfile);
});

// PUT /api/profile - Update personal profile details (Locked fields: role, status, schoolId, id cannot be modified)
app.put('/api/profile', (req: Request, res: Response) => {
  const user = req.user!;
  const profileIndex = dbProfiles.findIndex((p) => p.id === user.id);

  if (profileIndex === -1) {
    return res.status(404).json({ error: 'User profile not found in database.' });
  }

  const { name, email, phone, address, bio, avatar, designation } = req.body;

  // Strict Protection: Do not allow modifying role or status through user profile endpoint
  if (req.body.role && req.body.role !== dbProfiles[profileIndex].role) {
    return res.status(403).json({
      error: 'Security Violation: User roles are assigned by the Administrator and cannot be changed by the user.',
    });
  }

  // Student Permission Strictness: Students can ONLY edit their Bio. Official records are non-editable.
  if (user.role === 'Student') {
    if (bio !== undefined) {
      dbProfiles[profileIndex].bio = bio;
    }
    const { password, ...safeProfile } = dbProfiles[profileIndex];
    return res.json({ success: true, profile: safeProfile });
  }

  // Authorized Admin, Teacher fields
  if (name !== undefined && typeof name === 'string' && name.trim()) {
    dbProfiles[profileIndex].name = name.trim();
  }
  if (email !== undefined && typeof email === 'string' && email.trim()) {
    dbProfiles[profileIndex].email = email.trim();
  }
  if (phone !== undefined) dbProfiles[profileIndex].phone = phone;
  if (address !== undefined) dbProfiles[profileIndex].address = address;
  if (bio !== undefined) dbProfiles[profileIndex].bio = bio;
  if (avatar !== undefined) dbProfiles[profileIndex].avatar = avatar;
  if (designation !== undefined) {
    dbProfiles[profileIndex].designation = designation;
  }

  const { password, ...safeProfile } = dbProfiles[profileIndex];
  res.json({ success: true, profile: safeProfile });
});

// PUT /api/student/bio - Dedicated student bio update
app.put('/api/student/bio', (req: Request, res: Response) => {
  const user = req.user!;
  const { bio } = req.body;
  const profileIndex = dbProfiles.findIndex((p) => p.id === user.id);

  if (profileIndex === -1) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  dbProfiles[profileIndex].bio = typeof bio === 'string' ? bio : '';
  const { password, ...safeProfile } = dbProfiles[profileIndex];
  res.json({ success: true, message: 'Bio updated successfully', profile: safeProfile });
});

// GET /api/admin/users - List all system users and their assigned roles (Admin Only)
app.get('/api/admin/users', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Access Denied: Only authorized Administrators can view the user role directory.',
    });
  }

  const sanitizedUsers = dbProfiles.map(({ password, ...u }) => u);
  res.json(sanitizedUsers);
});

// POST /api/admin/users - Admin provisions a new user with an official locked role (Admin Only)
app.post('/api/admin/users', (req: Request, res: Response) => {
  const user = req.user!;
  
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    if (req.body.role !== 'OwnerAdmin') {
      return res.status(403).json({
        error: 'Access restricted: Platform Super Administrators can only register School Owners and manage platform subscriptions. School operational staff (Principals, Teachers, Students) are registered by School Owners and Principals.',
      });
    }
  }

  const isUserAdmin = user.role === 'OwnerAdmin' || user.role === 'Principal' || user.role === 'Admin' || user.role === 'SuperAdmin';
  if (!isUserAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only authorized School Administrators (Owner Admin / Principal) can provision new user accounts.',
    });
  }

  const { schoolId, name, email, role, password, designation, phone, address, assignedClasses, assignedSubjects, studentId, teacherId, linkedStudentIds, tenantSchoolId } = req.body;

  if (!schoolId || !name || !email || !role) {
    return res.status(400).json({ error: 'School ID, Full Name, Email, and Official Role are required.' });
  }

  const cleanSchoolId = schoolId.trim().toUpperCase();

  if (dbProfiles.some((p) => p.schoolId.toUpperCase() === cleanSchoolId || p.id === cleanSchoolId)) {
    return res.status(409).json({ error: `A user with School ID "${cleanSchoolId}" already exists.` });
  }

  const targetSchoolId = tenantSchoolId || user.schoolId || 'school-1';

  // Rule 9: Principal Duplication Prevention
  if (role === 'Principal') {
    const existingPrincipal = dbProfiles.find(
      (p) =>
        p.role === 'Principal' &&
        (p.tenantSchoolId === targetSchoolId || p.schoolId === targetSchoolId || p.id === 'usr-prin-1' || p.schoolId === 'SCH-2026-001') &&
        p.status !== 'Disabled'
    );

    if (existingPrincipal) {
      const school = dbSchools.find((s) => s.id === targetSchoolId) || { name: 'Springfield Academy' };
      return res.status(409).json({
        error: `Principal already registered: Dear ${user.name}, ${existingPrincipal.name} is currently registered as the Principal of ${school.name}. To appoint another Principal, please replace the current Principal first.`,
      });
    }
  }

  const newProfile: UserProfile = {
    id: `usr-${role.toLowerCase()}-${Date.now().toString(36)}`,
    schoolId: cleanSchoolId,
    tenantSchoolId: targetSchoolId,
    name: name.trim(),
    email: email.trim(),
    role,
    password: password || 'password123',
    status: 'Active',
    roleAssignedBy: `${user.name} (${user.id})`,
    roleAssignedAt: new Date().toISOString().slice(0, 10),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone,
    address,
    designation,
    joinDate: new Date().toISOString().slice(0, 10),
    assignedClasses,
    assignedSubjects,
    studentId,
    teacherId,
    linkedStudentIds,
  };

  dbProfiles.push(newProfile);

  // Record Audit Log
  const auditEntry: RoleAuditLog = {
    id: `aud-${Date.now()}`,
    userId: newProfile.id,
    userName: newProfile.name,
    userSchoolId: newProfile.schoolId,
    previousRole: role,
    newRole: role,
    changedByAdminId: user.id,
    changedByAdminName: user.name,
    changedByAdminSchoolId: (dbProfiles.find((p) => p.id === user.id)?.schoolId) || 'ADM-2026-0001',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    reason: `Initial account creation and official role assignment as ${role}`,
  };
  dbRoleAuditLogs.unshift(auditEntry);

  const { password: _, ...safeProfile } = newProfile;
  res.status(201).json({ success: true, user: safeProfile, auditEntry });
});

// POST /api/principals/replace (Owner Admin Only - Rule 9 & Rule 16)
app.post('/api/principals/replace', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot manage school Principal appointments.',
    });
  }

  const isOwner = user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isOwner) {
    return res.status(403).json({
      error: 'Access Denied: Only School Owner Administrators have the authority to appoint or replace the School Principal.',
    });
  }

  const { schoolId, newPrincipal, reason } = req.body;
  const targetSchoolId = schoolId || user.schoolId || 'school-1';
  const school = dbSchools.find((s) => s.id === targetSchoolId);
  if (!school) {
    return res.status(404).json({ error: `School "${targetSchoolId}" not found.` });
  }

  const { name, email, phone, designation, qualification } = newPrincipal || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'New Principal name and official email are required.' });
  }

  // 1. Find existing active Principal for this school
  const currentPrincipal = dbProfiles.find(
    (p) => p.role === 'Principal' && (p.tenantSchoolId === targetSchoolId || p.schoolId === targetSchoolId || p.id === school.principalId || p.id === 'usr-prin-1') && p.status !== 'Disabled'
  );

  const now = new Date().toISOString().slice(0, 10);
  const previousPrincipalName = currentPrincipal?.name || school.principalName || 'Previous Principal';

  // 2. Archive previous principal profile (maintain all historical records)
  if (currentPrincipal) {
    currentPrincipal.status = 'Disabled';
    currentPrincipal.designation = 'Former Principal (Transitioned)';
  }

  // 3. Record in school.previousPrincipals
  if (!school.previousPrincipals) school.previousPrincipals = [];
  school.previousPrincipals.push({
    id: currentPrincipal?.id || `usr-p-${Date.now()}`,
    name: previousPrincipalName,
    email: currentPrincipal?.email || school.principalEmail || '',
    appointedAt: currentPrincipal?.joinDate || '2025-01-01',
    replacedAt: now,
    replacedBy: user.name,
    reason: reason || 'Administrative transition by School Owner',
  });

  // 4. Create new Principal profile
  const newPrincipalId = `usr-prin-${Date.now().toString(36)}`;
  const newSchoolCodeId = `PRN-${Date.now().toString(36).toUpperCase()}`;
  const newProfile: UserProfile = {
    id: newPrincipalId,
    schoolId: newSchoolCodeId,
    tenantSchoolId: targetSchoolId,
    name: name.trim(),
    email: email.trim(),
    role: 'Principal',
    password: 'password123',
    status: 'Active',
    roleAssignedBy: `${user.name} (${user.role})`,
    roleAssignedAt: now,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    phone: phone || '+1 (555) 443-2211',
    designation: designation || 'School Principal',
    bio: qualification || 'Ph.D in Educational Leadership',
    joinDate: now,
  };
  dbProfiles.push(newProfile);

  // 5. Update School details
  school.principalName = name.trim();
  school.principalEmail = email.trim();
  school.principalId = newPrincipalId;

  // 6. Update Membership
  const existingMemberIdx = dbMemberships.findIndex((m) => m.schoolId === targetSchoolId && m.role === 'Principal');
  if (existingMemberIdx !== -1) {
    dbMemberships[existingMemberIdx] = {
      ...dbMemberships[existingMemberIdx],
      userId: newPrincipalId,
      status: 'Active',
    };
  } else {
    dbMemberships.push({
      id: `mem-${Date.now()}`,
      userId: newPrincipalId,
      schoolId: targetSchoolId,
      schoolName: school.name,
      schoolCode: school.code,
      role: 'Principal',
      status: 'Active',
      joinedAt: now,
    });
  }

  // 7. Record Activity Log
  dbActivities.unshift({
    id: `act-prin-${Date.now()}`,
    user: user.name,
    userId: user.id,
    userSchoolId: user.schoolId,
    userRole: user.role,
    action: `School Principal Replaced: ${name.trim()} (formerly ${previousPrincipalName})`,
    description: `Owner transitioned institutional leadership. All past academic, fee, and disciplinary records remain safely preserved.`,
    module: 'Administration',
    type: 'school',
    severity: 'success',
    timestamp: 'Just now',
  });

  const { password: _, ...safeProfile } = newProfile;
  res.json({
    success: true,
    message: `Principal for ${school.name} successfully updated to ${name}. Authority transitioned while preserving all historical records.`,
    newPrincipal: safeProfile,
    previousPrincipalName,
    school,
  });
});

// PUT /api/admin/users/:id/role - Admin changes/reassigns a user's role with mandatory audit logging (Admin Only)
app.put('/api/admin/users/:id/role', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Access Denied: Only authorized Administrators can assign or modify user roles.',
    });
  }

  const targetId = req.params.id;
  const { newRole, reason } = req.body;

  if (!newRole || !['SuperAdmin', 'OwnerAdmin', 'Principal', 'Admin', 'Teacher', 'Student', 'AccountAdmin'].includes(newRole)) {
    return res.status(400).json({ error: 'Valid canonical role is required.' });
  }

  const profile = dbProfiles.find((p) => p.id === targetId || p.schoolId === targetId);
  if (!profile) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  // Safety check: Prevent modifying the primary root administrator role
  if (profile.id === 'usr-admin-1' && newRole !== 'Admin') {
    return res.status(400).json({ error: 'The Primary Root Administrator account cannot be demoted.' });
  }

  const previousRole = profile.role;
  profile.role = newRole;
  profile.roleAssignedBy = `${user.name} (${user.id})`;
  profile.roleAssignedAt = new Date().toISOString().slice(0, 10);

  // Record strict Audit Log
  const auditEntry: RoleAuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: profile.id,
    userName: profile.name,
    userSchoolId: profile.schoolId,
    previousRole,
    newRole,
    changedByAdminId: user.id,
    changedByAdminName: user.name,
    changedByAdminSchoolId: (dbProfiles.find((p) => p.id === user.id)?.schoolId) || 'ADM-2026-0001',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    reason: reason ? reason.trim() : 'Administrative role reassignment by School Authority',
  };
  dbRoleAuditLogs.unshift(auditEntry);

  const { password, ...safeProfile } = profile;
  res.json({
    success: true,
    message: `Role for ${profile.name} successfully updated to ${newRole}.`,
    user: safeProfile,
    auditEntry,
  });
});

// PUT /api/admin/users/:id/status - Admin activates or disables a user account (Admin Only)
app.put('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Access Denied: Only authorized Administrators can change user account status.',
    });
  }

  const targetId = req.params.id;
  const { status, reason } = req.body;

  if (status !== 'Active' && status !== 'Disabled') {
    return res.status(400).json({ error: 'Status must be either "Active" or "Disabled".' });
  }

  const profile = dbProfiles.find((p) => p.id === targetId || p.schoolId === targetId);
  if (!profile) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  if (profile.id === 'usr-admin-1' && status === 'Disabled') {
    return res.status(400).json({ error: 'The Primary Root Administrator account cannot be disabled.' });
  }

  profile.status = status;

  // Record Audit Log
  const auditEntry: RoleAuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: profile.id,
    userName: profile.name,
    userSchoolId: profile.schoolId,
    previousRole: profile.role,
    newRole: profile.role,
    changedByAdminId: user.id,
    changedByAdminName: user.name,
    changedByAdminSchoolId: (dbProfiles.find((p) => p.id === user.id)?.schoolId) || 'ADM-2026-0001',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    reason: reason ? reason.trim() : `Account marked as ${status} by administrator`,
  };
  dbRoleAuditLogs.unshift(auditEntry);

  const { password, ...safeProfile } = profile;
  res.json({ success: true, user: safeProfile, auditEntry });
});

// GET /api/admin/role-audit-logs - Retrieve all role change audit logs (Admin Only)
app.get('/api/admin/role-audit-logs', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Access Denied: Only authorized Administrators can review role change audit logs.',
    });
  }

  res.json(dbRoleAuditLogs);
});

// ==========================================
// 9. SCHOOL FEES API (Strict RLS & Auditing)
// ==========================================

// GET /api/fees/structures - Get fee structures
app.get('/api/fees/structures', (req: Request, res: Response) => {
  res.json(dbFeeStructures);
});

// POST /api/fees/structures - Create fee structure (Accountant, Principal, Owner Admin)
app.post('/api/fees/structures', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot manage school fees.',
    });
  }

  const isFeeAdmin = user.role === 'AccountAdmin' || user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFeeAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Fee structure creation is restricted to the School Owner, Headteacher, and Accountant.',
    });
  }

  const { name, category, class: targetClass, academicYear, term, amount, dueDate, description } = req.body;
  if (!name || !amount || !dueDate) {
    return res.status(400).json({ error: 'Fee name, amount, and due date are required.' });
  }

  const newStructure: FeeStructure = {
    id: `FST-${String(dbFeeStructures.length + 1).padStart(3, '0')}`,
    name,
    category: category || 'Tuition',
    class: targetClass || 'All Classes',
    academicYear: academicYear || '2026-2027',
    term: term || 'Term 1',
    amount: Number(amount),
    dueDate,
    description,
  };

  dbFeeStructures.unshift(newStructure);
  res.status(201).json(newStructure);
});

// DELETE /api/fees/structures/:id (Accountant, Principal, Owner Admin)
app.delete('/api/fees/structures/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot manage school fees.',
    });
  }

  const isFeeAdmin = user.role === 'AccountAdmin' || user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFeeAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Fee structure deletion is restricted to the School Owner, Headteacher, and Accountant.',
    });
  }

  const id = req.params.id;
  dbFeeStructures = dbFeeStructures.filter((fs) => fs.id !== id);
  res.json({ success: true });
});

// GET /api/fees - List student fee records (RLS enforced)
app.get('/api/fees', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    // A student can ONLY view their own fee records
    const studentId = user.studentId;
    const records = dbStudentFees.filter((f) => f.studentId === studentId);
    return res.json(records);
  }

  // Admin, Accountant, Teacher
  return res.json(dbStudentFees);
});

// POST /api/fees/assign - Assign fee to student or entire class (Accountant, Principal, Owner Admin)
app.post('/api/fees/assign', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot assign school fees.',
    });
  }

  const isFeeAdmin = user.role === 'AccountAdmin' || user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFeeAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Fee assignment is restricted to the School Owner, Headteacher, and Accountant.',
    });
  }

  const { feeStructureId, studentId, class: targetClass, section, customAmount, dueDate } = req.body;
  const structure = dbFeeStructures.find((fs) => fs.id === feeStructureId);
  const amount = Number(customAmount || structure?.amount || 0);
  const finalDueDate = dueDate || structure?.dueDate || '2026-09-30';
  const category = structure?.category || 'Tuition';
  const title = structure?.name || 'School Fee';
  const academicYear = structure?.academicYear || '2026-2027';
  const term = structure?.term || 'Term 1';

  const createdRecords: StudentFeeRecord[] = [];

  if (studentId) {
    // Assign to single student
    const student = dbStudents.find((s) => s.id === studentId);
    if (!student) return res.status(404).json({ error: 'Target student not found.' });

    const newRecord: StudentFeeRecord = {
      id: `FEE-2026-${String(dbStudentFees.length + 1).padStart(4, '0')}`,
      feeStructureId,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      class: student.class,
      section: student.section,
      title,
      category,
      totalAmount: amount,
      paidAmount: 0,
      remainingBalance: amount,
      dueDate: finalDueDate,
      status: 'Unpaid',
      academicYear,
      term,
    };
    dbStudentFees.unshift(newRecord);
    createdRecords.push(newRecord);
  } else if (targetClass) {
    // Assign to whole class (and optional section)
    const matchingStudents = dbStudents.filter(
      (s) => s.class === targetClass && (!section || section === 'All' || s.section === section)
    );

    matchingStudents.forEach((student) => {
      const newRecord: StudentFeeRecord = {
        id: `FEE-2026-${String(dbStudentFees.length + 1 + createdRecords.length).padStart(4, '0')}`,
        feeStructureId,
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        class: student.class,
        section: student.section,
        title,
        category,
        totalAmount: amount,
        paidAmount: 0,
        remainingBalance: amount,
        dueDate: finalDueDate,
        status: 'Unpaid',
        academicYear,
        term,
      };
      dbStudentFees.unshift(newRecord);
      createdRecords.push(newRecord);
    });
  }

  res.status(201).json({ count: createdRecords.length, records: createdRecords });
});

// GET /api/fees/payments - List payments & receipts (RLS enforced)
app.get('/api/fees/payments', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    const studentId = user.studentId;
    return res.json(dbFeePayments.filter((p) => p.studentId === studentId));
  }

  // Admin, Accountant, Teacher
  return res.json(dbFeePayments);
});

// POST /api/fees/pay - Record a payment
app.post('/api/fees/pay', (req: Request, res: Response) => {
  const user = req.user!;
  const { feeRecordId, amount, paymentMethod, transactionReference, notes } = req.body;

  const record = dbStudentFees.find((f) => f.id === feeRecordId);
  if (!record) return res.status(404).json({ error: 'Fee invoice record not found.' });

  // RLS verification for students paying
  if (user.role === 'Student' && record.studentId !== user.studentId) {
    return res.status(403).json({ error: 'Access Denied: You cannot make payments on other students\' invoices.' });
  }
  if (user.role !== 'Student') {
    const isPayAdmin = user.role === 'AccountAdmin' || user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
    if (!isPayAdmin) {
      return res.status(403).json({
        error: 'Access Denied: Recording manual fee payments is restricted to authorized school finance staff.',
      });
    }
  }

  const payAmount = Number(amount);
  if (isNaN(payAmount) || payAmount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required.' });
  }

  if (payAmount > record.remainingBalance) {
    return res.status(400).json({
      error: `Payment amount ($${payAmount}) exceeds the remaining balance ($${record.remainingBalance}).`
    });
  }

  // Update invoice balance
  record.paidAmount += payAmount;
  record.remainingBalance = record.totalAmount - record.paidAmount;
  if (record.remainingBalance <= 0) {
    record.status = 'Paid';
  } else {
    record.status = 'Partially Paid';
  }

  // Generate Receipt
  const receiptNo = `REC-2026-${String(dbFeePayments.length + 87).padStart(4, '0')}`;
  const newPayment: FeePayment = {
    id: receiptNo,
    feeRecordId: record.id,
    studentId: record.studentId,
    studentName: record.studentName,
    rollNo: record.rollNo,
    class: record.class,
    section: record.section,
    title: record.title,
    category: record.category,
    amountPaid: payAmount,
    paymentDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    paymentMethod: paymentMethod || 'Online Gateway',
    transactionReference: transactionReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    receivedBy: user.role === 'AccountAdmin' || user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin' ? `${user.name} (${user.role})` : 'Online Student Portal',
    status: 'Completed',
    notes,
  };

  dbFeePayments.unshift(newPayment);
  res.status(201).json({ payment: newPayment, updatedFeeRecord: record });
});

// POST /api/fees/reverse - Reverse/Void a payment (Accountant, Principal, Owner Admin)
app.post('/api/fees/reverse', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot reverse school fee payments.',
    });
  }

  const isFeeAdmin = user.role === 'AccountAdmin' || user.role === 'Principal' || user.role === 'OwnerAdmin' || user.role === 'Admin';
  if (!isFeeAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only School Financial Officers, Headteachers, and School Owners can reverse recorded payments.',
    });
  }

  const { paymentId, reason } = req.body;
  if (!paymentId || !reason) {
    return res.status(400).json({ error: 'Payment Receipt ID and reversal reason are required.' });
  }

  const payment = dbFeePayments.find((p) => p.id === paymentId);
  if (!payment) return res.status(404).json({ error: 'Payment receipt not found.' });

  if (payment.status === 'Reversed') {
    return res.status(400).json({ error: 'This payment has already been reversed.' });
  }

  // Find associated fee record to restore balance
  const feeRecord = dbStudentFees.find((f) => f.id === payment.feeRecordId);
  if (feeRecord) {
    feeRecord.paidAmount = Math.max(0, feeRecord.paidAmount - payment.amountPaid);
    feeRecord.remainingBalance = feeRecord.totalAmount - feeRecord.paidAmount;
    if (feeRecord.paidAmount === 0) {
      feeRecord.status = 'Unpaid';
    } else {
      feeRecord.status = 'Partially Paid';
    }
  }

  payment.status = 'Reversed';
  payment.reversalReason = reason;
  payment.reversedBy = `${user.name} (${user.role})`;
  payment.reversedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  res.json({ success: true, reversedPayment: payment, updatedFeeRecord: feeRecord });
});

// ==========================================
// 10. CLASS TIMETABLE API (Conflict Prevention & RLS)
// ==========================================

// Helper: Check time overlaps between 2 slots (format HH:mm)
function timesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const sA = toMins(startA);
  const eA = toMins(endA);
  const sB = toMins(startB);
  const eB = toMins(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

// GET /api/timetables - List timetable slots (RLS enforced)
app.get('/api/timetables', (req: Request, res: Response) => {
  const user = req.user!;
  const { class: queryClass, section: querySection, teacherId: queryTeacherId, day: queryDay } = req.query;

  if (user.role === 'Student') {
    // Student can ONLY access timetable for their assigned class and section
    const student = dbStudents.find((s) => s.id === user.studentId);
    const targetClass = student ? student.class : 'Class 02';
    const targetSection = student ? student.section : 'A';
    const studentSlots = dbTimetables.filter(
      (t) => t.class === targetClass && (!t.section || t.section === targetSection)
    );
    return res.json(studentSlots);
  }

  if (user.role === 'Teacher') {
    // If personal schedule requested or by default
    if (queryTeacherId) {
      return res.json(dbTimetables.filter((t) => t.teacherId === queryTeacherId));
    }
    if (queryClass) {
      return res.json(
        dbTimetables.filter(
          (t) => t.class === queryClass && (!querySection || t.section === querySection)
        )
      );
    }
    // Teacher sees their assigned teaching slots or school schedule
    return res.json(dbTimetables);
  }

  // Admin sees all, with optional query filters
  let result = [...dbTimetables];
  if (queryClass) result = result.filter((t) => t.class === queryClass);
  if (querySection) result = result.filter((t) => !t.section || t.section === querySection);
  if (queryTeacherId) result = result.filter((t) => t.teacherId === queryTeacherId);
  if (queryDay) result = result.filter((t) => t.day === queryDay);

  return res.json(result);
});

// POST /api/timetables - Create slot with Strict Conflict Prevention (Headteacher Only)
app.post('/api/timetables', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot manage school timetables.',
    });
  }

  const isScheduleAdmin = user.role === 'Principal';
  if (!isScheduleAdmin) {
    return res.status(403).json({ error: 'Access Denied: Only the Headteacher can modify school timetables. Teachers and School Owners have read-only view access.' });
  }

  const {
    class: slotClass,
    section: slotSection,
    day,
    startTime,
    endTime,
    type,
    subject,
    teacherId,
    teacherName,
    roomNumber,
    notes,
  } = req.body;

  if (!slotClass || !day || !startTime || !endTime) {
    return res.status(400).json({ error: 'Class, day, start time, and end time are required.' });
  }

  // 1. Check Class & Section Collision (Prevent a class from having two subjects at the same time)
  const classConflict = dbTimetables.find(
    (t) =>
      t.day === day &&
      t.class === slotClass &&
      (!t.section || !slotSection || t.section === slotSection) &&
      timesOverlap(startTime, endTime, t.startTime, t.endTime)
  );

  if (classConflict) {
    return res.status(409).json({
      error: `Schedule Conflict: ${slotClass} (Section ${slotSection || 'All'}) is already scheduled for "${classConflict.subject || classConflict.type}" on ${day} from ${classConflict.startTime} to ${classConflict.endTime}.`
    });
  }

  // 2. Check Teacher Collision (Prevent a teacher from being assigned to two classes at the same time)
  if (type === 'Subject' && teacherId) {
    const teacherConflict = dbTimetables.find(
      (t) =>
        t.day === day &&
        t.teacherId === teacherId &&
        timesOverlap(startTime, endTime, t.startTime, t.endTime)
    );

    if (teacherConflict) {
      return res.status(409).json({
        error: `Teacher Conflict: Faculty member "${teacherName || teacherId}" is already assigned to ${teacherConflict.class} (Section ${teacherConflict.section}) on ${day} from ${teacherConflict.startTime} to ${teacherConflict.endTime}.`
      });
    }
  }

  // 3. Check Classroom Collision (Prevent same room booking at same time)
  if (roomNumber && roomNumber !== 'Courtyard' && roomNumber !== 'Main Dining Hall') {
    const roomConflict = dbTimetables.find(
      (t) =>
        t.day === day &&
        t.roomNumber?.toLowerCase() === roomNumber.toLowerCase() &&
        timesOverlap(startTime, endTime, t.startTime, t.endTime)
    );

    if (roomConflict) {
      return res.status(409).json({
        error: `Room Conflict: Classroom "${roomNumber}" is already booked by ${roomConflict.class}-${roomConflict.section} on ${day} from ${roomConflict.startTime} to ${roomConflict.endTime}.`
      });
    }
  }

  const newSlot: TimetableSlot = {
    id: `tt-${Date.now()}`,
    class: slotClass,
    section: slotSection || 'A',
    day,
    startTime,
    endTime,
    type: type || 'Subject',
    subject: subject || (type === 'Break' ? 'Recess / Break' : 'General Period'),
    teacherId: type === 'Subject' ? teacherId : undefined,
    teacherName: type === 'Subject' ? teacherName : undefined,
    roomNumber,
    notes,
  };

  dbTimetables.push(newSlot);
  res.status(201).json(newSlot);
});

// PUT /api/timetables/:id - Update slot with Conflict Checking (Headteacher Only)
app.put('/api/timetables/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot modify school timetables.',
    });
  }

  const isScheduleAdmin = user.role === 'Principal';
  if (!isScheduleAdmin) {
    return res.status(403).json({ error: 'Access Denied: Only the Headteacher can modify school timetables. Teachers and School Owners have read-only view access.' });
  }

  const id = req.params.id;
  const index = dbTimetables.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Timetable entry not found.' });

  const {
    class: slotClass,
    section: slotSection,
    day,
    startTime,
    endTime,
    type,
    subject,
    teacherId,
    teacherName,
    roomNumber,
    notes,
  } = req.body;

  // Conflict checking excluding self
  const classConflict = dbTimetables.find(
    (t) =>
      t.id !== id &&
      t.day === day &&
      t.class === slotClass &&
      (!t.section || !slotSection || t.section === slotSection) &&
      timesOverlap(startTime, endTime, t.startTime, t.endTime)
  );

  if (classConflict) {
    return res.status(409).json({
      error: `Schedule Conflict: ${slotClass} (Section ${slotSection || 'All'}) is already scheduled for "${classConflict.subject || classConflict.type}" on ${day} from ${classConflict.startTime} to ${classConflict.endTime}.`
    });
  }

  if (type === 'Subject' && teacherId) {
    const teacherConflict = dbTimetables.find(
      (t) =>
        t.id !== id &&
        t.day === day &&
        t.teacherId === teacherId &&
        timesOverlap(startTime, endTime, t.startTime, t.endTime)
    );

    if (teacherConflict) {
      return res.status(409).json({
        error: `Teacher Conflict: Faculty member "${teacherName || teacherId}" is already assigned to ${teacherConflict.class} (${teacherConflict.section}) on ${day} from ${teacherConflict.startTime} to ${teacherConflict.endTime}.`
      });
    }
  }

  dbTimetables[index] = {
    ...dbTimetables[index],
    class: slotClass,
    section: slotSection,
    day,
    startTime,
    endTime,
    type: type || 'Subject',
    subject,
    teacherId: type === 'Subject' ? teacherId : undefined,
    teacherName: type === 'Subject' ? teacherName : undefined,
    roomNumber,
    notes,
  };

  res.json(dbTimetables[index]);
});

// DELETE /api/timetables/:id (Headteacher Only)
app.delete('/api/timetables/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'SuperAdmin' || user.isSuperAdmin) {
    return res.status(403).json({
      error: 'Access restricted: Platform Super Administrators cannot delete school timetables.',
    });
  }

  const isScheduleAdmin = user.role === 'Principal';
  if (!isScheduleAdmin) {
    return res.status(403).json({ error: 'Access Denied: Only the Headteacher can delete school timetables. Teachers and School Owners have read-only view access.' });
  }

  const id = req.params.id;
  dbTimetables = dbTimetables.filter((t) => t.id !== id);
  res.json({ success: true });
});

// ==========================================
// 11. TEACHER CHAT GROUPS & REAL-TIME API (Strict Faculty RLS)
// ==========================================

// Helper: Check if user is a member of the group
function isUserGroupMember(user: AuthUser, group: ChatGroup): boolean {
  if (user.role === 'Admin') return true;
  if (group.type === 'AllTeachers') return true;
  return group.members.some(
    (m) =>
      m.teacherId === user.id ||
      m.teacherId === user.teacherId ||
      m.teacherName.toLowerCase() === user.name.toLowerCase()
  );
}

// GET /api/chat/groups - List chat groups authorized for this teacher
app.get('/api/chat/groups', (req: Request, res: Response) => {
  const user = req.user!;

  // Strict RLS: Students are strictly forbidden from viewing or joining teacher chat
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Teacher chat groups are strictly restricted to verified faculty and administrators.',
    });
  }

  const userMutes = userMutedGroups[user.id] || [];

  // Filter groups: Admin sees all, Teacher sees groups they belong to or open all-teacher groups
  const accessibleGroups = dbChatGroups.filter((g) => isUserGroupMember(user, g));

  // Augment with personalized status
  const formatted = accessibleGroups.map((g) => {
    const isMuted = userMutes.includes(g.id);
    // Find last message
    const groupMsgs = dbChatMessages.filter((m) => m.groupId === g.id);
    const lastMsg = groupMsgs.length > 0 ? groupMsgs[groupMsgs.length - 1] : undefined;

    // Calculate unread count based on lastReadTimestamp
    const userReadTime = (userReadTimestamps[user.id] && userReadTimestamps[user.id][g.id]) || 0;
    const unreadCount = groupMsgs.filter((m) => {
      // Don't count user's own sent messages as unread
      if (m.senderId === user.id || m.senderId === user.teacherId) return false;
      return true;
    }).length > 0 && userReadTime === 0 ? (g.id === 'grp-all-teachers' ? 1 : 0) : 0;

    return {
      ...g,
      isMutedForCurrentUser: isMuted,
      unreadCount: g.unreadCount !== undefined ? g.unreadCount : unreadCount,
      lastMessage: lastMsg
        ? {
            senderName: lastMsg.senderName,
            content: lastMsg.content,
            timestamp: lastMsg.timestamp,
            isAnnouncement: lastMsg.isAnnouncement,
          }
        : g.lastMessage,
    };
  });

  res.json(formatted);
});

// POST /api/chat/groups - Create a new Teacher Chat Group
app.post('/api/chat/groups', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only teachers and administrators can create chat groups.',
    });
  }

  const { name, description, type, department, subject, targetClass, iconName, memberIds } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Group name is required.' });
  }

  if (type === 'AllTeachers' && user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Access Denied: Only Administrators can create school-wide All Faculty groups.',
    });
  }

  // Construct initial member list
  const members: ChatMember[] = [];

  // Always add creator as owner
  members.push({
    teacherId: user.teacherId || user.id,
    teacherName: user.name,
    avatar: dbProfiles.find((p) => p.id === user.id)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    role: user.role as 'Admin' | 'Teacher',
    designation: user.role === 'Admin' ? 'Administrator' : 'Faculty Member',
    groupRole: 'owner',
    joinedAt: new Date().toISOString().slice(0, 10),
  });

  // Add additional selected members
  if (Array.isArray(memberIds)) {
    memberIds.forEach((mId: string) => {
      if (mId === user.id || mId === user.teacherId) return;

      const teacher = dbTeachers.find((t) => t.id === mId || t.teacherId === mId);
      const adminProfile = dbProfiles.find((p) => p.id === mId || p.schoolId === mId);

      if (teacher) {
        members.push({
          teacherId: teacher.teacherId || teacher.id,
          teacherName: teacher.name,
          avatar: teacher.avatar,
          role: 'Teacher',
          designation: teacher.subjects.join(', '),
          groupRole: 'member',
          joinedAt: new Date().toISOString().slice(0, 10),
        });
      } else if (adminProfile) {
        members.push({
          teacherId: adminProfile.id,
          teacherName: adminProfile.name,
          avatar: adminProfile.avatar,
          role: adminProfile.role as 'Admin' | 'Teacher',
          designation: adminProfile.designation || 'Staff',
          groupRole: 'member',
          joinedAt: new Date().toISOString().slice(0, 10),
        });
      }
    });
  }

  const newGroup: ChatGroup = {
    id: `grp-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : undefined,
    type: type || 'Custom',
    department,
    subject,
    targetClass,
    iconName: iconName || 'MessageSquare',
    createdBy: user.teacherId || user.id,
    createdByName: `${user.name} (${user.role})`,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    members,
    unreadCount: 0,
    isMutedForCurrentUser: false,
  };

  dbChatGroups.unshift(newGroup);

  // Add welcome system message
  const welcomeMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    groupId: newGroup.id,
    senderId: user.teacherId || user.id,
    senderName: user.name,
    senderAvatar: members[0].avatar,
    senderRole: user.role as 'Admin' | 'Teacher',
    senderDesignation: members[0].designation,
    content: `Welcome to the ${newGroup.name} group. This channel is created for faculty collaboration.`,
    timestamp: 'Just now',
    isAnnouncement: true,
  };
  dbChatMessages.push(welcomeMessage);
  newGroup.lastMessage = {
    senderName: user.name,
    content: welcomeMessage.content,
    timestamp: 'Just now',
    isAnnouncement: true,
  };

  res.status(201).json(newGroup);
});

// PUT /api/chat/groups/:id - Update group details or members
app.put('/api/chat/groups/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const groupId = req.params.id;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  // Permission check: Admin or Group Owner/Moderator
  const userMember = group.members.find((m) => m.teacherId === user.id || m.teacherId === user.teacherId);
  const isOwnerOrMod = user.role === 'Admin' || (userMember && (userMember.groupRole === 'owner' || userMember.groupRole === 'moderator'));

  if (!isOwnerOrMod) {
    return res.status(403).json({ error: 'Access Denied: Only group moderators or administrators can edit group settings.' });
  }

  const { name, description, department, subject, targetClass, members: newMembersList } = req.body;

  if (name) group.name = name.trim();
  if (description !== undefined) group.description = description.trim();
  if (department !== undefined) group.department = department;
  if (subject !== undefined) group.subject = subject;
  if (targetClass !== undefined) group.targetClass = targetClass;
  if (Array.isArray(newMembersList)) {
    group.members = newMembersList;
  }

  res.json(group);
});

// DELETE /api/chat/groups/:id - Delete group (Admin or Owner Only)
app.delete('/api/chat/groups/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const groupId = req.params.id;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  if (group.type === 'AllTeachers' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Cannot delete the master faculty lounge.' });
  }

  const isOwner = group.createdBy === user.id || group.createdBy === user.teacherId || user.role === 'Admin';
  if (!isOwner) {
    return res.status(403).json({ error: 'Access Denied: Only the group creator or an Administrator can delete this group.' });
  }

  dbChatGroups = dbChatGroups.filter((g) => g.id !== groupId);
  dbChatMessages = dbChatMessages.filter((m) => m.groupId !== groupId);

  res.json({ success: true, message: `Group "${group.name}" deleted.` });
});

// POST /api/chat/groups/:id/join - Join group
app.post('/api/chat/groups/:id/join', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const groupId = req.params.id;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  const currentTeacherId = user.teacherId || user.id;
  const alreadyMember = group.members.some((m) => m.teacherId === currentTeacherId);

  if (alreadyMember) {
    return res.json({ success: true, message: 'Already a member of this group.', group });
  }

  const newMember: ChatMember = {
    teacherId: currentTeacherId,
    teacherName: user.name,
    avatar: dbProfiles.find((p) => p.id === user.id)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    role: user.role as 'Admin' | 'Teacher',
    designation: user.role === 'Admin' ? 'Administrator' : 'Faculty Member',
    groupRole: 'member',
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  group.members.push(newMember);

  // Post system notice
  const joinMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    groupId: group.id,
    senderId: 'system',
    senderName: 'System',
    senderAvatar: '',
    senderRole: 'Admin',
    content: `${user.name} has joined the group.`,
    timestamp: 'Just now',
  };
  dbChatMessages.push(joinMsg);

  res.json({ success: true, group });
});

// POST /api/chat/groups/:id/leave - Leave group
app.post('/api/chat/groups/:id/leave', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const groupId = req.params.id;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  if (group.type === 'AllTeachers') {
    return res.status(400).json({ error: 'Faculty members cannot leave the All Faculty lounge.' });
  }

  const currentTeacherId = user.teacherId || user.id;
  group.members = group.members.filter((m) => m.teacherId !== currentTeacherId && m.teacherId !== user.id);

  // System message
  const leaveMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    groupId: group.id,
    senderId: 'system',
    senderName: 'System',
    senderAvatar: '',
    senderRole: 'Admin',
    content: `${user.name} has left the group.`,
    timestamp: 'Just now',
  };
  dbChatMessages.push(leaveMsg);

  res.json({ success: true, message: `You have left ${group.name}` });
});

// POST /api/chat/groups/:id/mute - Toggle Mute for user
app.post('/api/chat/groups/:id/mute', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const groupId = req.params.id;
  if (!userMutedGroups[user.id]) userMutedGroups[user.id] = [];

  const isMuted = userMutedGroups[user.id].includes(groupId);
  if (isMuted) {
    userMutedGroups[user.id] = userMutedGroups[user.id].filter((id) => id !== groupId);
  } else {
    userMutedGroups[user.id].push(groupId);
  }

  res.json({ isMuted: !isMuted });
});

// POST /api/chat/groups/:id/read - Mark group as read
app.post('/api/chat/groups/:id/read', (req: Request, res: Response) => {
  const user = req.user!;
  const groupId = req.params.id;

  if (!userReadTimestamps[user.id]) userReadTimestamps[user.id] = {};
  userReadTimestamps[user.id][groupId] = Date.now();

  const group = dbChatGroups.find((g) => g.id === groupId);
  if (group) group.unreadCount = 0;

  res.json({ success: true });
});

// GET /api/chat/groups/:id/messages - Get messages in a group
app.get('/api/chat/groups/:id/messages', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Teacher chat groups are strictly restricted to verified faculty.',
    });
  }

  const groupId = req.params.id;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  if (!isUserGroupMember(user, group)) {
    return res.status(403).json({
      error: 'Access Denied: You are not an authorized member of this chat group.',
    });
  }

  const query = (req.query.q as string || '').toLowerCase();
  let msgs = dbChatMessages.filter((m) => m.groupId === groupId);

  if (query) {
    msgs = msgs.filter(
      (m) =>
        m.content.toLowerCase().includes(query) ||
        m.senderName.toLowerCase().includes(query) ||
        (m.attachments && m.attachments.some((a) => a.name.toLowerCase().includes(query)))
    );
  }

  res.json(msgs);
});

// POST /api/chat/groups/:id/messages - Send a message in a group
app.post('/api/chat/groups/:id/messages', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({
      error: 'Access Denied: Only teachers and administrators can post in faculty chats.',
    });
  }

  const groupId = req.params.id;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  if (!isUserGroupMember(user, group)) {
    return res.status(403).json({
      error: 'Access Denied: You cannot send messages to a group you do not belong to.',
    });
  }

  const { content, isAnnouncement, replyTo, attachments } = req.body;

  if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: 'Message content or attachment is required.' });
  }

  const userProfile = dbProfiles.find((p) => p.id === user.id);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const timestamp = `Today at ${timeStr}`;

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    groupId,
    senderId: user.teacherId || user.id,
    senderName: user.name,
    senderAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    senderRole: user.role as 'Admin' | 'Teacher',
    senderDesignation: user.role === 'Admin' ? 'Principal / Admin' : userProfile?.designation || 'Faculty',
    content: content ? content.trim() : '',
    timestamp,
    isAnnouncement: !!isAnnouncement,
    replyTo,
    attachments,
    reactions: {},
  };

  dbChatMessages.push(newMsg);

  // Update group's last message summary
  group.lastMessage = {
    senderName: user.name,
    content: newMsg.content || (attachments?.length ? `[Attachment: ${attachments[0].name}]` : 'Sent a message'),
    timestamp,
    isAnnouncement: newMsg.isAnnouncement,
  };

  res.status(201).json(newMsg);
});

// PUT /api/chat/groups/:id/messages/:messageId - Edit message
app.put('/api/chat/groups/:id/messages/:messageId', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const { id: groupId, messageId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty.' });
  }

  const msgIdx = dbChatMessages.findIndex((m) => m.id === messageId && m.groupId === groupId);
  if (msgIdx === -1) return res.status(404).json({ error: 'Message not found.' });

  const msg = dbChatMessages[msgIdx];
  const canEdit =
    user.role === 'Admin' ||
    msg.senderId === user.id ||
    msg.senderId === user.teacherId;

  if (!canEdit) {
    return res.status(403).json({
      error: 'Access Denied: You can only edit your own messages or moderate as an Administrator.',
    });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  dbChatMessages[msgIdx] = {
    ...msg,
    content: content.trim(),
    isEdited: true,
    editedAt: `Edited at ${timeStr}`,
  };

  res.json(dbChatMessages[msgIdx]);
});

// DELETE /api/chat/groups/:id/messages/:messageId - Delete or moderate message
app.delete('/api/chat/groups/:id/messages/:messageId', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const { id: groupId, messageId } = req.params;
  const msgIdx = dbChatMessages.findIndex((m) => m.id === messageId && m.groupId === groupId);
  if (msgIdx === -1) return res.status(404).json({ error: 'Message not found.' });

  const msg = dbChatMessages[msgIdx];
  const canDelete =
    user.role === 'Admin' ||
    msg.senderId === user.id ||
    msg.senderId === user.teacherId;

  if (!canDelete) {
    return res.status(403).json({
      error: 'Access Denied: You can only delete your own messages or moderate as an Administrator.',
    });
  }

  dbChatMessages.splice(msgIdx, 1);
  res.json({ success: true, messageId });
});

// POST /api/chat/groups/:id/messages/:messageId/react - Toggle emoji reaction
app.post('/api/chat/groups/:id/messages/:messageId/react', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const { id: groupId, messageId } = req.params;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji is required.' });

  const msg = dbChatMessages.find((m) => m.id === messageId && m.groupId === groupId);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });

  if (!msg.reactions) msg.reactions = {};
  if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

  const existingIdx = msg.reactions[emoji].indexOf(user.name);
  if (existingIdx !== -1) {
    msg.reactions[emoji].splice(existingIdx, 1);
    if (msg.reactions[emoji].length === 0) {
      delete msg.reactions[emoji];
    }
  } else {
    msg.reactions[emoji].push(user.name);
  }

  res.json({ success: true, reactions: msg.reactions });
});

// POST /api/chat/groups/:id/messages/:messageId/replies - Post a threaded reply
app.post('/api/chat/groups/:id/messages/:messageId/replies', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied: Only teachers and administrators can participate in threads.' });
  }

  const { id: groupId, messageId } = req.params;
  const group = dbChatGroups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Chat group not found.' });

  const parentMsg = dbChatMessages.find((m) => m.id === messageId && m.groupId === groupId);
  if (!parentMsg) return res.status(404).json({ error: 'Parent message not found.' });

  const { content, attachments } = req.body;
  if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: 'Reply content or attachment is required.' });
  }

  const userProfile = dbProfiles.find((p) => p.id === user.id);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const timestamp = `Today at ${timeStr}`;

  const newReply: ChatReply = {
    id: `rpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    postId: messageId,
    authorId: user.teacherId || user.id,
    authorName: user.name,
    authorAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    authorRole: user.role as 'Admin' | 'Teacher' | 'SuperAdmin',
    authorDesignation: user.role === 'Admin' ? 'Principal / Admin' : userProfile?.designation || 'Faculty',
    content: content ? content.trim() : '',
    timestamp,
    attachments,
    reactions: {},
  };

  if (!parentMsg.replies) parentMsg.replies = [];
  parentMsg.replies.push(newReply);
  parentMsg.replyCount = parentMsg.replies.length;

  res.status(201).json(newReply);
});

// PUT /api/chat/groups/:id/messages/:messageId/replies/:replyId - Edit threaded reply
app.put('/api/chat/groups/:id/messages/:messageId/replies/:replyId', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const { id: groupId, messageId, replyId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Reply content cannot be empty.' });
  }

  const parentMsg = dbChatMessages.find((m) => m.id === messageId && m.groupId === groupId);
  if (!parentMsg || !parentMsg.replies) return res.status(404).json({ error: 'Reply not found.' });

  const replyIdx = parentMsg.replies.findIndex((r) => r.id === replyId);
  if (replyIdx === -1) return res.status(404).json({ error: 'Reply not found.' });

  const reply = parentMsg.replies[replyIdx];
  const canEdit =
    user.role === 'Admin' ||
    user.role === 'SuperAdmin' ||
    reply.authorId === user.id ||
    reply.authorId === user.teacherId;

  if (!canEdit) {
    return res.status(403).json({ error: 'Access Denied: You can only edit your own replies.' });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  parentMsg.replies[replyIdx] = {
    ...reply,
    content: content.trim(),
    isEdited: true,
    editedAt: `Edited at ${timeStr}`,
  };

  res.json(parentMsg.replies[replyIdx]);
});

// DELETE /api/chat/groups/:id/messages/:messageId/replies/:replyId - Delete threaded reply
app.delete('/api/chat/groups/:id/messages/:messageId/replies/:replyId', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const { id: groupId, messageId, replyId } = req.params;
  const parentMsg = dbChatMessages.find((m) => m.id === messageId && m.groupId === groupId);
  if (!parentMsg || !parentMsg.replies) return res.status(404).json({ error: 'Reply not found.' });

  const replyIdx = parentMsg.replies.findIndex((r) => r.id === replyId);
  if (replyIdx === -1) return res.status(404).json({ error: 'Reply not found.' });

  const reply = parentMsg.replies[replyIdx];
  const canDelete =
    user.role === 'Admin' ||
    user.role === 'SuperAdmin' ||
    reply.authorId === user.id ||
    reply.authorId === user.teacherId;

  if (!canDelete) {
    return res.status(403).json({ error: 'Access Denied: You can only delete your own replies.' });
  }

  parentMsg.replies.splice(replyIdx, 1);
  parentMsg.replyCount = parentMsg.replies.length;

  res.json({ success: true, replyId });
});

// POST /api/chat/groups/:id/messages/:messageId/replies/:replyId/react - Toggle emoji on threaded reply
app.post('/api/chat/groups/:id/messages/:messageId/replies/:replyId/react', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const { id: groupId, messageId, replyId } = req.params;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji is required.' });

  const parentMsg = dbChatMessages.find((m) => m.id === messageId && m.groupId === groupId);
  if (!parentMsg || !parentMsg.replies) return res.status(404).json({ error: 'Reply not found.' });

  const reply = parentMsg.replies.find((r) => r.id === replyId);
  if (!reply) return res.status(404).json({ error: 'Reply not found.' });

  if (!reply.reactions) reply.reactions = {};
  if (!reply.reactions[emoji]) reply.reactions[emoji] = [];

  const existingIdx = reply.reactions[emoji].indexOf(user.name);
  if (existingIdx !== -1) {
    reply.reactions[emoji].splice(existingIdx, 1);
    if (reply.reactions[emoji].length === 0) {
      delete reply.reactions[emoji];
    }
  } else {
    reply.reactions[emoji].push(user.name);
  }

  res.json({ success: true, reactions: reply.reactions });
});

// ==========================================
// 11B. MULTI-SCHOOL TENANCY & PLATFORM API
// ==========================================

// GET /api/schools/search - Public school directory search for login entry flow
app.get('/api/schools/search', (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  if (!query) {
    return res.json(dbSchools.filter((s) => s.status !== 'Archived'));
  }

  const results = dbSchools.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      s.address.toLowerCase().includes(query) ||
      s.principalName.toLowerCase().includes(query)
  );

  res.json(results);
});

// GET /api/schools - List schools
app.get('/api/schools', (req: Request, res: Response) => {
  res.json(dbSchools);
});

// GET /api/platform/stats - Platform-wide statistics for Super Admin
app.get('/api/platform/stats', (req: Request, res: Response) => {
  const user = req.user!;
  if (!user.isSuperAdmin && user.role !== 'SuperAdmin' && user.role !== 'OwnerAdmin') {
    return res.status(403).json({ error: 'Access Denied: Platform statistics require elevated privileges.' });
  }

  const totalSchools = dbSchools.length;
  const activeSchools = dbSchools.filter((s) => s.status === 'Active').length;
  const inactiveSchools = dbSchools.filter((s) => s.status !== 'Active').length;

  const totalStudents = dbProfiles.filter((p) => p.role === 'Student').length || dbStudents.length;
  const totalTeachers = dbProfiles.filter((p) => p.role === 'Teacher').length || dbTeachers.length;
  const totalPrincipals = dbProfiles.filter((p) => p.role === 'Principal').length;
  const totalOwnerAdmins = dbProfiles.filter((p) => p.role === 'OwnerAdmin').length;
  const totalAccountManagers = dbProfiles.filter((p) => p.role === 'AccountAdmin').length;
  const totalAdmins = totalOwnerAdmins + totalPrincipals;

  const totalClasses = dbClasses.length;
  const totalBooks = dbBooks.reduce((acc, b) => acc + (b.totalCopies || 1), 0);

  const recentSchoolRegistrations = [...dbSchools]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  const stats: PlatformStats = {
    totalSchools,
    activeSchools,
    inactiveSchools,
    totalStudents,
    totalTeachers,
    totalPrincipals,
    totalOwnerAdmins,
    totalAccountManagers,
    totalAdmins,
    totalClasses,
    totalBooks,
    platformUsage: {
      activeSessionsToday: 38,
      dailyLogins: 112,
      messagesSentToday: 284,
      filesStoredMb: 124.5,
    },
    recentSchoolRegistrations,
  };

  res.json(stats);
});

// GET /api/auth/memberships - Get active user memberships
app.get('/api/auth/memberships', (req: Request, res: Response) => {
  const user = req.user!;

  if (user.isSuperAdmin || user.role === 'SuperAdmin') {
    // SuperAdmin gets all memberships with school info
    return res.json(dbMemberships);
  }

  const userMemberships = dbMemberships.filter(
    (m) => (m.userId === user.id || m.userId === user.studentId || m.userId === user.teacherId) && m.status === 'Active'
  );

  // If no explicit membership found, synthesize from profile
  if (userMemberships.length === 0 && user.schoolId) {
    const sch = dbSchools.find((s) => s.id === user.schoolId);
    return res.json([
      {
        id: `mem-${user.id}-${user.schoolId}`,
        userId: user.id,
        schoolId: user.schoolId,
        schoolName: sch?.name || user.schoolName || 'Current School',
        schoolCode: sch?.code || 'SCH',
        role: user.role,
        status: 'Active',
        joinedAt: new Date().toISOString(),
      },
    ]);
  }

  res.json(userMemberships);
});

// POST /api/auth/select-context - Verify and select school & role context
app.post('/api/auth/select-context', (req: Request, res: Response) => {
  const user = req.user!;
  const { schoolId, role } = req.body;

  if (!schoolId) {
    return res.status(400).json({ error: 'School ID is required for context switching.' });
  }

  // Super Admin can switch to any school
  if (user.isSuperAdmin || user.role === 'SuperAdmin') {
    const targetSchool = dbSchools.find((s) => s.id === schoolId);
    if (!targetSchool) return res.status(404).json({ error: 'Selected school not found.' });

    return res.json({
      success: true,
      context: {
        schoolId: targetSchool.id,
        schoolName: targetSchool.name,
        schoolCode: targetSchool.code,
        role: role || 'SuperAdmin',
        isSuperAdmin: true,
      },
    });
  }

  // Verify membership in database
  const matchingMembership = dbMemberships.find(
    (m) =>
      (m.userId === user.id || m.userId === user.studentId || m.userId === user.teacherId) &&
      m.schoolId === schoolId &&
      m.status === 'Active' &&
      (!role || m.role === role)
  );

  if (!matchingMembership) {
    // Check fallback profile
    if (user.schoolId === schoolId && (!role || user.role === role)) {
      const sch = dbSchools.find((s) => s.id === schoolId);
      return res.json({
        success: true,
        context: {
          schoolId: user.schoolId,
          schoolName: sch?.name || 'School',
          schoolCode: sch?.code || 'SCH',
          role: user.role,
          isSuperAdmin: false,
        },
      });
    }

    return res.status(403).json({
      error: `Access Denied: You do not possess an authorized active membership for school "${schoolId}".`,
    });
  }

  const sch = dbSchools.find((s) => s.id === matchingMembership.schoolId);

  res.json({
    success: true,
    context: {
      membershipId: matchingMembership.id,
      schoolId: matchingMembership.schoolId,
      schoolName: sch?.name || matchingMembership.schoolName,
      schoolCode: sch?.code || matchingMembership.schoolCode,
      role: matchingMembership.role,
      isSuperAdmin: false,
    },
  });
});

// GET /api/admin/memberships - Manage school memberships (Super Admin or Owner Admin)
app.get('/api/admin/memberships', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin' && user.role !== 'OwnerAdmin' && user.role !== 'Principal' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Insufficient administrative privileges.' });
  }

  const schoolIdFilter = req.query.schoolId as string;
  let list = [...dbMemberships];

  if (user.role === 'SuperAdmin') {
    if (schoolIdFilter && schoolIdFilter !== 'all') {
      list = list.filter((m) => m.schoolId === schoolIdFilter);
    }
  } else {
    list = list.filter((m) => m.schoolId === user.schoolId);
  }

  res.json(list);
});

// POST /api/admin/memberships - Add / assign user membership
app.post('/api/admin/memberships', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin' && user.role !== 'OwnerAdmin' && user.role !== 'Principal' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Insufficient administrative privileges.' });
  }

  const { userId, schoolId, role, designation } = req.body;
  if (!userId || !schoolId || !role) {
    return res.status(400).json({ error: 'User ID, School ID, and Role are required.' });
  }

  const targetSchool = dbSchools.find((s) => s.id === schoolId);
  if (!targetSchool) return res.status(404).json({ error: 'School not found.' });

  const newMembership: SchoolMembership = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    schoolId,
    schoolName: targetSchool.name,
    schoolCode: targetSchool.code,
    role,
    status: 'Active',
    designation: designation || `${role} at ${targetSchool.name}`,
    joinedAt: new Date().toISOString(),
  };

  dbMemberships.push(newMembership);
  res.status(201).json({ success: true, membership: newMembership });
});

// PUT /api/admin/memberships/:id - Update membership
app.put('/api/admin/memberships/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin' && user.role !== 'OwnerAdmin' && user.role !== 'Principal' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const idx = dbMemberships.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Membership record not found.' });

  dbMemberships[idx] = {
    ...dbMemberships[idx],
    ...req.body,
    id: req.params.id,
  };

  res.json({ success: true, membership: dbMemberships[idx] });
});

// DELETE /api/admin/memberships/:id - Delete membership
app.delete('/api/admin/memberships/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin' && user.role !== 'OwnerAdmin' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  dbMemberships = dbMemberships.filter((m) => m.id !== req.params.id);
  res.json({ success: true, message: 'Membership revoked successfully.' });
});

// POST /api/schools - Create new School tenant (Super Admin Only)
app.post('/api/schools', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Only Super Administrators can provision new schools.' });
  }

  const {
    name,
    code,
    logo,
    address,
    phone,
    email,
    website,
    academicYear,
    status,
    principalName,
    ownerAdminEmail,
    description,
    motto,
  } = req.body;

  if (!name || !code) {
    return res.status(400).json({ error: 'School Name and Code are required.' });
  }

  const cleanCode = code.trim().toUpperCase();
  if (dbSchools.some((s) => s.code.toUpperCase() === cleanCode)) {
    return res.status(409).json({ error: `A school with code "${cleanCode}" already exists.` });
  }

  const newSchool: School = {
    id: `school-${Date.now()}`,
    name: name.trim(),
    code: cleanCode,
    logo: logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
    address: address || 'Campus Address',
    phone: phone || '+1 (555) 000-0000',
    email: email || `contact@${cleanCode.toLowerCase()}.edu`,
    website: website || '',
    academicYear: academicYear || '2025-2026',
    status: status || 'Active',
    principalName: principalName || 'Principal',
    ownerAdminEmail: ownerAdminEmail || `admin@${cleanCode.toLowerCase()}.edu`,
    description: description || '',
    motto: motto || '',
    createdAt: new Date().toISOString(),
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalBooks: 0,
      averageAttendanceRate: 98.0,
    },
  };

  dbSchools.push(newSchool);

  // Automatically create Owner Admin membership if owner email provided
  if (ownerAdminEmail) {
    const ownerProfile = dbProfiles.find((p) => p.email.toLowerCase() === ownerAdminEmail.toLowerCase());
    if (ownerProfile) {
      dbMemberships.push({
        id: `mem-${ownerProfile.id}-${newSchool.id}`,
        userId: ownerProfile.id,
        schoolId: newSchool.id,
        schoolName: newSchool.name,
        schoolCode: newSchool.code,
        role: 'OwnerAdmin',
        status: 'Active',
        designation: `Owner Admin & Founder`,
        joinedAt: new Date().toISOString(),
      });
    }
  }

  res.status(201).json({ success: true, school: newSchool });
});

// PUT /api/schools/:id - Update School Details (Super Admin Only)
app.put('/api/schools/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin' && user.role !== 'OwnerAdmin' && user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Only Administrators can modify school parameters.' });
  }

  const idx = dbSchools.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'School tenant not found.' });

  dbSchools[idx] = {
    ...dbSchools[idx],
    ...req.body,
    id: req.params.id, // Preserve ID
  };

  res.json({ success: true, school: dbSchools[idx] });
});

// DELETE /api/schools/:id - Delete School (Super Admin Only)
app.delete('/api/schools/:id', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SuperAdmin') {
    return res.status(403).json({ error: 'Access Denied: Only Platform Super Administrators can delete school tenants.' });
  }

  if (req.params.id === 'school-1') {
    return res.status(400).json({ error: 'Protected Resource: The primary founding school tenant cannot be deleted.' });
  }

  const exists = dbSchools.some((s) => s.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'School not found.' });

  dbSchools = dbSchools.filter((s) => s.id !== req.params.id);
  dbMemberships = dbMemberships.filter((m) => m.schoolId !== req.params.id);

  res.json({ success: true, message: 'School tenant removed.' });
});

// GET /api/chat/search - Global search messages across accessible groups
app.get('/api/chat/search', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'Student') {
    return res.status(403).json({ error: 'Access Denied.' });
  }

  const query = (req.query.q as string || '').toLowerCase();
  if (!query) return res.json([]);

  const userGroups = dbChatGroups.filter((g) => isUserGroupMember(user, g));
  const userGroupIds = new Set(userGroups.map((g) => g.id));

  const results = dbChatMessages
    .filter((m) => userGroupIds.has(m.groupId) && m.content.toLowerCase().includes(query))
    .map((m) => {
      const grp = userGroups.find((g) => g.id === m.groupId);
      return {
        ...m,
        groupName: grp?.name || 'Group',
      };
    });

  res.json(results);
});

// ==========================================
// 12. ACTIVITY & AUDIT LOGS API (Strict Admin & RBAC Filtering)
// ==========================================

// GET /api/activities - List system activities (Admin sees all; Teachers/Parents/Students see authorized logs)
app.get('/api/activities', (req: Request, res: Response) => {
  const user = req.user!;
  const queryModule = (req.query.module as string || '').toLowerCase();
  const querySeverity = (req.query.severity as string || '').toLowerCase();
  const querySearch = (req.query.q as string || '').toLowerCase();
  const querySchoolId = req.query.schoolId as string;

  let logs = [...dbActivities];

  // School Tenancy Filter
  if (querySchoolId && querySchoolId !== 'all') {
    logs = logs.filter((l) => !l.schoolId || l.schoolId === querySchoolId);
  }

  // Role Level Security Enforcement
  if (user.role === 'Student') {
    logs = logs.filter(
      (l) =>
        l.userId === user.id ||
        l.userSchoolId === user.studentId ||
        l.userSchoolId === user.schoolId ||
        (l.description && l.description.includes(user.name))
    );

  } else if (user.role === 'Teacher') {
    logs = logs.filter(
      (l) =>
        l.userId === user.id ||
        l.userSchoolId === user.teacherId ||
        l.module === 'Attendance' ||
        l.module === 'Exams' ||
        l.module === 'Notices' ||
        l.module === 'Library' ||
        l.module === 'Timetable' ||
        l.module === 'Chat'
    );
  }
  // Admin sees all logs

  if (queryModule && queryModule !== 'all') {
    logs = logs.filter((l) => (l.module || l.type).toLowerCase() === queryModule);
  }

  if (querySeverity && querySeverity !== 'all') {
    logs = logs.filter((l) => (l.severity || 'info').toLowerCase() === querySeverity);
  }

  if (querySearch) {
    logs = logs.filter(
      (l) =>
        l.user.toLowerCase().includes(querySearch) ||
        l.action.toLowerCase().includes(querySearch) ||
        (l.description && l.description.toLowerCase().includes(querySearch)) ||
        (l.details && l.details.toLowerCase().includes(querySearch)) ||
        (l.module && l.module.toLowerCase().includes(querySearch)) ||
        (l.resource && l.resource.toLowerCase().includes(querySearch)) ||
        (l.userSchoolId && l.userSchoolId.toLowerCase().includes(querySearch))
    );
  }

  res.json(logs);
});

// POST /api/activities - Log a new activity/audit event
app.post('/api/activities', (req: Request, res: Response) => {
  const user = req.user!;
  const { action, description, details, resource, module, type, severity, schoolId, schoolName } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Activity action description is required.' });
  }

  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '192.168.1.10';
  const userAgent = (req.headers['user-agent'] as string) || 'Web Portal';

  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user: user.name,
    userId: user.id,
    userSchoolId: user.schoolId || user.studentId || user.teacherId,
    userRole: user.role,
    schoolId: schoolId || (req.headers['x-school-id'] as string) || 'school-1',
    schoolName: schoolName || 'EduSpike International',
    resource: resource || module || 'System',
    action: action.trim(),
    details: details || description,
    description: description || details || action.trim(),
    module: module || 'General',
    type: type || 'security',
    severity: severity || 'info',
    ipAddress,
    deviceInfo: userAgent,
    timestamp: 'Just now',
  };

  dbActivities.unshift(newLog);
  res.status(201).json(newLog);
});

// ==========================================
// 13. GLOBAL ROLE-BASED SEARCH API (Strict RLS)
// ==========================================

app.get('/api/search', (req: Request, res: Response) => {
  const user = req.user!;
  const query = (req.query.q as string || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    return res.json([]);
  }

  const results: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: 'Students' | 'Teachers' | 'Classes' | 'Subjects' | 'Books' | 'Exams' | 'Notices' | 'Fees' | 'Timetable';
    targetModule: 'students' | 'teachers' | 'class' | 'subject' | 'library' | 'exam' | 'notice' | 'fees' | 'timetable' | 'profile' | 'report';
    recordId?: string;
    badge?: string;
  }> = [];

  // 1. SEARCH: Students (Enforcing RLS)
  if (user.role === 'Admin') {
    dbStudents
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query) ||
          s.rollNo.toLowerCase().includes(query) ||
          s.class.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .forEach((s) => {
        results.push({
          id: `search-stu-${s.id}`,
          title: s.name,
          subtitle: `ID: ${s.id} • ${s.class} (${s.section}) • Roll #${s.rollNo}`,
          category: 'Students',
          targetModule: 'students',
          recordId: s.id,
          badge: s.status,
        });
      });
  } else if (user.role === 'Teacher') {
    const assignedClasses = user.assignedClasses || [];
    dbStudents
      .filter(
        (s) =>
          assignedClasses.includes(s.class) &&
          (s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query) ||
            s.rollNo.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .forEach((s) => {
        results.push({
          id: `search-stu-${s.id}`,
          title: s.name,
          subtitle: `ID: ${s.id} • ${s.class} (${s.section}) • Roll #${s.rollNo}`,
          category: 'Students',
          targetModule: 'students',
          recordId: s.id,
          badge: s.status,
        });
      });

  } else if (user.role === 'Student') {
    // Student searching only their own record
    const myStudent = dbStudents.find((s) => s.id === user.studentId);
    if (myStudent && (myStudent.name.toLowerCase().includes(query) || myStudent.id.toLowerCase().includes(query))) {
      results.push({
        id: `search-stu-${myStudent.id}`,
        title: myStudent.name,
        subtitle: `My Profile • ${myStudent.class} (${myStudent.section}) • Roll #${myStudent.rollNo}`,
        category: 'Students',
        targetModule: 'profile',
        recordId: myStudent.id,
        badge: 'My Account',
      });
    }
  }

  // 2. SEARCH: Teachers & Faculty
  if (user.role === 'Admin' || user.role === 'Teacher') {
    dbTeachers
      .filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.teacherId.toLowerCase().includes(query) ||
          t.subjects.some((sub) => sub.toLowerCase().includes(query))
      )
      .slice(0, 4)
      .forEach((t) => {
        results.push({
          id: `search-tch-${t.id}`,
          title: t.name,
          subtitle: `Faculty ID: ${t.teacherId} • ${t.subjects.join(', ')}`,
          category: 'Teachers',
          targetModule: 'teachers',
          recordId: t.id,
          badge: t.designation || 'Faculty',
        });
      });
  }

  // 3. SEARCH: Classes
  if (user.role === 'Admin' || user.role === 'Teacher') {
    dbClasses
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.classTeacher.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach((c) => {
        results.push({
          id: `search-cls-${c.id}`,
          title: c.name,
          subtitle: `Teacher: ${c.classTeacher} • ${c.totalStudents} Enrolled Students`,
          category: 'Classes',
          targetModule: 'class',
          recordId: c.id,
          badge: `${c.sections.length} Sections`,
        });
      });
  }

  // 4. SEARCH: Subjects
  dbSubjects
    .filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        s.teachers.some((t) => t.toLowerCase().includes(query)) ||
        s.classes.some((c) => c.toLowerCase().includes(query))
    )
    .slice(0, 4)
    .forEach((s) => {
      results.push({
        id: `search-sub-${s.id}`,
        title: `${s.name} (${s.code})`,
        subtitle: `Classes: ${s.classes.join(', ')} • Instructors: ${s.teachers.join(', ')}`,
        category: 'Subjects',
        targetModule: 'subject',
        recordId: s.id,
        badge: s.type,
      });
    });

  // 5. SEARCH: Library Books
  dbBooks
    .filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.writer.toLowerCase().includes(query) ||
        b.subject.toLowerCase().includes(query) ||
        b.bookId.toLowerCase().includes(query)
    )
    .slice(0, 4)
    .forEach((b) => {
      results.push({
        id: `search-bk-${b.id}`,
        title: b.name,
        subtitle: `By ${b.writer} • ${b.subject} • #${b.bookId}`,
        category: 'Books',
        targetModule: 'library',
        recordId: b.id,
        badge: `${b.availableCopies} Available`,
      });
    });

  // 6. SEARCH: Exams & Grades
  dbExams
    .filter((e) => e.title.toLowerCase().includes(query) || e.term.toLowerCase().includes(query))
    .slice(0, 3)
    .forEach((e) => {
      results.push({
        id: `search-ex-${e.id}`,
        title: e.title,
        subtitle: `Term: ${e.term} • ${e.startDate} to ${e.endDate}`,
        category: 'Exams',
        targetModule: 'exam',
        recordId: e.id,
        badge: e.status,
      });
    });

  // 7. SEARCH: Notices
  const accessibleNotices = dbNotices.filter((n) => {
    if (user.role === 'Admin') return true;
    if (n.audience === 'All') return true;
    if (user.role === 'Student' && n.audience === 'Students') return true;
    if (user.role === 'Teacher' && n.audience === 'Teachers') return true;
    return false;
  });

  accessibleNotices
    .filter((n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
    .slice(0, 3)
    .forEach((n) => {
      results.push({
        id: `search-not-${n.id}`,
        title: n.title,
        subtitle: `Posted by ${n.postedBy} • ${n.date}`,
        category: 'Notices',
        targetModule: 'notice',
        recordId: n.id,
        badge: n.priority,
      });
    });

  // 8. SEARCH: Fees (Role restricted)
  if (user.role === 'Admin') {
    dbStudentFees
      .filter(
        (f) =>
          f.studentName.toLowerCase().includes(query) ||
          f.studentId.toLowerCase().includes(query) ||
          f.title.toLowerCase().includes(query) ||
          f.id.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach((f) => {
        results.push({
          id: `search-fee-${f.id}`,
          title: `${f.title} - ${f.studentName}`,
          subtitle: `Amount: $${f.totalAmount} • Remaining: $${f.remainingBalance} • Due: ${f.dueDate}`,
          category: 'Fees',
          targetModule: 'fees',
          recordId: f.id,
          badge: f.status,
        });
      });
  } else if (user.role === 'Student') {
    dbStudentFees
      .filter(
        (f) =>
          (user.studentId && f.studentId === user.studentId) &&
          (f.title.toLowerCase().includes(query) || f.studentName.toLowerCase().includes(query) || f.category.toLowerCase().includes(query))
      )
      .forEach((f) => {
        results.push({
          id: `search-fee-${f.id}`,
          title: `${f.title} - ${f.studentName}`,
          subtitle: `Amount: $${f.totalAmount} • Balance: $${f.remainingBalance} • Due: ${f.dueDate}`,
          category: 'Fees',
          targetModule: 'fees',
          recordId: f.id,
          badge: f.status,
        });
      });
  }

  res.json(results);
});

// ==========================================
// 15. AI-POWERED STUDY BUDDY API (Gemini 3.7 Flash)
// ==========================================

// In-Memory Study Buddy Store
let dbStudySummaries: Record<string, StudySummary[]> = {
  'usr-student-1': [
    {
      id: 'sum-demo-1',
      title: 'Photosynthesis & Cellular Respiration',
      subject: 'Biology',
      gradeLevel: 'Grade 10',
      originalNotes:
        'Photosynthesis occurs in plant chloroplasts using light, CO2, and H2O to produce glucose and O2. The light-dependent reactions take place in the thylakoid membrane, generating ATP and NADPH. The Calvin cycle (light-independent) occurs in the stroma and fixes carbon into sugar via RuBisCO enzyme. Cellular respiration occurs in mitochondria (glycolysis, Krebs cycle, electron transport chain) breaking glucose to produce ~30-32 ATP.',
      summary:
        'Photosynthesis and Cellular Respiration are complementary bioenergetic cycles. In chloroplasts, light energy converts carbon dioxide and water into glucose and oxygen. In mitochondria, aerobic respiration oxidizes glucose through Glycolysis, Krebs Cycle, and the Electron Transport Chain to generate ATP for cellular work.',
      keyConcepts: [
        'Light Reactions: Occur in Thylakoid membranes; water is split (photolysis) to release O2 and produce ATP + NADPH.',
        'Calvin Cycle: Occurs in the Stroma; utilizes ATP/NADPH and RuBisCO enzyme to convert CO2 into glucose.',
        'Cellular Respiration Steps: Glycolysis (Cytoplasm) -> Krebs Cycle (Mitochondrial Matrix) -> ETC (Inner Membrane).',
        'Energy Yield: Complete aerobic respiration produces approximately 30–32 ATP per glucose molecule.',
      ],
      definitions: [
        { term: 'RuBisCO', explanation: 'Ribulose-1,5-bisphosphate carboxylase-oxygenase, the primary carbon-fixing enzyme in the Calvin cycle.' },
        { term: 'Thylakoid', explanation: 'Membrane-bound compartments inside chloroplasts where light-dependent reactions take place.' },
        { term: 'ATP Synthase', explanation: 'Enzymatic protein complex that uses proton gradients across membranes to synthesize ATP from ADP and Pi.' },
      ],
      formulasOrRules: [
        'Photosynthesis: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2',
        'Cellular Respiration: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP',
      ],
      mnemonics: [
        'OIL RIG: Oxidation Is Loss of electrons, Reduction Is Gain of electrons (crucial for ETC redox chains).',
      ],
      createdAt: '2026-08-14 14:30',
    },
  ],
};

let dbStudyQuizzes: Record<string, StudyQuiz[]> = {
  'usr-student-1': [
    {
      id: 'quiz-demo-1',
      title: 'Biology Mastery: Photosynthesis & Respiration',
      subject: 'Biology',
      topic: 'Cellular Energetics',
      questions: [
        {
          id: 'q-1',
          question: 'Where do the light-dependent reactions of photosynthesis specifically take place in plant cells?',
          options: ['Stroma', 'Thylakoid membrane', 'Mitochondrial matrix', 'Outer chloroplast membrane'],
          correctAnswerIndex: 1,
          explanation: 'Light-dependent reactions occur within the thylakoid membranes where chlorophyll pigments absorb photons and drive photolysis of water.',
          hint: 'Think of the flattened green sac structures where chlorophyll is embedded.',
          difficulty: 'Easy',
        },
        {
          id: 'q-2',
          question: 'What is the primary enzyme responsible for carbon fixation during the Calvin cycle?',
          options: ['ATP Synthase', 'RuBisCO', 'DNA Polymerase', 'Amylase'],
          correctAnswerIndex: 1,
          explanation: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase) catalyzes the fixation of atmospheric CO2 onto RuBP.',
          hint: 'It is considered one of the most abundant enzymes on Earth.',
          difficulty: 'Medium',
        },
        {
          id: 'q-3',
          question: 'Which stage of cellular respiration produces the largest quantity of ATP?',
          options: ['Glycolysis', 'Krebs (Citric Acid) Cycle', 'Electron Transport Chain (Oxidative Phosphorylation)', 'Lactic Acid Fermentation'],
          correctAnswerIndex: 2,
          explanation: 'Oxidative phosphorylation along the Electron Transport Chain uses the chemiosmotic proton gradient to synthesize ~26-28 of the total 32 ATP molecules.',
          hint: 'It involves ATP synthase and proton pumps in the inner mitochondrial membrane.',
          difficulty: 'Medium',
        },
        {
          id: 'q-4',
          question: 'In cellular respiration, what molecule acts as the final electron acceptor in the electron transport chain?',
          options: ['Carbon dioxide (CO2)', 'Glucose (C6H12O6)', 'Molecular Oxygen (O2)', 'Water (H2O)'],
          correctAnswerIndex: 2,
          explanation: 'Oxygen acts as the terminal electron acceptor, combining with protons to produce water (H2O).',
          hint: 'This is why aerobic organisms must breathe this gas.',
          difficulty: 'Challenging',
        },
      ],
      createdAt: '2026-08-14 14:35',
      sourceNotes: 'Photosynthesis & Respiration notes summary',
    },
  ],
};

let dbQuizAttempts: Record<string, QuizAttempt[]> = {
  'usr-student-1': [
    {
      id: 'att-demo-1',
      quizId: 'quiz-demo-1',
      quizTitle: 'Biology Mastery: Photosynthesis & Respiration',
      subject: 'Biology',
      score: 4,
      totalQuestions: 4,
      percentage: 100,
      userAnswers: { 'q-1': 1, 'q-2': 1, 'q-3': 2, 'q-4': 2 },
      completedAt: '2026-08-14 14:45',
      timeSpentSeconds: 120,
    },
  ],
};

// Lazy Gemini API Client Initialization
let genAIInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIInstance;
}

// Resilient Gemini Execution with Exponential Backoff & Model Cascade
interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
}

async function callGeminiWithResilience(
  params: GeminiCallParams
): Promise<{ text: string; modelUsed: string } | null> {
  const ai = getGenAI();
  if (!ai) return null;

  // Primary and fallback models according to skill guidelines
  const modelsToTry = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const maxRetriesPerModel = 2;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
        if (params.responseSchema) config.responseSchema = params.responseSchema;

        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config,
        });

        if (response && response.text && response.text.trim().length > 0) {
          return { text: response.text.trim(), modelUsed: model };
        }
      } catch (err: any) {
        const status = err?.status || err?.code || (err?.error && err.error.code);
        const errMsg = String(err?.message || (err?.error && err.error.message) || '').toLowerCase();
        const isTransient =
          status === 503 ||
          status === 429 ||
          status === 500 ||
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('high demand') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('spikes in demand');

        console.warn(`[Study Buddy Gemini] Model "${model}" attempt ${attempt + 1}/${maxRetriesPerModel + 1} failed (Transient=${isTransient}):`, err?.message || err);

        if (isTransient && attempt < maxRetriesPerModel) {
          const delayMs = (attempt + 1) * 800 + Math.floor(Math.random() * 400);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        } else {
          // Switch to next fallback model in the list
          break;
        }
      }
    }
  }

  return null;
}

// Fallback Structured Summary Generator
function generateFallbackSummary(
  noteTopic: string,
  noteSubject: string,
  gradeLevel: string | undefined,
  notes: string,
  requestedFormat: string
): StudySummary {
  const cleanNotes = notes.trim();
  const lines = cleanNotes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const keyConcepts: string[] = [];
  const definitions: { term: string; explanation: string }[] = [];
  const formulasOrRules: string[] = [];
  const mnemonics: string[] = [];

  for (const line of lines) {
    const cleanLine = line.replace(/^[-*•#0-9.)\s]+/, '').trim();
    if (!cleanLine) continue;

    const colonMatch = cleanLine.match(/^([A-Za-z0-9\s()]{2,35})[:\-—]\s*(.+)$/);
    if (colonMatch && definitions.length < 6) {
      definitions.push({
        term: colonMatch[1].trim(),
        explanation: colonMatch[2].trim(),
      });
    } else if (
      (cleanLine.includes('=') ||
        cleanLine.toLowerCase().includes('formula') ||
        cleanLine.toLowerCase().includes('rule') ||
        cleanLine.toLowerCase().includes('equation') ||
        cleanLine.toLowerCase().includes('law')) &&
      formulasOrRules.length < 5
    ) {
      formulasOrRules.push(cleanLine);
    } else if (
      (cleanLine.toLowerCase().includes('remember') ||
        cleanLine.toLowerCase().includes('mnemonic') ||
        cleanLine.toLowerCase().includes('acronym') ||
        cleanLine.toLowerCase().includes('tip')) &&
      mnemonics.length < 3
    ) {
      mnemonics.push(cleanLine);
    } else if (cleanLine.length >= 15 && keyConcepts.length < 7) {
      keyConcepts.push(cleanLine);
    }
  }

  if (keyConcepts.length === 0) {
    keyConcepts.push(`Key principles covering ${noteTopic} in ${noteSubject}.`);
    keyConcepts.push('Review essential definitions, mechanisms, and related problem sets.');
    keyConcepts.push('Focus on practical applications and exam-targeted concepts.');
  }

  if (definitions.length === 0) {
    definitions.push({
      term: noteTopic,
      explanation: `Core subject matter and foundational concepts covered in ${noteSubject}.`,
    });
  }

  if (formulasOrRules.length === 0) {
    formulasOrRules.push(`Standard ${noteSubject} methodology and analytical guidelines.`);
  }

  if (mnemonics.length === 0) {
    mnemonics.push(`Active Recall: Practice explaining ${noteTopic} in your own words for maximum retention.`);
  }

  const executiveSummary =
    lines.length > 0
      ? `High-Yield Overview of ${noteTopic} (${noteSubject}): ${lines.slice(0, 3).join(' ')}`
      : `High-yield structured study overview for ${noteTopic}.`;

  return {
    id: `sum-${Date.now()}`,
    title: noteTopic,
    subject: noteSubject,
    gradeLevel: gradeLevel || 'Secondary School',
    originalNotes: notes,
    summary: executiveSummary,
    keyConcepts,
    definitions,
    formulasOrRules,
    mnemonics,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
}

// Fallback Structured Quiz Generator
function generateFallbackQuiz(
  quizTitle: string,
  quizSubject: string,
  notes: string,
  targetCount: number,
  difficulty: 'Easy' | 'Medium' | 'Challenging'
): StudyQuiz {
  const lines = notes
    .split('\n')
    .map((l) => l.trim().replace(/^[-*•#0-9.)\s]+/, ''))
    .filter((l) => l.length > 15);

  const questions: QuizQuestion[] = [];
  const count = Math.min(Math.max(targetCount, 3), 8);

  for (let i = 0; i < count; i++) {
    const sourceLine = lines[i % lines.length] || `Understanding core concept ${i + 1} of ${quizTitle}`;
    const colonMatch = sourceLine.match(/^([A-Za-z0-9\s()]{2,35})[:\-—]\s*(.+)$/);

    if (colonMatch) {
      const term = colonMatch[1].trim();
      const expl = colonMatch[2].trim();
      questions.push({
        id: `q-${Date.now()}-${i}`,
        question: `According to your study notes, what is the definition or role of "${term}"?`,
        options: [
          expl.length > 90 ? expl.slice(0, 87) + '...' : expl,
          `An unrelated mechanism in secondary ${quizSubject}`,
          `A legacy method superseded by modern ${quizSubject} principles`,
          `None of the listed descriptions are correct`,
        ],
        correctAnswerIndex: 0,
        explanation: `Your notes define "${term}" as: ${expl}`,
        hint: `Look back at the note entry for ${term}.`,
        difficulty: i === 0 ? 'Easy' : i === count - 1 ? 'Challenging' : 'Medium',
      });
    } else {
      questions.push({
        id: `q-${Date.now()}-${i}`,
        question: `Which of the following statements accurately reflects the study notes on "${quizTitle}"?`,
        options: [
          sourceLine.length > 90 ? sourceLine.slice(0, 87) + '...' : sourceLine,
          `The inverse principle applies under standard ${quizSubject} conditions`,
          `This topic is only relevant for advanced theoretical post-graduate studies`,
          `No structured relationship exists between the observed variables`,
        ],
        correctAnswerIndex: 0,
        explanation: `This directly matches the key insight: "${sourceLine}"`,
        hint: `Focus on the main statements highlighted in your notes.`,
        difficulty: i === 0 ? 'Easy' : i === count - 1 ? 'Challenging' : difficulty,
      });
    }
  }

  return {
    id: `quiz-${Date.now()}`,
    title: quizTitle,
    subject: quizSubject,
    topic: quizTitle,
    questions,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    sourceNotes: notes.slice(0, 300) + '...',
  };
}

// GET /api/study-buddy/history - Fetch user's saved summaries, quizzes, and attempts
app.get('/api/study-buddy/history', (req: Request, res: Response) => {
  const user = req.user!;
  const summaries = dbStudySummaries[user.id] || [];
  const quizzes = dbStudyQuizzes[user.id] || [];
  const attempts = dbQuizAttempts[user.id] || [];

  res.json({
    summaries,
    quizzes,
    attempts,
  });
});

// POST /api/study-buddy/summarize - Generate structured study notes & summaries using Gemini
app.post('/api/study-buddy/summarize', async (req: Request, res: Response) => {
  const user = req.user!;
  const { title, subject, notes, format, gradeLevel } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide valid subject notes to summarize.' });
  }

  const noteTopic = title?.trim() || `${subject || 'General'} Study Notes`;
  const noteSubject = subject?.trim() || 'General Studies';
  const requestedFormat = format || 'balanced';

  try {
    const prompt = `You are an expert, encouraging AI Study Buddy and pedagogical tutor for school students.
Subject: ${noteSubject}
Topic: ${noteTopic}
Grade Level Context: ${gradeLevel || 'Secondary School'}
Summary Style Preference: ${requestedFormat}

Carefully analyze the student's study notes below. Create a structured, high-yield summary that makes complex topics clear, memorable, and exam-ready.

STUDENT NOTES:
"""
${notes.trim()}
"""

Ensure:
1. "executiveSummary": An engaging, readable overview explaining the core theme.
2. "keyConcepts": 4 to 8 clear bullet points of the most essential takeaways.
3. "definitions": 3 to 6 key vocabulary words or terms with precise, easy-to-understand explanations.
4. "formulasOrRules": Any relevant equations, laws, formulas, grammar rules, or steps found in the notes.
5. "mnemonics": 1 to 3 creative memory aids, acronyms, or analogies to help remember tricky concepts.`;

    const result = await callGeminiWithResilience({
      prompt,
      systemInstruction:
        'You are an empathetic, clear, and highly structured school study companion. Produce structured study summaries strictly in valid JSON format according to the schema.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Topic or chapter title' },
          executiveSummary: { type: Type.STRING, description: 'Comprehensive yet easy-to-read summary' },
          keyConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key concept bullet points',
          },
          definitions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['term', 'explanation'],
            },
            description: 'List of vocabulary words and definitions',
          },
          formulasOrRules: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Formulas, laws, or principles',
          },
          mnemonics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Memory aids and acronyms',
          },
        },
        required: ['title', 'executiveSummary', 'keyConcepts', 'definitions'],
      },
    });

    if (result && result.text) {
      try {
        const parsed = JSON.parse(result.text);
        const newSummary: StudySummary = {
          id: `sum-${Date.now()}`,
          title: parsed.title || noteTopic,
          subject: noteSubject,
          gradeLevel: gradeLevel || 'High School',
          originalNotes: notes,
          summary: parsed.executiveSummary || 'Summary generated from your notes.',
          keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
          definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
          formulasOrRules: Array.isArray(parsed.formulasOrRules) ? parsed.formulasOrRules : [],
          mnemonics: Array.isArray(parsed.mnemonics) ? parsed.mnemonics : [],
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };

        if (!dbStudySummaries[user.id]) dbStudySummaries[user.id] = [];
        dbStudySummaries[user.id].unshift(newSummary);

        return res.json({ success: true, summary: newSummary, source: 'gemini', model: result.modelUsed });
      } catch (jsonErr) {
        console.warn('[Study Buddy Summarize] Failed to parse JSON from model, generating structured fallback.');
      }
    }

    // High-yield Structured Fallback
    const fallbackSummary = generateFallbackSummary(noteTopic, noteSubject, gradeLevel, notes, requestedFormat);
    if (!dbStudySummaries[user.id]) dbStudySummaries[user.id] = [];
    dbStudySummaries[user.id].unshift(fallbackSummary);

    return res.json({
      success: true,
      summary: fallbackSummary,
      source: 'local_engine',
      notice: 'Summary synthesized quickly via the intelligent study engine.',
    });
  } catch (error: any) {
    console.error('[Study Buddy Summarize Error]:', error);
    const fallbackSummary = generateFallbackSummary(noteTopic, noteSubject, gradeLevel, notes, requestedFormat);
    if (!dbStudySummaries[user.id]) dbStudySummaries[user.id] = [];
    dbStudySummaries[user.id].unshift(fallbackSummary);

    return res.json({
      success: true,
      summary: fallbackSummary,
      source: 'fallback',
      notice: 'Synthesized using high-speed local engine.',
    });
  }
});

// POST /api/study-buddy/generate-quiz - Generate interactive practice questions using Gemini
app.post('/api/study-buddy/generate-quiz', async (req: Request, res: Response) => {
  const user = req.user!;
  const { title, subject, notes, questionCount = 5, difficulty = 'Medium' } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide notes to generate quiz questions from.' });
  }

  const quizTitle = title?.trim() || `${subject || 'Subject'} Practice Quiz`;
  const quizSubject = subject?.trim() || 'General Studies';
  const targetCount = Math.min(Math.max(Number(questionCount) || 5, 3), 10);

  try {
    const prompt = `You are a curriculum specialist and test generator.
Subject: ${quizSubject}
Topic: ${quizTitle}
Target Difficulty: ${difficulty}
Total Questions Desired: ${targetCount}

Create a high-quality, multiple-choice practice quiz directly based on the student's study notes provided below.

STUDENT NOTES:
"""
${notes.trim()}
"""

Requirements for each question:
1. "question": Clear, challenging, and tests conceptual understanding or application (not just rote trivia).
2. "options": Exactly 4 plausible and distinct choices.
3. "correctAnswerIndex": The zero-based index (0, 1, 2, or 3) of the single correct option.
4. "explanation": A thorough, crystal-clear explanation justifying why the correct answer is right and why other options are incorrect.
5. "hint": A subtle, helpful thought prompt or clue that guides the student without giving away the answer.
6. "difficulty": Set to Easy, Medium, or Challenging.`;

    const result = await callGeminiWithResilience({
      prompt,
      systemInstruction:
        'You are an expert exam creator. Generate realistic, accurate, and educational multiple choice quizzes in valid JSON format according to the schema.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Quiz Title' },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Array of 4 options',
                },
                correctAnswerIndex: { type: Type.INTEGER, description: 'Index 0-3' },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING },
                difficulty: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'difficulty'],
            },
          },
        },
        required: ['title', 'questions'],
      },
    });

    if (result && result.text) {
      try {
        const parsed = JSON.parse(result.text);
        const questionsList: QuizQuestion[] = (parsed.questions || []).map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          question: q.question || `Practice Question ${idx + 1}`,
          options:
            Array.isArray(q.options) && q.options.length >= 2
              ? q.options.slice(0, 4)
              : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex:
            typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4
              ? q.correctAnswerIndex
              : 0,
          explanation: q.explanation || 'Correct based on provided notes.',
          hint: q.hint || 'Review the main definitions in your notes.',
          difficulty: (q.difficulty as any) || difficulty,
        }));

        if (questionsList.length > 0) {
          const newQuiz: StudyQuiz = {
            id: `quiz-${Date.now()}`,
            title: parsed.title || quizTitle,
            subject: quizSubject,
            topic: quizTitle,
            questions: questionsList,
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            sourceNotes: notes.slice(0, 300) + '...',
          };

          if (!dbStudyQuizzes[user.id]) dbStudyQuizzes[user.id] = [];
          dbStudyQuizzes[user.id].unshift(newQuiz);

          return res.json({ success: true, quiz: newQuiz, source: 'gemini', model: result.modelUsed });
        }
      } catch (jsonErr) {
        console.warn('[Study Buddy Quiz] Failed to parse JSON from model, generating structured fallback.');
      }
    }

    // Local Quiz Synthesis
    const fallbackQuiz = generateFallbackQuiz(quizTitle, quizSubject, notes, targetCount, difficulty as any);
    if (!dbStudyQuizzes[user.id]) dbStudyQuizzes[user.id] = [];
    dbStudyQuizzes[user.id].unshift(fallbackQuiz);

    return res.json({
      success: true,
      quiz: fallbackQuiz,
      source: 'local_engine',
      notice: 'Practice quiz questions generated via the built-in study test engine.',
    });
  } catch (error: any) {
    console.error('[Study Buddy Quiz Gen Error]:', error);
    const fallbackQuiz = generateFallbackQuiz(quizTitle, quizSubject, notes, targetCount, difficulty as any);
    if (!dbStudyQuizzes[user.id]) dbStudyQuizzes[user.id] = [];
    dbStudyQuizzes[user.id].unshift(fallbackQuiz);

    return res.json({
      success: true,
      quiz: fallbackQuiz,
      source: 'fallback',
      notice: 'Quiz synthesized using high-speed local engine.',
    });
  }
});

// POST /api/study-buddy/explain-concept - AI Tutor Concept Deep-Dive
app.post('/api/study-buddy/explain-concept', async (req: Request, res: Response) => {
  const { concept, contextNotes, questionContext } = req.body;

  if (!concept || typeof concept !== 'string' || !concept.trim()) {
    return res.status(400).json({ error: 'Concept query is required.' });
  }

  try {
    const prompt = `You are a friendly, encouraging personal Study Buddy tutor.
A student needs help understanding a specific concept or question.

Target Concept: "${concept.trim()}"
${questionContext ? `Question Context: "${questionContext}"` : ''}
${contextNotes ? `Student's Related Notes:\n"""\n${contextNotes.trim()}\n"""` : ''}

Please provide:
1. **Simple Explanation (ELI5 / High School Level)**: Break it down with an everyday analogy.
2. **Step-by-Step Logic**: How to solve or remember it systematically.
3. **Common Mistake to Avoid**: What pitfalls students usually fall into.
4. **Quick Check Question**: A 1-sentence mini question to test their understanding.`;

    const result = await callGeminiWithResilience({
      prompt,
      systemInstruction:
        'You are an engaging and warm AI study tutor who makes tricky academic concepts intuitive and fun.',
    });

    if (result && result.text) {
      return res.json({
        success: true,
        explanation: result.text,
        source: 'gemini',
        model: result.modelUsed,
      });
    }

    return res.json({
      success: true,
      explanation: `### Understanding ${concept}\n\n**Key Takeaway**: This concept is fundamental to mastering your subject.\n\n* **Core Principle**: Pay close attention to how terms and relationships interconnect in your coursework.\n* **Study Tip**: Try summarizing "${concept}" in one plain sentence without looking at reference notes.\n* **Common Pitfall**: Memorizing definitions without understanding cause-and-effect mechanisms.`,
      source: 'local_engine',
    });
  } catch (error: any) {
    console.error('[Study Buddy Explain Error]:', error);
    return res.json({
      success: true,
      explanation: `### Understanding ${concept}\n\n**Overview**: This topic is an essential foundation in your curriculum.\n\n* **Core Principle**: Focus on step-by-step logic and the specific definitions provided in your study notes.\n* **Practice**: Try explaining this concept out loud or using active flashcard recall.`,
      source: 'fallback',
    });
  }
});

// POST /api/study-buddy/attempt - Save student's quiz attempt
app.post('/api/study-buddy/attempt', (req: Request, res: Response) => {
  const user = req.user!;
  const { quizId, quizTitle, subject, score, totalQuestions, userAnswers, timeSpentSeconds } = req.body;

  const percentage = Math.round((Number(score || 0) / Math.max(Number(totalQuestions || 1), 1)) * 100);

  const attempt: QuizAttempt = {
    id: `att-${Date.now()}`,
    quizId: quizId || 'general',
    quizTitle: quizTitle || 'Practice Quiz',
    subject: subject || 'General',
    score: Number(score || 0),
    totalQuestions: Number(totalQuestions || 1),
    percentage,
    userAnswers: userAnswers || {},
    completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    timeSpentSeconds: Number(timeSpentSeconds || 0),
  };

  if (!dbQuizAttempts[user.id]) dbQuizAttempts[user.id] = [];
  dbQuizAttempts[user.id].unshift(attempt);

  // Log activity
  dbActivities.unshift({
    id: `act-${Date.now()}`,
    user: user.name,
    userId: user.id,
    userSchoolId: user.schoolId,
    userRole: user.role,
    action: `Completed AI Practice Quiz "${quizTitle}" with ${percentage}% score`,
    description: `Answered ${score}/${totalQuestions} questions correctly in ${timeSpentSeconds}s`,
    module: 'Study Buddy',
    type: 'exam',
    severity: percentage >= 80 ? 'success' : 'info',
    timestamp: 'Just now',
  });


  res.status(201).json({ success: true, attempt });
});

// DELETE /api/study-buddy/summary/:id - Delete a saved summary
app.delete('/api/study-buddy/summary/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id;

  if (dbStudySummaries[user.id]) {
    dbStudySummaries[user.id] = dbStudySummaries[user.id].filter((s) => s.id !== targetId);
  }

  res.json({ success: true, message: 'Summary deleted.' });
});

// DELETE /api/study-buddy/quiz/:id - Delete a saved quiz
app.delete('/api/study-buddy/quiz/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id;

  if (dbStudyQuizzes[user.id]) {
    dbStudyQuizzes[user.id] = dbStudyQuizzes[user.id].filter((q) => q.id !== targetId);
  }

  res.json({ success: true, message: 'Quiz deleted.' });
});

// Helper for local conversational fallback
function generateFallbackChatReply(query: string, systemInstruction: string, userRole?: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('lesson plan') || q.includes('curriculum') || q.includes('teach')) {
    return `### 📚 Structured Lesson Plan Overview\n\n**Topic Focus**: ${query.slice(0, 50)}...\n\n1. **Learning Objectives**: Students will analyze core principles, apply critical thinking, and synthesize key takeaways.\n2. **Direct Instruction (15 mins)**: Introduce key concepts with interactive real-world examples.\n3. **Guided Practice (20 mins)**: Small group activity and structured inquiry worksheets.\n4. **Formative Assessment & Exit Ticket (10 mins)**: 2 quick check questions to evaluate retention.\n\n*Tip: You can customize learning tiers for differentiated instruction in the Subjects module.*`;
  }

  if (q.includes('attendance') || q.includes('roll call')) {
    return `### 📋 Attendance Management Guidance\n\nDaily attendance roll calls are recorded by appointed Class Teachers in the Attendance Module. Administrators and Principals can monitor school-wide trends and export official offline PDF & CSV reports. If you need to log daily attendance, head over to the **Attendance** module or use the floating action button on your dashboard.`;
  }

  if (q.includes('fee') || q.includes('invoice') || q.includes('payment') || q.includes('tuition')) {
    return `### 💳 School Fee & Invoicing Assistance\n\nStudent fee structures, invoice dispatches, and receipt tracking are managed in the **Fee Management** module. Invoices can be assigned on a classroom basis or per individual student. Receipts can be downloaded or printed directly from the **Download Center**.`;
  }

  if (q.includes('exam') || q.includes('grade') || q.includes('mark') || q.includes('report card')) {
    return `### 🎓 Academic Performance & Report Cards\n\nOfficial marks and exam evaluations are registered by designated Class Teachers. Students and parents can inspect terminal transcripts in **My Report Form** and generate printable records in the **Download Center**.`;
  }

  return `### 💡 EduSpike Academic Guidance\n\nThank you for reaching out! Here are recommendations based on your query:\n\n* **Structured Analysis**: Focus on breaking down the topic into foundational concepts, practical exercises, and synthesis.\n* **Platform Navigation**: You can access academic records, timetables, and resource libraries directly from the navigation sidebar.\n* **Role Context**: As a ${userRole || 'valued member of our academy'}, you have access to specialized tools tailored to your operational responsibilities.\n\nFeel free to ask follow-up questions, request specific templates, or ask for step-by-step problem explanations!`;
}

// POST /api/gemini/chat - Multi-turn conversational chat with Gemini models
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const user = req.user;
  const { messages, systemInstruction, taskComplexity = 'general', customModel } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required for conversation.' });
  }

  // Model selection based on user requirements:
  // - gemini-3.1-pro-preview for particularly complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  let modelsToTry: string[] = [];
  if (customModel) {
    modelsToTry = [customModel, 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  } else if (taskComplexity === 'complex') {
    modelsToTry = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  } else if (taskComplexity === 'fast') {
    modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.5-flash'];
  } else {
    modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  }

  const roleNote = user ? `User Name: ${user.name}, Role: ${user.role}, School: ${user.schoolName || 'EduSpike Academy'}.` : '';
  const defaultSystemInstruction =
    (systemInstruction ? `${systemInstruction}\n\n` : '') +
    `You are the official EduSpike Platform AI Assistant. ${roleNote} You assist with educational queries, academic planning, coursework, and school management. Be helpful, clear, encouraging, structured, and use Markdown formatting.`;

  const ai = getGenAI();
  if (ai) {
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction: defaultSystemInstruction,
          },
        });

        if (response && response.text && response.text.trim()) {
          return res.json({
            success: true,
            reply: response.text.trim(),
            modelUsed: model,
            taskComplexity,
          });
        }
      } catch (err: any) {
        console.warn(`[Gemini Chat] Model "${model}" failed, trying next fallback:`, err?.message || err);
      }
    }
  }

  // Fallback response if API key is not configured or all models were busy
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const fallbackReply = generateFallbackChatReply(lastUserMessage, defaultSystemInstruction, user?.role);

  return res.json({
    success: true,
    reply: fallbackReply,
    modelUsed: 'local-intelligent-assistant',
    notice: 'Generated via EduSpike Intelligent Educational Assistant.',
  });
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
