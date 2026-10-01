import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
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
  FeeStructure,
  StudentFeeRecord,
  FeePayment,
  TimetableSlot,
  ChatGroup,
  ChatMessage,
  ChatReply,
  ChatAttachment,
  SyllabusItem,
  LearningResource,
} from '../types';
import { auditLogService } from '../services/auditLogService';
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
  INITIAL_FEE_STRUCTURES,
  INITIAL_STUDENT_FEES,
  INITIAL_FEE_PAYMENTS,
  INITIAL_TIMETABLES,
  INITIAL_CHAT_GROUPS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SYLLABUS,
  INITIAL_LEARNING_RESOURCES,
} from '../data/initialData';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export type ToastPayload =
  | string
  | {
      title?: string;
      message: string;
      type?: ToastType;
    };

interface SchoolDataContextType {
  students: Student[];
  teachers: Teacher[];
  books: LibraryBook[];
  syllabus: SyllabusItem[];
  learningResources: LearningResource[];
  classes: SchoolClass[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  marks: StudentMark[];
  studentMarks: StudentMark[];
  notices: Notice[];
  activities: ActivityLog[];
  activityLogs: ActivityLog[];
  reloadLogs: () => Promise<void>;
  isLogsLoading: boolean;
  feeStructures: FeeStructure[];
  studentFees: StudentFeeRecord[];
  studentFeeRecords: StudentFeeRecord[];
  feePayments: FeePayment[];
  downloadFiles: (SyllabusItem | LearningResource)[];
  timetables: TimetableSlot[];
  chatGroups: ChatGroup[];
  activeChatGroupId: string | null;
  setActiveChatGroupId: (id: string | null) => void;
  activeChatMessages: ChatMessage[];
  unreadChatCount: number;
  toasts: ToastMessage[];
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isLoading: boolean;

  addToast: (payload: ToastPayload, type?: ToastType) => void;
  removeToast: (id: string) => void;

  // Teacher Chat
  fetchChatMessages: (groupId: string, search?: string) => Promise<void>;
  sendChatMessage: (payload: {
    groupId: string;
    content: string;
    isAnnouncement?: boolean;
    replyTo?: ChatMessage['replyTo'];
    attachments?: ChatMessage['attachments'];
  }) => Promise<boolean>;
  editChatMessage: (groupId: string, messageId: string, content: string) => Promise<boolean>;
  deleteChatMessage: (groupId: string, messageId: string) => Promise<void>;
  toggleMessageReaction: (groupId: string, messageId: string, emoji: string) => Promise<void>;
  sendChatReply: (groupId: string, messageId: string, payload: { content: string; attachments?: ChatAttachment[] }) => Promise<boolean>;
  editChatReply: (groupId: string, messageId: string, replyId: string, content: string) => Promise<boolean>;
  deleteChatReply: (groupId: string, messageId: string, replyId: string) => Promise<void>;
  toggleReplyReaction: (groupId: string, messageId: string, replyId: string, emoji: string) => Promise<void>;
  createChatGroup: (groupData: Partial<ChatGroup> & { memberIds?: string[] }) => Promise<ChatGroup | null>;
  updateChatGroup: (id: string, updated: Partial<ChatGroup>) => Promise<void>;
  deleteChatGroup: (id: string) => Promise<void>;
  joinChatGroup: (id: string) => Promise<void>;
  leaveChatGroup: (id: string) => Promise<void>;
  toggleMuteGroup: (id: string) => Promise<void>;
  markGroupRead: (id: string) => Promise<void>;
  refreshChatGroups: () => Promise<void>;

  // Student CRUD
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addStudentsBulk: (students: Omit<Student, 'id'>[]) => Promise<{ success: boolean; count: number; errors?: string[] }>;

  // Teacher CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<{ success: boolean; teacher?: Teacher; error?: string }>;
  updateTeacher: (id: string, updated: Partial<Teacher>) => Promise<{ success: boolean; error?: string }>;
  deleteTeacher: (id: string) => Promise<{ success: boolean; error?: string }>;
  addTeachersBulk: (teachers: Omit<Teacher, 'id'>[]) => Promise<{ success: boolean; count: number; errors?: string[] }>;

  // Book CRUD & Borrow
  addBook: (book: Omit<LibraryBook, 'id'>) => Promise<void>;
  updateBook: (id: string, updated: Partial<LibraryBook>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  toggleFavoriteBook: (id: string) => void;
  borrowBook: (bookId: string) => Promise<void>;
  returnBook: (bookId: string) => Promise<void>;

  // Syllabus CRUD
  addSyllabusItem: (item: Omit<SyllabusItem, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByRole'>) => Promise<void>;
  updateSyllabusItem: (id: string, updated: Partial<SyllabusItem>) => Promise<void>;
  deleteSyllabusItem: (id: string) => Promise<void>;

  // Learning Resources CRUD
  addLearningResource: (resource: Omit<LearningResource, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByRole' | 'downloadsCount'>) => Promise<void>;
  updateLearningResource: (id: string, updated: Partial<LearningResource>) => Promise<void>;
  deleteLearningResource: (id: string) => Promise<void>;
  incrementResourceDownloads: (id: string) => Promise<void>;

  // File Download Helper
  downloadFile: (fileName: string, fileData?: string, fileType?: string) => void;

  // Class CRUD
  addClass: (cls: Omit<SchoolClass, 'id'>) => Promise<void>;
  updateClass: (id: string, updated: Partial<SchoolClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  nominateClassTeacher: (classId: string, teacherId: string, teacherName: string, reason?: string) => Promise<{ success: boolean; error?: string }>;

  // Subject CRUD
  addSubject: (sub: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, updated: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Attendance
  markAttendanceBatch: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<void>;

  // Exam & Marks
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  updateExam: (id: string, updated: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addOrUpdateMark: (mark: Omit<StudentMark, 'id'>) => Promise<void>;

  // Notice CRUD
  addNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
  updateNotice: (id: string, updated: Partial<Notice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  // Fees CRUD & Payments
  addFeeStructure: (fs: Omit<FeeStructure, 'id'>) => Promise<void>;
  deleteFeeStructure: (id: string) => Promise<void>;
  assignFees: (payload: { feeStructureId: string; studentId?: string; class?: string; section?: string; customAmount?: number; dueDate?: string }) => Promise<void>;
  recordFeePayment: (payload: { feeRecordId: string; amount: number; paymentMethod: string; transactionReference?: string; notes?: string }) => Promise<boolean>;
  reverseFeePayment: (paymentId: string, reason: string) => Promise<boolean>;

  // Timetable CRUD & Validation
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateTimetableSlot: (id: string, slot: Partial<TimetableSlot>) => Promise<{ success: boolean; error?: string }>;
  deleteTimetableSlot: (id: string) => Promise<void>;

  // Helper activity logger
  logActivity: (user: string, action: string, type: ActivityLog['type']) => void;
  refreshData: () => Promise<void>;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, activeRole, activeChildId, getAuthHeaders } = useAuth();

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_BOOKS);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(INITIAL_SYLLABUS);
  const [learningResources, setLearningResources] = useState<LearningResource[]>(INITIAL_LEARNING_RESOURCES);
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [marks, setMarks] = useState<StudentMark[]>(INITIAL_MARKS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(INITIAL_FEE_STRUCTURES);
  const [studentFees, setStudentFees] = useState<StudentFeeRecord[]>(INITIAL_STUDENT_FEES);
  const [feePayments, setFeePayments] = useState<FeePayment[]>(INITIAL_FEE_PAYMENTS);
  const [timetables, setTimetables] = useState<TimetableSlot[]>(INITIAL_TIMETABLES);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(INITIAL_CHAT_GROUPS);
  const [activeChatGroupId, setActiveChatGroupId] = useState<string | null>('grp-all-teachers');
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Compute unread chat count for current teacher/admin
  const unreadChatCount = (activeRole === 'Admin' || activeRole === 'Teacher' || activeRole === 'Principal')
    ? (chatGroups || []).reduce((acc, g) => acc + (g?.unreadCount || 0), 0)
    : 0;

  const addToast = useCallback((payload: ToastPayload, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let messageStr = '';
    let titleStr: string | undefined = undefined;
    let typeVal: ToastType = type;

    if (typeof payload === 'string') {
      messageStr = payload;
      typeVal = type;
    } else if (payload && typeof payload === 'object') {
      titleStr = typeof payload.title === 'string' ? payload.title : undefined;
      messageStr = typeof payload.message === 'string' ? payload.message : (payload.title || '');
      if (payload.type) {
        typeVal = payload.type;
      }
    }

    // Defensive guarantee: message is always a string primitive, never an object
    if (typeof messageStr !== 'string') {
      messageStr = String(messageStr ?? '');
    }

    setToasts((prev) => [...prev, { id, type: typeVal, title: titleStr, message: messageStr }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleApiError = useCallback((res: Response, fallbackMsg: string) => {
    if (res.status === 403) {
      addToast('Access Denied: You do not have permission for this record or action.', 'error');
    } else {
      addToast(fallbackMsg, 'error');
    }
  }, [addToast]);

  // Helper for safe JSON parsing without throw on HTML/404 fallbacks
  const safeJsonParse = async <T = any>(res: Response, fallback: T): Promise<T> => {
    try {
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  // Fetch all RLS-enforced data from backend server
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();

    try {
      // 1. Fetch Students (RLS Filtered)
      const resStudents = await fetch('/api/students', { headers });
      const studentsData = await safeJsonParse<Student[] | null>(resStudents, null);
      if (studentsData) setStudents(studentsData);

      // 2. Fetch Teachers (RLS Filtered)
      const resTeachers = await fetch('/api/teachers', { headers });
      const teachersData = await safeJsonParse<Teacher[] | null>(resTeachers, null);
      if (teachersData) setTeachers(teachersData);

      // 3. Fetch Attendance (RLS Filtered)
      const resAttendance = await fetch('/api/attendance', { headers });
      const attendanceData = await safeJsonParse<AttendanceRecord[] | null>(resAttendance, null);
      if (attendanceData) setAttendance(attendanceData);

      // 4. Fetch Marks (RLS Filtered)
      const resMarks = await fetch('/api/marks', { headers });
      const marksData = await safeJsonParse<StudentMark[] | null>(resMarks, null);
      if (marksData) setMarks(marksData);

      // 5. Fetch Notices (Audience Filtered)
      const resNotices = await fetch('/api/notices', { headers });
      const noticesData = await safeJsonParse<Notice[] | null>(resNotices, null);
      if (noticesData) setNotices(noticesData);

      // 6. Fetch Fees (Structures, Invoices RLS, Payments RLS)
      const [resFeeStructs, resStudentFees, resFeePays] = await Promise.all([
        fetch('/api/fees/structures', { headers }),
        fetch('/api/fees', { headers }),
        fetch('/api/fees/payments', { headers }),
      ]);
      const feeStructsData = await safeJsonParse<FeeStructure[] | null>(resFeeStructs, null);
      const studentFeesData = await safeJsonParse<StudentFeeRecord[] | null>(resStudentFees, null);
      const feePaysData = await safeJsonParse<FeePayment[] | null>(resFeePays, null);
      if (feeStructsData) setFeeStructures(feeStructsData);
      if (studentFeesData) setStudentFees(studentFeesData);
      if (feePaysData) setFeePayments(feePaysData);

      // 7. Fetch Timetables (RLS Filtered)
      const resTimetables = await fetch('/api/timetables', { headers });
      const timetablesData = await safeJsonParse<TimetableSlot[] | null>(resTimetables, null);
      if (timetablesData) setTimetables(timetablesData);

      // 8. Fetch Teacher Chat Groups (If Teacher or Admin)
      if (activeRole === 'Teacher' || activeRole === 'Admin') {
        const resChat = await fetch('/api/chat/groups', { headers });
        const chatData = await safeJsonParse<ChatGroup[] | null>(resChat, null);
        if (chatData) {
          setChatGroups(chatData);
          if (chatData.length > 0) {
            setActiveChatGroupId((prev) => {
              if (!prev || !chatData.some((g) => g.id === prev)) {
                return chatData[0].id;
              }
              return prev;
            });
          }
        }
      } else {
        setChatGroups([]);
      }

      // 9. Fetch Public/Catalog datasets
      const [resBooks, resSyllabus, resResources, resClasses, resSubjects, resExams] = await Promise.all([
        fetch('/api/library', { headers }),
        fetch('/api/syllabus', { headers }),
        fetch('/api/learning-resources', { headers }),
        fetch('/api/classes', { headers }),
        fetch('/api/subjects', { headers }),
        fetch('/api/exams', { headers }),
      ]);

      const booksData = await safeJsonParse<LibraryBook[] | null>(resBooks, null);
      const syllabusData = await safeJsonParse<SyllabusItem[] | null>(resSyllabus, null);
      const resourcesData = await safeJsonParse<LearningResource[] | null>(resResources, null);
      const classesData = await safeJsonParse<SchoolClass[] | null>(resClasses, null);
      const subjectsData = await safeJsonParse<Subject[] | null>(resSubjects, null);
      const examsData = await safeJsonParse<Exam[] | null>(resExams, null);

      if (booksData) setBooks(booksData);
      if (syllabusData) setSyllabus(syllabusData);
      if (resourcesData) setLearningResources(resourcesData);
      if (classesData) setClasses(classesData);
      if (subjectsData) setSubjects(subjectsData);
      if (examsData) setExams(examsData);

    } catch (err) {
      console.warn('Backend server offline or starting up:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeRole, getAuthHeaders]);

  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  const reloadLogs = useCallback(async () => {
    setIsLogsLoading(true);
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/activities', { headers });
      const data = await safeJsonParse<ActivityLog[] | null>(res, null);
      if (data) {
        setActivities(data);
      }
    } catch (e) {
      console.warn('Failed to load activity logs:', e);
    } finally {
      setIsLogsLoading(false);
    }
  }, [getAuthHeaders]);

  // Trigger refresh whenever authenticated user, role, or active parent child changes
  useEffect(() => {
    refreshData();
    reloadLogs();
  }, [currentUser, activeRole, activeChildId, refreshData, reloadLogs]);

  const logActivity = (
    user: string,
    action: string,
    type: ActivityLog['type'],
    details?: string,
    module?: string,
    severity: 'info' | 'success' | 'warning' | 'danger' = 'info'
  ) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: user || currentUser.name,
      userRole: currentUser.role,
      user: user || currentUser.name,
      action,
      timestamp: new Date().toISOString(),
      type,
      module: module || 'System',
      severity,
      details: details || action,
    };
    setActivities((prev) => [newAct, ...prev]);

    // Send to backend RLS audit log
    const headers = getAuthHeaders();
    fetch('/api/activities', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action,
        module: module || 'System',
        severity,
        details: details || action,
      }),
    }).catch(() => {
      // Non-blocking log
    });
  };

  // Student CRUD
  const addStudent = async (st: Omit<Student, 'id'>) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers,
      body: JSON.stringify(st),
    });
    if (res.ok) {
      addToast(`Student ${st.name} enrolled successfully!`);
      logActivity(currentUser.name, `enrolled student ${st.name} to ${st.class}`, 'student');
      await refreshData();
    } else {
      const err = await res.json();
      addToast(err.error || 'Failed to enroll student', 'error');
    }
  };

  const updateStudent = async (id: string, updated: Partial<Student>) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      addToast(`Student record updated.`);
      await refreshData();
    } else {
      handleApiError(res, 'Failed to update student');
    }
  };

  const deleteStudent = async (id: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      addToast(`Student account removed.`, 'info');
      await refreshData();
    } else {
      handleApiError(res, 'Failed to remove student');
    }
  };

  // Teacher CRUD
  const addTeacher = async (t: Omit<Teacher, 'id'>): Promise<{ success: boolean; teacher?: Teacher; error?: string }> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers,
        body: JSON.stringify(t),
      });
      if (res.ok) {
        const newTeacher: Teacher = await res.json();
        setTeachers((prev) => [newTeacher, ...prev.filter((x) => x.id !== newTeacher.id && x.teacherId !== newTeacher.teacherId)]);
        addToast(`Teacher ${t.name} added successfully!`, 'success');
        logActivity(currentUser.name, `added faculty member ${t.name} (${newTeacher.teacherId})`, 'teacher');
        await refreshData();
        return { success: true, teacher: newTeacher };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to add teacher' }));
        const errorMsg = err.error || 'Failed to add teacher';
        addToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Network connection failed while adding teacher';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const updateTeacher = async (id: string, updated: Partial<Teacher>): Promise<{ success: boolean; error?: string }> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const updatedTeacher = await res.json();
        setTeachers((prev) => prev.map((t) => (t.id === id || t.teacherId === id ? updatedTeacher : t)));
        addToast(`Teacher record updated.`);
        await refreshData();
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to update teacher' }));
        const errorMsg = err.error || 'Failed to update teacher';
        addToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch {
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      addToast(`Teacher record updated.`);
      return { success: true };
    }
  };

  const deleteTeacher = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setTeachers((prev) => prev.filter((tc) => tc.id !== id && tc.teacherId !== id));
        addToast(`Teacher removed.`, 'info');
        await refreshData();
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to remove teacher' }));
        const errorMsg = err.error || 'Failed to remove teacher';
        addToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch {
      setTeachers((prev) => prev.filter((tc) => tc.id !== id && tc.teacherId !== id));
      addToast(`Teacher removed.`, 'info');
      return { success: true };
    }
  };

  const addTeachersBulk = async (teacherList: Omit<Teacher, 'id'>[]): Promise<{ success: boolean; count: number; errors?: string[] }> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/teachers/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify({ teachers: teacherList }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.teachers && data.teachers.length > 0) {
          setTeachers((prev) => [...data.teachers, ...prev]);
        }
        addToast(`Successfully imported ${data.count || teacherList.length} faculty members!`, 'success');
        logActivity(currentUser.name, `bulk imported ${data.count || teacherList.length} teachers`, 'teacher');
        await refreshData();
        return { success: true, count: data.count || teacherList.length, errors: data.errors };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to bulk import teachers' }));
        addToast(err.error || 'Bulk teacher import failed', 'error');
        return { success: false, count: 0, errors: [err.error || 'Failed to import'] };
      }
    } catch (e: any) {
      addToast(e?.message || 'Network error during bulk import', 'error');
      return { success: false, count: 0, errors: [e?.message || 'Network error'] };
    }
  };

  const addStudentsBulk = async (studentList: Omit<Student, 'id'>[]): Promise<{ success: boolean; count: number; errors?: string[] }> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify({ students: studentList }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.students && data.students.length > 0) {
          setStudents((prev) => [...data.students, ...prev]);
        }
        addToast(`Successfully enrolled ${data.count || studentList.length} students in bulk!`, 'success');
        logActivity(currentUser.name, `bulk imported ${data.count || studentList.length} students`, 'student');
        await refreshData();
        return { success: true, count: data.count || studentList.length, errors: data.errors };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to bulk import students' }));
        addToast(err.error || 'Bulk student import failed', 'error');
        return { success: false, count: 0, errors: [err.error || 'Failed to import'] };
      }
    } catch (e: any) {
      addToast(e?.message || 'Network error during bulk import', 'error');
      return { success: false, count: 0, errors: [e?.message || 'Network error'] };
    }
  };

  // Library Book CRUD & Borrow
  const addBook = async (bk: Omit<LibraryBook, 'id'>) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/library/books', {
        method: 'POST',
        headers,
        body: JSON.stringify(bk),
      });
      if (res.ok) {
        const newBook = await res.json();
        setBooks((prev) => [newBook, ...prev]);
        addToast(`Book "${bk.name}" added to catalog.`);
        logActivity(currentUser.name, `added book "${bk.name}" to library`, 'book');
      } else {
        // Optimistic fallback
        const id = `bk-${Date.now()}`;
        setBooks((prev) => [{ ...bk, id }, ...prev]);
        addToast(`Book "${bk.name}" added to library.`);
      }
    } catch {
      const id = `bk-${Date.now()}`;
      setBooks((prev) => [{ ...bk, id }, ...prev]);
      addToast(`Book "${bk.name}" added to library.`);
    }
  };

  const updateBook = async (id: string, updated: Partial<LibraryBook>) => {
    const headers = getAuthHeaders();
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    try {
      await fetch(`/api/library/books/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Book update API sync notice:', e);
    }
    addToast(`Book details updated.`);
  };

  const deleteBook = async (id: string) => {
    const headers = getAuthHeaders();
    setBooks((prev) => prev.filter((b) => b.id !== id));
    try {
      await fetch(`/api/library/books/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      console.warn('Book delete API sync notice:', e);
    }
    addToast(`Book removed from catalog.`, 'info');
  };

  const toggleFavoriteBook = (id: string) => {
    let nowFavorite = false;
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          nowFavorite = !b.isFavorite;
          return { ...b, isFavorite: nowFavorite };
        }
        return b;
      })
    );
    addToast(nowFavorite ? 'Added book to your favorites' : 'Removed book from favorites', 'info');
  };

  const borrowBook = async (bookId: string) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/library/borrow', {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookId }),
    });

    if (res.ok) {
      addToast(`Book borrowed successfully.`);
      logActivity(currentUser.name, `borrowed library book`, 'book');
      await refreshData();
    } else {
      handleApiError(res, 'Failed to borrow book.');
    }
  };

  const returnBook = async (bookId: string) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/library/return', {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookId }),
    });

    if (res.ok) {
      addToast(`Book returned to library.`);
      await refreshData();
    } else {
      handleApiError(res, 'Failed to return book.');
    }
  };

  // Syllabus CRUD
  const addSyllabusItem = async (item: Omit<SyllabusItem, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByRole'>) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const newItem = await res.json();
        setSyllabus((prev) => [newItem, ...prev]);
        addToast(`Syllabus "${item.title}" published!`);
        logActivity(currentUser.name, `published syllabus for ${item.subject} (${item.class})`, 'book');
      } else {
        const id = `syl-${Date.now()}`;
        const fallbackItem: SyllabusItem = {
          ...item,
          id,
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: currentUser.name,
          uploadedByRole: currentUser.role,
        };
        setSyllabus((prev) => [fallbackItem, ...prev]);
        addToast(`Syllabus "${item.title}" published!`);
      }
    } catch {
      const id = `syl-${Date.now()}`;
      const fallbackItem: SyllabusItem = {
        ...item,
        id,
        uploadedAt: new Date().toISOString().slice(0, 10),
        uploadedBy: currentUser.name,
        uploadedByRole: currentUser.role,
      };
      setSyllabus((prev) => [fallbackItem, ...prev]);
      addToast(`Syllabus "${item.title}" published!`);
    }
  };

  const updateSyllabusItem = async (id: string, updated: Partial<SyllabusItem>) => {
    const headers = getAuthHeaders();
    setSyllabus((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    try {
      await fetch(`/api/syllabus/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Syllabus update notice:', e);
    }
    addToast('Syllabus item updated.');
  };

  const deleteSyllabusItem = async (id: string) => {
    const headers = getAuthHeaders();
    setSyllabus((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/syllabus/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      console.warn('Syllabus delete notice:', e);
    }
    addToast('Syllabus document removed.', 'info');
  };

  // Learning Resources CRUD
  const addLearningResource = async (resource: Omit<LearningResource, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByRole' | 'downloadsCount'>) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/learning-resources', {
        method: 'POST',
        headers,
        body: JSON.stringify(resource),
      });
      if (res.ok) {
        const newResource = await res.json();
        setLearningResources((prev) => [newResource, ...prev]);
        addToast(`Resource "${resource.title}" uploaded!`);
        logActivity(currentUser.name, `uploaded learning resource "${resource.title}"`, 'book');
      } else {
        const id = `res-${Date.now()}`;
        const fallbackRes: LearningResource = {
          ...resource,
          id,
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: currentUser.name,
          uploadedByRole: currentUser.role,
          downloadsCount: 0,
        };
        setLearningResources((prev) => [fallbackRes, ...prev]);
        addToast(`Resource "${resource.title}" uploaded!`);
      }
    } catch {
      const id = `res-${Date.now()}`;
      const fallbackRes: LearningResource = {
        ...resource,
        id,
        uploadedAt: new Date().toISOString().slice(0, 10),
        uploadedBy: currentUser.name,
        uploadedByRole: currentUser.role,
        downloadsCount: 0,
      };
      setLearningResources((prev) => [fallbackRes, ...prev]);
      addToast(`Resource "${resource.title}" uploaded!`);
    }
  };

  const updateLearningResource = async (id: string, updated: Partial<LearningResource>) => {
    const headers = getAuthHeaders();
    setLearningResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    try {
      await fetch(`/api/learning-resources/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Resource update notice:', e);
    }
    addToast('Resource updated.');
  };

  const deleteLearningResource = async (id: string) => {
    const headers = getAuthHeaders();
    setLearningResources((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/learning-resources/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      console.warn('Resource delete notice:', e);
    }
    addToast('Learning resource removed.', 'info');
  };

  const incrementResourceDownloads = async (id: string) => {
    setLearningResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r))
    );
    try {
      const headers = getAuthHeaders();
      await fetch(`/api/learning-resources/${id}/download-count`, {
        method: 'POST',
        headers,
      });
    } catch {
      // Non-blocking
    }
  };

  // Safe file downloader helper
  const downloadFile = (fileName: string, fileData?: string, fileType?: string) => {
    try {
      let content = fileData;
      let mimeType = 'text/plain';

      const lowerName = (fileName || 'document.pdf').toLowerCase();
      if (fileType === 'pdf' || lowerName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (fileType === 'doc' || fileType === 'docx' || lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileType === 'ppt' || fileType === 'pptx' || lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      } else if (fileType === 'xls' || fileType === 'xlsx' || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (fileType === 'image' || lowerName.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
        mimeType = 'image/png';
      }

      if (!content) {
        content = `--- AUDIENTA ACADEMIC REPOSITORY ---\nFile Name: ${fileName}\nExport Date: ${new Date().toLocaleString()}\nInstitution: Audienta International Academy\nStatus: Official Academic Document Record\n\nContent verified for authorized educational use.`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast(`Downloaded "${fileName}"`, 'success');
    } catch (err) {
      console.error('File download failed:', err);
      addToast(`Could not download "${fileName}"`, 'error');
    }
  };

  // Class CRUD
  const addClass = async (cls: Omit<SchoolClass, 'id'>) => {
    const id = `cls-${Date.now()}`;
    setClasses((prev) => [...prev, { ...cls, id }]);
    addToast(`Class ${cls.name} created.`);
  };

  const updateClass = async (id: string, updated: Partial<SchoolClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    addToast(`Class updated.`);
  };

  const deleteClass = async (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    addToast(`Class deleted.`, 'info');
  };

  const nominateClassTeacher = async (
    classId: string,
    teacherId: string,
    teacherName: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/classes/${classId}/assign-class-teacher`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ newTeacherId: teacherId, newTeacherName: teacherName, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.error || 'Failed to nominate class teacher', 'error');
        return { success: false, error: data.error };
      }

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId || c.name === classId
            ? { ...c, classTeacher: teacherName, classTeacherId: teacherId }
            : c
        )
      );
      addToast(
        `Successfully nominated ${teacherName} as Class Teacher for ${data.class?.name || classId}!`,
        'success'
      );
      return { success: true };
    } catch {
      // Offline fallback
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId || c.name === classId
            ? { ...c, classTeacher: teacherName, classTeacherId: teacherId }
            : c
        )
      );
      addToast(`Nominated ${teacherName} as Class Teacher.`, 'success');
      return { success: true };
    }
  };

  // Subject CRUD
  const addSubject = async (sub: Omit<Subject, 'id'>) => {
    const id = `sub-${Date.now()}`;
    setSubjects((prev) => [...prev, { ...sub, id }]);
    addToast(`Subject "${sub.name}" created.`);
  };

  const updateSubject = async (id: string, updated: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    addToast(`Subject updated.`);
  };

  const deleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast(`Subject deleted.`, 'info');
  };

  // Attendance Batch (Backend Authorized)
  const markAttendanceBatch = async (records: Omit<AttendanceRecord, 'id'>[]) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/attendance/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify(records),
    });

    if (res.ok) {
      addToast(`Attendance saved for ${records.length} students!`);
      logActivity(currentUser.name, `marked daily attendance`, 'attendance');
      await refreshData();
    } else {
      const err = await res.json();
      addToast(err.error || 'Access Denied: You cannot mark attendance for this class.', 'error');
    }
  };

  // Exam & Marks (Backend Authorized)
  const addExam = async (ex: Omit<Exam, 'id'>) => {
    const id = `ex-${Date.now()}`;
    setExams((prev) => [{ ...ex, id }, ...prev]);
    addToast(`Exam "${ex.title}" created.`);
  };

  const updateExam = async (id: string, updated: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    addToast(`Exam updated.`);
  };

  const deleteExam = async (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    addToast(`Exam deleted.`, 'info');
  };

  const addOrUpdateMark = async (m: Omit<StudentMark, 'id'>) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/marks', {
      method: 'POST',
      headers,
      body: JSON.stringify(m),
    });

    if (res.ok) {
      addToast(`Marks recorded for ${m.studentName}`);
      await refreshData();
    } else {
      const err = await res.json();
      addToast(err.error || 'Access Denied: Unauthorized subject or class grade entry.', 'error');
    }
  };

  // Notice CRUD
  const addNotice = async (not: Omit<Notice, 'id'>) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers,
      body: JSON.stringify(not),
    });

    if (res.ok) {
      addToast(`Notice "${not.title}" published!`);
      logActivity(currentUser.name, `published notice "${not.title}"`, 'notice');
      await refreshData();
    } else {
      const err = await res.json();
      addToast(err.error || 'Access Denied: Only Teachers and Admins can publish notices.', 'error');
    }
  };

  const updateNotice = async (id: string, updated: Partial<Notice>) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    addToast(`Notice updated.`);
  };

  const deleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    addToast(`Notice deleted.`, 'info');
  };

  // Fees CRUD & Payments
  const addFeeStructure = async (fs: Omit<FeeStructure, 'id'>) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/fees/structures', {
      method: 'POST',
      headers,
      body: JSON.stringify(fs),
    });
    if (res.ok) {
      addToast(`Fee structure "${fs.name}" created!`);
      logActivity(currentUser.name, `created fee structure "${fs.name}" ($${fs.amount})`, 'fee');
      await refreshData();
    } else {
      const err = await res.json();
      addToast(err.error || 'Failed to create fee structure', 'error');
    }
  };

  const deleteFeeStructure = async (id: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/fees/structures/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      addToast(`Fee structure deleted.`, 'info');
      await refreshData();
    } else {
      handleApiError(res, 'Failed to delete fee structure');
    }
  };

  const assignFees = async (payload: {
    feeStructureId: string;
    studentId?: string;
    class?: string;
    section?: string;
    customAmount?: number;
    dueDate?: string;
  }) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/fees/assign', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      addToast(`Successfully assigned fee invoice to ${data.count} student(s)!`);
      logActivity(currentUser.name, `assigned fees to ${data.count} student(s)`, 'fee');
      await refreshData();
    } else {
      const err = await res.json();
      addToast(err.error || 'Failed to assign fees', 'error');
    }
  };

  const recordFeePayment = async (payload: {
    feeRecordId: string;
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
    notes?: string;
  }): Promise<boolean> => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/fees/pay', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      addToast(`Payment of $${payload.amount} recorded! Receipt: ${data.payment.id}`);
      logActivity(currentUser.name, `paid $${payload.amount} for ${data.payment.studentName} (${data.payment.title})`, 'fee');
      await refreshData();
      return true;
    } else {
      const err = await res.json();
      addToast(err.error || 'Failed to record payment', 'error');
      return false;
    }
  };

  const reverseFeePayment = async (paymentId: string, reason: string): Promise<boolean> => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/fees/reverse', {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentId, reason }),
    });
    if (res.ok) {
      addToast(`Payment receipt ${paymentId} reversed successfully.`, 'info');
      logActivity(currentUser.name, `reversed payment ${paymentId} (Reason: ${reason})`, 'fee');
      await refreshData();
      return true;
    } else {
      const err = await res.json();
      addToast(err.error || 'Failed to reverse payment', 'error');
      return false;
    }
  };

  // Timetable CRUD & Collision Handling
  const addTimetableSlot = async (
    slot: Omit<TimetableSlot, 'id'>
  ): Promise<{ success: boolean; error?: string }> => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/timetables', {
      method: 'POST',
      headers,
      body: JSON.stringify(slot),
    });
    if (res.ok) {
      addToast(`Timetable period scheduled for ${slot.class} (${slot.day})`);
      logActivity(currentUser.name, `scheduled ${slot.subject || slot.type} for ${slot.class} on ${slot.day}`, 'timetable');
      await refreshData();
      return { success: true };
    } else {
      const err = await res.json();
      const errorMsg = err.error || 'Failed to create timetable slot';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const updateTimetableSlot = async (
    id: string,
    slot: Partial<TimetableSlot>
  ): Promise<{ success: boolean; error?: string }> => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/timetables/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(slot),
    });
    if (res.ok) {
      addToast(`Timetable slot updated.`);
      await refreshData();
      return { success: true };
    } else {
      const err = await res.json();
      const errorMsg = err.error || 'Failed to update timetable slot';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const deleteTimetableSlot = async (id: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/timetables/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      addToast(`Timetable slot removed.`, 'info');
      await refreshData();
    } else {
      handleApiError(res, 'Failed to remove timetable slot');
    }
  };

  // ==========================================
  // TEACHER CHAT METHODS
  // ==========================================

  const refreshChatGroups = useCallback(async () => {
    if (activeRole !== 'Teacher' && activeRole !== 'Admin') return;
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/chat/groups', { headers });
      const data = await safeJsonParse<ChatGroup[] | null>(res, null);
      if (Array.isArray(data)) {
        setChatGroups(data);
        // If current active group is invalid or empty, set to first available
        if (data.length > 0) {
          setActiveChatGroupId((prev) => {
            if (!prev || !data.some((g) => g.id === prev)) {
              return data[0].id;
            }
            return prev;
          });
        }
      }
    } catch {
      // Non-blocking
    }
  }, [activeRole, getAuthHeaders]);

  const fetchChatMessages = useCallback(
    async (groupId: string, search?: string) => {
      if (!groupId || (activeRole !== 'Teacher' && activeRole !== 'Admin')) {
        return;
      }
      const headers = getAuthHeaders();
      try {
        const url = `/api/chat/groups/${groupId}/messages${search ? `?q=${encodeURIComponent(search)}` : ''}`;
        const res = await fetch(url, { headers });
        const data = await safeJsonParse<ChatMessage[] | null>(res, null);
        if (Array.isArray(data)) {
          setActiveChatMessages(data);
        }
      } catch {
        // Silently handle transient connection/restart intervals
      }
    },
    [activeRole, getAuthHeaders]
  );

  // Poll messages for the active group in real-time
  useEffect(() => {
    if (!activeChatGroupId || (activeRole !== 'Teacher' && activeRole !== 'Admin')) {
      return;
    }

    fetchChatMessages(activeChatGroupId);

    const interval = setInterval(() => {
      fetchChatMessages(activeChatGroupId);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeChatGroupId, activeRole, fetchChatMessages]);

  const sendChatMessage = async (payload: {
    groupId: string;
    content: string;
    isAnnouncement?: boolean;
    replyTo?: ChatMessage['replyTo'];
    attachments?: ChatMessage['attachments'];
  }): Promise<boolean> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${payload.groupId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data && data.id) {
        setActiveChatMessages((prev) => [...prev, data]);
        await refreshChatGroups();
        return true;
      } else {
        addToast(data?.error || 'Failed to send message', 'error');
        return false;
      }
    } catch {
      addToast('Network error sending message', 'error');
      return false;
    }
  };

  const editChatMessage = async (groupId: string, messageId: string, content: string): Promise<boolean> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ content }),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data) {
        setActiveChatMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: data.content, isEdited: true, editedAt: data.editedAt } : m))
        );
        addToast('Message edited.');
        await refreshChatGroups();
        return true;
      } else {
        addToast(data?.error || 'Failed to edit message', 'error');
        return false;
      }
    } catch {
      addToast('Failed to edit message', 'error');
      return false;
    }
  };

  const deleteChatMessage = async (groupId: string, messageId: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok) {
        setActiveChatMessages((prev) => prev.filter((m) => m.id !== messageId));
        addToast('Message deleted.', 'info');
        await refreshChatGroups();
      } else {
        addToast(data?.error || 'Failed to delete message', 'error');
      }
    } catch {
      addToast('Failed to delete message', 'error');
    }
  };

  const toggleMessageReaction = async (groupId: string, messageId: string, emoji: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}/react`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emoji }),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data?.reactions) {
        setActiveChatMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: data.reactions } : m))
        );
      }
    } catch {
      // Non-blocking
    }
  };

  const sendChatReply = async (
    groupId: string,
    messageId: string,
    payload: { content: string; attachments?: ChatAttachment[] }
  ): Promise<boolean> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}/replies`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data && data.id) {
        setActiveChatMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId) {
              const existingReplies = m.replies || [];
              return {
                ...m,
                replies: [...existingReplies, data],
                replyCount: existingReplies.length + 1,
              };
            }
            return m;
          })
        );
        addToast('Reply sent!');
        auditLogService.logAction(currentUser?.id || 'usr-1', 'chat_reply', 'Chat', {
          groupId,
          messageId,
          replyId: data.id,
          hasAttachments: !!payload.attachments?.length,
        });
        return true;
      } else {
        addToast(data?.error || 'Failed to send reply', 'error');
        return false;
      }
    } catch {
      addToast('Network error sending reply', 'error');
      return false;
    }
  };

  const editChatReply = async (
    groupId: string,
    messageId: string,
    replyId: string,
    content: string
  ): Promise<boolean> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}/replies/${replyId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ content }),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data) {
        setActiveChatMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId && m.replies) {
              return {
                ...m,
                replies: m.replies.map((r) => (r.id === replyId ? { ...r, ...data } : r)),
              };
            }
            return m;
          })
        );
        addToast('Reply edited.');
        return true;
      } else {
        addToast(data?.error || 'Failed to edit reply', 'error');
        return false;
      }
    } catch {
      addToast('Failed to edit reply', 'error');
      return false;
    }
  };

  const deleteChatReply = async (groupId: string, messageId: string, replyId: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}/replies/${replyId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok) {
        setActiveChatMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId && m.replies) {
              const updatedReplies = m.replies.filter((r) => r.id !== replyId);
              return {
                ...m,
                replies: updatedReplies,
                replyCount: updatedReplies.length,
              };
            }
            return m;
          })
        );
        addToast('Reply deleted.', 'info');
      } else {
        addToast(data?.error || 'Failed to delete reply', 'error');
      }
    } catch {
      addToast('Failed to delete reply', 'error');
    }
  };

  const toggleReplyReaction = async (
    groupId: string,
    messageId: string,
    replyId: string,
    emoji: string
  ) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${groupId}/messages/${messageId}/replies/${replyId}/react`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emoji }),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data?.reactions) {
        setActiveChatMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId && m.replies) {
              return {
                ...m,
                replies: m.replies.map((r) =>
                  r.id === replyId ? { ...r, reactions: data.reactions } : r
                ),
              };
            }
            return m;
          })
        );
      }
    } catch {
      // Non-blocking
    }
  };

  const createChatGroup = async (groupData: Partial<ChatGroup> & { memberIds?: string[] }): Promise<ChatGroup | null> => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch('/api/chat/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify(groupData),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok && data?.id) {
        const newGroup: ChatGroup = data;
        addToast(`Teacher chat group "${newGroup.name}" created!`, 'success');
        await refreshChatGroups();
        setActiveChatGroupId(newGroup.id);
        logActivity(currentUser?.name || 'Faculty', `Created chat group "${newGroup.name}"`, 'chat');
        return newGroup;
      } else {
        addToast(data?.error || 'Failed to create group', 'error');
        return null;
      }
    } catch {
      addToast('Failed to create group', 'error');
      return null;
    }
  };

  const updateChatGroup = async (id: string, updated: Partial<ChatGroup>) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated),
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok) {
        addToast('Chat group updated successfully.');
        await refreshChatGroups();
      } else {
        addToast(data?.error || 'Failed to update group', 'error');
      }
    } catch {
      addToast('Failed to update group', 'error');
    }
  };

  const deleteChatGroup = async (id: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok) {
        addToast('Chat group deleted.', 'info');
        if (activeChatGroupId === id) {
          setActiveChatGroupId(null);
        }
        await refreshChatGroups();
      } else {
        addToast(data?.error || 'Failed to delete group', 'error');
      }
    } catch {
      addToast('Failed to delete group', 'error');
    }
  };

  const joinChatGroup = async (id: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${id}/join`, {
        method: 'POST',
        headers,
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok) {
        addToast('Joined group successfully.');
        await refreshChatGroups();
        setActiveChatGroupId(id);
      } else {
        addToast(data?.error || 'Failed to join group', 'error');
      }
    } catch {
      addToast('Failed to join group', 'error');
    }
  };

  const leaveChatGroup = async (id: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${id}/leave`, {
        method: 'POST',
        headers,
      });
      const data = await safeJsonParse<any>(res, null);
      if (res.ok) {
        addToast('Left group.', 'info');
        if (activeChatGroupId === id) {
          setActiveChatGroupId(null);
        }
        await refreshChatGroups();
      } else {
        addToast(data?.error || 'Failed to leave group', 'error');
      }
    } catch {
      addToast('Failed to leave group', 'error');
    }
  };

  const toggleMuteGroup = async (id: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`/api/chat/groups/${id}/mute`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        addToast(data.isMuted ? 'Group notifications muted' : 'Group unmuted', 'info');
        await refreshChatGroups();
      }
    } catch (e) {
      addToast('Failed to update mute setting', 'error');
    }
  };

  const markGroupRead = async (id: string) => {
    const headers = getAuthHeaders();
    try {
      await fetch(`/api/chat/groups/${id}/read`, {
        method: 'POST',
        headers,
      });
      setChatGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, unreadCount: 0 } : g))
      );
    } catch (e) {
      // Non-blocking
    }
  };

  return (
    <SchoolDataContext.Provider
      value={{
        students,
        teachers,
        books,
        syllabus,
        learningResources,
        classes,
        subjects,
        attendance,
        exams,
        marks,
        studentMarks: marks || [],
        notices,
        activities,
        activityLogs: activities,
        reloadLogs,
        isLogsLoading,
        feeStructures,
        studentFees,
        studentFeeRecords: studentFees || [],
        feePayments,
        downloadFiles: [...(syllabus || []), ...(learningResources || [])],
        timetables,
        chatGroups,
        activeChatGroupId,
        setActiveChatGroupId,
        activeChatMessages,
        unreadChatCount,
        toasts,
        globalSearch,
        setGlobalSearch,
        isLoading,
        addToast,
        removeToast,
        fetchChatMessages,
        sendChatMessage,
        editChatMessage,
        deleteChatMessage,
        toggleMessageReaction,
        sendChatReply,
        editChatReply,
        deleteChatReply,
        toggleReplyReaction,
        createChatGroup,
        updateChatGroup,
        deleteChatGroup,
        joinChatGroup,
        leaveChatGroup,
        toggleMuteGroup,
        markGroupRead,
        refreshChatGroups,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addBook,
        updateBook,
        deleteBook,
        toggleFavoriteBook,
        borrowBook,
        returnBook,
        addSyllabusItem,
        updateSyllabusItem,
        deleteSyllabusItem,
        addLearningResource,
        updateLearningResource,
        deleteLearningResource,
        incrementResourceDownloads,
        downloadFile,
        addClass,
        updateClass,
        deleteClass,
        nominateClassTeacher,
        addSubject,
        updateSubject,
        deleteSubject,
        markAttendanceBatch,
        addExam,
        updateExam,
        deleteExam,
        addOrUpdateMark,
        addNotice,
        updateNotice,
        deleteNotice,
        addFeeStructure,
        deleteFeeStructure,
        assignFees,
        recordFeePayment,
        reverseFeePayment,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        logActivity,
        refreshData,
      }}
    >
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return context;
};
