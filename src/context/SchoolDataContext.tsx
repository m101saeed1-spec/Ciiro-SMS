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
} from '../types';
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
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface SchoolDataContextType {
  students: Student[];
  teachers: Teacher[];
  books: LibraryBook[];
  classes: SchoolClass[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  marks: StudentMark[];
  notices: Notice[];
  activities: ActivityLog[];
  toasts: ToastMessage[];
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isLoading: boolean;

  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Student CRUD
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Teacher CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (id: string, updated: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  // Book CRUD & Borrow
  addBook: (book: Omit<LibraryBook, 'id'>) => Promise<void>;
  updateBook: (id: string, updated: Partial<LibraryBook>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  borrowBook: (bookId: string) => Promise<void>;
  returnBook: (bookId: string) => Promise<void>;

  // Class CRUD
  addClass: (cls: Omit<SchoolClass, 'id'>) => Promise<void>;
  updateClass: (id: string, updated: Partial<SchoolClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

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
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [marks, setMarks] = useState<StudentMark[]>(INITIAL_MARKS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
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

  // Fetch all RLS-enforced data from backend server
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();

    try {
      // 1. Fetch Students (RLS Filtered)
      const resStudents = await fetch('/api/students', { headers });
      if (resStudents.ok) {
        const data = await resStudents.json();
        setStudents(data);
      } else {
        setStudents([]);
      }

      // 2. Fetch Teachers (RLS Filtered)
      const resTeachers = await fetch('/api/teachers', { headers });
      if (resTeachers.ok) {
        const data = await resTeachers.json();
        setTeachers(data);
      } else {
        setTeachers([]);
      }

      // 3. Fetch Attendance (RLS Filtered)
      const resAttendance = await fetch('/api/attendance', { headers });
      if (resAttendance.ok) {
        const data = await resAttendance.json();
        setAttendance(data);
      }

      // 4. Fetch Marks (RLS Filtered)
      const resMarks = await fetch('/api/marks', { headers });
      if (resMarks.ok) {
        const data = await resMarks.json();
        setMarks(data);
      }

      // 5. Fetch Notices (Audience Filtered)
      const resNotices = await fetch('/api/notices', { headers });
      if (resNotices.ok) {
        const data = await resNotices.json();
        setNotices(data);
      }

      // 6. Fetch Public/Catalog datasets
      const [resBooks, resClasses, resSubjects, resExams] = await Promise.all([
        fetch('/api/library', { headers }),
        fetch('/api/classes', { headers }),
        fetch('/api/subjects', { headers }),
        fetch('/api/exams', { headers }),
      ]);

      if (resBooks.ok) setBooks(await resBooks.json());
      if (resClasses.ok) setClasses(await resClasses.json());
      if (resSubjects.ok) setSubjects(await resSubjects.json());
      if (resExams.ok) setExams(await resExams.json());

    } catch (err) {
      console.warn('Backend server offline or starting up:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Trigger refresh whenever authenticated user, role, or active parent child changes
  useEffect(() => {
    refreshData();
  }, [currentUser, activeRole, activeChildId, refreshData]);

  const logActivity = (user: string, action: string, type: ActivityLog['type']) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      user,
      action,
      timestamp: 'Just now',
      type,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 15)]);
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
  const addTeacher = async (t: Omit<Teacher, 'id'>) => {
    addToast(`Teacher ${t.name} added successfully!`);
    logActivity(currentUser.name, `added faculty member ${t.name}`, 'teacher');
    await refreshData();
  };

  const updateTeacher = async (id: string, updated: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    addToast(`Teacher record updated.`);
  };

  const deleteTeacher = async (id: string) => {
    setTeachers((prev) => prev.filter((tc) => tc.id !== id));
    addToast(`Teacher removed.`, 'info');
  };

  // Library Book CRUD & Borrow
  const addBook = async (bk: Omit<LibraryBook, 'id'>) => {
    const id = `bk-${Date.now()}`;
    setBooks((prev) => [{ ...bk, id }, ...prev]);
    addToast(`Book "${bk.name}" added to library.`);
  };

  const updateBook = async (id: string, updated: Partial<LibraryBook>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    addToast(`Book details updated.`);
  };

  const deleteBook = async (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    addToast(`Book removed from library.`, 'info');
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

  return (
    <SchoolDataContext.Provider
      value={{
        students,
        teachers,
        books,
        classes,
        subjects,
        attendance,
        exams,
        marks,
        notices,
        activities,
        toasts,
        globalSearch,
        setGlobalSearch,
        isLoading,
        addToast,
        removeToast,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        addClass,
        updateClass,
        deleteClass,
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
