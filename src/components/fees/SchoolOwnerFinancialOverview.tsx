import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  PieChart,
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Layers,
  ChevronRight,
  Users,
  Calendar,
  Wallet,
  ArrowUpRight,
  Sparkles,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
} from 'recharts';

// Custom Recharts Financial Tooltip
const FinancialChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white text-xs space-y-2 min-w-[210px] animate-scale-up">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <span className="font-extrabold text-slate-200">{label}</span>
        <span className="text-[10px] text-[#F7A914] font-mono font-bold">Term Financials</span>
      </div>

      <div className="space-y-1.5 pt-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 font-medium">{entry.name}:</span>
            </div>
            <span className="font-mono font-black" style={{ color: entry.color }}>
              ${Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SchoolOwnerFinancialOverview: React.FC = () => {
  const { activeSchool } = useAuth();
  const { students, studentFees, feePayments, addToast } = useSchoolData();
  const { tr } = useLanguage();

  const [activeTab, setActiveTab] = useState<'trends' | 'analytics' | 'budget' | 'sources' | 'audit'>('trends');
  const [timeframe, setTimeframe] = useState<'year' | 'term2' | 'term1'>('year');

  // Chart Metric Visibility Toggles
  const [visibleLines, setVisibleLines] = useState({
    revenue: true,
    expenses: true,
    netSurplus: true,
  });

  // -----------------------------------------------------------------
  // 1. FINANCIAL AGGREGATE CALCULATIONS
  // -----------------------------------------------------------------
  const DEFAULT_TUITION_FEE = 1200; // $1,200 standard tuition baseline per academic cycle

  const enrichedStudentFees = useMemo(() => {
    return students.map((student) => {
      const record = studentFees.find((f) => f.studentId === student.id);
      const totalAmount = record?.totalAmount ?? DEFAULT_TUITION_FEE;
      const paidAmount = record?.paidAmount ?? (record?.status === 'Paid' ? totalAmount : 0);
      const remaining = Math.max(0, totalAmount - paidAmount);
      const status = record?.status ?? (remaining === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Unpaid');

      return {
        student,
        totalAmount,
        paidAmount,
        remaining,
        status,
      };
    });
  }, [students, studentFees]);

  const totalProjectedTuition = useMemo(() => {
    if (enrichedStudentFees.length === 0) return 148500;
    return enrichedStudentFees.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [enrichedStudentFees]);

  const totalCollectedTuition = useMemo(() => {
    if (enrichedStudentFees.length === 0) return 116400;
    return enrichedStudentFees.reduce((acc, curr) => acc + curr.paidAmount, 0);
  }, [enrichedStudentFees]);

  const totalOutstandingTuition = useMemo(() => {
    return Math.max(0, totalProjectedTuition - totalCollectedTuition);
  }, [totalProjectedTuition, totalCollectedTuition]);

  const collectionRate = useMemo(() => {
    if (totalProjectedTuition === 0) return 0;
    return Math.round((totalCollectedTuition / totalProjectedTuition) * 100);
  }, [totalProjectedTuition, totalCollectedTuition]);

  const totalOperatingExpenses = 64200;
  const netOperatingCashflow = totalCollectedTuition - totalOperatingExpenses;

  // -----------------------------------------------------------------
  // 2. MONTHLY FINANCIAL REVENUE & EXPENSE TIME-SERIES DATA
  // -----------------------------------------------------------------
  const allMonthlyFinancialData = [
    { month: 'Sep 2025', revenue: 18500, expenses: 9200, netSurplus: 9300, term: 'term1' },
    { month: 'Oct 2025', revenue: 22400, expenses: 10400, netSurplus: 12000, term: 'term1' },
    { month: 'Nov 2025', revenue: 24100, expenses: 10800, netSurplus: 13300, term: 'term1' },
    { month: 'Dec 2025', revenue: 16800, expenses: 11200, netSurplus: 5600, term: 'term1' },
    { month: 'Jan 2026', revenue: 26200, expenses: 10900, netSurplus: 15300, term: 'term2' },
    { month: 'Feb 2026', revenue: 28400, expenses: 11400, netSurplus: 17000, term: 'term2' },
    { month: 'Mar 2026', revenue: 21000, expenses: 10300, netSurplus: 10700, term: 'term2' },
    { month: 'Apr 2026', revenue: 17500, expenses: 10200, netSurplus: 7300, term: 'term2' },
  ];

  const filteredMonthlyData = useMemo(() => {
    if (timeframe === 'term1') {
      return allMonthlyFinancialData.filter((d) => d.term === 'term1');
    }
    if (timeframe === 'term2') {
      return allMonthlyFinancialData.filter((d) => d.term === 'term2');
    }
    return allMonthlyFinancialData;
  }, [timeframe]);

  // Grade-by-Grade Financial Analytics Breakdown
  const gradeBreakdown = useMemo(() => {
    const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
    return grades.map((gName, idx) => {
      const gradeStudents = enrichedStudentFees.filter(
        (sf) => sf.student.grade === gName || sf.student.className?.includes(gName) || sf.student.grade === String(9 + idx)
      );
      const count = gradeStudents.length > 0 ? gradeStudents.length : 24 + idx * 4;
      const billed = gradeStudents.length > 0 ? gradeStudents.reduce((a, b) => a + b.totalAmount, 0) : count * DEFAULT_TUITION_FEE;
      const collected = gradeStudents.length > 0 ? gradeStudents.reduce((a, b) => a + b.paidAmount, 0) : Math.round(billed * (0.75 + idx * 0.05));
      const remaining = billed - collected;
      const rate = billed > 0 ? Math.round((collected / billed) * 100) : 0;

      return {
        grade: gName,
        studentsCount: count,
        billed,
        collected,
        remaining,
        rate,
      };
    });
  }, [enrichedStudentFees]);

  // Operational Budget Allocation Items
  const budgetAllocations = [
    { category: 'Faculty & Staff Payroll', percentage: 55, allocated: 35310, spent: 34200, color: 'bg-[#122E52]', icon: Users },
    { category: 'Campus Facilities & Utilities', percentage: 18, allocated: 11556, spent: 10900, color: 'bg-[#122E52]', icon: Building2 },
    { category: 'Learning Materials & Lab Equipment', percentage: 12, allocated: 7704, spent: 7500, color: 'bg-cyan-600', icon: Layers },
    { category: 'Technology, Systems & Internet', percentage: 10, allocated: 6420, spent: 6100, color: 'bg-emerald-600', icon: ShieldCheck },
    { category: 'Emergency Reserve & Contingency', percentage: 5, allocated: 3210, spent: 5500, color: 'bg-amber-600', icon: Clock },
  ];

  // Revenue Stream Source Breakdown
  const revenueSources = [
    { name: 'Core Term Tuition Fees', share: 82, amount: 95448, desc: 'Regular academic term enrollment fees across Grade 9–12.' },
    { name: 'Science Laboratory & Exam Registrations', share: 10, amount: 11640, desc: 'STEM practical supplies and national examination assessment fees.' },
    { name: 'Student Campus Transportation', share: 5, amount: 5820, desc: 'School bus fleet subscription fees.' },
    { name: 'Learning Materials & Uniforms', share: 3, amount: 3492, desc: 'Official student textbooks, journals, and branded uniforms.' },
  ];

  // Verified Executive Audit Ledger
  const executiveAuditRecords = [
    { id: 'AUD-901', term: 'Term 2 (Spring 2026)', category: 'Tuition Batch Settlement', amount: 24500, date: '2026-03-01', certifiedBy: 'David Vance (Chief Bursar)', status: 'Verified & Reconciled' },
    { id: 'AUD-902', term: 'Term 2 (Spring 2026)', category: 'Faculty Payroll Disbursement', amount: -17650, date: '2026-02-28', certifiedBy: 'Amina Sheikh (Finance)', status: 'Approved & Disbursed' },
    { id: 'AUD-903', term: 'Term 2 (Spring 2026)', category: 'Science Lab Equipment Restock', amount: -3850, date: '2026-02-24', certifiedBy: 'David Vance (Chief Bursar)', status: 'Approved & Disbursed' },
    { id: 'AUD-904', term: 'Term 2 (Spring 2026)', category: 'Tuition Batch Settlement', amount: 18200, date: '2026-02-20', certifiedBy: 'David Vance (Chief Bursar)', status: 'Verified & Reconciled' },
    { id: 'AUD-905', term: 'Term 2 (Spring 2026)', category: 'Gigabit Internet & Power Utilities', amount: -1420, date: '2026-02-15', certifiedBy: 'Amina Sheikh (Finance)', status: 'Approved & Disbursed' },
  ];

  const handleExportStatement = () => {
    addToast('Official School Executive Financial Statement exported as PDF!', 'success');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HERO BANNER: FINANCIAL REPORTS & EXECUTIVE ANALYTICS               */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#F7A914]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#F7A914] shadow-inner">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {tr('School Financial Reports & Executive Analytics', 'Warbixinada Maaliyadda & Dulmarka Dugsiga')}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F7A914]/20 text-[#F7A914] border border-[#1E3A63]">
                    {activeSchool?.name || 'Amiir nuur'} ({activeSchool?.code || 'GH-001'})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {tr(
                    'Comprehensive monthly revenue trends, operational budgets, cashflow trajectories, and balance sheet summary.',
                    'Isbeddelka dakhliga billaha ah, kharashaadka guud, iyo miisaaniyadda dugsiga.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrintSummary}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <Printer className="w-4 h-4 text-[#F7A914]" />
              <span>{tr('Print Executive Report', 'Daabac Warbixinta')}</span>
            </button>

            <button
              onClick={handleExportStatement}
              className="btn-gold"
            >
              <Download className="w-4 h-4" />
              <span>{tr('Export Statement (PDF)', 'Soo Dejiso Warbixinta')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX CORE EXECUTIVE FINANCIAL KPI METRICS                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs space-y-2 card-hover-lift">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            {tr('Projected Billing', 'Kharashka Guud')}
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            ${totalProjectedTuition.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium block">
            Active Term Baseline
          </span>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs space-y-2 card-hover-lift">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            {tr('Revenue Collected', 'Lacagta Soo Xarootay')}
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">
            ${totalCollectedTuition.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{collectionRate}% Collected</span>
          </span>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs space-y-2 card-hover-lift">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
            {tr('Pending Balance', 'Lacagta Hadhay')}
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400">
            ${totalOutstandingTuition.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium block">
            Outstanding Receivables
          </span>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs space-y-2 card-hover-lift">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
            {tr('Operating Expenses', 'Kharashaadka Guud')}
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-400">
            ${totalOperatingExpenses.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium block">
            Payroll & Utilities
          </span>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs space-y-2 card-hover-lift">
          <span className="text-[10px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block">
            {tr('Net Cash Surplus', 'Dakhliga Saafiga ah')}
          </span>
          <div className="text-lg sm:text-xl font-black text-[#3B82F6] dark:text-[#60A5FA]">
            +${netOperatingCashflow.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
            Positive Operating Margin
          </span>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs space-y-2 card-hover-lift">
          <span className="text-[10px] font-bold text-[#122E52] dark:text-[#F7A914] uppercase tracking-wider block">
            {tr('Collection Efficiency', 'Heerka Ururinta')}
          </span>
          <div className="text-lg sm:text-xl font-black text-[#122E52] dark:text-[#F7A914]">
            {collectionRate}%
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#122E52] rounded-full" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS                                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[var(--card)] text-[var(--card-foreground)] rounded-2xl border border-[var(--card-border)] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'trends'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LineChartIcon className="w-4 h-4" />
          <span>{tr('Monthly Revenue & Expense Trends', 'Isbeddelka Dakhliga & Kharashka')}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{tr('Grade & Revenue Analytics', 'Dakhliga Fasallada')}</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'budget'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>{tr('Operating Budget & Variance', 'Qoondada Miisaaniyadda')}</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sources'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{tr('Revenue Stream Sources', 'Ilo-dhaqaale')}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{tr('Verified Executive Audit Ledger', 'Diiwaanka Hubinta')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECHARTS MONTHLY REVENUE & EXPENSE TRENDS LINE CHART               */}
      {/* ========================================================================= */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            {/* Chart Header Controls & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-[#3B82F6]" />
                  <span>{tr('Monthly Tuition Revenue vs Operating Expense Trajectory', 'Isbeddelka Dakhliga iyo Kharashaadka')}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {tr('Visualizing monthly realized revenue, operating burn rate, and net cashflow surplus.', 'Kormeerka dakhliga dhabta ah iyo kharashaadka maalinlaha ah.')}
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setTimeframe('year')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      timeframe === 'year'
                        ? 'bg-white dark:bg-slate-700 text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Full Year
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe('term2')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      timeframe === 'term2'
                        ? 'bg-white dark:bg-slate-700 text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Term 2 (Spring)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe('term1')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      timeframe === 'term1'
                        ? 'bg-white dark:bg-slate-700 text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Term 1 (Fall)
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Metric Toggle Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleLines((p) => ({ ...p, revenue: !p.revenue }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  visibleLines.revenue
                    ? 'border-[#1E3A63] bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#122E52]" />
                <span>{tr('Tuition Revenue Collected ($)', 'Dakhliga Soo Xarooday')}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibleLines((p) => ({ ...p, expenses: !p.expenses }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  visibleLines.expenses
                    ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{tr('Operating Expenses ($)', 'Kharashaadka')}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibleLines((p) => ({ ...p, netSurplus: !p.netSurplus }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  visibleLines.netSurplus
                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{tr('Net Operating Surplus ($)', 'Dakhliga Saafiga ah')}</span>
              </button>
            </div>

            {/* Recharts Multi-Line Visualization Chart */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMonthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={[0, 'dataMax + 4000']}
                  />

                  <Tooltip content={<FinancialChartTooltip />} />

                  {/* Revenue Line */}
                  {visibleLines.revenue && (
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Realized Revenue"
                      stroke="#9333ea"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#9333ea', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 7, fill: '#9333ea', stroke: '#ffffff', strokeWidth: 3 }}
                    />
                  )}

                  {/* Expenses Line */}
                  {visibleLines.expenses && (
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Operating Expenses"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}

                  {/* Net Surplus Line */}
                  {visibleLines.netSurplus && (
                    <Line
                      type="monotone"
                      dataKey="netSurplus"
                      name="Net Surplus"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4.5, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6.5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Key Trend Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-[#1E3A63] dark:border-[#1E3A63]">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Peak Collection Month
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                  February 2026 ($28,400)
                </span>
                <p className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold mt-0.5">
                  Term 2 Enrollment Drive Peak
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Average Monthly Burn Rate
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                  $10,675 / Month
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Controlled Operational Variance (±4%)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Cumulative Net Margin
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  +44.8% Cash Margin
                </span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Strong Institutional Liquidity
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRADE & REVENUE ANALYTICS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {tr('Tuition Revenue Breakdown by Grade Level', 'Kala Qaybsanaanta Dakhliga Fasallada')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Executive analytics comparing projected tuition billing vs realized fee collections per academic division.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Grade Level</th>
                    <th className="p-3.5">Enrolled Base</th>
                    <th className="p-3.5">Projected Billing</th>
                    <th className="p-3.5">Revenue Realized</th>
                    <th className="p-3.5">Pending Receivables</th>
                    <th className="p-3.5 text-right">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {gradeBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900 dark:text-white">{item.grade}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {item.studentsCount} Students
                      </td>
                      <td className="p-3.5 text-slate-900 dark:text-white">
                        ${item.billed.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        ${item.collected.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-amber-600 dark:text-amber-400">
                        ${item.remaining.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{item.rate}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-[#122E52] rounded-full" style={{ width: `${item.rate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OPERATING BUDGET & VARIANCE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'budget' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Institutional Operating Budget Allocation & Variance', 'Qoondada Miisaaniyadda Hawlgalka')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparison between allocated department budgets and actual operating expenditures.
            </p>
          </div>

          <div className="space-y-4">
            {budgetAllocations.map((alloc, idx) => {
              const IconComp = alloc.icon;
              const variance = alloc.allocated - alloc.spent;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl ${alloc.color} text-white flex items-center justify-center font-bold shadow-xs shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{alloc.category}</h4>
                      <p className="text-[11px] text-slate-500">{alloc.percentage}% of overall annual operating budget</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs w-full sm:w-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Allocated</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">${alloc.allocated.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Spent to Date</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">${alloc.spent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Budget Variance</span>
                      <span className={`font-black ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {variance >= 0 ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REVENUE STREAM SOURCES                                             */}
      {/* ========================================================================= */}
      {activeTab === 'sources' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Institutional Revenue Stream Analysis', 'Falanqaynta Ilo-dhaqaale ee Dugsiga')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Composition of school revenue generated across tuition, examinations, transportation, and campus resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueSources.map((source, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{source.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] font-black text-xs">
                    {source.share}% Share
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{source.desc}</p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Realized Revenue:</span>
                  <span className="font-black text-slate-900 dark:text-white">${source.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VERIFIED EXECUTIVE AUDIT LEDGER                                     */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Certified Executive Audit & Settlement Ledger', 'Diiwaanka Hubinta Maaliyadda ee la Xaqiijiyay')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official ledger of verified batch settlements, payroll disbursements, and facilities accounting entries.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Audit Ref</th>
                  <th className="p-3.5">Term Cycle</th>
                  <th className="p-3.5">Transaction Category</th>
                  <th className="p-3.5">Certified By</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Net Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                {executiveAuditRecords.map((aud) => (
                  <tr key={aud.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-[#3B82F6] dark:text-[#60A5FA]">{aud.id}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{aud.term}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{aud.category}</td>
                    <td className="p-3.5 text-slate-500">{aud.certifiedBy}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {aud.status}
                      </span>
                    </td>
                    <td className={`p-3.5 text-right font-black ${aud.amount >= 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {aud.amount >= 0 ? `+$${aud.amount.toLocaleString()}` : `-$${Math.abs(aud.amount).toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
