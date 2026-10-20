import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Building2,
  Users,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Layers,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface SchoolGrowthDataPoint {
  month: string;
  monthShort: string;
  newSchools: number;
  cumulativeSchools: number;
  studentCapacity: number;
  verifiedFaculty: number;
  targetNewSchools: number;
}

const GROWTH_TREND_DATA: SchoolGrowthDataPoint[] = [
  {
    month: 'May 2026',
    monthShort: 'May',
    newSchools: 1,
    cumulativeSchools: 1,
    studentCapacity: 350,
    verifiedFaculty: 18,
    targetNewSchools: 1,
  },
  {
    month: 'June 2026',
    monthShort: 'Jun',
    newSchools: 2,
    cumulativeSchools: 3,
    studentCapacity: 850,
    verifiedFaculty: 42,
    targetNewSchools: 2,
  },
  {
    month: 'July 2026',
    monthShort: 'Jul',
    newSchools: 3,
    cumulativeSchools: 6,
    studentCapacity: 1650,
    verifiedFaculty: 78,
    targetNewSchools: 2,
  },
  {
    month: 'August 2026',
    monthShort: 'Aug',
    newSchools: 4,
    cumulativeSchools: 10,
    studentCapacity: 2800,
    verifiedFaculty: 125,
    targetNewSchools: 3,
  },
  {
    month: 'September 2026',
    monthShort: 'Sep',
    newSchools: 5,
    cumulativeSchools: 15,
    studentCapacity: 4100,
    verifiedFaculty: 185,
    targetNewSchools: 4,
  },
  {
    month: 'October 2026 (Current)',
    monthShort: 'Oct',
    newSchools: 4,
    cumulativeSchools: 19,
    studentCapacity: 5250,
    verifiedFaculty: 240,
    targetNewSchools: 4,
  },
];

interface SchoolGrowthTrendWidgetProps {
  className?: string;
}

export const SchoolGrowthTrendWidget: React.FC<SchoolGrowthTrendWidgetProps> = ({ className = '' }) => {
  const { tr } = useLanguage();
  const [activeMetric, setActiveMetric] = useState<'cumulative' | 'monthly' | 'capacity'>('cumulative');

  // Custom high-contrast theme-aware Tooltip
  const CustomGrowthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SchoolGrowthDataPoint;
      return (
        <div className="bg-[#122E52] text-white p-3.5 rounded-2xl border border-[#1E3A63] shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px] animate-scale-up font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-black text-[#F7A914] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#F7A914]" />
              {data.month}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#93C5FD] border border-[#3B82F6]/30 font-bold">
              6-Mo Analytics
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#F7A914]" />
                {tr('New Registrations:', 'Dugsiyo Cusub:')}
              </span>
              <span className="font-bold text-white">+{data.newSchools} schools</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
                {tr('Cumulative Network:', 'Wadarta Guud:')}
              </span>
              <span className="font-black text-[#F7A914]">{data.cumulativeSchools} institutions</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {tr('Student Capacity:', 'Awoodda Ardayda:')}
              </span>
              <span className="font-bold text-emerald-300">{data.studentCapacity.toLocaleString()} seats</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Target Benchmark:</span>
              <span className="font-mono text-slate-400">{data.targetNewSchools} / mo</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 sm:p-7 rounded-3xl border shadow-xs space-y-6 font-sans card-theme ${className}`}>
      
      {/* Header & Metric Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1E3A63]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight" >
                {tr('School Registration Growth Trends', 'Kobac Dugsiyada ee 6-dii Bilood')}
              </h3>
              <p className="text-xs subtext-theme">
                {tr('Monthly institutional adoption, onboarding velocity, and network capacity expansion over the last 6 months.', 'Kormeerka dugsiyada cusub ee kusoo biiray nidaamka 6-dii bilood ee la soo dhaafay.')}
              </p>
            </div>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] shrink-0">
          <button
            type="button"
            onClick={() => setActiveMetric('cumulative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'cumulative'
                ? 'bg-[#122E52] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tr('Cumulative Network', 'Wadarta Guud')}
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'monthly'
                ? 'bg-[#122E52] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tr('New Registrations / Mo', 'Bishiiba Cusub')}
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('capacity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'capacity'
                ? 'bg-[#122E52] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tr('Student Seats Capacity', 'Awoodda Kuraasta')}
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1B32]/60 border border-slate-200 dark:border-[#1E3A63]">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
            {tr('Total Active Network', 'Wadarta Dugsiyada')}
          </span>
          <div className="text-2xl font-black mt-0.5" >
            19 Schools
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +280% in 6 months
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1B32]/60 border border-slate-200 dark:border-[#1E3A63]">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
            {tr('Avg Velocity', 'Xawaaraha Bishii')}
          </span>
          <div className="text-2xl font-black mt-0.5" >
            3.2 / mo
          </div>
          <span className="text-[10px] font-bold text-[#F7A914]">
            Ahead of 2.5 baseline
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1B32]/60 border border-slate-200 dark:border-[#1E3A63]">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
            {tr('Total Student Seats', 'Kuraasta Ardayda')}
          </span>
          <div className="text-2xl font-black mt-0.5" >
            5,250
          </div>
          <span className="text-[10px] font-bold text-[#3B82F6]">
            Across 19 campuses
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1B32]/60 border border-slate-200 dark:border-[#1E3A63]">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
            {tr('Peak Onboarding Month', 'Bisha Ugu Kobaca Badnayd')}
          </span>
          <div className="text-2xl font-black mt-0.5" >
            Sep 2026
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            +5 schools onboarded
          </span>
        </div>
      </div>

      {/* Recharts Data Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'cumulative' ? (
            <AreaChart data={GROWTH_TREND_DATA} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="goldNewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F7A914" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#F7A914" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="monthShort"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <YAxis
                tick={{ fill: 'currentColor', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <Tooltip content={<CustomGrowthTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontWeight: 'bold' }}
                iconType="circle"
              />
              <ReferenceLine y={15} label={{ value: 'Q3 Milestone (15)', fill: '#F7A914', fontSize: 10 }} stroke="#F7A914" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="cumulativeSchools"
                name="Cumulative Registered Schools"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#blueGrowthGradient)"
              />
              <Area
                type="monotone"
                dataKey="newSchools"
                name="New Monthly Registrations"
                stroke="#F7A914"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#goldNewGradient)"
              />
            </AreaChart>
          ) : activeMetric === 'monthly' ? (
            <BarChart data={GROWTH_TREND_DATA} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="monthShort"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <YAxis
                tick={{ fill: 'currentColor', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <Tooltip content={<CustomGrowthTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontWeight: 'bold' }}
                iconType="square"
              />
              <Bar
                dataKey="newSchools"
                name="New School Onboardings"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="targetNewSchools"
                name="Target Benchmark"
                fill="#cbd5e1"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          ) : (
            <AreaChart data={GROWTH_TREND_DATA} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldCapacityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="monthShort"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <YAxis
                tick={{ fill: 'currentColor', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <Tooltip content={<CustomGrowthTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontWeight: 'bold' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="studentCapacity"
                name="Total Enrolled Student Capacity"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#emeraldCapacityGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Metric Narrative Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-[#1E3A63] text-xs subtext-theme">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {tr(
              'All 19 tenant databases are fully provisioned with Row-Level Security (RLS) and isolated data boundaries.',
              'Dhammaan 19-ka dugsi waxaa loo xafiday xogtooda si gaar ah oo ammaan ah.'
            )}
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-[#F7A914] shrink-0">
          Last Synced: Oct 2026
        </span>
      </div>

    </div>
  );
};
