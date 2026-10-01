import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Plus,
  FileText,
  Printer,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AccountantDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onNavigate }) => {
  const { currentUser, activeSchool } = useAuth();
  const {
    studentFees,
    studentFeeRecords,
    feePayments,
    feeStructures,
    students,
  } = useSchoolData();

  const [searchQuery, setSearchQuery] = useState('');

  // Financial calculations
  const feesList = studentFees || studentFeeRecords || [];
  const paymentsList = feePayments || [];
  const totalInvoiced = feesList.reduce((acc, r) => acc + (r.totalAmount || (r as any).netAmountDue || 0), 0);
  const totalCollected = paymentsList.reduce((acc, p) => acc + (p.amountPaid || (p as any).amount || 0), 0);
  const totalPending = Math.max(0, totalInvoiced - totalCollected);
  const collectionPercentage = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

  const paidCount = feesList.filter((r) => r.status === 'Paid').length;
  const partialCount = feesList.filter((r) => r.status === 'Partially Paid' || (r.status as any) === 'Partial').length;
  const unpaidCount = feesList.filter((r) => r.status === 'Unpaid' || r.status === 'Overdue').length;

  const monthlyData = [
    { month: 'Jan', collected: 28400, pending: 4200 },
    { month: 'Feb', collected: 32100, pending: 3500 },
    { month: 'Mar', collected: 45000, pending: 6800 },
    { month: 'Apr', collected: 38200, pending: 5100 },
    { month: 'May', collected: totalCollected, pending: totalPending },
  ];

  const filteredFeeRecords = feesList.filter((record) => {
    const student = (students || []).find((s) => s.id === record.studentId);
    const searchString = `${record.studentId} ${student?.name || ''} ${(record as any).invoiceNumber || record.title || ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Financial Command Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            <span>School Bursar & Accounts Office</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Finance & Fee Collection Desk
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            Welcome, Accountant {currentUser.name}. Managing student billing, tuition payment verification, automated receipt generation, and revenue ledgers for {activeSchool?.name}.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Fee Payment</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Issue Invoice & Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              {collectionPercentage}% Collected
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${totalCollected.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Total Fees Collected</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{feePayments.length} logged transactions</p>
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg">
              {unpaidCount} Accounts Due
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${totalPending.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Pending Receivables</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Awaiting term fee remittance</p>
          </div>
        </div>

        {/* Paid in Full */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg">
              Cleared
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{paidCount}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Students Fully Paid</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{partialCount} partial installments</p>
          </div>
        </div>

        {/* Total Invoiced Volume */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
              Term Billing
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${totalInvoiced.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Total Invoiced Target</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Active term fee structures</p>
          </div>
        </div>
      </div>

      {/* Revenue Graph & Quick Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Fee Revenue vs Target</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monthly collection comparisons</p>
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Fee Reports <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="collected" name="Collected ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending ($)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Payment Ledger Search */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Student Ledger</h3>
              <button
                onClick={() => onNavigate('fees')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                All Records
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {filteredFeeRecords.slice(0, 4).map((record) => {
                const student = students.find((s) => s.id === record.studentId);
                return (
                  <div
                    key={record.id}
                    onClick={() => onNavigate('fees')}
                    className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{student?.name || record.studentId}</p>
                      <span className="text-[10px] font-mono text-slate-400">{record.studentId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">${record.netAmountDue || 0}</span>
                      <span
                        className={`block text-[9px] font-bold ${
                          record.status === 'Paid'
                            ? 'text-emerald-600'
                            : record.status === 'Partial'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('fees')}
            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Open Cashier Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
