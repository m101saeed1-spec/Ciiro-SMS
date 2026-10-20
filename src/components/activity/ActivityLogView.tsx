import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { ActivityLog } from '../../types';
import { exportAuditLogsPDF } from '../../utils/pdfExport';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Clock,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activityLogs, reloadLogs, isLogsLoading } = useSchoolData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const modules = ['All', 'Authentication', 'Security', 'Academic', 'Finance', 'Library', 'Attendance', 'Examination', 'System'];
  const severities = ['All', 'info', 'success', 'warning', 'danger'];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule = selectedModule === 'All' || log.module === selectedModule;
    const matchesSeverity = selectedSeverity === 'All' || log.severity === selectedSeverity;

    return matchesSearch && matchesModule && matchesSeverity;
  });

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" /> Danger
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63]">
            <Info className="w-3 h-3 text-[#3B82F6]" /> Info
          </span>
        );
    }
  };

  const handleExportPDF = () => {
    exportAuditLogsPDF(filteredLogs, {
      generatedBy: `${currentUser.name} (${currentUser.role})`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-[#122E52] flex items-center justify-center text-white shadow-md shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                System Activity & Audit Logs
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63]">
                  RLS Verified
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable cryptographic audit trail recording user logins, grade submissions, fee receipts, and permission changes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reloadLogs}
            disabled={isLogsLoading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="btn-navy"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search action, user, or details..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
            >
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User / Actor</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No audit records match the current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[#EFF6FF]/40 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{log.userName}</div>
                      <div className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold">{log.userRole}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA]" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Audit Log Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Log ID</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">User</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedLog.userName} ({selectedLog.userRole})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Module</span>
                  <span className="font-semibold text-[#3B82F6] dark:text-[#60A5FA]">{selectedLog.module}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold mb-1">Action</span>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 bg-[#EFF6FF]/50 dark:bg-[#1E3A63] p-2.5 rounded-xl border border-[#1E3A63]/60">
                  {selectedLog.action}
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold mb-1">Full Details</span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed font-mono text-[11px]">
                  {selectedLog.details || 'No additional parameters logged.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
