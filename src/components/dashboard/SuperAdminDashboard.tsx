import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { NavModule } from '../common/Sidebar';
import { School, PlatformStats } from '../../types';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Server,
  KeyRound,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Archive,
  RefreshCw,
  X,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate: (module: NavModule) => void;
  onOpenCreateSchool?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate, onOpenCreateSchool }) => {
  const {
    currentUser,
    schools,
    activeSchoolId,
    setActiveSchoolId,
    toggleSchoolStatus,
    fetchPlatformStats,
  } = useAuth();
  const { activities, addToast } = useSchoolData();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const loadStats = async () => {
    setLoadingStats(true);
    const data = await fetchPlatformStats();
    if (data) setStats(data);
    setLoadingStats(false);
  };

  useEffect(() => {
    loadStats();
  }, [schools]);

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (school.address && school.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.principalName && school.principalName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || school.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSchools = (schools || []).length;
  const activeSchoolsCount = (schools || []).filter((s) => s.status === 'Active').length;
  const inactiveSchoolsCount = (schools || []).filter((s) => s.status !== 'Active').length;

  const totalStudentsPlatform = stats?.totalStudents ?? (schools || []).reduce((acc, s) => acc + (s.stats?.totalStudents || 0), 0);
  const totalTeachersPlatform = stats?.totalTeachers ?? (schools || []).reduce((acc, s) => acc + (s.stats?.totalTeachers || 0), 0);

  const handleToggleStatus = async (school: School) => {
    const newStatus = school.status === 'Active' ? 'Inactive' : 'Active';
    const res = await toggleSchoolStatus(school.id, newStatus);
    if (res.success) {
      addToast(`Updated status for "${school.name}" to ${newStatus}`, 'success');
      loadStats();
    } else {
      addToast(res.error || 'Failed to update school status', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform Master Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Platform Command Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Welcome, {currentUser.name}. You have unrestricted platform-level oversight across all {totalSchools} registered school tenants, multi-tenant databases, faculty accounts, and enterprise compliance.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigate('schools' as NavModule)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>School Directory & Tenants</span>
            </button>
            <button
              onClick={() => onNavigate('activities')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Global Audit Logs</span>
            </button>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Metric KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Schools */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {activeSchoolsCount} Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalSchools}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Registered Schools</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{inactiveSchoolsCount} suspended / pending</p>
          </div>
        </div>

        {/* Metric 2: Total Students Platform-wide */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              Platform Total
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalStudentsPlatform}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Enrolled Students</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Across all registered academies</p>
          </div>
        </div>

        {/* Metric 3: Active Faculty */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Verified
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalTeachersPlatform}</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Teaching Faculty</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Instructors, heads & mentors</p>
          </div>
        </div>

        {/* Metric 4: Platform Security Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Healthy
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">100%</p>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Tenant Isolation</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">RLS & Membership verified</p>
          </div>
        </div>
      </div>

      {/* School Directory & Tenant Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registered School Tenants</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control school operational statuses, inspect isolated data scopes, and switch platform views.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search school by name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive / Suspended</option>
            </select>

            <button
              onClick={() => onNavigate('schools' as NavModule)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add School</span>
            </button>
          </div>
        </div>

        {/* School Tenant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredSchools.map((school) => {
            const isCurrentlyActiveContext = activeSchoolId === school.id;
            return (
              <div
                key={school.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrentlyActiveContext
                    ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 ring-1 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={school.logo}
                        alt={school.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {school.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {school.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        school.status === 'Active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {school.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                    {school.description || school.address}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Students:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {school.stats?.totalStudents ?? 0} Enrolled
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Principal:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {school.principalName || 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setActiveSchoolId(school.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isCurrentlyActiveContext
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isCurrentlyActiveContext ? 'Active Context' : 'Set Context'}
                  </button>

                  <button
                    onClick={() => handleToggleStatus(school)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded transition-colors"
                  >
                    {school.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Platform Audit Logs Snippet */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform System & Audit Log</h3>
          </div>
          <button
            onClick={() => onNavigate('activities')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View Full Trail <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{act.action}</span>
                <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                  [{act.userName || act.user || 'Admin'} - {act.schoolName || 'Platform'}]
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
