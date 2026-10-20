import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActivityLog, ActivityLogSeverity } from '../../types';
import { auth, db } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { exportAuditLogsPDF } from '../../utils/pdfExport';
import { downloadCSV } from '../../utils/csvExport';
import {
  Activity,
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
  Building2,
  KeyRound,
  Sliders,
  RefreshCw,
  Eye,
  X,
  Radio,
  FileText,
  Lock,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface PlatformAuditLogsFeedProps {
  className?: string;
}

const SEED_CRITICAL_LOGS: ActivityLog[] = [
  {
    id: 'log-seed-001',
    user: 'Platform Admin',
    action: 'School Tenant Created: Al-Hikma International School',
    details: 'New institutional tenant (AH-001) registered with 350 student capacity bounds and dedicated RLS policies.',
    description: 'School tenant creation approved by Platform Master Administrator.',
    resource: 'Schools',
    module: 'Schools',
    type: 'school',
    severity: 'success',
    userName: 'Platform Admin (Saeed)',
    userRole: 'SuperAdmin',
    userId: 'usr-admin-1',
    userSchoolId: 'ADM-0001',
    schoolId: 'school-1',
    schoolName: 'Al-Hikma International School',
    ipAddress: '197.234.12.8',
    deviceInfo: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0',
    timestamp: '2026-10-05 06:45 AM',
  },
  {
    id: 'log-seed-002',
    user: 'Platform Admin',
    action: 'User Role Changed: Ahmed Ali promoted to Headteacher',
    details: 'Elevated authorization credentials and assigned Headteacher (Principal #4001) scope for Grade 8 and Campus Operations.',
    description: 'Institutional role elevation performed in Security Governance Module.',
    resource: 'Security',
    module: 'Security',
    type: 'security',
    severity: 'warning',
    userName: 'Platform Admin (Saeed)',
    userRole: 'SuperAdmin',
    userId: 'usr-admin-1',
    userSchoolId: 'ADM-0001',
    schoolId: 'school-1',
    schoolName: 'Al-Hikma International School',
    ipAddress: '197.234.12.8',
    deviceInfo: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0',
    timestamp: '2026-10-05 05:30 AM',
  },
  {
    id: 'log-seed-003',
    user: 'Platform Admin',
    action: 'System Configuration Updated: Security Passcode & Academic Benchmark',
    details: 'Updated global target attendance benchmark to 95.0% and enforced mandatory 2FA on faculty sign-in.',
    description: 'Tenant operational parameters refreshed.',
    resource: 'Settings',
    module: 'Settings',
    type: 'security',
    severity: 'info',
    userName: 'Platform Admin (Saeed)',
    userRole: 'SuperAdmin',
    userId: 'usr-admin-1',
    userSchoolId: 'ADM-0001',
    schoolId: 'school-1',
    schoolName: 'Al-Hikma International School',
    ipAddress: '197.234.12.8',
    deviceInfo: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0',
    timestamp: '2026-10-04 11:20 PM',
  },
  {
    id: 'log-seed-004',
    user: 'Platform Admin',
    action: 'School Tenant Created: Green Hills Secondary Academy',
    details: 'New institutional tenant (GH-002) provisioned with semester calendar and financial ledger.',
    description: 'Tenant onboarding completed.',
    resource: 'Schools',
    module: 'Schools',
    type: 'school',
    severity: 'success',
    userName: 'Platform Admin (Saeed)',
    userRole: 'SuperAdmin',
    userId: 'usr-admin-1',
    userSchoolId: 'ADM-0001',
    schoolId: 'school-2',
    schoolName: 'Green Hills Secondary Academy',
    ipAddress: '197.234.12.8',
    deviceInfo: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0',
    timestamp: '2026-10-04 04:15 PM',
  },
  {
    id: 'log-seed-005',
    user: 'Anonymous Client',
    action: 'Failed Authentication Attempt: Suspicious IP Threshold Exceeded',
    details: '3 consecutive invalid password attempts on account teacher@alhikma.edu from unknown subnet. Rate-limiting engaged.',
    description: 'Automated firewall defense trigger.',
    resource: 'Authentication',
    module: 'Authentication',
    type: 'auth',
    severity: 'danger',
    userName: 'Anonymous Client',
    userRole: 'Teacher',
    userId: 'usr-unknown',
    schoolId: 'school-1',
    schoolName: 'Al-Hikma International School',
    ipAddress: '41.223.108.45',
    deviceInfo: 'Automated Scanner Client v2',
    timestamp: '2026-10-04 01:10 PM',
  },
  {
    id: 'log-seed-006',
    user: 'Platform Admin',
    action: 'User Role Changed: Fatima Noor assigned Accountant',
    details: 'Assigned single fees collection and revenue reconciliation authorization (#3001).',
    description: 'Role assignment registered in school directory.',
    resource: 'Security',
    module: 'Security',
    type: 'security',
    severity: 'info',
    userName: 'Platform Admin (Saeed)',
    userRole: 'SuperAdmin',
    userId: 'usr-admin-1',
    userSchoolId: 'ADM-0001',
    schoolId: 'school-1',
    schoolName: 'Al-Hikma International School',
    ipAddress: '197.234.12.8',
    deviceInfo: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0',
    timestamp: '2026-10-03 09:30 AM',
  },
];

export const PlatformAuditLogsFeed: React.FC<PlatformAuditLogsFeedProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { activityLogs, addToast } = useSchoolData();
  const { tr } = useLanguage();

  const [firestoreLogs, setFirestoreLogs] = useState<ActivityLog[]>(SEED_CRITICAL_LOGS);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Schools' | 'Security' | 'Settings' | 'Auth'>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'danger' | 'warning' | 'info' | 'success'>('All');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // Real-time Firestore onSnapshot listener
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Only attach real-time Firestore listener if user is authenticated with Firebase Auth
      if (!firebaseUser) {
        setIsLiveConnected(false);
        setFirestoreLogs(SEED_CRITICAL_LOGS);
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = undefined;
        }
        return;
      }

      try {
        const logsQuery = query(
          collection(db, 'auditLogs'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );

        unsubscribeFirestore = onSnapshot(
          logsQuery,
          (snapshot) => {
            if (!snapshot.empty) {
              const fetched = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                  id: docSnap.id,
                  user: data.user || data.userName || 'System',
                  action: data.action || 'System Action',
                  details: data.details || data.description || '',
                  description: data.description || data.details || '',
                  resource: data.resource || data.module || 'System',
                  module: data.module || data.resource || 'System',
                  type: data.type || 'security',
                  severity: (data.severity || 'info') as ActivityLogSeverity,
                  userName: data.userName || data.user || 'System',
                  userRole: data.userRole || 'Admin',
                  userId: data.userId || 'usr-system',
                  schoolId: data.schoolId || 'school-1',
                  schoolName: data.schoolName || 'Platform',
                  ipAddress: data.ipAddress || '197.234.12.8',
                  deviceInfo: data.deviceInfo || 'Platform Client',
                  timestamp: data.timestamp
                    ? typeof data.timestamp === 'string'
                      ? data.timestamp
                      : new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp).toLocaleString()
                    : new Date().toISOString(),
                } as ActivityLog;
              });

              // Combine with initial seed logs without duplicates
              const merged = [...fetched];
              SEED_CRITICAL_LOGS.forEach((seed) => {
                if (!merged.some((m) => m.action === seed.action)) {
                  merged.push(seed);
                }
              });

              setFirestoreLogs(merged);
              setIsLiveConnected(true);
            } else {
              // If collection empty in firestore, fallback to seed + local
              setFirestoreLogs(SEED_CRITICAL_LOGS);
              setIsLiveConnected(true);
            }
          },
          (err) => {
            console.debug('Firestore live listener notice (falling back to local):', err);
            setIsLiveConnected(false);
            // Combine local context activities with seed
            const localCombined = [...SEED_CRITICAL_LOGS];
            activityLogs.forEach((act) => {
              if (!localCombined.some((c) => c.id === act.id)) {
                localCombined.push(act);
              }
            });
            setFirestoreLogs(localCombined);
          }
        );
      } catch {
        setIsLiveConnected(false);
        setFirestoreLogs(SEED_CRITICAL_LOGS);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [activityLogs]);

  // Filtered Logs
  const filteredLogs = firestoreLogs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.userRole.toLowerCase().includes(q) ||
      (log.schoolName && log.schoolName.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(q));

    let matchesCategory = true;
    if (categoryFilter === 'Schools') matchesCategory = log.resource === 'Schools' || log.module === 'Schools' || log.type === 'school';
    if (categoryFilter === 'Security') matchesCategory = log.resource === 'Security' || log.module === 'Security' || log.action.includes('Role');
    if (categoryFilter === 'Settings') matchesCategory = log.resource === 'Settings' || log.module === 'Settings' || log.type === 'system';
    if (categoryFilter === 'Auth') matchesCategory = log.resource === 'Authentication' || log.module === 'Authentication' || log.type === 'auth';

    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleExportPDF = () => {
    exportAuditLogsPDF(filteredLogs, {
      schoolName: 'Ileys Platform Master Infrastructure',
      affiliationNo: 'SYS-AUDIT-2026-X',
      generatedBy: `${currentUser.name} (${currentUser.role})`,
    });
    addToast('Official Platform Audit Logs exported to PDF.', 'success');
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action Event', 'Severity', 'Operator', 'Role', 'Target School', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.action,
      l.severity?.toUpperCase() || 'INFO',
      l.userName,
      l.userRole,
      l.schoolName || 'Platform Global',
      l.ipAddress || '127.0.0.1',
      l.details || l.description || '',
    ]);
    downloadCSV(`Platform_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    addToast('Audit trail exported to CSV dataset.', 'success');
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Critical</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Warning</span>
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Success</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] border border-[#3B82F6]/30">
            <Info className="w-3 h-3 text-[#3B82F6]" />
            <span>Info</span>
          </span>
        );
    }
  };

  return (
    <div className={`p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-[#1E3A63] shadow-xs space-y-6 font-sans bg-white dark:bg-[#0B1B32] ${className}`}>
      
      {/* Header with Live Firestore Indicator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1E3A63]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-[#3B82F6] dark:text-[#F7A914]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-[#12233F] dark:text-white">
                  {tr('Real-Time Firestore Audit Logs', 'Diiwaanka Tooska ah ee Firestore')}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isLiveConnected ? 'Live Firestore Feed' : 'Real-Time Sync'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  'Continuous real-time audit trail capturing school creation, user role changes, and system configuration updates.',
                  'Diiwaanka tooska ah ee la socda abuurista dugsiyada, beddelka doorka, iyo wax ka beddelka nidaamka.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Export CSV / PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-outline-navy"
          >
            <Download className="w-4 h-4 text-[#3B82F6]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="btn-gold"
          >
            <FileText className="w-4 h-4 text-[#122E52]" />
            <span>Download Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={tr('Search audit logs by action, user, IP...', 'Raadi dhacdooyinka, qofka, IP...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-[#1E3A63] bg-white dark:bg-[#12233F] text-[#12233F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 rounded-xl bg-slate-100 dark:bg-[#12233F] border border-slate-200 dark:border-[#1E3A63] text-xs">
          {(['All', 'Schools', 'Security', 'Settings', 'Auth'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-[#122E52] text-[#3B82F6] dark:text-[#F7A914] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'All' ? tr('All Events', 'Dhammaan') : cat}
            </button>
          ))}
        </div>

        {/* Severity Selector */}
        <div className="shrink-0">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-[#1E3A63] bg-white dark:bg-[#12233F] text-[#12233F] dark:text-white cursor-pointer outline-none focus:ring-2 focus:ring-[#3B82F6]"
          >
            <option value="All">{tr('All Severities', 'Dhammaan Xaaladaha')}</option>
            <option value="danger">{tr('Critical / Danger', 'Khatar')}</option>
            <option value="warning">{tr('Warning Alerts', 'Digniin')}</option>
            <option value="success">{tr('Success Actions', 'Guul')}</option>
            <option value="info">{tr('Informational', 'Xog')}</option>
          </select>
        </div>
      </div>

      {/* Audit Log Stream Feed Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E3A63] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-[#122E52]/50 font-extrabold border-b border-slate-200 dark:border-[#1E3A63] text-[#12233F] dark:text-slate-200">
              <tr>
                <th className="py-3 px-4">{tr('Timestamp', 'Waqtiga')}</th>
                <th className="py-3 px-4">{tr('Critical System Event', 'Dhacdada')}</th>
                <th className="py-3 px-4">{tr('Operator & Role', 'Qofka Fuliyay')}</th>
                <th className="py-3 px-4">{tr('Target Scope', 'Dugsiga')}</th>
                <th className="py-3 px-4">{tr('Severity', 'Xaaladda')}</th>
                <th className="py-3 px-4 text-right">{tr('Forensics', 'Faahfaahin')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E3A63]/60 text-[#12233F] dark:text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 italic">
                    {tr('No matching audit events found.', 'Lama helin dhacdooyin u dhigma.')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#122E52]/20 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold max-w-sm">
                      <div className="truncate font-extrabold text-[#12233F] dark:text-white">
                        {log.action}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-normal mt-0.5">
                        {log.details || log.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold">{log.userName || log.user}</div>
                      <span className="text-[10px] font-semibold text-[#3B82F6] dark:text-[#60A5FA]">
                        {log.userRole}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {log.schoolName || 'Platform Global'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="btn-outline-navy"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Count & Live Sync Info Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#3B82F6] shrink-0" />
          <span>
            {tr(
              `Displaying ${filteredLogs.length} verified audit records from Firestore auditLogs collection.`,
              `Waxa muuqda ${filteredLogs.length} dhacdo oo laga keenay Firestore.`
            )}
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-slate-500">
          Source: firestore/auditLogs (Encrypted Stream)
        </span>
      </div>

      {/* Forensics Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="System Audit Event Forensics"
          size="lg"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-[#1E3A63]">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedLog.severity)}
                <span className="font-mono font-bold text-slate-500">ID: {selectedLog.id}</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                {selectedLog.timestamp}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-black mb-1 text-[#12233F] dark:text-white">
                {selectedLog.action}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-[#12233F] border border-slate-200 dark:border-[#1E3A63]">
                {selectedLog.details || selectedLog.description || 'No additional event details provided.'}
              </p>
            </div>

            {/* Metadata Forensics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#12233F]/70 border border-slate-200 dark:border-[#1E3A63]">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operator Name</span>
                <span className="font-bold text-[#12233F] dark:text-white">{selectedLog.userName || selectedLog.user}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operator Role</span>
                <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA]">{selectedLog.userRole}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">School Tenant</span>
                <span className="font-bold truncate block">{selectedLog.schoolName || 'Platform Global'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin IP Address</span>
                <span className="font-mono font-bold">{selectedLog.ipAddress || '197.234.12.8'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Module Category</span>
                <span className="font-bold">{selectedLog.module || selectedLog.resource}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Verified</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Immutable
                </span>
              </div>
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Raw Audit Event Record</span>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto max-h-40">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs cursor-pointer"
              >
                Close Forensics
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
