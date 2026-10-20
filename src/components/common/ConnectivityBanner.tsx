import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Database,
  HardDrive,
  Trash2,
  Info,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  analyzeLocalStorage,
  optimizeAndFreeCache,
  setSimulatedStorageConstraint,
  formatBytes,
  StorageCacheStatus,
} from '../../utils/storageCacheUtils';

export const ConnectivityBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [showRestoredMessage, setShowRestoredMessage] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [offlineSince, setOfflineSince] = useState<Date | null>(null);

  // Storage cache availability state
  const [storageStatus, setStorageStatus] = useState<StorageCacheStatus>(() => analyzeLocalStorage());
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [cacheActionMessage, setCacheActionMessage] = useState<string | null>(null);
  const [isSimulatedLimited, setIsSimulatedLimited] = useState<boolean>(false);

  const restoredTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionMsgTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh storage cache analytics
  const refreshStorage = useCallback(() => {
    const updated = analyzeLocalStorage();
    setStorageStatus(updated);
    if (typeof window !== 'undefined' && window.localStorage) {
      setIsSimulatedLimited(!!localStorage.getItem('eduspike_cache_simulated_buffer'));
    }
  }, []);

  // Check actual connectivity via ping
  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        if (!isOnline) {
          setIsOnline(true);
          setOfflineSince(null);
          setWasOffline(true);
          setShowRestoredMessage(true);
        }
      } else {
        setIsOnline(false);
      }
    } catch {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
      }
    } finally {
      setIsChecking(false);
      refreshStorage();
    }
  }, [isOnline, refreshStorage]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineSince(null);
      if (wasOffline) {
        setShowRestoredMessage(true);
      }
      refreshStorage();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowRestoredMessage(false);
      setOfflineSince(new Date());
      refreshStorage();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshStorage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, refreshStorage]);

  // Auto-dismiss the "back online" message after 4 seconds
  useEffect(() => {
    if (showRestoredMessage) {
      if (restoredTimerRef.current) {
        clearTimeout(restoredTimerRef.current);
      }
      restoredTimerRef.current = setTimeout(() => {
        setShowRestoredMessage(false);
        setWasOffline(false);
      }, 4000);
    }

    return () => {
      if (restoredTimerRef.current) {
        clearTimeout(restoredTimerRef.current);
      }
    };
  }, [showRestoredMessage]);

  // Free cache action handler
  const handleOptimizeCache = () => {
    const res = optimizeAndFreeCache();
    refreshStorage();
    if (res.success) {
      const msg = res.freedBytes > 0 
        ? `Freed ${formatBytes(res.freedBytes)} of storage cache! Storage capacity restored.`
        : 'Storage cache optimized. Redundant logs trimmed.';
      setCacheActionMessage(msg);
    } else {
      setCacheActionMessage('Cache is already optimized.');
    }

    if (actionMsgTimerRef.current) clearTimeout(actionMsgTimerRef.current);
    actionMsgTimerRef.current = setTimeout(() => {
      setCacheActionMessage(null);
    }, 4500);
  };

  // Toggle simulated storage limit for demonstration & testing
  const handleToggleSimulation = () => {
    const willEnable = !isSimulatedLimited;
    setSimulatedStorageConstraint(willEnable);
    setIsSimulatedLimited(willEnable);
    refreshStorage();
    setCacheActionMessage(
      willEnable
        ? 'Simulated ~82% local storage buffer injected. Limited cache state active.'
        : 'Simulated storage buffer removed. Cache state normalized.'
    );
    if (actionMsgTimerRef.current) clearTimeout(actionMsgTimerRef.current);
    actionMsgTimerRef.current = setTimeout(() => {
      setCacheActionMessage(null);
    }, 4500);
  };

  // If online and no restored notification, render nothing
  if (isOnline && !showRestoredMessage) {
    return null;
  }

  const isStorageConstrained = !isOnline && storageStatus.isLimited;

  return (
    <div
      id="connectivity-status-wrapper"
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* 1. LIMITED STORAGE CACHE OFFLINE STATE (Amber / Orange Themed Alert)      */}
        {/* ========================================================================= */}
        {!isOnline && isStorageConstrained && (
          <motion.div
            key="limited-storage-offline-banner"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full flex justify-center pointer-events-auto shadow-xl"
          >
            {isMinimized ? (
              // Minimized floating pill for Limited Storage Offline state
              <div className="mt-2 mx-4 bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-3 border border-amber-400/40 text-xs font-semibold backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-200"></span>
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-100" />
                <span className="font-bold">Offline • Limited Local Cache ({storageStatus.usagePercent}%)</span>
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1 hover:bg-amber-700/80 rounded-full transition-colors ml-1 cursor-pointer"
                  title="Expand storage warning details"
                  aria-label="Expand storage warning details"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // Full Expanded Banner for Limited Local Storage Cache Availability
              <div className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 dark:from-amber-700 dark:via-amber-800 dark:to-amber-900 text-white px-4 py-3 border-b border-amber-500/50 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs sm:text-sm">
                  {/* Left info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-800/90 dark:bg-amber-950/90 flex items-center justify-center shrink-0 border border-amber-300/40 shadow-inner">
                      <AlertTriangle className="w-5 h-5 text-amber-200 animate-pulse" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
                          Offline Mode — Limited Local Storage Cache Available
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-900/80 text-amber-100 border border-amber-400/40 shadow-xs">
                          <HardDrive className="w-2.5 h-2.5" />
                          Storage Quota: {storageStatus.usagePercent}% Used
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/40 text-white border border-amber-300/30">
                          Sync Paused
                        </span>
                      </div>

                      <p className="text-amber-100 text-xs font-normal leading-relaxed">
                        Local browser storage is nearing capacity ({formatBytes(storageStatus.usedBytes)} of estimated {formatBytes(storageStatus.totalEstimatedBytes)}).
                        <span className="font-medium text-white ml-1">
                          New offline entries, marks, and audit logs may fail to persist locally.
                        </span>
                        {storageStatus.pendingSyncCount > 0 && (
                          <span className="ml-1 text-amber-200 font-semibold underline decoration-amber-400/60">
                            ({storageStatus.pendingSyncCount} items pending cloud sync)
                          </span>
                        )}
                      </p>

                      {/* Feedback message upon cache optimization */}
                      {cacheActionMessage && (
                        <p className="text-xs font-semibold text-white bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-400/40 inline-flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          {cacheActionMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center pt-1 sm:pt-0">
                    <button
                      type="button"
                      id="free-cache-btn"
                      onClick={handleOptimizeCache}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-200 text-amber-900 hover:bg-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      title="Safely prune old logs and optimize storage"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-amber-800" />
                      <span>Free Cache Space</span>
                    </button>

                    <button
                      type="button"
                      id="sync-diagnostics-btn"
                      onClick={() => setIsDiagnosticsOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-800/80 hover:bg-amber-900 text-white font-bold text-xs border border-amber-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="View cache breakdown and sync diagnostics"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-200" />
                      <span>Sync Details</span>
                    </button>

                    <button
                      type="button"
                      id="retry-connection-amber-btn"
                      onClick={checkConnection}
                      disabled={isChecking}
                      className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-75 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                      <span>{isChecking ? 'Checking...' : 'Retry'}</span>
                    </button>

                    <button
                      type="button"
                      id="minimize-limited-banner-btn"
                      onClick={() => setIsMinimized(true)}
                      className="p-1.5 hover:bg-amber-800/90 rounded-lg text-amber-100 hover:text-white transition-colors cursor-pointer"
                      title="Minimize banner"
                      aria-label="Minimize banner"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. STANDARD OFFLINE STATE (Healthy Local Storage Cache)                    */}
        {/* ========================================================================= */}
        {!isOnline && !isStorageConstrained && (
          <motion.div
            key="standard-offline-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full flex justify-center pointer-events-auto shadow-md"
          >
            {isMinimized ? (
              // Minimized floating pill
              <div className="mt-2 mx-4 bg-rose-600 dark:bg-rose-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 border border-rose-400/30 text-xs font-semibold backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <WifiOff className="w-3.5 h-3.5" />
                <span>You are offline • Cache Healthy ({storageStatus.usagePercent}%)</span>
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1 hover:bg-rose-700/60 rounded-full transition-colors ml-1 cursor-pointer"
                  title="Expand offline details"
                  aria-label="Expand offline details"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // Full Expanded Banner
              <div className="w-full bg-rose-600 dark:bg-rose-800 text-white px-4 py-2.5 sm:py-3 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                  {/* Left info */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-lg bg-rose-700 dark:bg-rose-900/80 flex items-center justify-center shrink-0 border border-rose-400/30">
                      <WifiOff className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white tracking-wide">
                          No Internet Connection Detected
                        </p>
                        <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-700/80 text-rose-100 border border-rose-400/30">
                          Offline Mode
                        </span>
                        <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-900/60 text-emerald-200 border border-emerald-400/30">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                          Local Cache Ready ({formatBytes(storageStatus.usedBytes)})
                        </span>
                      </div>
                      <p className="text-rose-100/90 text-xs font-medium truncate sm:whitespace-normal">
                        You are browsing cached data. Changes will automatically sync when connection is restored.
                        {offlineSince && (
                          <span className="hidden lg:inline ml-1 text-rose-200/80">
                            (Disconnected at {offlineSince.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      id="standard-sync-diagnostics-btn"
                      onClick={() => setIsDiagnosticsOpen(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-700/70 hover:bg-rose-700 text-rose-100 hover:text-white font-semibold text-xs border border-rose-400/30 transition-all flex items-center gap-1 cursor-pointer"
                      title="Inspect local cache and sync status"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Sync Info</span>
                    </button>

                    <button
                      type="button"
                      id="retry-connection-btn"
                      onClick={checkConnection}
                      disabled={isChecking}
                      className="px-3 py-1.5 rounded-lg bg-white text-rose-700 dark:text-rose-800 hover:bg-rose-50 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-75 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                      <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
                    </button>

                    <button
                      type="button"
                      id="minimize-connection-banner-btn"
                      onClick={() => setIsMinimized(true)}
                      className="p-1.5 hover:bg-rose-700/80 rounded-lg text-rose-100 hover:text-white transition-colors cursor-pointer"
                      title="Minimize banner"
                      aria-label="Minimize banner"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. BACK ONLINE / RECONNECTED BANNER                                        */}
        {/* ========================================================================= */}
        {isOnline && showRestoredMessage && (
          <motion.div
            key="online-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2.5 sm:py-3 shadow-md pointer-events-auto transition-colors"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Connection Restored!
                  </p>
                  <p className="text-emerald-100 text-xs font-medium">
                    You are back online. All school management systems are synced with the server.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="dismiss-online-banner-btn"
                onClick={() => setShowRestoredMessage(false)}
                className="p-1.5 hover:bg-emerald-700/80 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. DATA SYNCHRONIZATION & STORAGE CACHE DIAGNOSTICS MODAL                 */}
      {/* ========================================================================= */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto pointer-events-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                  isStorageConstrained ? 'bg-amber-600 text-white' : 'bg-[#122E52] text-white'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    Offline Cache & Sync Diagnostics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Local storage availability, cache health, and synchronization queues
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Storage Gauge & Status Card */}
            <div className={`p-4 rounded-2xl border mb-5 ${
              isStorageConstrained
                ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className={`w-4 h-4 ${isStorageConstrained ? 'text-amber-600 dark:text-amber-400' : 'text-[#3B82F6] dark:text-[#F7A914]'}`} />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Local Storage Cache Capacity
                  </span>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  isStorageConstrained
                    ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {storageStatus.usagePercent}% Full ({storageStatus.cacheHealth.toUpperCase()})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    storageStatus.usagePercent >= 90
                      ? 'bg-rose-600'
                      : storageStatus.usagePercent >= 75
                      ? 'bg-amber-500'
                      : 'bg-[#122E52]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, storageStatus.usagePercent))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>Used: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatBytes(storageStatus.usedBytes)}</strong></span>
                <span>Quota Limit: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatBytes(storageStatus.totalEstimatedBytes)}</strong></span>
              </div>
            </div>

            {/* Sync Queue State */}
            <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">
                  Sync Pipeline Status
                </span>
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                  {isOnline ? 'Active (Live)' : 'Paused (Offline Queue)'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">
                  Queued Changes
                </span>
                <span className="font-bold font-mono text-[#3B82F6] dark:text-[#F7A914] text-sm">
                  {storageStatus.pendingSyncCount} Audit Records
                </span>
              </div>
            </div>

            {/* Cache Breakdown List */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Cached Key Breakdown ({storageStatus.itemCount} Keys)
              </span>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {storageStatus.categoryBreakdown.length === 0 ? (
                  <div className="p-3 text-center text-slate-400 text-xs">No cached items found in localStorage.</div>
                ) : (
                  storageStatus.categoryBreakdown.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {cat.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                          {cat.key} {cat.itemCount !== undefined ? `(${cat.itemCount} items)` : ''}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                        {cat.formattedSize}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions & Simulation Testing */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Test Storage Limit State:
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSimulation}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSimulatedLimited
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isSimulatedLimited ? 'Disable Test Limit' : 'Simulate Low Cache (~82%)'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOptimizeCache}
                  className="btn-gold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Prune & Optimize
                </button>
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Last analyzed: {storageStatus.lastChecked.toLocaleTimeString()}</span>
                <button
                  type="button"
                  onClick={refreshStorage}
                  className="text-[#3B82F6] dark:text-[#F7A914] hover:underline font-medium cursor-pointer"
                >
                  Recalculate Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
