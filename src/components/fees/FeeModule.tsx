import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { StudentFeeRecord, FeePayment, Student } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { LanguageToggle } from '../common/LanguageToggle';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Printer,
  FileText,
  User,
  Phone,
  Layers,
  ChevronRight,
  TrendingUp,
  Receipt,
  RotateCcw,
  Sparkles,
  Download,
  AlertCircle,
  X,
  Plus,
  Building2,
} from 'lucide-react';

interface FeeModuleProps {
  initialClass?: string;
}

export const FeeModule: React.FC<FeeModuleProps> = ({ initialClass }) => {
  const { currentUser, activeRole, activeSchool } = useAuth();
  const {
    students,
    classes,
    studentFees,
    feePayments,
    feeStructures,
    toggleStudentPaymentStatus,
    recordFeePayment,
    addToast,
  } = useSchoolData();
  const { language, t } = useLanguage();

  const isStudent = activeRole === 'Student';
  const isAccountant = activeRole === 'AccountAdmin';

  // Selected Class View State (null = All Classes Overview, string = specific Class Name)
  const [selectedClass, setSelectedClass] = useState<string | null>(initialClass || null);

  // Search and Filter State within class student list
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Custom Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetStudentForPayment, setTargetStudentForPayment] = useState<{
    student: Student;
    feeRecord?: StudentFeeRecord;
    totalAmount: number;
    paidAmount: number;
    remaining: number;
  } | null>(null);

  const [customPayAmount, setCustomPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    student: Student;
    feeRecord?: StudentFeeRecord;
    payment?: FeePayment;
    totalAmount: number;
    paidAmount: number;
    remaining: number;
    date: string;
    receiptNo: string;
  } | null>(null);

  // -----------------------------------------------------------------
  // 1. DATA ENRICHMENT: Map every student to their active fee status
  // -----------------------------------------------------------------
  // Default standard fee per student if no explicit fee record exists yet
  const DEFAULT_TUITION_AMOUNT = 1200;

  const enrichedStudentList = useMemo(() => {
    return students.map((st) => {
      // Find matching fee record for this student
      const record = studentFees.find((f) => f.studentId === st.id);
      
      const totalAmount = record ? Number(record.totalAmount) : DEFAULT_TUITION_AMOUNT;
      const paidAmount = record ? Number(record.paidAmount) : 0;
      const remainingBalance = Math.max(0, totalAmount - paidAmount);
      
      // Determine standardized binary status: Paid (when fully settled) or Unpaid
      const isPaid = record ? (record.status === 'Paid' || remainingBalance === 0) : false;
      const paymentStatus: 'Paid' | 'Unpaid' = isPaid ? 'Paid' : 'Unpaid';

      return {
        student: st,
        feeRecord: record,
        totalAmount,
        paidAmount,
        remainingBalance,
        paymentStatus,
      };
    });
  }, [students, studentFees]);

  // -----------------------------------------------------------------
  // 2. TOP 3 AGGREGATE DASHBOARD TOTALS (All Students / Active School)
  // -----------------------------------------------------------------
  const dashboardTotals = useMemo(() => {
    // If logged in as student, scope strictly to their own student record
    const targetDataset = isStudent && currentUser.studentId
      ? enrichedStudentList.filter((item) => item.student.id === currentUser.studentId)
      : enrichedStudentList;

    const totalAmount = targetDataset.reduce((acc, item) => acc + item.totalAmount, 0);
    const totalPaid = targetDataset.reduce((acc, item) => acc + item.paidAmount, 0);
    const totalRemaining = Math.max(0, totalAmount - totalPaid);
    const collectionRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 100;

    return {
      totalAmount,
      totalPaid,
      totalRemaining,
      collectionRate,
      totalStudentsCount: targetDataset.length,
    };
  }, [enrichedStudentList, isStudent, currentUser.studentId]);

  // -----------------------------------------------------------------
  // 3. CLASS-BY-CLASS FINANCIAL BREAKDOWN
  // -----------------------------------------------------------------
  const classFinancialSummaries = useMemo(() => {
    // Collect all class names from registered classes list + any extra from students
    const registeredNames = classes.map((c) => c.name);
    const studentClassNames = students.map((s) => s.class);
    const uniqueClassNames = Array.from(new Set([...registeredNames, ...studentClassNames])).filter(Boolean);

    // Sort classes naturally (e.g. Class 01, Class 02, etc.)
    uniqueClassNames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return uniqueClassNames.map((className) => {
      const classStudents = enrichedStudentList.filter((item) => item.student.class === className);
      const studentCount = classStudents.length;
      const classTotalBilled = classStudents.reduce((acc, item) => acc + item.totalAmount, 0);
      const classTotalPaid = classStudents.reduce((acc, item) => acc + item.paidAmount, 0);
      const classRemaining = Math.max(0, classTotalBilled - classTotalPaid);
      const classPaidCount = classStudents.filter((item) => item.paymentStatus === 'Paid').length;
      const classUnpaidCount = studentCount - classPaidCount;
      const classRate = classTotalBilled > 0 ? Math.round((classTotalPaid / classTotalBilled) * 100) : 100;

      return {
        className,
        studentCount,
        totalBilled: classTotalBilled,
        totalPaid: classTotalPaid,
        remaining: classRemaining,
        paidCount: classPaidCount,
        unpaidCount: classUnpaidCount,
        rate: classRate,
      };
    });
  }, [classes, students, enrichedStudentList]);

  // -----------------------------------------------------------------
  // 4. FILTERED STUDENTS FOR SELECTED CLASS
  // -----------------------------------------------------------------
  const selectedClassStudents = useMemo(() => {
    let list = enrichedStudentList;

    if (isStudent && currentUser.studentId) {
      list = list.filter((item) => item.student.id === currentUser.studentId);
    } else if (selectedClass) {
      list = list.filter((item) => item.student.class === selectedClass);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.student.name.toLowerCase().includes(q) ||
          item.student.id.toLowerCase().includes(q) ||
          (item.student.parentName && item.student.parentName.toLowerCase().includes(q)) ||
          (item.student.parentPhone && item.student.parentPhone.includes(q))
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      list = list.filter((item) => item.paymentStatus === statusFilter);
    }

    return list;
  }, [enrichedStudentList, selectedClass, searchQuery, statusFilter, isStudent, currentUser.studentId]);

  // Active selected class financial summary
  const currentClassSummary = useMemo(() => {
    if (!selectedClass) return null;
    return classFinancialSummaries.find((c) => c.className === selectedClass) || null;
  }, [classFinancialSummaries, selectedClass]);

  // -----------------------------------------------------------------
  // 5. ACTIONS: TOGGLE STATUS & RECORD PAYMENTS
  // -----------------------------------------------------------------
  const handleToggleStatus = async (item: typeof enrichedStudentList[0]) => {
    const newStatus: 'Paid' | 'Unpaid' = item.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    
    const result = await toggleStudentPaymentStatus({
      studentId: item.student.id,
      feeRecordId: item.feeRecord?.id,
      newStatus,
      customAmount: item.totalAmount,
      paymentMethod: 'Cash',
      notes: `Updated by ${currentUser.name} (${activeRole})`,
    });

    if (result.success) {
      addToast(
        newStatus === 'Paid' ? t.paymentSavedSuccess : t.paymentUnpaidSuccess,
        'success'
      );
    }
  };

  const handleOpenCustomPayment = (item: typeof enrichedStudentList[0]) => {
    setTargetStudentForPayment({
      student: item.student,
      feeRecord: item.feeRecord,
      totalAmount: item.totalAmount,
      paidAmount: item.paidAmount,
      remaining: item.remainingBalance,
    });
    setCustomPayAmount(String(item.remainingBalance > 0 ? item.remainingBalance : item.totalAmount));
    setPayMethod('Cash');
    setPayRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayNotes('');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmCustomPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForPayment) return;

    const amountNum = Number(customPayAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast(t.invalidAmount, 'error');
      return;
    }

    setIsSubmittingPayment(true);

    if (targetStudentForPayment.feeRecord) {
      const ok = await recordFeePayment({
        feeRecordId: targetStudentForPayment.feeRecord.id,
        amount: amountNum,
        paymentMethod: payMethod,
        transactionReference: payRef,
        notes: payNotes || `Payment recorded by ${currentUser.name}`,
      });
      setIsSubmittingPayment(false);
      if (ok) {
        setIsPaymentModalOpen(false);
      }
    } else {
      // Toggle / Provision via toggle-status with exact custom amount
      const res = await toggleStudentPaymentStatus({
        studentId: targetStudentForPayment.student.id,
        newStatus: 'Paid',
        customAmount: amountNum,
        paymentMethod: payMethod,
        notes: payNotes || `Payment recorded by ${currentUser.name}`,
      });
      setIsSubmittingPayment(false);
      if (res.success) {
        setIsPaymentModalOpen(false);
        addToast(t.paymentSavedSuccess, 'success');
      }
    }
  };

  const handleViewReceipt = (item: typeof enrichedStudentList[0]) => {
    const payment = feePayments.find((p) => p.studentId === item.student.id);
    const receiptNo = payment?.id || `REC-2026-${item.student.rollNo?.padStart(4, '0') || '0098'}`;
    const dateStr = payment?.paymentDate || new Date().toISOString().slice(0, 10);

    setReceiptData({
      student: item.student,
      feeRecord: item.feeRecord,
      payment,
      totalAmount: item.totalAmount,
      paidAmount: item.paidAmount,
      remaining: item.remainingBalance,
      date: dateStr,
      receiptNo,
    });
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.fees}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                {activeSchool?.name || 'School Accounts'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'so'
                ? 'Maamulka kharashaadka dugsiga, diiwaanka lacag-bixinta ardayda iyo xisaabaadka fasallada.'
                : 'Manage school billing, student payment verification, and class-by-class financial records.'}
            </p>
          </div>
        </div>

        {/* Language Switcher Toolbar */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageToggle />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP SUMMARY CARDS (EXACTLY 3 CARDS AS SPECIFIED)                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: TOTAL AMOUNT */}
        <div className="bg-white dark:bg-[#122E52] rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-[#122E52] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-[#122E52] dark:text-slate-300 uppercase">
              {t.totalAmount}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#12233F] dark:text-white tracking-tight">
              ${dashboardTotals.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 font-medium">
              {t.totalAmountDesc}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#1E3A63] flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-slate-400">
            <span>{t.students}: {dashboardTotals.totalStudentsCount}</span>
            <span className="text-[#3B82F6] dark:text-[#F7A914]">100% {t.totalBilled}</span>
          </div>
        </div>

        {/* Card 2: TOTAL PAID */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              {t.totalPaid}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ${dashboardTotals.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {t.totalPaidDesc}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{t.collectionRate}</span>
            <span>{dashboardTotals.collectionRate}%</span>
          </div>
        </div>

        {/* Card 3: REMAINING */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-rose-600 dark:text-rose-400 uppercase">
              {t.remaining}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              ${dashboardTotals.totalRemaining.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {t.remainingDesc}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
            <span>{language === 'so' ? 'Haraaga Guud' : 'Outstanding Balance'}</span>
            <span>
              {dashboardTotals.totalAmount > 0
                ? `${Math.round((dashboardTotals.totalRemaining / dashboardTotals.totalAmount) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CLASS LIST VIEW OR SELECTED CLASS STUDENT FINANCIAL LIST               */}
      {/* ========================================================================= */}

      {!selectedClass && !isStudent ? (
        /* ------------------------------------------------------------- */
        /* VIEW A: SELECTABLE CLASS CARDS LIST                           */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t.classList}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'so'
                  ? 'Guji fasal kasta si aad u aragto ardayda iyo xaaladdooda lacag-bixineed.'
                  : 'Click on any class card to view its student financial roster and update payment statuses.'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {classFinancialSummaries.length} {t.classes}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classFinancialSummaries.map((cls) => (
              <div
                key={cls.className}
                onClick={() => {
                  setSelectedClass(cls.className);
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#122E52] dark:hover:border-[#F7A914] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#3B82F6] dark:group-hover:text-[#F7A914] transition-colors">
                          {cls.className}
                        </h3>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          {cls.studentCount} {t.students}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      {cls.rate}%
                    </span>
                  </div>

                  {/* Financial Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 py-4 text-center">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                        {t.totalBilled}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                        ${cls.totalBilled.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">
                        {t.totalPaid}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                        ${cls.totalPaid.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">
                        {t.remainingAmount}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-400 mt-0.5 block">
                        ${cls.remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Open Link */}
                <div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, cls.rate)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-extrabold text-[#3B82F6] dark:text-[#60A5FA] pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">
                      {cls.paidCount} {t.paid} • {cls.unpaidCount} {t.unpaid}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t.selectClass} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW B: CLASS STUDENT FINANCIAL LIST                          */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          {/* Header Navigation for Selected Class */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!isStudent && (
                <button
                  onClick={() => setSelectedClass(null)}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={t.backToClasses}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backToClasses}</span>
                </button>
              )}

              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedClass || t.allClasses}</span>
                  {currentClassSummary && (
                    <span className="text-xs font-extrabold text-[#3B82F6] dark:text-[#60A5FA] px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-[#122E52]/20 border border-[#1E3A63]">
                      {currentClassSummary.studentCount} {t.students}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'so'
                    ? 'Diiwaanka lacag-bixinta ardayda iyo taleefannada waalidiinta.'
                    : 'Class financial roster, parent contact numbers, fee balances, and payment verification.'}
                </p>
              </div>
            </div>

            {/* Quick Class Summary Stats */}
            {currentClassSummary && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                  {t.totalBilled}: ${currentClassSummary.totalBilled.toLocaleString()}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {t.totalPaid}: ${currentClassSummary.totalPaid.toLocaleString()}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  {t.remaining}: ${currentClassSummary.remaining.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs: All, Paid, Unpaid */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-stretch sm:self-auto justify-center">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === 'All'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.all} ({enrichedStudentList.filter((s) => !selectedClass || s.student.class === selectedClass).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Paid')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'Paid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                <span>✓ {t.paid}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Unpaid')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'Unpaid'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50/50'
                }`}
              >
                <span>✕ {t.unpaid}</span>
              </button>
            </div>
          </div>

          {/* Student Financial Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">{t.studentName}</th>
                    <th className="py-3.5 px-4">{t.studentId}</th>
                    <th className="py-3.5 px-4">{t.parentGuardian}</th>
                    <th className="py-3.5 px-4">{t.phoneNumber}</th>
                    <th className="py-3.5 px-4 text-right">{t.totalFee}</th>
                    <th className="py-3.5 px-4 text-right">{t.amountPaid}</th>
                    <th className="py-3.5 px-4 text-right">{t.remainingBalance}</th>
                    <th className="py-3.5 px-4 text-center">{t.paymentStatus}</th>
                    <th className="py-3.5 px-4 text-center">{t.paymentAction}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {selectedClassStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="font-bold">{t.noStudentsFound}</p>
                      </td>
                    </tr>
                  ) : (
                    selectedClassStudents.map((item) => {
                      const isPaid = item.paymentStatus === 'Paid';
                      return (
                        <tr
                          key={item.student.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* 1. Student Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={item.student.name}
                                avatarUrl={item.student.avatar}
                                size="sm"
                              />
                              <div>
                                <span className="font-black text-slate-900 dark:text-white block">
                                  {item.student.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Roll: {item.student.rollNo || '01'} • {item.student.class}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Student ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                            {item.student.id}
                          </td>

                          {/* 3. Parent / Guardian Name */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {item.student.parentName || 'Hassan Warsame'}
                          </td>

                          {/* 4. Parent / Guardian Phone Number */}
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.student.parentPhone || '+252 61 555 1234'}</span>
                            </div>
                          </td>

                          {/* 5. Total Fee */}
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                            ${item.totalAmount.toLocaleString()}
                          </td>

                          {/* 6. Amount Paid */}
                          <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                            ${item.paidAmount.toLocaleString()}
                          </td>

                          {/* 7. Remaining Balance */}
                          <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                            ${item.remainingBalance.toLocaleString()}
                          </td>

                          {/* 8. Payment Status (✓ PAID or ✕ UNPAID) */}
                          <td className="py-3.5 px-4 text-center">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t.paid}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{t.unpaid}</span>
                              </span>
                            )}
                          </td>

                          {/* 9. Payment Action */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Direct 1-Click Toggle Status Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item)}
                                className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                                  isPaid
                                    ? 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                                title={isPaid ? t.markAsUnpaid : t.markAsPaid}
                              >
                                {isPaid ? (
                                  <>
                                    <X className="w-3.5 h-3.5" />
                                    <span>{t.markAsUnpaid}</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{t.markAsPaid}</span>
                                  </>
                                )}
                              </button>

                              {/* Custom / Partial Payment Modal */}
                              <button
                                type="button"
                                onClick={() => handleOpenCustomPayment(item)}
                                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#EFF6FF] dark:hover:bg-[#0B1B32] text-slate-700 dark:text-slate-300 hover:text-[#122E52] dark:hover:text-[#F7A914] transition-colors cursor-pointer"
                                title={t.updateStatus}
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>

                              {/* View Receipt */}
                              {isPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleViewReceipt(item)}
                                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                                  title={t.viewReceipt}
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: RECORD CUSTOM PAYMENT & GENERATE RECEIPT                        */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && targetStudentForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {t.recordNewPayment}
                </h3>
                <p className="text-xs text-slate-500">
                  {targetStudentForPayment.student.name} ({targetStudentForPayment.student.id})
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCustomPayment} className="space-y-4 text-xs">
              {/* Summary of Dues */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{t.totalFee}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                    ${targetStudentForPayment.totalAmount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 uppercase font-bold">{t.amountPaid}</span>
                  <span className="text-xs font-black text-emerald-600 block mt-0.5">
                    ${targetStudentForPayment.paidAmount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 uppercase font-bold">{t.remainingBalance}</span>
                  <span className="text-xs font-black text-rose-600 block mt-0.5">
                    ${targetStudentForPayment.remaining}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'so' ? 'Qadarka La Bixinayo ($)' : 'Payment Amount ($)'} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={customPayAmount}
                  onChange={(e) => setCustomPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.paymentMethod}
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="Cash">{t.cash}</option>
                  <option value="Mobile Money (EVC / Zaad / Sahal)">{t.mobileMoney}</option>
                  <option value="Bank Transfer">{t.bankTransfer}</option>
                  <option value="Online Gateway">{t.onlineGateway}</option>
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.transactionRef}
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder={language === 'so' ? 'Qoraal dheeraad ah...' : 'Optional notes...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="btn-gold"
                >
                  {isSubmittingPayment ? 'Saving...' : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: OFFICIAL PRINTABLE RECEIPT                                      */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && receiptData && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-scale-up print:p-0 print:border-none print:shadow-none">
            {/* Header / Institutional Branding */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {activeSchool?.name || 'Eduspike International Academy'}
                  </h4>
                  <p className="text-[11px] text-slate-500">{t.officialReceipt}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-[#3B82F6] dark:text-[#60A5FA] block">
                  {receiptData.receiptNo}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{receiptData.date}</span>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">{t.studentName}</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {receiptData.student.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">{t.studentId}</span>
                <span className="font-mono font-bold text-[#3B82F6] dark:text-[#60A5FA] block mt-0.5">
                  {receiptData.student.id}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">{t.class}</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {receiptData.student.class}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">{t.parentGuardian}</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {receiptData.student.parentName || 'Hassan Warsame'} ({receiptData.student.parentPhone})
                </span>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr>
                    <td className="py-2.5 px-3">Tuition & Academic Term Fee</td>
                    <td className="py-2.5 px-3 text-right font-bold">${receiptData.totalAmount}</td>
                  </tr>
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/30">
                    <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-300">Amount Paid</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-300">
                      ${receiptData.paidAmount}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-500">Remaining Balance</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">${receiptData.remaining}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions: Print and Close */}
            <div className="flex items-center justify-between pt-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-gold"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printReceipt}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
