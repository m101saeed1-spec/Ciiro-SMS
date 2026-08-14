import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { StudentFeeRecord, FeePayment, FeeStructure } from '../../types';
import { exportFeeReceiptPDF } from '../../utils/pdfExport';
import {
  CreditCard,
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  RotateCcw,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  FileText,
  Eye,
  X,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

export const FeeModule: React.FC = () => {
  const { currentUser, activeRole, activeChildId } = useAuth();
  const {
    students,
    classes,
    feeStructures,
    studentFees,
    feePayments,
    addFeeStructure,
    deleteFeeStructure,
    assignFees,
    recordFeePayment,
    reverseFeePayment,
    addToast,
  } = useSchoolData();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'structures' | 'reports'>('invoices');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Modals state
  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [isAssignFeeOpen, setIsAssignFeeOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<StudentFeeRecord | null>(null);
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [reversalPayment, setReversalPayment] = useState<FeePayment | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Form states
  const [structureForm, setStructureForm] = useState({
    name: '',
    category: 'Tuition' as FeeStructure['category'],
    class: 'All Classes',
    academicYear: '2026-2027',
    term: 'Term 1',
    amount: '',
    dueDate: '2026-09-30',
    description: '',
  });

  const [assignForm, setAssignForm] = useState({
    targetType: 'class' as 'class' | 'student',
    feeStructureId: '',
    class: 'Class 01',
    section: 'All',
    studentId: '',
    customAmount: '',
    dueDate: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    feeRecordId: '',
    amount: '',
    paymentMethod: 'Online Gateway',
    transactionReference: '',
    notes: '',
  });

  // Filtered student fees (RLS already handled on server, client filtering for UI)
  const filteredFees = useMemo(() => {
    return studentFees.filter((fee) => {
      // Role scope check
      if (activeRole === 'Student' && currentUser.studentId && fee.studentId !== currentUser.studentId) {
        return false;
      }
      if (activeRole === 'Parent') {
        const linked = currentUser.linkedStudentIds || [];
        if (activeChildId) {
          if (fee.studentId !== activeChildId) return false;
        } else if (!linked.includes(fee.studentId)) {
          return false;
        }
      }

      // Search query
      const matchSearch =
        fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter dropdowns
      const matchClass = filterClass === 'All' || fee.class === filterClass;
      const matchStatus = filterStatus === 'All' || fee.status === filterStatus;
      const matchCategory = filterCategory === 'All' || fee.category === filterCategory;

      return matchSearch && matchClass && matchStatus && matchCategory;
    });
  }, [studentFees, activeRole, currentUser, activeChildId, searchQuery, filterClass, filterStatus, filterCategory]);

  // Filtered Payments (RLS scoped)
  const filteredPayments = useMemo(() => {
    return feePayments.filter((payment) => {
      if (activeRole === 'Student' && currentUser.studentId && payment.studentId !== currentUser.studentId) {
        return false;
      }
      if (activeRole === 'Parent') {
        const linked = currentUser.linkedStudentIds || [];
        if (activeChildId) {
          if (payment.studentId !== activeChildId) return false;
        } else if (!linked.includes(payment.studentId)) {
          return false;
        }
      }

      return (
        payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [feePayments, activeRole, currentUser, activeChildId, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalBilled = filteredFees.reduce((acc, f) => acc + f.totalAmount, 0);
    const totalPaid = filteredFees.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalBalance = filteredFees.reduce((acc, f) => acc + f.remainingBalance, 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
    const unpaidCount = filteredFees.filter((f) => f.status === 'Unpaid').length;
    const partialCount = filteredFees.filter((f) => f.status === 'Partially Paid').length;
    const paidCount = filteredFees.filter((f) => f.status === 'Paid').length;

    return {
      totalBilled,
      totalPaid,
      totalBalance,
      collectionRate,
      unpaidCount,
      partialCount,
      paidCount,
    };
  }, [filteredFees]);

  // Handlers
  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structureForm.name || !structureForm.amount) {
      addToast('Please enter structure name and valid amount.', 'error');
      return;
    }

    await addFeeStructure({
      name: structureForm.name,
      category: structureForm.category,
      class: structureForm.class,
      academicYear: structureForm.academicYear,
      term: structureForm.term,
      amount: Number(structureForm.amount),
      dueDate: structureForm.dueDate,
      description: structureForm.description,
    });

    setIsCreateStructureOpen(false);
    setStructureForm({
      name: '',
      category: 'Tuition',
      class: 'All Classes',
      academicYear: '2026-2027',
      term: 'Term 1',
      amount: '',
      dueDate: '2026-09-30',
      description: '',
    });
  };

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.feeStructureId) {
      addToast('Please select a fee structure package.', 'error');
      return;
    }

    if (assignForm.targetType === 'student' && !assignForm.studentId) {
      addToast('Please choose a student.', 'error');
      return;
    }

    await assignFees({
      feeStructureId: assignForm.feeStructureId,
      studentId: assignForm.targetType === 'student' ? assignForm.studentId : undefined,
      class: assignForm.targetType === 'class' ? assignForm.class : undefined,
      section: assignForm.targetType === 'class' ? assignForm.section : undefined,
      customAmount: assignForm.customAmount ? Number(assignForm.customAmount) : undefined,
      dueDate: assignForm.dueDate || undefined,
    });

    setIsAssignFeeOpen(false);
  };

  const handleOpenPayModal = (fee: StudentFeeRecord) => {
    setSelectedFeeRecord(fee);
    setPaymentForm({
      feeRecordId: fee.id,
      amount: String(fee.remainingBalance),
      paymentMethod: activeRole === 'Parent' || activeRole === 'Student' ? 'Online Gateway' : 'Cash',
      transactionReference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: '',
    });
    setIsRecordPaymentOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      addToast('Please enter a valid payment amount.', 'error');
      return;
    }

    const success = await recordFeePayment({
      feeRecordId: paymentForm.feeRecordId,
      amount: Number(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      transactionReference: paymentForm.transactionReference,
      notes: paymentForm.notes,
    });

    if (success) {
      setIsRecordPaymentOpen(false);
      setSelectedFeeRecord(null);
    }
  };

  const handleOpenReverse = (payment: FeePayment) => {
    setReversalPayment(payment);
    setReversalReason('');
    setIsReverseModalOpen(true);
  };

  const handleConfirmReverse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalPayment) return;
    if (!reversalReason.trim()) {
      addToast('Please provide an authorization audit reason for reversal.', 'error');
      return;
    }

    const ok = await reverseFeePayment(reversalPayment.id, reversalReason);
    if (ok) {
      setIsReverseModalOpen(false);
      setReversalPayment(null);
    }
  };

  const handlePrintReceipt = (receipt: FeePayment) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {activeRole === 'Parent'
                  ? 'Children Fee Management'
                  : activeRole === 'Student'
                  ? 'My School Fees & Receipts'
                  : 'School Fee Management'}
              </h1>
              <p className="text-sm text-slate-500">
                {activeRole === 'Admin'
                  ? 'Manage fee structures, class invoicing, track payments, reverse transactions, and export audit receipts'
                  : activeRole === 'Parent'
                  ? 'View tuition fees, outstanding balances, and download official payment receipts for your children'
                  : 'Track your term tuition, balance statements, and official payment receipts'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Admin Only) */}
        {activeRole === 'Admin' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAssignForm({
                  targetType: 'class',
                  feeStructureId: feeStructures[0]?.id || '',
                  class: classes[0]?.name || 'Class 01',
                  section: 'All',
                  studentId: students[0]?.id || '',
                  customAmount: '',
                  dueDate: '',
                });
                setIsAssignFeeOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <UserCheck className="w-4 h-4" />
              Assign Fees
            </button>

            <button
              onClick={() => setIsCreateStructureOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-md shadow-purple-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Fee Structure
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {activeRole === 'Student' || activeRole === 'Parent' ? 'Total Billed' : 'Total Invoiced'}
            </span>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              ${summary.totalBilled.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {filteredFees.length} invoice record(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Paid */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Amount Paid
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              ${summary.totalPaid.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-0.5 block">
              {summary.paidCount} Fully Settled
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Remaining Balance
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              ${summary.totalBalance.toLocaleString()}
            </div>
            <span className="text-xs text-amber-600 font-medium mt-0.5 block">
              {summary.unpaidCount + summary.partialCount} Pending Invoice(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Settlement Rate
            </span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              {summary.collectionRate}%
            </div>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.collectionRate)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Fee Invoices & Balances
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Payment History & Receipts ({filteredPayments.length})
        </button>

        {activeRole === 'Admin' && (
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'structures'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Fee Packages & Catalog ({feeStructures.length})
          </button>
        )}

        {activeRole === 'Admin' && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Financial Audit & Reports
          </button>
        )}
      </div>

      {/* TAB 1: Invoices & Balances Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, fee title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {activeRole === 'Admin' && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500 font-medium">Class:</span>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    <option value="All">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Tuition">Tuition</option>
                  <option value="Examination">Examination</option>
                  <option value="Library">Library</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Sports">Sports</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Invoice / Student</th>
                  <th className="px-6 py-4">Fee Item & Category</th>
                  <th className="px-6 py-4">Total Billed</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No fee records match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((fee) => {
                    const isOverdue = new Date(fee.dueDate) < new Date() && fee.status !== 'Paid';
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{fee.studentName}</div>
                          <div className="text-xs text-purple-600 font-mono">
                            {fee.studentId} • {fee.class}-{fee.section}
                          </div>
                          <div className="text-[11px] text-slate-400">Inv: {fee.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{fee.title}</div>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 mt-0.5">
                            {fee.category} • {fee.term}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          ${fee.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          ${fee.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ${fee.remainingBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-700">{fee.dueDate}</div>
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-rose-600 uppercase">
                              Overdue
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              fee.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : fee.status === 'Partially Paid'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                fee.status === 'Paid'
                                  ? 'bg-emerald-600'
                                  : fee.status === 'Partially Paid'
                                  ? 'bg-amber-600'
                                  : 'bg-rose-600'
                              }`}
                            />
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {fee.remainingBalance > 0 ? (
                            <button
                              onClick={() => handleOpenPayModal(fee)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-medium text-xs hover:bg-purple-700 shadow-xs transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              {activeRole === 'Parent' || activeRole === 'Student' ? 'Pay Now' : 'Record Payment'}
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Payment History & Official Receipts */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base">Recorded Fee Receipts & Transactions</h2>
            <span className="text-xs text-slate-500">
              Official timestamped receipts with downloadable PDF format
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Receipt Number</th>
                  <th className="px-6 py-4">Student & Class</th>
                  <th className="px-6 py-4">Fee Item</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Receipt / Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No payment receipts recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        payment.status === 'Reversed' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-purple-700">{payment.id}</span>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: {payment.transactionReference || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{payment.studentName}</div>
                        <div className="text-xs text-slate-500">
                          {payment.studentId} • {payment.class}-{payment.section}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{payment.title}</div>
                        <div className="text-xs text-slate-400">{payment.category}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-base">
                        ${payment.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {payment.paymentDate}
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <RotateCcw className="w-3 h-3" /> Voided / Reversed
                            </span>
                            <div className="text-[10px] text-rose-600 mt-0.5 italic max-w-xs">
                              Reason: {payment.reversalReason}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handlePrintReceipt(payment)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100 border border-purple-200 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          View Receipt
                        </button>

                        {activeRole === 'Admin' && payment.status !== 'Reversed' && (
                          <button
                            onClick={() => handleOpenReverse(payment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 text-rose-600 font-semibold text-xs hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-colors"
                            title="Reverse Payment"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reverse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Fee Structures & Packages (Admin) */}
      {activeTab === 'structures' && activeRole === 'Admin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">School Approved Fee Structure Catalog</h2>
            <button
              onClick={() => setIsCreateStructureOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-md shadow-purple-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Structure
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map((structure) => (
              <div
                key={structure.id}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-600">{structure.id}</span>
                      <h3 className="font-bold text-slate-900 text-lg">{structure.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                      {structure.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {structure.description || 'Standard approved fee schedule package.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Class Level</span>
                      <span className="font-semibold text-slate-700">{structure.class}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Term / Year</span>
                      <span className="font-semibold text-slate-700">
                        {structure.term} ({structure.academicYear})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Fixed Rate</span>
                    <span className="text-2xl font-black text-slate-900">
                      ${structure.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAssignForm({
                          targetType: 'class',
                          feeStructureId: structure.id,
                          class: structure.class === 'All Classes' ? 'Class 01' : structure.class,
                          section: 'All',
                          studentId: students[0]?.id || '',
                          customAmount: String(structure.amount),
                          dueDate: structure.dueDate,
                        });
                        setIsAssignFeeOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100 transition-colors"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => deleteFeeStructure(structure.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Reports & Analytics (Admin) */}
      {activeTab === 'reports' && activeRole === 'Admin' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Financial Collection Breakdown</h3>
                <p className="text-xs text-slate-500">Term 1 2026 Academic Year Revenue and Receivables</p>
              </div>

              <button
                onClick={triggerWindowPrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-xs"
              >
                <Download className="w-4 h-4" />
                Export Audit Report (PDF)
              </button>
            </div>

            {/* Category Analysis */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Tuition', 'Examination', 'Library', 'Laboratory'].map((cat) => {
                const catFees = studentFees.filter((f) => f.category === cat);
                const billed = catFees.reduce((acc, f) => acc + f.totalAmount, 0);
                const paid = catFees.reduce((acc, f) => acc + f.paidAmount, 0);
                const rate = billed > 0 ? Math.round((paid / billed) * 100) : 0;

                return (
                  <div key={cat} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{cat}</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">${paid.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">of ${billed.toLocaleString()} billed</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 mt-1 block">{rate}% Collected</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Create Fee Structure (Admin) */}
      {/* ========================================================================= */}
      {isCreateStructureOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg">Create New Fee Structure</h2>
              </div>
              <button
                onClick={() => setIsCreateStructureOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Structure Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grade 1 Term Tuition 2026"
                  value={structureForm.name}
                  onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={structureForm.category}
                    onChange={(e) =>
                      setStructureForm({
                        ...structureForm,
                        category: e.target.value as FeeStructure['category'],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Examination">Examination</option>
                    <option value="Library">Library</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Sports">Sports</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Transport">Transport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Target Class *
                  </label>
                  <select
                    value={structureForm.class}
                    onChange={(e) => setStructureForm({ ...structureForm, class: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="All Classes">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="e.g., 450"
                    value={structureForm.amount}
                    onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={structureForm.dueDate}
                    onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Term</label>
                  <select
                    value={structureForm.term}
                    onChange={(e) => setStructureForm({ ...structureForm, term: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details regarding this fee..."
                  value={structureForm.description}
                  onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateStructureOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-200 transition-all"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Assign Fees to Class or Student (Admin) */}
      {/* ========================================================================= */}
      {isAssignFeeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg">Assign Fee Invoice</h2>
              </div>
              <button
                onClick={() => setIsAssignFeeOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignFee} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Fee Package *
                </label>
                <select
                  required
                  value={assignForm.feeStructureId}
                  onChange={(e) => {
                    const sel = feeStructures.find((f) => f.id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      feeStructureId: e.target.value,
                      customAmount: sel ? String(sel.amount) : '',
                      dueDate: sel ? sel.dueDate : '',
                    });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {feeStructures.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} - ${f.amount} ({f.class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Assignment Target *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, targetType: 'class' })}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      assignForm.targetType === 'class'
                        ? 'bg-purple-50 border-purple-600 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Entire Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, targetType: 'student' })}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      assignForm.targetType === 'student'
                        ? 'bg-purple-50 border-purple-600 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Individual Student
                  </button>
                </div>
              </div>

              {assignForm.targetType === 'class' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Class *
                    </label>
                    <select
                      value={assignForm.class}
                      onChange={(e) => setAssignForm({ ...assignForm, class: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Section
                    </label>
                    <select
                      value={assignForm.section}
                      onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="All">All Sections (A, B)</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Select Student *
                  </label>
                  <select
                    required
                    value={assignForm.studentId}
                    onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a registered student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id} - {s.class})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Defaults to package rate"
                    value={assignForm.customAmount}
                    onChange={(e) => setAssignForm({ ...assignForm, customAmount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Custom Due Date
                  </label>
                  <input
                    type="date"
                    value={assignForm.dueDate}
                    onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignFeeOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-200 transition-all"
                >
                  Generate & Assign Invoices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Record Payment / Pay Online Modal */}
      {/* ========================================================================= */}
      {isRecordPaymentOpen && selectedFeeRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">
                    {activeRole === 'Parent' || activeRole === 'Student' ? 'Pay School Fee' : 'Record Fee Payment'}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Invoice: {selectedFeeRecord.id} • {selectedFeeRecord.studentName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-4 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-600 uppercase font-bold block">Fee Item</span>
                <span className="font-bold text-slate-800 text-sm">{selectedFeeRecord.title}</span>
                <span className="text-xs text-slate-500 block">Category: {selectedFeeRecord.category}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-purple-600 uppercase font-bold block">Remaining Due</span>
                <span className="font-black text-purple-900 text-xl">
                  ${selectedFeeRecord.remainingBalance}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Amount ($) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedFeeRecord.remainingBalance}
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  You may pay the full amount or a partial installment.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Online Gateway">Online Gateway (Card / Stripe)</option>
                    <option value="Bank Transfer">Bank Wire / Transfer</option>
                    <option value="POS / Terminal">POS Debit Card</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Transaction Ref
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionReference}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, transactionReference: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Parent Portal"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-200 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Official Printable PDF Receipt */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative print:p-0 print:border-none print:shadow-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-slate-800">Official Payment Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const feeRec = studentFees.find((f) => f.id === selectedReceipt.feeRecordId);
                    exportFeeReceiptPDF(selectedReceipt, feeRec);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF Receipt
                </button>
                <button
                  type="button"
                  onClick={triggerWindowPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-b from-slate-50/50 to-white">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">
                      EduSpike High School
                    </h3>
                    <p className="text-xs text-slate-500">Official Fee Receipt & Bursary Voucher</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    {selectedReceipt.id}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{selectedReceipt.paymentDate}</div>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="my-5 grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block uppercase text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block uppercase text-[10px]">Student ID / Roll</span>
                  <span className="font-bold font-mono text-purple-700">
                    {selectedReceipt.studentId} • Roll #{selectedReceipt.rollNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block uppercase text-[10px]">Class & Section</span>
                  <span className="font-semibold text-slate-700">
                    {selectedReceipt.class} (Section {selectedReceipt.section})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block uppercase text-[10px]">Payment Channel</span>
                  <span className="font-semibold text-slate-700">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden my-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">Fee Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">{selectedReceipt.title}</td>
                      <td className="p-3 text-slate-500">{selectedReceipt.category}</td>
                      <td className="p-3 font-bold text-slate-900 text-right">
                        ${selectedReceipt.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-purple-50/50 border-t border-purple-100">
                    <tr>
                      <td colSpan={2} className="p-3 font-bold text-slate-800 text-right">
                        Total Amount Received:
                      </td>
                      <td className="p-3 font-black text-purple-900 text-base text-right">
                        ${selectedReceipt.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Authorization Stamp */}
              <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Processed By</span>
                  <span className="font-medium text-slate-700">{selectedReceipt.receivedBy}</span>
                  <div className="text-[10px] text-slate-400">Ref: {selectedReceipt.transactionReference}</div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 border border-emerald-600 rounded text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
                    AUTHORIZED PAID STAMP
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Computer Generated Voucher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Reverse / Void Payment (Admin Authorization) */}
      {/* ========================================================================= */}
      {isReverseModalOpen && reversalPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Reverse Payment Voucher</h2>
                <p className="text-xs text-slate-500">Receipt ID: {reversalPayment.id}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmReverse} className="space-y-4 mt-4">
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800 leading-relaxed">
                Reversing this payment of <strong>${reversalPayment.amountPaid}</strong> for student{' '}
                <strong>{reversalPayment.studentName}</strong> will restore their unpaid balance and record
                an immutable audit log entry.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason for Reversal (Mandatory Audit Requirement) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Bank chargeback, erroneous check bounce, double-entry adjustment..."
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReverseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Authorize Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
