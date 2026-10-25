import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import { Modal } from '../common/Modal';
import { StudentRegistrationWizard } from '../students/StudentRegistrationWizard';
import { AttendanceStatus } from '../../types';
import {
  Plus,
  X,
  UserPlus,
  CalendarCheck,
  Receipt,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface DashboardFABProps {
  onNavigate: (module: NavModule) => void;
}

type FABActionType = 'add-student' | 'record-attendance' | 'issue-invoice';

interface GuidanceState {
  title: string;
  badge: string;
  message: string;
  suggestedActionLabel: string;
  suggestedModule: NavModule;
}

export const DashboardFAB: React.FC<DashboardFABProps> = ({ onNavigate }) => {
  const {
    currentUser,
    activeRole,
    isSuperAdmin,
    isOwnerAdmin,
    isPrincipal,
    isTeacher,
    isAccountAdmin,
    isClassTeacher,
    classTeacherOf,
    canPerformClassOperations,
  } = useAuth();

  const {
    students,
    classes,
    feeStructures,
    addStudent,
    markAttendanceBatch,
    assignFees,
    addToast,
  } = useSchoolData();

  // Menu open / close state
  const [isOpen, setIsOpen] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<FABActionType | null>(null);
  const [guidanceInfo, setGuidanceInfo] = useState<GuidanceState | null>(null);

  // ---------------------------------------------------------
  // 1. ADD STUDENT QUICK STATE & HANDLER
  // ---------------------------------------------------------
  // Classes where current user is authorized to enroll students
  const authorizedEnrollmentClasses = useMemo(() => {
    return classes.filter((c) => canPerformClassOperations(c.name, 'student_registration').allowed);
  }, [classes, canPerformClassOperations]);

  const defaultEnrollClass = authorizedEnrollmentClasses[0] || classes[0];

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    class: defaultEnrollClass?.name || 'Class 01',
    section: 'A',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '2016-04-15',
    bloodGroup: 'O+',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '104 Harmony Blvd, Academic Hills',
  });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // ---------------------------------------------------------
  // 2. RECORD ATTENDANCE QUICK STATE & HANDLER
  // ---------------------------------------------------------
  const authorizedAttendanceClasses = useMemo(() => {
    return classes.filter((c) => canPerformClassOperations(c.name, 'attendance').allowed);
  }, [classes, canPerformClassOperations]);

  const defaultAttClass = authorizedAttendanceClasses[0] || classes[0];
  const [attSelectedClass, setAttSelectedClass] = useState<string>(defaultAttClass?.name || 'Class 01');
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attStatuses, setAttStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Students of current attendance class
  const attClassStudents = useMemo(() => {
    return students.filter((s) => s.class === attSelectedClass);
  }, [students, attSelectedClass]);

  // Initialize statuses when class or students change
  React.useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    attClassStudents.forEach((st) => {
      initial[st.id] = 'Present';
    });
    setAttStatuses(initial);
  }, [attSelectedClass, attClassStudents]);

  // ---------------------------------------------------------
  // 3. ISSUE INVOICE QUICK STATE & HANDLER
  // ---------------------------------------------------------
  const [invoiceForm, setInvoiceForm] = useState({
    targetType: 'class' as 'class' | 'student',
    feeStructureId: feeStructures[0]?.id || '',
    category: 'Tuition' as const,
    class: classes[0]?.name || 'Class 01',
    section: 'All',
    studentId: students[0]?.id || '',
    amount: '350',
    dueDate: '2026-10-15',
    title: 'Term 1 Tuition Fee',
  });
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // ---------------------------------------------------------
  // ACTION TRIGGER ROUTER WITH ROLE AUTHORIZATION
  // ---------------------------------------------------------
  const handleActionClick = (action: FABActionType) => {
    setIsOpen(false);

    if (action === 'add-student') {
      // Check authorization
      if (isSuperAdmin) {
        setGuidanceInfo({
          title: 'Platform Scope Restriction',
          badge: 'Super Admin Governance',
          message:
            'Platform Super Admins govern platform subscriptions, school registration, and tenant isolation. School student registration is strictly delegated to appointed school Class Teachers.',
          suggestedActionLabel: 'View Schools Directory',
          suggestedModule: 'schools',
        });
        return;
      }

      if (isPrincipal) {
        setGuidanceInfo({
          title: 'Class Teacher Responsibility',
          badge: 'Academic Leadership',
          message:
            'As Principal, you structure classes and assign faculty. Once a Class Teacher is appointed, official student registration is executed by that Class Teacher to preserve classroom chain-of-responsibility.',
          suggestedActionLabel: 'Manage Class Teachers',
          suggestedModule: 'class',
        });
        return;
      }

      if (isTeacher) {
        if (authorizedEnrollmentClasses.length === 0) {
          setGuidanceInfo({
            title: 'Class Teacher Assignment Required',
            badge: 'Faculty Role',
            message:
              'You are registered as a Subject Teacher. Only teachers explicitly assigned as Class Teachers can enroll new students into their designated classroom. Please contact the Principal to assign your class.',
            suggestedActionLabel: 'View Teaching Timetable',
            suggestedModule: 'timetable',
          });
          return;
        }

        // Teacher is Class Teacher: Open quick student modal
        setStudentForm((prev) => ({
          ...prev,
          class: authorizedEnrollmentClasses[0].name,
        }));
        setActiveModal('add-student');
        return;
      }

      // Accountant / Student
      setGuidanceInfo({
        title: 'Access Restricted',
        badge: `${activeRole} Role`,
        message: 'Student registration is restricted to designated Class Teachers.',
        suggestedActionLabel: 'Return to Dashboard',
        suggestedModule: 'home',
      });
      return;
    } // <-- Added closing brace here


    if (action === 'record-attendance') {
      // Check authorization
      if (isSuperAdmin) {
        setGuidanceInfo({
          title: 'Platform Scope Restriction',
          badge: 'Super Admin Governance',
          message:
            'Platform Super Admins govern tenant schools and platform statistics. Daily classroom attendance is recorded by assigned Class Teachers.',
          suggestedActionLabel: 'View Platform Statistics',
          suggestedModule: 'home',
        });
        return;
      }

      if (isPrincipal) {
        setGuidanceInfo({
          title: 'Class Teacher Responsibility',
          badge: 'Administrative Oversight',
          message:
            'Official class attendance roll calls are recorded exclusively by the designated Class Teacher for each class. Administrators may monitor attendance audit logs and export offline reports.',
          suggestedActionLabel: 'Inspect Attendance Directory',
          suggestedModule: 'attendance',
        });
        return;
      }

      if (isTeacher) {
        if (authorizedAttendanceClasses.length === 0) {
          setGuidanceInfo({
            title: 'Class Teacher Assignment Required',
            badge: 'Faculty Scope',
            message:
              'Official roll call is restricted to designated Class Teachers. As a Subject Teacher, you manage coursework and study resources.',
            suggestedActionLabel: 'View Attendance Records',
            suggestedModule: 'attendance',
          });
          return;
        }

        setAttSelectedClass(authorizedAttendanceClasses[0].name);
        setActiveModal('record-attendance');
        return;
      }

      // Other roles
      setGuidanceInfo({
        title: 'Access Restricted',
        badge: `${activeRole} Role`,
        message: 'Daily roll call attendance is managed exclusively by authorized faculty.',
        suggestedActionLabel: 'View Attendance',
        suggestedModule: 'attendance',
      });
      return;
    }
    if (action === 'issue-invoice') {
      // Check authorization: Principal
      if (isPrincipal) {
        setActiveModal('issue-invoice');
        return;
      }

      if (isSuperAdmin) {
        setGuidanceInfo({
          title: 'Platform Scope Restriction',
          badge: 'Platform Super Admin',
          message:
            'Super Admins manage platform subscription plans and tenant schools. Operational school fees are issued by individual school Accountants.',
          suggestedActionLabel: 'Manage Platform Pricing',
          suggestedModule: 'home',
        });
        return;
      }

      setGuidanceInfo({
        title: 'Accounts Department Required',
        badge: 'Financial Governance',
        message:
          'Billing, invoicing, and fee structures are managed exclusively by the School Accountant and authorized administration.',
        suggestedActionLabel: 'View School Fees',
        suggestedModule: 'fees',
      });
      return;
    }
  };

  // ---------------------------------------------------------
  // SUBMISSION HANDLERS
  // ---------------------------------------------------------
  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim()) {
      addToast({ title: 'Validation Error', message: 'Student full name is required.', type: 'error' });
      return;
    }

    setIsSubmittingStudent(true);
    try {
      const classCount = students.filter((s) => s.class === studentForm.class).length;
      const autoRoll = `2026${String(classCount + 1).padStart(2, '0')}`;
      const nextNum = 120 + students.length + 1;
      const autoId = `STU-2026-${String(nextNum).padStart(4, '0')}`;

      await addStudent({
        id: autoId,
        rollNo: autoRoll,
        name: studentForm.name.trim(),
        avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200`,
        email: studentForm.email.trim() || `${studentForm.name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
        class: studentForm.class,
        section: studentForm.section,
        gender: studentForm.gender,
        dob: studentForm.dob,
        bloodGroup: studentForm.bloodGroup,
        attendanceRate: 100,
        status: 'Active',
        parentName: studentForm.parentName.trim() || 'Parent/Guardian',
        parentPhone: studentForm.parentPhone.trim() || '+1 (555) 019-4821',
        parentEmail: studentForm.parentEmail.trim() || 'parent@example.com',
        address: studentForm.address,
        enrollmentDate: new Date().toISOString().split('T')[0],
      });

      addToast({
        title: 'Student Enrolled',
        message: `${studentForm.name} was successfully enrolled in ${studentForm.class} (ID: ${autoId}).`,
        type: 'success',
      });

      setActiveModal(null);
      setStudentForm({
        name: '',
        email: '',
        class: defaultEnrollClass?.name || 'Class 01',
        section: 'A',
        gender: 'Female',
        dob: '2016-04-15',
        bloodGroup: 'O+',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '104 Harmony Blvd, Academic Hills',
      });
    } catch (err: any) {
      addToast({
        title: 'Registration Error',
        message: err?.message || 'Failed to complete student registration.',
        type: 'error',
      });
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!attSelectedClass) return;
    setIsSavingAttendance(true);

    try {
      const records = attClassStudents.map((st) => ({
        date: attDate,
        class: attSelectedClass,
        section: st.section || 'A',
        studentId: st.id,
        studentName: st.name,
        rollNo: st.rollNo,
        status: attStatuses[st.id] || 'Present',
        recordedBy: currentUser.name || 'Class Teacher',
      }));

      await markAttendanceBatch(records);
      addToast({
        title: 'Attendance Recorded',
        message: `Roll call for ${attSelectedClass} on ${attDate} successfully saved (${records.length} students).`,
        type: 'success',
      });
      setActiveModal(null);
    } catch (err: any) {
      addToast({
        title: 'Attendance Error',
        message: err?.message || 'Failed to save attendance.',
        type: 'error',
      });
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInvoice(true);

    try {
      const targetStructure = feeStructures.find((f) => f.id === invoiceForm.feeStructureId) || feeStructures[0];
      const structId = targetStructure ? targetStructure.id : 'fs-tuition-term1';

      await assignFees({
        feeStructureId: structId,
        studentId: invoiceForm.targetType === 'student' ? invoiceForm.studentId : undefined,
        class: invoiceForm.targetType === 'class' ? invoiceForm.class : undefined,
        section: invoiceForm.targetType === 'class' ? invoiceForm.section : undefined,
        customAmount: parseFloat(invoiceForm.amount) || undefined,
        dueDate: invoiceForm.dueDate,
      });

      addToast({
        title: 'Invoice Issued',
        message: `Fee invoice for $${invoiceForm.amount} was successfully issued.`,
        type: 'success',
      });
      setActiveModal(null);
    } catch (err: any) {
      addToast({
        title: 'Invoicing Error',
        message: err?.message || 'Failed to issue fee invoice.',
        type: 'error',
      });
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  return (
    <>
      {/* Dimmed backdrop when FAB menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Action Options (Animated Pop-up) */}
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-4 animate-scale-up origin-bottom-right">
            {/* Action 0: Ask Gemini AI */}
            <div className="flex items-center gap-3 group">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-none transition-transform group-hover:scale-105">
                Gemini AI Chatbot
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('gemini');
                }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#122E52] to-[#0B1B32] hover:from-[#0B1B32] hover:to-[#122E52] text-white shadow-lg shadow-[#122E52]/25 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-[#F7A914]/20"
                title="Chat with Gemini AI Platform Assistant"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
            </div>

            {/* Action 1: Add Student */}
            <div className="flex items-center gap-3 group">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-none transition-transform group-hover:scale-105">
                Add Student
              </span>
              <button
                type="button"
                onClick={() => handleActionClick('add-student')}
                className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-emerald-500/10"
                title="Add New Student"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>

            {/* Action 2: Record Attendance */}
            <div className="flex items-center gap-3 group">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-none transition-transform group-hover:scale-105">
                Record Attendance
              </span>
              <button
                type="button"
                onClick={() => handleActionClick('record-attendance')}
                className="w-12 h-12 rounded-2xl bg-[#F7A914] hover:bg-[#E59807] text-[#122E52] text-white shadow-lg shadow-[#122E52]/25 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-[#F7A914]/20"
                title="Record Class Attendance"
              >
                <CalendarCheck className="w-5 h-5" />
              </button>
            </div>

            {/* Action 3: Issue Invoice */}
            <div className="flex items-center gap-3 group">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-none transition-transform group-hover:scale-105">
                Issue Invoice
              </span>
              <button
                type="button"
                onClick={() => handleActionClick('issue-invoice')}
                className="w-12 h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-amber-500/10"
                title="Issue Fee Invoice"
              >
                <Receipt className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Trigger FAB */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close quick action menu' : 'Open quick action menu'}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-xl transition-all duration-200 cursor-pointer active:scale-95 ${
            isOpen
              ? 'bg-slate-900 dark:bg-slate-800 rotate-90 shadow-slate-900/30'
              : 'bg-gradient-to-tr from-[#122E52] to-[#0B1B32] hover:from-[#0B1B32] hover:to-[#122E52] shadow-[#F7A914]/30 hover:scale-105 ring-4 ring-[#F7A914]/20'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          )}

          {/* Quick Actions tooltip badge on initial view */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7A914] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F7A914] border-2 border-white dark:border-slate-900" />
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. QUICK ADD STUDENT MULTI-STEP WIZARD MODAL             */}
      {/* ========================================================= */}
      {activeModal === 'add-student' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={`Student Admission Wizard — ${defaultEnrollClass?.name || 'Class Registration'}`}
          maxWidth="2xl"
        >
          <StudentRegistrationWizard
            targetClass={defaultEnrollClass}
            onClose={() => setActiveModal(null)}
            onSuccess={(_student) => {
              setActiveModal(null);
            }}
          />
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 2. QUICK RECORD ATTENDANCE MODAL                         */}
      {/* ========================================================= */}
      {activeModal === 'record-attendance' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={`Quick Attendance Roll Call - ${attSelectedClass}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Top controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F7A914] dark:text-[#F7A914]" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Roll Date:</span>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              {authorizedAttendanceClasses.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Class:</span>
                  <select
                    value={attSelectedClass}
                    onChange={(e) => setAttSelectedClass(e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {authorizedAttendanceClasses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const allPresent: Record<string, AttendanceStatus> = {};
                  attClassStudents.forEach((s) => {
                    allPresent[s.id] = 'Present';
                  });
                  setAttStatuses(allPresent);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>
            </div>

            {/* Quick Students Roster */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {attClassStudents.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No enrolled students in this class.</p>
              ) : (
                attClassStudents.map((st) => {
                  const status = attStatuses[st.id] || 'Present';
                  return (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] text-slate-400 font-bold">#{st.rollNo}</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                          <p className="text-[10px] text-slate-400">{st.id} • Sec {st.section}</p>
                        </div>
                      </div>

                      {/* 3 Status Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAttStatuses((prev) => ({ ...prev, [st.id]: 'Present' }))}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttStatuses((prev) => ({ ...prev, [st.id]: 'Absent' }))}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                            status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttStatuses((prev) => ({ ...prev, [st.id]: 'Permission' }))}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                            status === 'Permission'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                          }`}
                        >
                          Excuse
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onNavigate('attendance');
                }}
                className="text-xs font-semibold text-[#F7A914] dark:text-[#F7A914] hover:underline flex items-center gap-1"
              >
                <span>Full Attendance Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance || attClassStudents.length === 0}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F7A914] hover:bg-[#E59807] text-[#122E52] text-white shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 3. QUICK ISSUE INVOICE MODAL                             */}
      {/* ========================================================= */}
      {activeModal === 'issue-invoice' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Quick Fee Invoicing"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitInvoice} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authorized Billing Dispatch</span>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                  Issue student tuition or supplementary fee invoices with automated ledger synchronization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Target
                </label>
                <select
                  value={invoiceForm.targetType}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, targetType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="class">Entire Classroom</option>
                  <option value="student">Individual Student</option>
                </select>
              </div>

              {invoiceForm.targetType === 'class' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Class
                  </label>
                  <select
                    value={invoiceForm.class}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, class: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Student
                  </label>
                  <select
                    value={invoiceForm.studentId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {students.slice(0, 30).map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.class})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Amount ($) *
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="350"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onNavigate('fees');
                }}
                className="text-xs font-semibold text-[#F7A914] dark:text-[#F7A914] hover:underline flex items-center gap-1"
              >
                <span>Open Fee Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvoice}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingInvoice ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 4. CONTEXTUAL GUIDANCE MODAL (FRIENDLY ERROR MESSAGES)    */}
      {/* ========================================================= */}
      {guidanceInfo && (
        <Modal
          isOpen={true}
          onClose={() => setGuidanceInfo(null)}
          title={guidanceInfo.title}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 mb-1">
                  {guidanceInfo.badge}
                </span>
                <p className="text-xs leading-relaxed font-medium mt-1">
                  {guidanceInfo.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGuidanceInfo(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  const mod = guidanceInfo.suggestedModule;
                  setGuidanceInfo(null);
                  onNavigate(mod);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#F7A914] hover:bg-[#E59807] text-[#122E52] text-white shadow-xs cursor-pointer"
              >
                <span>{guidanceInfo.suggestedActionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
