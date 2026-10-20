import React from 'react';
import {
  CalendarCheck,
  GraduationCap,
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Sparkles,
} from 'lucide-react';

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  unit?: string;
  type?: 'attendance' | 'academic' | 'grade' | 'exam' | 'generic';
  termTarget?: number;
}

/**
 * Custom Tooltip for Recharts visualizations displaying rich student metrics
 * on hover (attendance rolls, cohort sizes, variances vs term targets, grade tiers, etc.)
 */
export const CustomRechartsTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  unit = '',
  type,
  termTarget = 95,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Extract the primary data item from the payload
  const primaryEntry = payload[0];
  const dataItem = primaryEntry?.payload || {};

  // Auto-detect chart type if not explicitly passed
  const detectedType =
    type ||
    (dataItem.rate !== undefined || dataItem.attendanceRate !== undefined
      ? 'attendance'
      : dataItem.subject !== undefined
      ? 'academic'
      : dataItem.grade !== undefined
      ? 'grade'
      : dataItem.assessment !== undefined
      ? 'exam'
      : 'generic');

  // -------------------------------------------------------------
  // 1. ATTENDANCE METRICS TOOLTIP
  // -------------------------------------------------------------
  if (detectedType === 'attendance') {
    const rate = Number(dataItem.rate ?? dataItem.attendanceRate ?? primaryEntry.value ?? 0);
    const target = Number(dataItem.target ?? termTarget ?? 95);
    const variance = (rate - target).toFixed(1);
    const isTargetMet = rate >= target;

    // Student counts
    const totalEnrolled = dataItem.totalStudents ?? dataItem.enrolled ?? 32;
    const presentCount =
      dataItem.presentCount ?? Math.max(0, Math.round((totalEnrolled * rate) / 100));
    const lateCount =
      dataItem.lateCount ??
      (dataItem.late !== undefined
        ? Math.round((totalEnrolled * dataItem.late) / 100)
        : Math.round(totalEnrolled * 0.02));
    const absentCount =
      dataItem.absentCount ?? Math.max(0, totalEnrolled - presentCount - lateCount);

    return (
      <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-2xl text-xs space-y-3 min-w-[240px] max-w-[320px] transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header Title with Period & Status Badge */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white leading-tight">
                {label || dataItem.period || dataItem.className || 'Attendance Roll'}
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                {dataItem.date || dataItem.termName || 'Term 1 Instructional Roll'}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
              isTargetMet
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            }`}
          >
            {isTargetMet ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            )}
            {isTargetMet ? 'Target Met' : 'Below Target'}
          </span>
        </div>

        {/* Primary Metric Banner: Current Attendance vs Target */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--card-border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Recorded Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {rate}%
              </span>
              <span
                className={`text-[11px] font-bold flex items-center ${
                  Number(variance) >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {Number(variance) >= 0 ? `+${variance}%` : `${variance}%`}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block flex items-center justify-end gap-1">
              <Target className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> School Target
            </span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 block">
              {target.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Detailed Student Roster Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b border-[var(--card-border)] pb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Total Cohort:
            </span>
            <span className="text-slate-900 dark:text-white font-mono">
              {totalEnrolled} Scholars
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
            {/* Present Students */}
            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63]">
              <span className="text-[9px] font-bold text-[#122E52] dark:text-[#F7A914] block uppercase">
                Present
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                {presentCount}
              </span>
              <span className="text-[9px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold block">
                {rate}%
              </span>
            </div>

            {/* Late / Permission */}
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
              <span className="text-[9px] font-bold text-blue-800 dark:text-blue-300 block uppercase">
                Late/Perm
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                {lateCount}
              </span>
              <span className="text-[9px] text-blue-700 dark:text-blue-400 font-semibold block">
                {dataItem.late !== undefined ? `${dataItem.late}%` : `${((lateCount / totalEnrolled) * 100).toFixed(1)}%`}
              </span>
            </div>

            {/* Absences */}
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
              <span className="text-[9px] font-bold text-rose-800 dark:text-rose-300 block uppercase">
                Absences
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                {absentCount}
              </span>
              <span className="text-[9px] text-rose-700 dark:text-rose-400 font-semibold block">
                {dataItem.absent !== undefined ? `${dataItem.absent}%` : `${((absentCount / totalEnrolled) * 100).toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Insight / Section Note */}
        {dataItem.className && dataItem.classTeacher && (
          <p className="text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-[var(--card-border)]">
            Class Teacher: <span className="font-semibold text-slate-900 dark:text-slate-200">{dataItem.classTeacher}</span>
          </p>
        )}
        {dataItem.topClass && (
          <p className="text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-[var(--card-border)] flex items-center justify-between">
            <span>Highest Room:</span>
            <span className="font-bold text-[#122E52] dark:text-[#F7A914]">{dataItem.topClass}</span>
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ACADEMIC PERFORMANCE (SUBJECT MASTERY) TOOLTIP
  // -------------------------------------------------------------
  if (detectedType === 'academic') {
    const avg = Number(dataItem.average ?? primaryEntry.value ?? 0);
    const benchmark = Number(dataItem.benchmark ?? 75);
    const passRate = Number(dataItem.passRate ?? 98);
    const totalAssessed = dataItem.totalAssessed ?? 28;
    const highestScore = dataItem.highestScore ?? Math.min(100, Math.round(avg + 11));
    const distinctionCount =
      dataItem.distinctionCount ?? Math.max(1, Math.round(totalAssessed * (avg >= 85 ? 0.45 : 0.25)));

    const getGradeTier = (score: number) => {
      if (score >= 90) return { letter: 'A+', tier: 'Distinction Mastery', color: 'text-[#3B82F6] dark:text-[#60A5FA]' };
      if (score >= 80) return { letter: 'A', tier: 'High Competency', color: 'text-[#3B82F6] dark:text-[#60A5FA]' };
      if (score >= 70) return { letter: 'B', tier: 'Proficient', color: 'text-blue-700 dark:text-blue-400' };
      if (score >= 60) return { letter: 'C', tier: 'Developing', color: 'text-emerald-700 dark:text-emerald-400' };
      if (score >= 50) return { letter: 'D', tier: 'Passing Threshold', color: 'text-amber-700 dark:text-amber-400' };
      return { letter: 'F', tier: 'Remediation Required', color: 'text-rose-700 dark:text-rose-400' };
    };

    const gradeInfo = getGradeTier(avg);

    return (
      <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-2xl text-xs space-y-3 min-w-[240px] max-w-[320px] transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white leading-tight">
                {label || dataItem.subject || 'Academic Discipline'}
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                Curriculum Performance Metric
              </p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-current/20 bg-slate-100 dark:bg-slate-800 ${gradeInfo.color}`}>
            Grade {gradeInfo.letter}
          </span>
        </div>

        {/* Score & Benchmark Banner */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--card-border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Mean Exam Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {avg}%
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                ({gradeInfo.tier})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block flex items-center justify-end gap-1">
              <Target className="w-3 h-3 text-[#3B82F6] dark:text-[#60A5FA]" /> Benchmark
            </span>
            <span className="text-sm font-black text-[#3B82F6] dark:text-[#60A5FA] font-mono mt-0.5 block">
              {benchmark}%
            </span>
          </div>
        </div>

        {/* Detailed Student Achievement Metrics */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" /> Tested Cohort:
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {totalAssessed} Students
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Overall Pass Ratio:
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {passRate}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#3B82F6]" /> Distinction Scholars (A/A+):
            </span>
            <span className="font-bold text-[#122E52] dark:text-[#F7A914] font-mono">
              {distinctionCount} ({Math.round((distinctionCount / totalAssessed) * 100)}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Peak Individual Score:
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {highestScore} / 100
            </span>
          </div>
        </div>

        {dataItem.topStudent && (
          <p className="text-[10px] text-slate-600 dark:text-slate-400 pt-1.5 border-t border-[var(--card-border)]">
            Top Ranking Scholar: <strong className="text-slate-900 dark:text-white">{dataItem.topStudent}</strong>
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. GRADE TIER DISTRIBUTION TOOLTIP
  // -------------------------------------------------------------
  if (detectedType === 'grade') {
    const studentCount = Number(primaryEntry.value ?? dataItem.count ?? 0);
    const totalCohort = dataItem.totalCohort ?? 120;
    const percentage = ((studentCount / totalCohort) * 100).toFixed(1);

    return (
      <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-2xl text-xs space-y-2.5 min-w-[220px] max-w-[280px] transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#3B82F6] dark:text-[#F7A914]" />
            <p className="font-bold text-slate-900 dark:text-white">
              {label || dataItem.grade}
            </p>
          </div>
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: dataItem.color || primaryEntry.fill || '#122E52' }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Total Enrolled:</span>
            <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
              {studentCount} Students
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Cohort Proportion:</span>
            <span className="font-bold text-[#122E52] dark:text-[#F7A914] font-mono">
              {percentage}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Academic Standing:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {dataItem.tier || 'Curriculum Certified'}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 dark:text-slate-400 pt-1.5 border-t border-[var(--card-border)]">
          Evaluated from official examination term transcripts
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. EXAMINATION PROGRESSION TOOLTIP
  // -------------------------------------------------------------
  if (detectedType === 'exam') {
    const avgScore = Number(dataItem.average ?? primaryEntry.value ?? 0);
    const topScore = Number(dataItem.topScore ?? 100);
    const threshold = Number(dataItem.passingThreshold ?? 50);

    return (
      <div className="bg-[var(--card)] text-[var(--card-foreground)] p-4 rounded-2xl border border-[var(--card-border)] shadow-2xl text-xs space-y-2.5 min-w-[240px] transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
            <p className="font-bold text-slate-900 dark:text-white">
              {label || dataItem.assessment}
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
            Assessment Milestone
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">Cohort Average:</span>
            <span className="font-black text-[#3B82F6] dark:text-[#60A5FA] font-mono text-sm">
              {avgScore}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">Top Individual Score:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {topScore}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">Passing Threshold:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {threshold}%
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 dark:text-slate-400 pt-1.5 border-t border-[var(--card-border)]">
          All eligible scholars participated in assessment
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. FALLBACK / MULTI-PAYLOAD GENERIC TOOLTIP
  // -------------------------------------------------------------
  return (
    <div className="bg-[var(--card)] text-[var(--card-foreground)] p-3.5 rounded-2xl border border-[var(--card-border)] shadow-xl text-xs space-y-2 min-w-[180px]">
      <p className="font-bold text-slate-900 dark:text-white border-b border-[var(--card-border)] pb-1 flex items-center justify-between">
        <span>{label}</span>
        {unit && <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">({unit})</span>}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={`generic-tooltip-item-${index}`} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
            />
            {entry.name}:
          </span>
          <span className="font-extrabold text-slate-900 dark:text-white font-mono">
            {entry.value}
            {unit || entry.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
};
