import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
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
  Layers,
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
    students,
  } = useSchoolData();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');

  // Financial calculations
  const feesList = studentFees || studentFeeRecords || [];
  const paymentsList = feePayments || [];
  const totalInvoiced = feesList.reduce((acc, r) => acc + (r.totalAmount || (r as any).netAmountDue || 0), 0);
  const totalCollected = paymentsList.reduce((acc, p) => acc + (p.amountPaid || (p as any).amount || 0), 0);
  const totalPending = Math.max(0, totalInvoiced - totalCollected);
  const collectionPercentage = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

  const paidCount = feesList.filter((r) => r.status === 'Paid').length;
  const unpaidCount = feesList.filter((r) => r.status === 'Unpaid' || r.status === 'Overdue' || r.remainingBalance > 0).length;

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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Financial Command Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            <span>
              {language === 'so' ? 'Xafiiska Xisaabaadka & Kharashaadka' : 'School Bursar & Accounts Office'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {language === 'so' ? 'Xarunta Maamulka Maaliyadda & Kharashaadka' : 'Finance & Fee Collection Desk'}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            {language === 'so'
              ? `Ku soo dhawoow, Xisaabiye ${currentUser.name}. Maamul kharashaadka dugsiga, xaqiijinta lacag-bixinta, iyo diiwaannada maaliyadeed ee ${activeSchool?.name || 'Dugsiga'}.`
              : `Welcome, Accountant ${currentUser.name}. Managing student billing, tuition payment verification, automated receipt generation, and revenue ledgers for ${activeSchool?.name || 'School'}.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t.fees} ({t.classList})</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t.financialReports}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs (3 Canonical Metrics + Active Students) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TOTAL AMOUNT */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-lg">
              100% {t.totalBilled}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${totalInvoiced.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{t.totalAmount}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.totalAmountDesc}</p>
          </div>
        </div>

        {/* TOTAL PAID */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              {collectionPercentage}% {t.collectionRate}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ${totalCollected.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{t.totalPaid}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{paidCount} {t.paid}</p>
          </div>
        </div>

        {/* REMAINING */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg">
              {unpaidCount} {t.unpaid}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              ${totalPending.toLocaleString()}
            </p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{t.remaining}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.remainingDesc}</p>
          </div>
        </div>
      </div>

      {/* Revenue Graph & Quick Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'so' ? 'Kharashaadka La Ururiyay & Bartilmaameedka' : 'Fee Revenue vs Target'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {language === 'so' ? 'Ibarbardhigga maaliyadeed ee bilaha' : 'Monthly collection comparisons'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {t.fees} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="collected" name={t.totalPaid + ' ($)'} fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name={t.remaining + ' ($)'} fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Student Ledger Search */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'so' ? 'Raadin Degdeg ah' : 'Quick Student Ledger'}
              </h3>
              <button
                onClick={() => onNavigate('fees')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                {t.allClasses}
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {filteredFeeRecords.slice(0, 4).map((record) => {
                const student = students.find((s) => s.id === record.studentId);
                const isPaid = record.status === 'Paid' || record.remainingBalance === 0;
                return (
                  <div
                    key={record.id}
                    onClick={() => onNavigate('fees')}
                    className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{student?.name || record.studentId}</p>
                      <span className="text-[10px] font-mono text-slate-400">{record.studentId} • {record.class}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">${record.totalAmount || 1200}</span>
                      <span
                        className={`block text-[10px] font-black ${
                          isPaid ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPaid ? `✓ ${t.paid}` : `✕ ${t.unpaid}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('fees')}
            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.fees} ({t.classList})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
